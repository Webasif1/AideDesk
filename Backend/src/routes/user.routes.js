import express from 'express';
const router = express.Router();

import {
  createUser,
  loginUser,
  logoutUser,
  forgotUserPassword,
  resetUserPassword,
  getMe,
  updateMe,
  changeUserPassword,
  getUsers,
  getUserStats,
  getUserById,
  deleteUser,
  updateUserAccountStatus
} from '../controllers/user.controller.js';

import {
  createUserValidator,
  loginUserValidator,
  forgotUserPasswordValidator,
  resetUserPasswordValidator,
  updateUserValidator,
  changeUserPasswordValidator
} from '../validator/user.validator.js';
import { validate } from '../middleware/validation.middleware.js';
import { protect, requireRole } from '../middleware/auth.middleware.js';

// ============================================
// Public — no auth required
// ============================================

/**
 * @route  POST /api/users/login
 * @desc   Customer login — companyId scopes to the correct portal
 * @access Public
 */
router.post('/login', loginUserValidator, validate, loginUser);

/**
 * @route  POST /api/users/logout
 * @desc   Clear auth cookie + set status offline (optional auth)
 * @access Public
 */
router.post('/logout', logoutUser);

/**
 * @route  POST /api/users/forgot-password
 * @desc   Send password reset link (email-enumeration resistant)
 * @access Public
 */
router.post(
  '/forgot-password',
  forgotUserPasswordValidator,
  validate,
  forgotUserPassword
);

/**
 * @route  POST /api/users/reset-password/:token
 * @desc   Reset password via 15-minute token from email
 * @access Public
 */
router.post(
  '/reset-password/:token',
  resetUserPasswordValidator,
  validate,
  resetUserPassword
);

// ============================================
// Protected — all routes below require auth
// ============================================
router.use(protect);

// ── Customer self-service ────────────────────────────────────────────────────

/**
 * @route  GET /api/users/me
 * @desc   Get own profile
 * @access Private — Customer
 */
router.get('/me', requireRole('customer'), getMe);

/**
 * @route  PATCH /api/users/me
 * @desc   Update own profile (name, profileImage, status)
 * @access Private — Customer
 */
router.patch(
  '/me',
  requireRole('customer'),
  updateUserValidator,
  validate,
  updateMe
);

/**
 * @route  PATCH /api/users/me/password
 * @desc   Change own password (requires current password)
 * @access Private — Customer
 */
router.patch(
  '/me/password',
  requireRole('customer'),
  changeUserPasswordValidator,
  validate,
  changeUserPassword
);

// ── Admin manages customers ──────────────────────────────────────────────────

/**
 * @route  POST /api/users
 * @desc   Admin adds a customer — auto-generates password, sends invite email
 * @access Private — Admin
 */
router.post(
  '/register',
  requireRole('admin'),
  createUserValidator,
  validate,
  createUser
);

/**
 * @route  GET /api/users
 * @desc   List customers for the company/workspace — ?status=&search=&page=&limit=
 * @access Private — Admin or Agent
 */
router.get('/getAll', requireRole('admin', 'agent'), getUsers);

/**
 * @route  GET /api/users/stats
 * @desc   Customer metrics — total, active (30d), new this month, active rate
 * @access Private — Admin or Agent
 */
router.get('/stats', requireRole('admin', 'agent'), getUserStats);

/**
 * @route  GET /api/users/:id
 * @desc   Get a specific customer (must belong to admin's company)
 * @access Private — Admin
 */
router.get('/:id', requireRole('admin'), getUserById);

/**
 * @route  PATCH /api/users/:id/account-status
 * @desc   Suspend, restore, or soft-delete a customer.
 *         Body: { accountStatus: 'active'|'suspended'|'deleted', reason?: string }
 *         A non-empty reason is emailed to the customer; blank sends nothing.
 * @access Private — Admin
 */
router.patch(
  '/:id/account-status',
  requireRole('admin'),
  updateUserAccountStatus
);

/**
 * @route  DELETE /api/users/remove/:id
 * @desc   Soft-delete a customer — the record and their tickets/chats survive,
 *         they simply cannot log in until an admin restores them.
 * @access Private — Admin
 */
router.delete('/remove/:id', requireRole('admin'), deleteUser);

export default router;
