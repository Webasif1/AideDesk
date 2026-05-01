// import files and modules
<<<<<<< HEAD
import userModel from "../models/user.model.js";
import { HTTP_STATUS, ERROR_MESSAGES } from "../config/constants.js";
import { AppError, asyncHandler } from "../utils/errorHandler.js";
import { generateToken } from "../utils/tokens.js";
import { sendVerificationEmail } from "../utils/email.js";
import { config } from "../config/config.js";
import { getVerificationHTML } from "../utils/verificationTemplate.js";
import jwt from "jsonwebtoken";
=======
import userModel from '../models/user.model.js';
import { HTTP_STATUS, ERROR_MESSAGES } from '../config/constants.js';
import { AppError, asyncHandler } from '../utils/errorHandler.js';
import { generateToken } from '../utils/tokens.js';
import { sendVerificationEmail } from '../utils/email.js';
import { config } from '../config/config.js';

const recieverEmail = 'huzaifaquadri1853@gmail.com';
>>>>>>> feature/schemas

// ============================================
// Register User
// ============================================
export const registerController = asyncHandler(async (req, res) => {
  const { email, password, fullName, role } = req.body;

  const isUserExists = await userModel.findOne({ email });

  if (isUserExists) {
    throw new AppError(ERROR_MESSAGES.USER_EXISTS, HTTP_STATUS.CONFLICT);
  }
  const user = await userModel.create({
    email,
    password,
    fullName,
    role
  });
  const userResponse = {
    id: user._id,
    email: user.email,
    fullName: user.fullName,
    role: user.role
  };

  console.log(`✅ New user registered: ${user.email}`);

  const token = generateToken(res, user._id, user.email);

  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: 'User registered successfully',
    data: userResponse,
    token: token
  });

  const sent = await sendVerificationEmail({
    // email: user.email,
    email: config.TEST_RECIEVER_EMAIL, //for now; will send mail only on this email as dummy emails will be used in testing
    name: user.fullName,
    verificationLink:
      process.env.backendURL ||
      `http://localhost:${config.PORT}/api/auth/verify/${token}`
  });
  if (sent) {
    console.log('📧 Verification Email sent successfully');
  } else {
    console.log('❎ Verification Email not sent');
  }
});

export const verifyEmailToken = async (req, res, next) => {
  const { token } = req.params;

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);

    const user = await userModel.findOne({ email: decoded.email });

    if (!user) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .send(
          getVerificationHTML(
            "User Not Found",
            "The account associated with this verification link does not exist.",
            false,
          ),
        );
    }

    if (user.isVerified) {
      return res
        .status(HTTP_STATUS.OK)
        .send(
          getVerificationHTML(
            "Account Already Verified",
            "Your account has already been verified. You can proceed to log in.",
            true,
          ),
        );
    }

    user.isVerified = true;
    await user.save();

    return res
      .status(HTTP_STATUS.OK)
      .send(
        getVerificationHTML(
          "Account Verified!",
          "Your email has been successfully verified. You can now access all features of your account.",
          true,
        ),
      );
  } catch (error) {
    return res
      .status(HTTP_STATUS.UNAUTHORIZED)
      .send(
        getVerificationHTML(
          "Invalid or Expired Link",
          "The verification link is invalid or has expired. Please request a new one.",
          false,
        ),
      );
  }
};
