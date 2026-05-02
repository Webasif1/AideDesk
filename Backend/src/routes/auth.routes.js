import express from 'express';
const router = express.Router();

import {
  registerController,
  verifyEmailToken,
  loginController,
  logoutController,
  forgotPasswordController,
  resetPasswordController,
  resendVerificationController,
  getMeController
} from '../controllers/auth.controller.js';

import {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  resendVerificationValidator
} from '../validator/auth.validator.js';

import { validate } from '../middleware/validation.middleware.js';
import { protect } from '../middleware/auth.middleware.js';

// ============================================
// Public Routes
// ============================================

/**
 * @route   POST /api/auth/register
 * @desc    Register a new Admin account
 * @access  Public
 */
router.post('/register', registerValidator, validate, registerController);

/**
 * @route   GET /api/auth/verify/:token
 * @desc    Verify email address via token link (renders HTML page)
 * @access  Public
 */
router.get('/verify/:token', verifyEmailToken);

/**
 * @route   POST /api/auth/login
 * @desc    Login for Admin or Agent — tries admin model first, then agent
 * @access  Public
 */
router.post('/login', loginValidator, validate, loginController);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Send a 15-minute password reset link to the registered email
 * @access  Public
 */
router.post(
  '/forgot-password',
  forgotPasswordValidator,
  validate,
  forgotPasswordController
);

/**
 * @route   POST /api/auth/reset-password/:token
 * @desc    Verify reset token and update password
 * @access  Public
 */
router.post(
  '/reset-password/:token',
  resetPasswordValidator,
  validate,
  resetPasswordController
);

/**
 * @route   POST /api/auth/resend-verification
 * @desc    Resend the email verification link
 * @access  Public
 */
router.post(
  '/resend-verification',
  resendVerificationValidator,
  validate,
  resendVerificationController
);

// ============================================
// Protected Routes
// ============================================

/**
 * @route   POST /api/auth/logout
 * @desc    Clear the auth cookie and log out
 * @access  Private
 */
router.post('/logout', protect, logoutController);

/**
 * @route   GET /api/auth/get-me
 * @desc    Get the currently authenticated user's profile
 * @access  Private
 */
router.get('/get-me', protect, getMeController);

export default router;
