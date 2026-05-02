import adminModel from '../models/admin.model.js';
import agentModel from '../models/aget.model.js';
import { HTTP_STATUS, ERROR_MESSAGES } from '../config/constants.js';
import { AppError, asyncHandler } from '../utils/errorHandler.js';
import { generateToken, generateResetToken } from '../utils/tokens.js';
import {
  sendVerificationEmail,
  sendPasswordResetEmail
} from '../utils/email.js';
import { config } from '../config/config.js';
import { getVerificationHTML } from '../utils/verificationTemplate.js';
import jwt from 'jsonwebtoken';

// ============================================
// POST /api/auth/register
// Creates a new Admin account (agents are created by admins, not self-registered)
// ============================================
export const registerController = asyncHandler(async (req, res) => {
  const { email, password, fullName } = req.body;

  const exists = await adminModel.findOne({ email });
  if (exists) {
    throw new AppError(ERROR_MESSAGES.USER_EXISTS, HTTP_STATUS.CONFLICT);
  }

  const admin = await adminModel.create({
    email,
    password,
    fullName,
    role: 'admin'
  });

  const token = generateToken(
    res,
    admin._id,
    admin.email,
    admin.role,
    admin.companyId
  );

  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message:
      'Account registered successfully. Please check your email to verify.',
    data: {
      id: admin._id,
      email: admin.email,
      fullName: admin.fullName,
      role: admin.role
    },
    token
  });

  // Fire-and-forget — email errors don't affect the response
  sendVerificationEmail({
    email: config.TEST_RECIEVER_EMAIL || admin.email,
    name: admin.fullName,
    verificationLink: `http://localhost:${config.PORT}/api/auth/verify/${token}`
  }).then(sent => {
    console.log(
      sent ? '📧 Verification email sent' : '❎ Verification email failed'
    );
  });
});

// ============================================
// GET /api/auth/verify/:token
// Handles both admin (HTML response) and agent (redirect to frontend login page).
// Token payload includes { userId, email, role } so we know which model to query.
// ============================================
export const verifyEmailToken = async (req, res) => {
  const { token } = req.params;

  let decoded;
  try {
    decoded = jwt.verify(token, config.JWT_SECRET);
  } catch {
    return res.status(HTTP_STATUS.UNAUTHORIZED).send(
      getVerificationHTML(
        'Invalid or Expired Link',
        'This verification link is invalid or has expired. Please request a new one.',
        false
      )
    );
  }

  const isAgentToken = decoded.role === 'agent';

  // Resolve the right model based on the role encoded in the token
  const user = isAgentToken
    ? await agentModel.findById(decoded.userId)
    : await adminModel.findOne({ email: decoded.email });

  if (!user) {
    return res.status(HTTP_STATUS.NOT_FOUND).send(
      getVerificationHTML(
        'User Not Found',
        'The account associated with this link does not exist.',
        false
      )
    );
  }

  if (user.isVerified) {
    if (isAgentToken) {
      // Agent is already verified — redirect straight to login
      return res.redirect(
        `${config.FRONTEND_URL}/login?role=agent&email=${encodeURIComponent(user.email)}&already_verified=true`
      );
    }
    return res.status(HTTP_STATUS.OK).send(
      getVerificationHTML(
        'Already Verified',
        'Your account has already been verified. You can log in.',
        true
      )
    );
  }

  user.isVerified = true;
  await user.save();

  if (isAgentToken) {
    // Agent verification → redirect to frontend login page with a success signal
    return res.redirect(
      `${config.FRONTEND_URL}/login?role=agent&email=${encodeURIComponent(user.email)}&verified=true`
    );
  }

  // Admin verification → render the HTML confirmation page
  return res.status(HTTP_STATUS.OK).send(
    getVerificationHTML(
      'Account Verified!',
      'Your email has been verified. You can now log in.',
      true
    )
  );
};

// ============================================
// POST /api/auth/login
// Accepts admin or agent credentials. Tries admin model first, then agent.
// ============================================
export const loginController = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Try admin first
  let user = await adminModel.findOne({ email }).select('+password');
  let role = 'admin';

  if (!user) {
    user = await agentModel.findOne({ email }).select('+password');
    role = 'agent';
  }

  if (!user) {
    throw new AppError(
      ERROR_MESSAGES.INVALID_CREDENTIALS,
      HTTP_STATUS.UNAUTHORIZED
    );
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new AppError(
      ERROR_MESSAGES.INVALID_CREDENTIALS,
      HTTP_STATUS.UNAUTHORIZED
    );
  }

  if (!user.isVerified) {
    throw new AppError(
      ERROR_MESSAGES.USER_NOT_VERIFIED,
      HTTP_STATUS.UNAUTHORIZED
    );
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  const token = generateToken(
    res,
    user._id,
    user.email,
    role,
    user.companyId ?? null
  );

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Logged in successfully',
    data: {
      id: user._id,
      email: user.email,
      fullName: user.fullName ?? user.name,
      role,
      companyId: user.companyId ?? null,
      isVerified: user.isVerified
    },
    token
  });
});

// ============================================
// POST /api/auth/logout
// ============================================
export const logoutController = asyncHandler(async (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: config.NODE_ENV === 'production',
    sameSite: 'strict'
  });

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Logged out successfully'
  });
});

// ============================================
// POST /api/auth/forgot-password
// Sends a 15-minute reset link. Always returns 200 to avoid email enumeration.
// ============================================
export const forgotPasswordController = asyncHandler(async (req, res) => {
  const { email } = req.body;

  let user = await adminModel.findOne({ email });
  let name = user?.fullName;

  if (!user) {
    user = await agentModel.findOne({ email });
    name = user?.name;
  }

  // Always return the same response — don't reveal whether the email exists
  if (user) {
    const resetToken = generateResetToken(user._id);
    const resetLink = `http://localhost:${config.PORT}/api/auth/reset-password/${resetToken}`;

    sendPasswordResetEmail({
      email: config.TEST_RECIEVER_EMAIL || email,
      name,
      resetLink
    }).then(sent => {
      console.log(
        sent ? '📧 Password reset email sent' : '❎ Password reset email failed'
      );
    });
  }

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'If that email is registered, a reset link has been sent.'
  });
});

// ============================================
// POST /api/auth/reset-password/:token
// ============================================
export const resetPasswordController = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  let decoded;
  try {
    decoded = jwt.verify(token, config.JWT_SECRET);
  } catch {
    throw new AppError(ERROR_MESSAGES.INVALID_TOKEN, HTTP_STATUS.UNAUTHORIZED);
  }

  if (decoded.purpose !== 'password-reset') {
    throw new AppError(ERROR_MESSAGES.INVALID_TOKEN, HTTP_STATUS.UNAUTHORIZED);
  }

  let user = await adminModel.findById(decoded.userId);
  if (!user) user = await agentModel.findById(decoded.userId);

  if (!user) {
    throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  }

  user.password = newPassword; // bcrypt pre-save hook handles hashing
  await user.save();

  // Clear any active session so user must log in with new password
  res.clearCookie('token', {
    httpOnly: true,
    secure: config.NODE_ENV === 'production',
    sameSite: 'strict'
  });

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message:
      'Password reset successfully. Please log in with your new password.'
  });
});

// ============================================
// POST /api/auth/resend-verification
// ============================================
export const resendVerificationController = asyncHandler(async (req, res) => {
  const { email } = req.body;

  let user = await adminModel.findOne({ email });
  let name = user?.fullName;

  if (!user) {
    user = await agentModel.findOne({ email });
    name = user?.name;
  }

  if (!user) {
    throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  }

  if (user.isVerified) {
    throw new AppError(
      ERROR_MESSAGES.USER_ALREADY_VERIFIED,
      HTTP_STATUS.CONFLICT
    );
  }

  const token = jwt.sign(
    { userId: user._id, email: user.email },
    config.JWT_SECRET,
    {
      expiresIn: config.JWT_EXPIRE || '5d'
    }
  );

  sendVerificationEmail({
    email: config.TEST_RECIEVER_EMAIL || email,
    name,
    verificationLink: `http://localhost:${config.PORT}/api/auth/verify/${token}`
  }).then(sent => {
    console.log(
      sent ? '📧 Verification email resent' : '❎ Verification email failed'
    );
  });

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Verification email sent. Please check your inbox.'
  });
});

// ============================================
// GET /api/auth/me  (protected)
// ============================================
export const getMeController = asyncHandler(async (req, res) => {
  const user = req.user;

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: {
      id: user._id,
      email: user.email,
      fullName: user.fullName ?? user.name,
      role: req.role,
      companyId: req.companyId ?? null,
      isVerified: user.isVerified,
      profileImage: user.profileImage,
      status: user.status,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt
    }
  });
});

// export const updateAdminDetailsController = asyncHandler(async (req, res) => {

// })
