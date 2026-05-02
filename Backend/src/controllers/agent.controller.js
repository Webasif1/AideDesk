import crypto from 'crypto';
import agentModel from '../models/aget.model.js';
import companyModel from '../models/company.model.js';
import { HTTP_STATUS, ERROR_MESSAGES } from '../config/constants.js';
import { AppError, asyncHandler } from '../utils/errorHandler.js';
import { sendAgentInviteEmail } from '../utils/email.js';
import { config } from '../config/config.js';
import jwt from 'jsonwebtoken';

// ============================================
// Generates a temporary password in the format: <Company4Letters><5RandomChars>
// Example: "Tech" + "3kPmN" → "Tech3kPmN"
// ============================================
const generateAgentPassword = (companyName) => {
  // Strip non-alpha, take first 4, pad with 'X' if the name is short
  const prefix = companyName
    .replace(/[^a-zA-Z]/g, '')
    .substring(0, 4)
    .padEnd(4, 'X');

  // Charset excludes visually confusing characters (0/O, 1/l/I)
  const charset = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  const random = Array.from(
    crypto.randomBytes(5),
    (byte) => charset[byte % charset.length]
  ).join('');

  return prefix + random;
};

// ============================================
// POST /api/agents
// Admin adds an agent to their company.
// Password is server-generated and sent only via the invite email.
// ============================================
export const createAgent = asyncHandler(async (req, res) => {
  if (!req.companyId) {
    throw new AppError(
      'Please complete your company setup before adding agents.',
      HTTP_STATUS.BAD_REQUEST
    );
  }

  const { name, email } = req.body;

  const exists = await agentModel.findOne({ email });
  if (exists) {
    throw new AppError(ERROR_MESSAGES.USER_EXISTS, HTTP_STATUS.CONFLICT);
  }

  // Fetch company so we can use the name in the password and in the email
  const company = await companyModel.findById(req.companyId);
  if (!company) {
    throw new AppError('Company not found. Please contact support.', HTTP_STATUS.NOT_FOUND);
  }

  const tempPassword = generateAgentPassword(company.name);

  // Create agent — bcrypt pre-save hook hashes the password automatically
  const agent = await agentModel.create({
    name,
    email,
    password: tempPassword,
    companyId: req.companyId,
  });

  // Invite token — short-lived (7d), contains role so verifyEmailToken picks the right model
  const inviteToken = jwt.sign(
    { userId: agent._id, email: agent.email, role: 'agent' },
    config.JWT_SECRET,
    { expiresIn: '7d' }
  );

  const verifyLink = `${config.BACKEND_URL || `http://localhost:${config.PORT}`}/api/auth/verify/${inviteToken}`;

  // Send invite — fire-and-forget, email failure should not block the response
  sendAgentInviteEmail({
    email: config.TEST_RECIEVER_EMAIL || agent.email,
    agentName: agent.name,
    companyName: company.name,
    loginEmail: agent.email,
    tempPassword,   // plain-text password, sent before bcrypt hashes it in the DB
    verifyLink,
    frontendUrl: config.FRONTEND_URL,
  }).then((sent) => {
    console.log(
      sent
        ? `📧 Agent invite sent → ${agent.email}`
        : `❎ Agent invite email failed → ${agent.email}`
    );
  });

  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: `Agent added successfully. An invite email with login credentials has been sent to ${agent.email}.`,
    data: {
      id: agent._id,
      name: agent.name,
      email: agent.email,
      companyId: agent.companyId,
      status: agent.status,
      isVerified: agent.isVerified,
    },
  });
});

// ============================================
// GET /api/agents
// Admin: all agents in their company
// ============================================
export const getAgents = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const filter = { companyId: req.companyId };
  if (status) filter.status = status;

  const [agents, total] = await Promise.all([
    agentModel
      .find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    agentModel.countDocuments(filter),
  ]);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: agents,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit)),
    },
  });
});

// ============================================
// GET /api/agents/:id
// Admin: any agent in their company | Agent: own profile
// ============================================
export const getAgent = asyncHandler(async (req, res) => {
  const agent = await agentModel.findById(req.params.id).select('-password');

  if (!agent) {
    throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  }

  const isOwnProfile = req.role === 'agent' && agent._id.toString() === req.userId;
  const isAdminOfCompany =
    req.role === 'admin' && agent.companyId.toString() === req.companyId.toString();

  if (!isOwnProfile && !isAdminOfCompany) {
    throw new AppError(ERROR_MESSAGES.FORBIDDEN, HTTP_STATUS.FORBIDDEN);
  }

  res.status(HTTP_STATUS.OK).json({ success: true, data: agent });
});

// ============================================
// PATCH /api/agents/:id
// Admin: any field | Agent: own name/profileImage/status only
// ============================================
export const updateAgent = asyncHandler(async (req, res) => {
  const agent = await agentModel.findById(req.params.id);

  if (!agent) {
    throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  }

  const isOwnProfile = req.role === 'agent' && agent._id.toString() === req.userId;
  const isAdminOfCompany =
    req.role === 'admin' && agent.companyId.toString() === req.companyId.toString();

  if (!isOwnProfile && !isAdminOfCompany) {
    throw new AppError(ERROR_MESSAGES.FORBIDDEN, HTTP_STATUS.FORBIDDEN);
  }

  const updates = isAdminOfCompany ? { ...req.body } : {};

  if (isOwnProfile) {
    const agentAllowed = ['name', 'profileImage', 'status'];
    agentAllowed.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });
  }

  // Never allow these to be changed via this endpoint
  delete updates.role;
  delete updates.companyId;
  delete updates.password;
  delete updates.isVerified;

  const updated = await agentModel
    .findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true })
    .select('-password');

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Agent updated successfully',
    data: updated,
  });
});

// ============================================
// PATCH /api/agents/:id/password
// Agent changes their own password (requires current password)
// ============================================
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  // Only the agent themselves can change their password
  if (req.role !== 'agent' || req.params.id !== req.userId) {
    throw new AppError(ERROR_MESSAGES.FORBIDDEN, HTTP_STATUS.FORBIDDEN);
  }

  const agent = await agentModel.findById(req.userId).select('+password');
  if (!agent) {
    throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  }

  const isMatch = await agent.comparePassword(currentPassword);
  if (!isMatch) {
    throw new AppError('Current password is incorrect', HTTP_STATUS.UNAUTHORIZED);
  }

  agent.password = newPassword; // pre-save hook re-hashes
  await agent.save();

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Password changed successfully.',
  });
});

// ============================================
// DELETE /api/agents/:id
// Admin removes an agent from their company
// ============================================
export const deleteAgent = asyncHandler(async (req, res) => {
  const agent = await agentModel.findById(req.params.id);

  if (!agent) {
    throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  }

  if (agent.companyId.toString() !== req.companyId.toString()) {
    throw new AppError(ERROR_MESSAGES.FORBIDDEN, HTTP_STATUS.FORBIDDEN);
  }

  await agentModel.findByIdAndDelete(req.params.id);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Agent removed successfully',
  });
});

// ============================================
// PATCH /api/agents/status
// Agent updates their own online/offline/away status
// ============================================
export const updateOwnStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!['online', 'offline', 'away'].includes(status)) {
    throw new AppError('Status must be online, offline, or away', HTTP_STATUS.BAD_REQUEST);
  }

  const agent = await agentModel
    .findByIdAndUpdate(req.userId, { status }, { new: true })
    .select('-password');

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Status updated',
    data: { status: agent.status },
  });
});
