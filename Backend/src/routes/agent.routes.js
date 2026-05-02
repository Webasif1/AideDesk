import express from 'express';
const router = express.Router();

import {
  createAgent,
  getAgents,
  getAgent,
  updateAgent,
  deleteAgent,
  updateOwnStatus,
  changePassword,
} from '../controllers/agent.controller.js';

import {
  registerAgentValidator,
  updateAgentValidator,
  changePasswordValidator,
} from '../validator/agent.validator.js';
import { validate } from '../middleware/validation.middleware.js';
import { protect, requireRole } from '../middleware/auth.middleware.js';

// All agent routes require authentication
router.use(protect);

// ============================================
// Agent self-service (agent role)
// ============================================

/**
 * @route   PATCH /api/agents/status
 * @desc    Agent updates their own online/offline/away status
 * @access  Private — Agent only
 */
router.patch('/status', requireRole('agent'), updateOwnStatus);

/**
 * @route   PATCH /api/agents/:id/password
 * @desc    Agent changes their own password — requires current password
 * @access  Private — Agent only (own account)
 */
router.patch('/:id/password', requireRole('agent'), changePasswordValidator, validate, changePassword);

// ============================================
// Admin manages agents (admin role)
// ============================================

/**
 * @route   POST /api/agents
 * @desc    Admin creates a new agent for their company
 * @access  Private — Admin only
 */
router.post('/', requireRole('admin'), registerAgentValidator, validate, createAgent);

/**
 * @route   GET /api/agents
 * @desc    Admin lists all agents in their company (supports ?status=online&page=1&limit=20)
 * @access  Private — Admin only
 */
router.get('/', requireRole('admin'), getAgents);

// ============================================
// Shared — Admin or Agent (own profile)
// ============================================

/**
 * @route   GET /api/agents/:id
 * @desc    Get a single agent — admin can view any; agent can only view own
 * @access  Private — Admin or Agent
 */
router.get('/:id', requireRole('admin', 'agent'), getAgent);

/**
 * @route   PATCH /api/agents/:id
 * @desc    Update agent — admin can change all fields; agent limited to name/image/status
 * @access  Private — Admin or Agent
 */
router.patch('/:id', requireRole('admin', 'agent'), updateAgentValidator, validate, updateAgent);

/**
 * @route   DELETE /api/agents/:id
 * @desc    Admin removes an agent from their company
 * @access  Private — Admin only
 */
router.delete('/:id', requireRole('admin'), deleteAgent);

export default router;
