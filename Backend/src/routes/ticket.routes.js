import express from 'express';
const router = express.Router();

import {
  createTicket,
  getTickets,
  getTicketStats,
  getTicket,
  updateTicket,
  assignAgent,
  updateTicketStatus,
  escalateTicket,
  deleteTicket,
} from '../controllers/ticket.controller.js';

import { createTicketValidator, updateTicketValidator } from '../validator/ticket.validator.js';
import { validate } from '../middleware/validation.middleware.js';
import { protect, requireRole } from '../middleware/auth.middleware.js';
import { body } from 'express-validator';

// All ticket routes require authentication
router.use(protect);

// ============================================
// Stats — must come before /:id to avoid route clash
// ============================================

/**
 * @route   GET /api/tickets/stats
 * @desc    Dashboard counts: total, open, in_progress, resolved, closed, urgent, slaBreached
 * @access  Private — Admin only
 */
router.get('/stats', requireRole('admin'), getTicketStats);

// ============================================
// Collection routes
// ============================================

/**
 * @route   POST /api/tickets
 * @desc    Create ticket. Customer creates own. Agent/Admin requires customerId in body.
 *          AI classifies intent + sentiment async after response.
 * @access  Private — All roles
 */
router.post(
  '/',
  requireRole('customer', 'agent', 'admin'),
  createTicketValidator,
  validate,
  createTicket
);

/**
 * @route   GET /api/tickets
 * @desc    List tickets scoped by role.
 *          Admin → all company | Agent → assigned + unassigned | Customer → own
 *          Query: ?status=open&priority=high&category=billing&assignedAgent=id&page=1&limit=20&from=date&to=date
 * @access  Private — All roles
 */
router.get('/', getTickets);

// ============================================
// Single ticket routes
// ============================================

/**
 * @route   GET /api/tickets/:id
 * @desc    Single ticket + linked chat messages
 * @access  Private — All roles (customer only sees own)
 */
router.get('/:id', getTicket);

/**
 * @route   PATCH /api/tickets/:id
 * @desc    Update title, description, category, priority, tags
 *          Customer: only own open/pending tickets
 * @access  Private — All roles
 */
router.patch('/:id', updateTicketValidator, validate, updateTicket);

/**
 * @route   PATCH /api/tickets/:id/assign
 * @desc    Assign agent to ticket; auto-advances status to in_progress
 * @access  Private — Admin only
 */
router.patch(
  '/:id/assign',
  requireRole('admin'),
  [
    body('agentId')
      .notEmpty().withMessage('agentId is required')
      .isMongoId().withMessage('agentId must be a valid MongoDB ObjectId')
  ],
  validate,
  assignAgent
);

/**
 * @route   PATCH /api/tickets/:id/status
 * @desc    Update ticket status. Agent can only update assigned tickets.
 *          resolvedAt/closedAt set automatically.
 * @access  Private — Admin or Agent
 */
router.patch(
  '/:id/status',
  requireRole('admin', 'agent'),
  [
    body('status')
      .notEmpty()
      .isIn(['open', 'pending', 'in_progress', 'resolved', 'closed'])
      .withMessage('Status must be one of: open, pending, in_progress, resolved, closed')
  ],
  validate,
  updateTicketStatus
);

/**
 * @route   POST /api/tickets/:id/escalate
 * @desc    Escalate ticket. AI generates 3-sentence briefing (awaited, in response).
 *          Priority bumped to at least high. Status set to in_progress.
 * @access  Private — Agent or Admin
 */
router.post('/:id/escalate', requireRole('agent', 'admin'), escalateTicket);

/**
 * @route   DELETE /api/tickets/:id
 * @desc    Admin: hard delete. Agent/Customer: soft close (status = 'closed').
 * @access  Private — All roles
 */
router.delete('/:id', deleteTicket);

export default router;
