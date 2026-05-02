import ticketModel from '../models/ticket.model.js';
import agentModel from '../models/aget.model.js';
import chatModel from '../models/chat.model.js';
import messageModel from '../models/message.model.js';
import { HTTP_STATUS, ERROR_MESSAGES } from '../config/constants.js';
import { AppError, asyncHandler } from '../utils/errorHandler.js';
import {
  classifyIntent,
  scoreSentiment,
  generateEscalationBriefing
} from '../services/ai.service.js';

// ============================================
// Helper — assert ticket belongs to requester's company
// ============================================
const assertTicketAccess = (ticket, req) => {
  if (ticket.companyId.toString() !== req.companyId.toString()) {
    throw new AppError(ERROR_MESSAGES.FORBIDDEN, HTTP_STATUS.FORBIDDEN);
  }
};

// ============================================
// POST /api/tickets
// Customer creates own ticket; Agent/Admin creates on behalf of a customer (customerId required)
// AI classifies intent + sentiment fire-and-forget after creation
// ============================================
export const createTicket = asyncHandler(async (req, res) => {
  const { title, description, category, priority, source, tags, chat: chatId, customerId: bodyCustomerId } = req.body;

  let customerId;
  if (req.role === 'customer') {
    customerId = req.userId;
  } else {
    if (!bodyCustomerId) {
      throw new AppError('customerId is required when agent or admin creates a ticket', HTTP_STATUS.BAD_REQUEST);
    }
    customerId = bodyCustomerId;
  }

  if (chatId) {
    const chat = await chatModel.findById(chatId);
    if (!chat || chat.company.toString() !== req.companyId.toString()) {
      throw new AppError('Chat not found or does not belong to your company', HTTP_STATUS.NOT_FOUND);
    }
  }

  const ticket = await ticketModel.create({
    title,
    description,
    companyId: req.companyId,
    customerId,
    category: category || 'general',
    priority: priority || 'medium',
    source: source || 'dashboard',
    tags: tags || [],
    chat: chatId || null,
  });

  // Fire-and-forget AI classification — don't block response
  Promise.all([
    classifyIntent(description),
    scoreSentiment(description)
  ]).then(([intentLabel, sentimentScore]) => {
    ticketModel.findByIdAndUpdate(ticket._id, { intentLabel, sentimentScore }).catch(() => {});
  }).catch(() => {});

  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: 'Ticket created. AI classification running in background.',
    data: ticket,
  });
});

// ============================================
// GET /api/tickets
// Admin: all company tickets
// Agent: assigned + unassigned company tickets
// Customer: own tickets only
// Query: ?status=open&priority=high&category=billing&assignedAgent=id&page=1&limit=20&from=date&to=date
// ============================================
export const getTickets = asyncHandler(async (req, res) => {
  const {
    status, priority, category, assignedAgent,
    page = 1, limit = 20, from, to
  } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  let filter = { companyId: req.companyId };

  if (req.role === 'customer') {
    filter.customerId = req.userId;
  } else if (req.role === 'agent') {
    filter.$or = [{ assignedAgent: req.userId }, { assignedAgent: null }];
  }

  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (category) filter.category = category;
  if (assignedAgent && req.role === 'admin') filter.assignedAgent = assignedAgent;

  if (from || to) {
    filter.createdAt = {};
    if (from) filter.createdAt.$gte = new Date(from);
    if (to) filter.createdAt.$lte = new Date(to);
  }

  const [tickets, total] = await Promise.all([
    ticketModel
      .find(filter)
      .populate('customerId', 'fullName email profileImage')
      .populate('assignedAgent', 'name email status profileImage')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    ticketModel.countDocuments(filter)
  ]);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: tickets,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit))
    }
  });
});

// ============================================
// GET /api/tickets/stats
// Admin dashboard overview counts
// ============================================
export const getTicketStats = asyncHandler(async (req, res) => {
  const companyId = req.companyId;

  const [total, open, pending, inProgress, resolved, closed, urgent, slaBreached] = await Promise.all([
    ticketModel.countDocuments({ companyId }),
    ticketModel.countDocuments({ companyId, status: 'open' }),
    ticketModel.countDocuments({ companyId, status: 'pending' }),
    ticketModel.countDocuments({ companyId, status: 'in_progress' }),
    ticketModel.countDocuments({ companyId, status: 'resolved' }),
    ticketModel.countDocuments({ companyId, status: 'closed' }),
    ticketModel.countDocuments({ companyId, priority: 'urgent', status: { $nin: ['resolved', 'closed'] } }),
    ticketModel.countDocuments({ companyId, slaBreached: true }),
  ]);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: { total, open, pending, inProgress, resolved, closed, urgent, slaBreached }
  });
});

// ============================================
// GET /api/tickets/:id
// Single ticket + linked chat messages (if ticket originated from chat)
// ============================================
export const getTicket = asyncHandler(async (req, res) => {
  const ticket = await ticketModel
    .findById(req.params.id)
    .populate('customerId', 'fullName email profileImage')
    .populate('assignedAgent', 'name email status profileImage')
    .populate('chat');

  if (!ticket) throw new AppError('Ticket not found', HTTP_STATUS.NOT_FOUND);

  assertTicketAccess(ticket, req);

  if (req.role === 'customer' && ticket.customerId._id.toString() !== req.userId) {
    throw new AppError(ERROR_MESSAGES.FORBIDDEN, HTTP_STATUS.FORBIDDEN);
  }

  let chatMessages = [];
  if (ticket.chat) {
    chatMessages = await messageModel
      .find({ chat: ticket.chat._id })
      .sort({ createdAt: 1 })
      .lean();
  }

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: { ticket, chatMessages }
  });
});

// ============================================
// PATCH /api/tickets/:id
// Update title, description, category, priority, tags
// Customer can only edit their own open/pending tickets
// ============================================
export const updateTicket = asyncHandler(async (req, res) => {
  const ticket = await ticketModel.findById(req.params.id);
  if (!ticket) throw new AppError('Ticket not found', HTTP_STATUS.NOT_FOUND);

  assertTicketAccess(ticket, req);

  if (req.role === 'customer') {
    if (ticket.customerId.toString() !== req.userId) {
      throw new AppError(ERROR_MESSAGES.FORBIDDEN, HTTP_STATUS.FORBIDDEN);
    }
    if (!['open', 'pending'].includes(ticket.status)) {
      throw new AppError('Cannot edit a ticket that is already in progress or resolved', HTTP_STATUS.BAD_REQUEST);
    }
  }

  const allowedFields = ['title', 'description', 'category', 'priority', 'tags'];
  const updates = {};
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  }

  const updated = await ticketModel
    .findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true })
    .populate('customerId', 'fullName email')
    .populate('assignedAgent', 'name email');

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Ticket updated',
    data: updated
  });
});

// ============================================
// PATCH /api/tickets/:id/assign
// Admin assigns agent to ticket; auto-advances status to in_progress
// ============================================
export const assignAgent = asyncHandler(async (req, res) => {
  const { agentId } = req.body;
  if (!agentId) throw new AppError('agentId is required', HTTP_STATUS.BAD_REQUEST);

  const ticket = await ticketModel.findById(req.params.id);
  if (!ticket) throw new AppError('Ticket not found', HTTP_STATUS.NOT_FOUND);

  assertTicketAccess(ticket, req);

  const agent = await agentModel.findOne({ _id: agentId, companyId: req.companyId });
  if (!agent) throw new AppError('Agent not found in your company', HTTP_STATUS.NOT_FOUND);

  ticket.assignedAgent = agentId;
  if (ticket.status === 'open') ticket.status = 'in_progress';
  if (!ticket.firstResponseAt) ticket.firstResponseAt = new Date();
  await ticket.save();

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: `Ticket assigned to ${agent.name}`,
    data: {
      ticketId: ticket._id,
      assignedAgent: { id: agent._id, name: agent.name },
      status: ticket.status
    }
  });
});

// ============================================
// PATCH /api/tickets/:id/status
// Admin: any status | Agent: only tickets assigned to them
// Timestamps resolvedAt/closedAt set automatically
// ============================================
export const updateTicketStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['open', 'pending', 'in_progress', 'resolved', 'closed'];

  if (!validStatuses.includes(status)) {
    throw new AppError(`Status must be one of: ${validStatuses.join(', ')}`, HTTP_STATUS.BAD_REQUEST);
  }

  const ticket = await ticketModel.findById(req.params.id);
  if (!ticket) throw new AppError('Ticket not found', HTTP_STATUS.NOT_FOUND);

  assertTicketAccess(ticket, req);

  if (req.role === 'agent' && ticket.assignedAgent?.toString() !== req.userId) {
    throw new AppError(ERROR_MESSAGES.FORBIDDEN, HTTP_STATUS.FORBIDDEN);
  }

  ticket.status = status;
  if (status === 'resolved' && !ticket.resolvedAt) ticket.resolvedAt = new Date();
  if (status === 'closed' && !ticket.closedAt) ticket.closedAt = new Date();
  await ticket.save();

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: `Ticket status updated to ${status}`,
    data: { ticketId: ticket._id, status: ticket.status }
  });
});

// ============================================
// POST /api/tickets/:id/escalate
// Agent or Admin escalates ticket
// AI generates 3-sentence briefing (awaited — agent needs it in response)
// Priority bumped to at least 'high'; status set to in_progress
// ============================================
export const escalateTicket = asyncHandler(async (req, res) => {
  const ticket = await ticketModel.findById(req.params.id).populate('chat');

  if (!ticket) throw new AppError('Ticket not found', HTTP_STATUS.NOT_FOUND);

  assertTicketAccess(ticket, req);

  if (ticket.escalatedAt) {
    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Ticket already escalated',
      data: {
        ticketId: ticket._id,
        aiSummary: ticket.aiSummary,
        escalatedAt: ticket.escalatedAt
      }
    });
  }

  let thread = [];
  if (ticket.chat) {
    thread = await messageModel
      .find({ chat: ticket.chat._id })
      .sort({ createdAt: 1 })
      .select('role content')
      .lean();
  }

  let aiSummary;
  try {
    aiSummary = await generateEscalationBriefing({
      thread,
      sentiment: ticket.sentimentScore || 3,
      ticketTitle: ticket.title,
    });
  } catch {
    aiSummary = `Ticket "${ticket.title}" escalated. Sentiment: ${ticket.sentimentScore || 'unknown'}/5. Review chat history for full context.`;
  }

  ticket.escalatedAt = new Date();
  ticket.aiSummary = aiSummary;
  ticket.status = 'in_progress';
  // Bump priority: low/medium → high; high/urgent unchanged
  if (['low', 'medium'].includes(ticket.priority)) ticket.priority = 'high';
  await ticket.save();

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Ticket escalated',
    data: {
      ticketId: ticket._id,
      ticketNumber: ticket.ticketNumber,
      aiSummary,
      escalatedAt: ticket.escalatedAt,
      priority: ticket.priority,
      status: ticket.status
    }
  });
});

// ============================================
// DELETE /api/tickets/:id
// Admin: hard delete | Agent/Customer: soft close (status = 'closed')
// ============================================
export const deleteTicket = asyncHandler(async (req, res) => {
  const ticket = await ticketModel.findById(req.params.id);
  if (!ticket) throw new AppError('Ticket not found', HTTP_STATUS.NOT_FOUND);

  assertTicketAccess(ticket, req);

  if (req.role === 'customer' && ticket.customerId.toString() !== req.userId) {
    throw new AppError(ERROR_MESSAGES.FORBIDDEN, HTTP_STATUS.FORBIDDEN);
  }

  if (req.role === 'admin') {
    await ticketModel.findByIdAndDelete(req.params.id);
    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Ticket permanently deleted'
    });
  }

  // Soft-close for agent / customer
  ticket.status = 'closed';
  ticket.closedAt = new Date();
  await ticket.save();

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Ticket closed',
    data: { ticketId: ticket._id, status: 'closed' }
  });
});
