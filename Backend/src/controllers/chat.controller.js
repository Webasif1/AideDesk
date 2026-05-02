import chatModel from '../models/chat.model.js';
import messageModel from '../models/message.model.js';
import agentModel from '../models/aget.model.js';
import { HTTP_STATUS, ERROR_MESSAGES } from '../config/constants.js';
import { AppError, asyncHandler } from '../utils/errorHandler.js';

// ============================================
// POST /api/chats
// Customer starts a new chat session with a company's support
// ============================================
export const createChat = asyncHandler(async (req, res) => {
  // Prevent duplicate open chats: one active session per customer per company
  const existing = await chatModel.findOne({
    user: req.userId,
    company: req.companyId,
    status: 'active'
  });

  if (existing) {
    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'You already have an active chat session.',
      data: existing
    });
  }

  const chat = await chatModel.create({
    company: req.companyId,
    user: req.userId,
    status: 'active'
  });

  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: 'Chat session started.',
    data: chat
  });
});

// ============================================
// GET /api/chats
// Admin: all chats for their company
// Agent: chats assigned to them + unassigned chats for their company
// Customer: their own chats
// Supports: ?status=active&page=1&limit=20
// ============================================
export const getChats = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  let filter = {};

  if (req.role === 'admin') {
    filter.company = req.companyId;
  } else if (req.role === 'agent') {
    filter.company = req.companyId;
    filter.$or = [{ assignedAgent: req.userId }, { assignedAgent: null }];
  } else if (req.role === 'customer') {
    filter.user = req.userId;
  }

  if (status) filter.status = status;

  const [chats, total] = await Promise.all([
    chatModel
      .find(filter)
      .populate('user', 'name email profileImage')
      .populate('assignedAgent', 'name email status profileImage')
      .populate('latestMessage', 'content role createdAt')
      .sort({ lastActivity: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    chatModel.countDocuments(filter)
  ]);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: chats,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit))
    }
  });
});

// ============================================
// GET /api/chats/:id
// Returns chat details + last 50 messages (paginate with /messages if needed)
// ============================================
export const getChat = asyncHandler(async (req, res) => {
  const chat = await chatModel
    .findById(req.params.id)
    .populate('user', 'name email profileImage')
    .populate('assignedAgent', 'name email status profileImage')
    .populate('ticket', 'ticketNumber title status priority');

  if (!chat) {
    throw new AppError('Chat not found', HTTP_STATUS.NOT_FOUND);
  }

  // Enforce access: admin/agent sees company chats, customer sees own chats
  const hasAccess =
    (req.role === 'admin' &&
      chat.company.toString() === req.companyId.toString()) ||
    (req.role === 'agent' &&
      chat.company.toString() === req.companyId.toString()) ||
    (req.role === 'customer' && chat.user._id.toString() === req.userId);

  if (!hasAccess) {
    throw new AppError(ERROR_MESSAGES.FORBIDDEN, HTTP_STATUS.FORBIDDEN);
  }

  // Include last 50 messages so the agent/customer doesn't need a second request
  const messages = await messageModel
    .find({ chat: chat._id })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean(); //? Gives plain JavaScript objects instead of full Mongoose documents.

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: { chat, messages: messages.reverse() }
  });
});

// ============================================
// PATCH /api/chats/:id/assign
// Admin assigns an agent to a chat (or reassigns)
// ============================================
export const assignAgent = asyncHandler(async (req, res) => {
  const { agentId } = req.body;

  if (!agentId) {
    throw new AppError('agentId is required', HTTP_STATUS.BAD_REQUEST);
  }

  const chat = await chatModel.findById(req.params.id);
  if (!chat) throw new AppError('Chat not found', HTTP_STATUS.NOT_FOUND);

  if (chat.company.toString() !== req.companyId.toString()) {
    throw new AppError(ERROR_MESSAGES.FORBIDDEN, HTTP_STATUS.FORBIDDEN);
  }

  // Verify the agent belongs to the same company
  const agent = await agentModel.findOne({
    _id: agentId,
    companyId: req.companyId
  });
  if (!agent) {
    throw new AppError(
      'Agent not found in your company',
      HTTP_STATUS.NOT_FOUND
    );
  }

  chat.assignedAgent = agentId;
  chat.status = 'active';
  await chat.save();

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: `Chat assigned to ${agent.name}`,
    data: {
      chatId: chat._id,
      assignedAgent: { id: agent._id, name: agent.name }
    }
  });
});

// ============================================
// PATCH /api/chats/:id/status
// Agent or Admin updates chat status (active / waiting / closed)
// ============================================
export const updateChatStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!['active', 'waiting', 'closed'].includes(status)) {
    throw new AppError(
      'Status must be active, waiting, or closed',
      HTTP_STATUS.BAD_REQUEST
    );
  }

  const chat = await chatModel.findById(req.params.id);
  if (!chat) throw new AppError('Chat not found', HTTP_STATUS.NOT_FOUND);

  // Agents can only update chats assigned to them or unassigned
  if (req.role === 'agent') {
    const isAssigned =
      chat.assignedAgent && chat.assignedAgent.toString() === req.userId;
    if (!isAssigned) {
      throw new AppError(ERROR_MESSAGES.FORBIDDEN, HTTP_STATUS.FORBIDDEN);
    }
  }

  if (chat.company.toString() !== req.companyId.toString()) {
    throw new AppError(ERROR_MESSAGES.FORBIDDEN, HTTP_STATUS.FORBIDDEN);
  }

  chat.status = status;
  if (status === 'closed') chat.lastActivity = new Date();
  await chat.save();

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: `Chat marked as ${status}`,
    data: { chatId: chat._id, status: chat.status }
  });
});

// ============================================
// GET /api/chats/stats
// Admin: overview counts for the dashboard
// ============================================
export const getChatStats = asyncHandler(async (req, res) => {
  const companyId = req.companyId;

  const [total, active, waiting, closed, unassigned] = await Promise.all([
    chatModel.countDocuments({ company: companyId }),
    chatModel.countDocuments({ company: companyId, status: 'active' }),
    chatModel.countDocuments({ company: companyId, status: 'waiting' }),
    chatModel.countDocuments({ company: companyId, status: 'closed' }),
    chatModel.countDocuments({
      company: companyId,
      assignedAgent: null,
      status: 'active'
    })
  ]);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: { total, active, waiting, closed, unassigned }
  });
});
