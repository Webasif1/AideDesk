import { Router } from 'express';
const router = Router();

// ============================================
// Import Validators
// ============================================
import {
  updateCompanyValidator,
  createCompanyValidator
} from '../validator/company.validator.js';

// ============================================
// Import Middlewares
// ============================================
import { protect, requireRole } from '../middleware/auth.middleware.js';

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
// Every route here operates on the caller's OWN company, which is read from
// their session — never from the URL. The :id and :companyId params are kept
// only so existing clients keep working; assertOwnCompany below rejects any
// value that is not the caller's own, and the controllers ignore the param
// entirely. Prefer the /me forms in new code.
//
// Previously these were `protect`-only: no role check and no tenant check, so
// any authenticated user of any tenant could read another company's customers,
// agents and full message corpus, overwrite its record, or delete it outright.
// ============================================
router.use(protect);
router.use(requireRole('admin'));

// Rejects a URL that names someone else's company rather than silently
// serving the caller's own, so a mis-scoped client fails loudly instead of
// appearing to work.
const assertOwnCompany = (param) => (req, res, next) => {
  const value = req.params[param];
  if (value && value !== 'me' && String(value) !== String(req.companyId)) {
    return res.status(403).json({
      success: false,
      statusCode: 403,
      message: 'You can only access your own company',
      code: 'FORBIDDEN'
    });
  }
  next();
};

/**
 * @route   POST /api/company/register
 * @desc    Register a new company (admin only)
 * @access  Private — admin
 */
router.post('/register', createCompanyValidator, registerCompanyController);

// ── Own-company routes ──────────────────────────────────────────────────────
// Registered before /:id — Express matches in order, so /:id would otherwise
// swallow "me" and hand the controller a company id of "me".

/**
 * @route   GET /api/company/me
 * @desc    Get the caller's company
 * @access  Private — admin
 */
router.get('/me', getCompanyController);

/**
 * @route   PUT /api/company/me
 * @desc    Update the caller's company
 * @access  Private — admin
 */
router.put('/me', updateCompanyValidator, updateCompanyController);

/**
 * @route   DELETE /api/company/me
 * @desc    Delete the caller's company (requires confirmSlug in the body)
 * @access  Private — admin
 */
router.delete('/me', deleteCompanyController);

/**
 * @route   GET /api/company/me/users|agents|tickets|messages
 * @desc    Company-scoped collections for the caller's own company
 * @access  Private — admin
 */
router.get('/me/users', getCompanyUsersController);
router.get('/me/agents', getCompanyAgentsController);
router.get('/me/tickets', getCompanyTicketsController);
router.get('/me/messages', getCompanyMessagesController);

// ── Legacy id-bearing routes ────────────────────────────────────────────────
// Retained for existing clients. The id must match the caller's own company.

router.get('/:id', assertOwnCompany('id'), getCompanyController);
router.put('/:id', assertOwnCompany('id'), updateCompanyValidator, updateCompanyController);
router.delete('/:id', assertOwnCompany('id'), deleteCompanyController);

router.get('/:companyId/users', assertOwnCompany('companyId'), getCompanyUsersController);
router.get('/:companyId/agents', assertOwnCompany('companyId'), getCompanyAgentsController);
router.get('/:companyId/tickets', assertOwnCompany('companyId'), getCompanyTicketsController);
router.get('/:companyId/messages', assertOwnCompany('companyId'), getCompanyMessagesController);

// ============================================
// Export Router
// ============================================
export default router;
