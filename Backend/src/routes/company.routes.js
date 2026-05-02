import { Router } from 'express';
const router = Router();

// ============================================
// Import Validators
// ============================================
import {
  registerCompanyValidator,
  loginCompanyValidator
} from '../validator/company.validator.js';

// ============================================
// Import Middlewares
// ============================================
import { authenticateAdmin } from '../middleware/auth.middleware.js';

// ============================================
// Import Controllers
// ============================================
import {
  registerCompanyController,
  getCompanyController,
  updateCompanyController,
  deleteCompanyController,
  getCompanyUsersController,
  getCompanyAgentsController,
  getCompanyTicketsController,
  getCompanyMessagesController
} from '../controllers/company.controller.js';

// ============================================
// ── Admin Routes (register / auth / manage) ─
// ============================================

/**
 * @route   POST /api/company/register
 * @desc    Register a new company (admin only)
 * @access  Private — admin
 */
router.post('/register', registerCompanyValidator, registerCompanyController);

/**
 * @route   GET /api/company/:id
 * @desc    Get a company by ID
 * @access  Private — admin
 */
router.get('/:id', authenticateAdmin, getCompanyController);

/**
 * @route   PUT /api/company/:id
 * @desc    Update company details
 * @access  Private — admin
 */
router.put('/:id', authenticateAdmin, updateCompanyController);

/**
 * @route   DELETE /api/company/:id
 * @desc    Delete a company
 * @access  Private — admin
 */
router.delete('/:id', authenticateAdmin, deleteCompanyController);

// ============================================
// ── Company Data Routes (users / agents / tickets / messages)
// ── All scoped to a specific company by :companyId
// ============================================

/**
 * @route   GET /api/company/:companyId/users
 * @desc    Get all users belonging to a company
 * @access  Private — admin
 */
router.get('/:companyId/users', authenticateAdmin, getCompanyUsersController);

/**
 * @route   GET /api/company/:companyId/agents
 * @desc    Get all agents assigned to a company
 * @access  Private — admin
 */
router.get('/:companyId/agents', authenticateAdmin, getCompanyAgentsController);

/**
 * @route   GET /api/company/:companyId/tickets
 * @desc    Get all tickets raised under a company
 * @access  Private — admin
 */
router.get(
  '/:companyId/tickets',
  authenticateAdmin,
  getCompanyTicketsController
);

/**
 * @route   GET /api/company/:companyId/messages
 * @desc    Get all messages under a company
 * @access  Private — admin
 */
router.get(
  '/:companyId/messages',
  authenticateAdmin,
  getCompanyMessagesController
);

// ============================================
// Export Router
// ============================================
export default router;
