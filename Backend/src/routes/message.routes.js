import express from 'express';
const router = express.Router();

import {
  sendMessage,
  getMessages,
  markMessagesRead,
  getUnreadCount,
  requestAiSuggestions,
} from '../controllers/message.controller.js';

import { sendMessageValidator } from '../validator/message.validator.js';
import { validate } from '../middleware/validation.middleware.js';
import { protect, requireRole } from '../middleware/auth.middleware.js';

// All message routes require authentication
router.use(protect);

// ============================================
// Send & retrieve messages
// ============================================

/**
 * @route   POST /api/messages
 * @desc    Send a message in a chat session
 *          role 'user' (customer) → stored with role:'user', triggers AI pipeline
 *          role 'agent' → stored with role:'agent'
 * @access  Private — Customer or Agent
 */
router.post(
  '/',
  requireRole('customer', 'agent'),
  sendMessageValidator,
  validate,
  sendMessage
);

/**
 * @route   GET /api/messages/:chatId
 * @desc    Paginated message history for a chat, oldest-first
 *          Query: ?page=1&limit=30
 * @access  Private — All roles (access-checked against chat ownership)
 */
router.get('/:chatId', getMessages);

// ============================================
// Read receipts
// ============================================

/**
 * @route   PATCH /api/messages/:chatId/read
 * @desc    Mark all unread messages in a chat as read (from the other party's perspective)
 * @access  Private — Customer or Agent
 */
router.patch('/:chatId/read', requireRole('customer', 'agent'), markMessagesRead);

/**
 * @route   GET /api/messages/:chatId/unread-count
 * @desc    Count unread messages in a chat for the requesting user
 * @access  Private — Customer or Agent
 */
router.get('/:chatId/unread-count', requireRole('customer', 'agent'), getUnreadCount);

// ============================================
// AI co-pilot
// ============================================

/**
 * @route   POST /api/messages/:messageId/suggest
 * @desc    Agent requests AI co-pilot suggestions for a customer message.
 *          Enqueues a BullMQ job; suggestions arrive via Socket.IO (not in HTTP response).
 * @access  Private — Agent only
 */
router.post('/:messageId/suggest', requireRole('agent'), requestAiSuggestions);

export default router;
