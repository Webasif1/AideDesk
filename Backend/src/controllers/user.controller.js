import crypto from 'crypto';
import userModel from '../models/user.model.js';
import companyModel from '../models/company.model.js';
import workspaceModel from '../models/workSpace.model.js';
import { HTTP_STATUS, ERROR_MESSAGES } from '../config/constants.js';
import { AppError, asyncHandler } from '../utils/errorHandler.js';
import { generateToken, generateResetToken } from '../utils/tokens.js';
import { sendPasswordResetEmail, sendCustomerInviteEmail } from '../utils/email.js';
import { emitDomain } from '../sockets/emit.js';
import { config } from '../config/config.js';
import jwt from 'jsonwebtoken';

// ============================================
// Same charset as agent password — no confusing 0/O/1/l/I chars
// ============================================
const generateUserPassword = (companyName) => {
  const prefix = companyName
    .replace(/[^a-zA-Z]/g, '')
    .substring(0, 4)
    .padEnd(4, 'X');

  const charset = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  const random = Array.from(
    crypto.randomBytes(5),
    (byte) => charset[byte % charset.length]
  ).join('');

  return prefix + random;
};

// ============================================
// POST /api/users  (admin only)
// Admin adds a customer to their company.
// Password is server-generated and sent only via the invite email.
// ============================================
export const createUser = asyncHandler(async (req, res) => {
  if (!req.companyId) {
    throw new AppError(
      'Please complete your company setup before adding customers.',
      HTTP_STATUS.BAD_REQUEST
    );
  }

  const { name, email, phone } = req.body;

  const exists = await userModel.findOne({ email });
  if (exists) {
    throw new AppError(ERROR_MESSAGES.USER_EXISTS, HTTP_STATUS.CONFLICT);
  }

  const company = await companyModel.findById(req.companyId);
  if (!company) {
    throw new AppError('Company not found. Please contact support.', HTTP_STATUS.NOT_FOUND);
  }

  // Guard: company must have a workspace before customers can be added
  const workspace = await workspaceModel.findOne({ companyId: req.companyId, status: 'active' });
  if (!workspace) {
    throw new AppError(
      'You must create a workspace before adding customers.',
      HTTP_STATUS.BAD_REQUEST
    );
  }

  const tempPassword = generateUserPassword(company.name);

  const user = await userModel.create({
    name,
    email,
    phone: phone || "",
    password: tempPassword,
    companyId: req.companyId,
    workspaceId: workspace._id,
  });

  sendCustomerInviteEmail({
    email: config.TEST_RECIEVER_EMAIL || user.email,
    customerName: user.name,
    companyName: company.name,
    loginEmail: user.email,
    tempPassword,
    loginUrl: `${config.FRONTEND_URL}/login?workspaceId=${workspace._id}`,
    frontendUrl: config.FRONTEND_URL,
  }).then((sent) => {
    console.log(
      sent
        ? `📧 Customer invite sent → ${user.email}`
        : `❎ Customer invite email failed → ${user.email}`
    );
  });

  emitDomain.customerCreated(req.companyId, {
    _id: user._id,
    name: user.name,
    email: user.email,
    companyId: user.companyId,
    workspaceId: user.workspaceId,
    status: user.status,
    isVerified: user.isVerified,
    createdAt: user.createdAt,
  });

  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: `Customer added. An invite email with login credentials has been sent to ${user.email}.`,
    data: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      companyId: user.companyId,
      status: user.status,
    },
  });
});

// ============================================
// GET /api/users/stats  (protected — admin or agent)
// Customer metrics — total, active (30d), new this month, active rate.
// Workspace-scoped when a workspace context is present.
// ============================================
export const getUserStats = asyncHandler(async (req, res) => {
  const filter = { companyId: req.companyId };
  if (req.workspaceId) filter.workspaceId = req.workspaceId;

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [total, active, newThisMonth] = await Promise.all([
    userModel.countDocuments(filter),
    userModel.countDocuments({ ...filter, lastLogin: { $gte: thirtyDaysAgo } }),
    userModel.countDocuments({ ...filter, createdAt: { $gte: monthStart } }),
  ]);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: {
      total,
      active,
      newThisMonth,
      activeRate: total ? Math.round((active / total) * 1000) / 10 : 0,
    },
  });
});

// ============================================
// POST /api/users/login
// Customer login — companyId comes from widget embed (public context)
// ============================================
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password, companyId } = req.body;

  const user = await userModel.findOne({ email, companyId }).select('+password');
  if (!user) {
    throw new AppError(ERROR_MESSAGES.INVALID_CREDENTIALS, HTTP_STATUS.UNAUTHORIZED);
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new AppError(ERROR_MESSAGES.INVALID_CREDENTIALS, HTTP_STATUS.UNAUTHORIZED);
  }

  user.lastLogin = new Date();
  user.status = 'online';
  await user.save({ validateBeforeSave: false });

  const token = generateToken(res, user._id, user.email, user.role, user.companyId, user.workspaceId);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Logged in successfully',
    data: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
      workspaceId: user.workspaceId,
      profileImage: user.profileImage,
      status: user.status,
      lastLogin: user.lastLogin,
    },
    token,
  });
});

// ============================================
// POST /api/users/logout
// ============================================
export const logoutUser = asyncHandler(async (req, res) => {
  if (req.userId) {
    await userModel.findByIdAndUpdate(req.userId, { status: 'offline' });
  }

  res.clearCookie('token', {
    httpOnly: true,
    secure: config.NODE_ENV === 'production',
    sameSite: 'strict',
  });

  res.status(HTTP_STATUS.OK).json({ success: true, message: 'Logged out successfully' });
});

// ============================================
// POST /api/users/forgot-password
// Email-enumeration-resistant — always returns 200
// ============================================
export const forgotUserPassword = asyncHandler(async (req, res) => {
  const { email, companyId } = req.body;

  const user = await userModel.findOne({ email, companyId });
  if (user) {
    const resetToken = generateResetToken(user._id);
    const resetLink = `${config.FRONTEND_URL}/reset-password?token=${resetToken}&role=customer`;

    sendPasswordResetEmail({
      email: config.TEST_RECIEVER_EMAIL || email,
      name: user.name,
      resetLink,
    }).then((sent) => {
      console.log(sent ? '📧 Customer reset email sent' : '❎ Customer reset email failed');
    });
  }

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'If that email is registered, a reset link has been sent.',
  });
});

// ============================================
// POST /api/users/reset-password/:token
// ============================================
export const resetUserPassword = asyncHandler(async (req, res) => {
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

  const user = await userModel.findById(decoded.userId);
  if (!user) {
    throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  }

  user.password = newPassword;
  await user.save();

  res.clearCookie('token', {
    httpOnly: true,
    secure: config.NODE_ENV === 'production',
    sameSite: 'strict',
  });

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Password reset successfully. Please log in with your new password.',
  });
});

// ============================================
// GET /api/users/me  (protected — customer)
// ============================================
export const getMe = asyncHandler(async (req, res) => {
  const user = req.user;

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: req.role,
      companyId: req.companyId,
      profileImage: user.profileImage,
      status: user.status,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
    },
  });
});

// ============================================
// PATCH /api/users/me  (protected — customer)
// Allowed: name, profileImage, status
// ============================================
export const updateMe = asyncHandler(async (req, res) => {
  const { name, profileImage, status } = req.body;

  const updates = {};
  if (name !== undefined) updates.name = name;
  if (profileImage !== undefined) updates.profileImage = profileImage;
  if (status !== undefined) updates.status = status;

  const user = await userModel.findByIdAndUpdate(
    req.userId,
    { $set: updates },
    { new: true, runValidators: true }
  );

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Profile updated',
    data: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profileImage: user.profileImage,
      status: user.status,
    },
  });
});

// ============================================
// PATCH /api/users/me/password  (protected — customer)
// ============================================
export const changeUserPassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await userModel.findById(req.userId).select('+password');
  if (!user) {
    throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  }

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw new AppError('Current password is incorrect', HTTP_STATUS.UNAUTHORIZED);
  }

  user.password = newPassword;
  await user.save();

  res.status(HTTP_STATUS.OK).json({ success: true, message: 'Password changed successfully' });
});

// ============================================
// GET /api/users  (protected — admin)
// Query: ?status=online&search=&page=1&limit=20
// ============================================
export const getUsers = asyncHandler(async (req, res) => {
  const { status, search, page = 1, limit = 20 } = req.query;

  const filter = { companyId: req.companyId };
  if (req.workspaceId) filter.workspaceId = req.workspaceId;
  if (status) filter.status = status;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [users, total] = await Promise.all([
    userModel
      .find(filter)
      .select('-__v')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    userModel.countDocuments(filter),
  ]);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: users,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / Number(limit)),
    },
  });
});

// ============================================
// GET /api/users/:id  (protected — admin)
// ============================================
export const getUserById = asyncHandler(async (req, res) => {
  const user = await userModel
    .findOne({ _id: req.params.id, companyId: req.companyId })
    .select('-__v');

  if (!user) {
    throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  }

  res.status(HTTP_STATUS.OK).json({ success: true, data: user });
});

// ============================================
// DELETE /api/users/:id  (protected — admin)
// ============================================
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await userModel.findOneAndDelete({
    _id: req.params.id,
    companyId: req.companyId,
  });

  if (!user) {
    throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  }

  emitDomain.customerDeleted(req.companyId, { _id: req.params.id });

  res.status(HTTP_STATUS.OK).json({ success: true, message: 'Customer account removed' });
});
