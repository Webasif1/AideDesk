// import files and modules
import userModel from "../models/user.model.js";
import { config } from "../config/config.js";
import { sendEmail } from "../services/mail.service.js";
import { HTTP_STATUS, ERROR_MESSAGES } from "../config/constants.js";
import jwt from "jsonwebtoken";

// Helper function to generate JWT token and send response
async function sendTokenResponse(user, res, message) {
  const token = jwt.sign(
    {
      id: user._id,
    },
    config.JWT_SECRET,
    { expiresIn: "7d" },
  );

  res.cookie("token", token);

  res.status(200).json({
    message,
    success: true,
    user: {
      id: user._id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    },
  });
}

// ============================================
// Register User
// ============================================
export async function registerController(req, res) {
  const { email, password, fullName, role } = req.body;

  try {
    // Check if user already exists
    const isUsrAlreadyExist = await userModel.findOne({
      email,
    });
    if (isUsrAlreadyExist) {
      return res.status(HTTP_STATUS.CONFLICT).json({
        message: "User already exists",
        success: false,
        error: ERROR_MESSAGES.USER_EXISTS,
      });
    }

    // Create new user
    const user = await userModel.create({
      email,
      password,
      fullName,
      role: role || "admin",
    });

    // Generate email verification token
    const emailVerificationToken = jwt.sign(
      {
        email: user.email,
      },
      process.env.JWT_SECRET,
    );
    // Send verification email
    await sendEmail({
      to: email,
      subject: "Welcome to AideDesk - Please Verify Your Email",
      text: `Welcome ${fullName}`,
      html: `<h2>Welcome to AideDesk</h2>
          <p>Hi ${fullName},</p>

          <p>
          Thanks for registering. Your account has been successfully created.
          </p>

          <p>
          Please verify your email address by clicking the link below: <a href="http://localhost:3000/api/auth/verify-email?token=${emailVerificationToken}"
           >
           Verify Email
          </a>
          </p>

          <hr/>
          <p>AideDesk Team</p>`,
    });

    await sendTokenResponse(user, res, "User Register Successfully");
  } catch (err) {
    console.log(err);
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ message: "Server error" });
  }
}
