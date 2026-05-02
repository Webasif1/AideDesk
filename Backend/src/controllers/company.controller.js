// ============================================
// Import Models
// ============================================
import companyModel from '../models/company.model.js';
import adminModel from '../models/admin.model.js';
import userModel from '../models/user.model.js';
import agentModel from '../models/aget.model.js';
import chatModel from '../models/chat.model.js';
import ticketModel from '../models/ticket.model.js';
import messageModel from '../models/message.model.js';

// ============================================
// Import Utilities
// ============================================
import { AppError, asyncHandler } from '../utils/errorHandler.js';
import { HTTP_STATUS } from '../config/constants.js';
import { config } from '../config/config.js';

// ============================================
// Register Company
// ============================================
/**
 * @desc   Register a new company and link it to the authenticated admin.
 *         Also auto-creates a workspace for the company.
 *
 * Flow:
 *  1. Check no company with the same email/slug already exists
 *  2. Create the company with adminId = req.admin._id
 *  3. Link the new company back to the admin (admin.companyId)
 *
 * @route  POST /api/company/register
 * @access Private — admin
 */
export const registerCompanyController = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    slug,
    email,
    phone,
    website,
    industry,
    size,
    address,
    country,
    branding,
    plan
  } = req.body;

  // ── 1. Duplicate checks ───────────────────────────────────────────────────────
  const emailExists = await companyModel.findOne({ email });
  if (emailExists) {
    throw new AppError(
      'A company with this email already exists',
      HTTP_STATUS.CONFLICT
    );
  }

  const slugExists = await companyModel.findOne({ slug });
  if (slugExists) {
    throw new AppError(
      'A company with this slug already exists',
      HTTP_STATUS.CONFLICT
    );
  }

  // ── 2. Create the company ─────────────────────────────────────────────────────
  // adminId comes from the authenticated admin (set by authenticateAdmin middleware)
  const company = await companyModel.create({
    name,
    description,
    slug,
    email,
    phone,
    website,
    industry,
    size,
    address,
    country,
    branding,
    plan,
    adminId: req.admin._id, // set server-side from auth middleware
    workSpaceId: null // can be linked after workspace creation
  });

  // ── 3. Link company back to the admin ─────────────────────────────────────────
  // await adminModel.findByIdAndUpdate(req.admin._id, {
  //   companyId: company._id
  // });

  if (config.NODE_ENV === 'development') {
    console.log(
      `✅ New company registered: ${company.name} (${company.email})`
    );
  }

  // ── 4. Response (never expose internal refs or __v) ───────────────────────────
  const companyResponse = {
    name: company.name,
    description: company.description,
    slug: company.slug,
    email: company.email,
    phone: company.phone,
    website: company.website,
    industry: company.industry,
    size: company.size,
    address: company.address,
    country: company.country,
    branding: company.branding,
    plan: company.plan,
    status: company.status,
    createdAt: company.createdAt
  };

  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: 'Company registered successfully',
    data: companyResponse
  });
});

// ============================================
// Get Company by ID
// ============================================
/**
 * @desc   Fetch full company details by MongoDB _id.
 *
 * @route  GET /api/company/:id
 * @access Private — admin
 */
export const getCompanyController = asyncHandler(async (req, res) => {
  const company = await companyModel
    .findById(req.params.id)
    .populate('adminId', 'fullName email role profileImage status');

  if (!company) {
    throw new AppError('Company not found', HTTP_STATUS.NOT_FOUND);
  }

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: company
  });
});

// ============================================
// Update Company
// ============================================
/**
 * @desc   Update editable company fields.
 *         adminId, workSpaceId, and status are excluded from client updates.
 *
 * @route  PUT /api/company/:id
 * @access Private — admin
 */
export const updateCompanyController = asyncHandler(async (req, res) => {
  // Strip fields that should never be updated via this route
  const { adminId, workSpaceId, status, ...updateData } = req.body;

  const company = await companyModel.findByIdAndUpdate(
    req.params.id,
    { $set: updateData },
    { new: true, runValidators: true }
  );

  if (!company) {
    throw new AppError('Company not found', HTTP_STATUS.NOT_FOUND);
  }

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Company updated successfully',
    data: company
  });
});

// ============================================
// Delete Company
// ============================================
/**
 * @desc   Permanently delete a company and unlink it from the admin.
 *
 * @route  DELETE /api/company/:id
 * @access Private — admin
 */
export const deleteCompanyController = asyncHandler(async (req, res) => {
  const company = await companyModel.findById(req.params.id);

  if (!company) {
    throw new AppError('Company not found', HTTP_STATUS.NOT_FOUND);
  }

  // Unlink company from admin
  await adminModel.findByIdAndUpdate(company.adminId, { companyId: null });

  await company.deleteOne();

  console.log(`🗑️  Company deleted: ${company.name}`);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Company deleted successfully'
  });
});

// ============================================
// Get Company Users
// ============================================
/**
 * @desc   Get all customers (users) belonging to a company.
 *
 * @route  GET /api/company/:companyId/users
 * @access Private — admin
 */
export const getCompanyUsersController = asyncHandler(async (req, res) => {
  const companyId = req.admin.companyId;
  const users = await userModel.find({ companyId: companyId }).select('-__v');

  res.status(HTTP_STATUS.OK).json({
    success: true,
    count: users.length,
    data: users
  });
});

// ============================================
// Get Company Agents
// ============================================
/**
 * @desc   Get all support agents assigned to a company.
 *
 * @route  GET /api/company/:companyId/agents
 * @access Private — admin
 */
export const getCompanyAgentsController = asyncHandler(async (req, res) => {
  const companyId = req.admin.companyId;
  const agents = await agentModel
    .find({ companyId: companyId })
    .select('-password -__v');

  res.status(HTTP_STATUS.OK).json({
    success: true,
    count: agents.length,
    data: agents
  });
});

// ============================================
// Get Company Tickets
// ============================================
/**
 * @desc   Get all support tickets raised under a company.
 *
 * @route  GET /api/company/:companyId/tickets
 * @access Private — admin
 */
export const getCompanyTicketsController = asyncHandler(async (req, res) => {
  const companyId = req.admin.companyId;
  const tickets = await ticketModel
    .find({ companyId: companyId })
    .populate('createdBy', 'name email')
    .populate('assignedTo', 'name email')
    .select('-__v');

  res.status(HTTP_STATUS.OK).json({
    success: true,
    count: tickets.length,
    data: tickets
  });
});

// ============================================
// Get Company Messages
// ============================================
/**
 * @desc   Get all messages under a company.
 *         message.model.js has no companyId — messages are scoped to a chat,
 *         and chat.company holds the companyId. So we:
 *           1. Find all chat IDs belonging to this company
 *           2. Query messages where chat is in that set
 *
 * @route  GET /api/company/:companyId/messages
 * @access Private — admin
 */
export const getCompanyMessagesController = asyncHandler(async (req, res) => {
  const companyId = req.admin.companyId;

  const chats = await chatModel.find({ company: companyId }).select('_id');

  const chatIds = chats.map(c => c._id);

  const messages = await messageModel
    .find({ chat: { $in: chatIds } })
    .populate({
      path: 'sender',
      select: 'name email role'
    })
    .select('-__v');

  res.status(HTTP_STATUS.OK).json({
    success: true,
    count: messages.length,
    data: messages
  });
});
