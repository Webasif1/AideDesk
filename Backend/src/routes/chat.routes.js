import express from 'express';
const router = express.Router();

import {
  createChat,
  getChats,
  getChat,
  assignAgent,
  updateChatStatus,
  getChatStats,
} from '../controllers/chat.controller.js';

import { protect, requireRole } from '../middleware/auth.middleware.js';
import { body } from 'express-validator';
import { validate } from '../middleware/validation.middleware.js';

// All chat routes require authentication
router.use(protect);

// ============================================
// Admin stats (must come before /:id to avoid route clash)
// ============================================

/**
 * @route   GET /api/chats/stats
 * @desc    Dashboard overview: total, active, waiting, closed, unassigned counts
 * @access  Private — Admin only
 */
router.get('/stats', requireRole('admin'), getChatStats);

// ============================================
// Shared routes
// ============================================

/**
 * @route   POST /api/chats
 * @desc    Customer starts a new chat session (deduplicates if one is already active)
 * @access  Private — Customer only
 */
router.post('/', requireRole('customer'), createChat);

/**
 * @route   GET /api/chats
 * @desc    List chats — scoped by role:
 *          Admin → all company chats | Agent → assigned + unassigned | Customer → own chats
 *          Query: ?status=active&page=1&limit=20
 * @access  Private — All roles
 */
router.get('/', getChats);

/**
 * @route   GET /api/chats/:id
 * @desc    Get a single chat + last 50 messages (use /messages for full history)
 * @access  Private — All roles (access-checked per role inside controller)
 */
router.get('/:id', getChat);

/**
 * @route   PATCH /api/chats/:id/assign
 * @desc    Admin assigns or reassigns an agent to a chat
 * @access  Private — Admin only
 */
router.patch(
  '/:id/assign',
  requireRole('admin'),
  [body('agentId').notEmpty().withMessage('agentId is required').isMongoId().withMessage('agentId must be a valid ObjectId')],
  validate,
  assignAgent
);

/**
 * @route   PATCH /api/chats/:id/status
 * @desc    Update chat status — admin can change any; agent can only change assigned chats
 * @access  Private — Admin or Agent
 */
router.patch(
  '/:id/status',
  requireRole('admin', 'agent'),
  [body('status').notEmpty().isIn(['active', 'waiting', 'closed']).withMessage('Status must be active, waiting, or closed')],
  validate,
  updateChatStatus
);

export default router;
