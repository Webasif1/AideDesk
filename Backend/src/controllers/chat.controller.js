import chatModel from "../models/chat.model.js";
import messageModel from "../models/message.model.js";
import agentModel from "../models/aget.model.js";
import ticketModel from "../models/ticket.model.js";
import { HTTP_STATUS, ERROR_MESSAGES } from "../config/constants.js";
import { AppError, asyncHandler } from "../utils/errorHandler.js";
<<<<<<< HEAD
import { answerChatMessage } from "../services/ticketCopilot.service.js";
import { socketEmit, emitDomain } from "../sockets/emit.js";
=======
import { handleCustomerReply } from "../services/copilotFlow.service.js";
>>>>>>> aae7b5cb8fd64ce2fd9c76e4a3b10a264c39f62f

// ============================================
// POST /api/chats
// Customer starts a new chat session with a company"s support
// ============================================
export const createChat = asyncHandler(async (req, res) => {
  // One general-purpose session per customer per company. Ticket-bound chats are
  // excluded — those are owned by their ticket (one chat per ticket) and must not
  // be handed back as the customer's walk-in conversation.
  const existing = await chatModel.findOne({
    user: req.userId,
    company: req.companyId,
    status: "active",
    ticket: null
  });

  if (existing) {
    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "You already have an active chat session.",
      data: existing
    });
  }

  if (!req.workspaceId) {
    throw new AppError(
      "No workspace on your account. Ask your administrator to assign you to one.",
      HTTP_STATUS.BAD_REQUEST
    );
  }

  const chat = await chatModel.create({
    company: req.companyId,
<<<<<<< HEAD
    workspaceId: req.workspaceId,
=======
    workspaceId: req.workspaceId, // required by schema; comes from the customer JWT
>>>>>>> aae7b5cb8fd64ce2fd9c76e4a3b10a264c39f62f
    user: req.userId,
    status: "active"
  });

  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: "Chat session started.",
    data: chat
  });
});

// ============================================
// POST /api/chats/:id/messages
// Customer sends a message in a copilot chat. The AI triages, replies, or
// escalates to a human agent. Optional image/PDF attachment (multipart).
// ============================================
export const sendCopilotMessage = asyncHandler(async (req, res) => {
  const { content = "" } = req.body;
  const text = content.trim();

  if (!text && !req.file) {
    throw new AppError("Message content or an attachment is required", HTTP_STATUS.BAD_REQUEST);
  }

  const chat = await chatModel.findById(req.params.id);
  if (!chat) throw new AppError("Chat not found", HTTP_STATUS.NOT_FOUND);

  // Customer-only endpoint; must own the chat.
  if (req.role !== "customer" || chat.user.toString() !== req.userId) {
    throw new AppError(ERROR_MESSAGES.FORBIDDEN, HTTP_STATUS.FORBIDDEN);
  }

  if (chat.status === "closed") {
    throw new AppError("This conversation is closed. Please open a new ticket.", HTTP_STATUS.BAD_REQUEST);
  }

  const result = await handleCustomerReply({
    chat,
    content: text || "(sent an attachment)",
    file: req.file,
    req,
  });

  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: "Message sent",
    data: result,
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

  if (req.role === "admin") {
    filter.company = req.companyId;
  } else if (req.role === "agent") {
    filter.company = req.companyId;
    filter.$or = [{ assignedAgent: req.userId }, { assignedAgent: null }];
  } else if (req.role === "customer") {
    filter.user = req.userId;
  }

  if (status) filter.status = status;

  const [chats, total] = await Promise.all([
    chatModel
      .find(filter)
      .populate("user", "name email profileImage")
      .populate("assignedAgent", "name email status profileImage")
      .populate("latestMessage", "content role createdAt")
      // Each chat belongs to at most one ticket — the list labels rows by it,
      // since a customer's own chats would otherwise all read as their name.
      .populate("ticket", "ticketNumber title status priority")
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
    .populate("user", "name email profileImage")
    .populate("assignedAgent", "name email status profileImage")
    .populate("ticket", "ticketNumber title status priority");

  if (!chat) {
    throw new AppError("Chat not found", HTTP_STATUS.NOT_FOUND);
  }

  // Enforce access: admin/agent sees company chats, customer sees own chats
  const hasAccess =
    (req.role === "admin" &&
      chat.company.toString() === req.companyId.toString()) ||
    (req.role === "agent" &&
      chat.company.toString() === req.companyId.toString()) ||
    (req.role === "customer" && chat.user._id.toString() === req.userId);

  if (!hasAccess) {
    throw new AppError(ERROR_MESSAGES.FORBIDDEN, HTTP_STATUS.FORBIDDEN);
  }

  // Include last 50 messages so the agent/customer doesn"t need a second request
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
    throw new AppError("agentId is required", HTTP_STATUS.BAD_REQUEST);
  }

  const chat = await chatModel.findById(req.params.id);
  if (!chat) throw new AppError("Chat not found", HTTP_STATUS.NOT_FOUND);

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
      "Agent not found in your company",
      HTTP_STATUS.NOT_FOUND
    );
  }

  chat.assignedAgent = agentId;
  chat.status = "active";
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

  if (!["active", "waiting", "closed"].includes(status)) {
    throw new AppError(
      "Status must be active, waiting, or closed",
      HTTP_STATUS.BAD_REQUEST
    );
  }

  const chat = await chatModel.findById(req.params.id);
  if (!chat) throw new AppError("Chat not found", HTTP_STATUS.NOT_FOUND);

  // Agents can only update chats assigned to them or unassigned
  if (req.role === "agent") {
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
  if (status === "closed") chat.lastActivity = new Date();
  await chat.save();

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: `Chat marked as ${status}`,
    data: { chatId: chat._id, status: chat.status }
  });
});

// ============================================
// POST /api/chats/:id/messages
// Customer sends a message; the AI copilot answers inline.
// Response shape is what the chat UI expects:
//   { resolved: true,  message }      → AI answered
//   { escalate: true,  ticketDraft }  → needs a human; UI offers to raise a ticket
// ============================================
export const sendCopilotMessage = asyncHandler(async (req, res) => {
  const { content } = req.body;

  if (!content || !content.trim()) {
    throw new AppError("Message content is required", HTTP_STATUS.BAD_REQUEST);
  }

  const chat = await chatModel.findById(req.params.id);
  if (!chat) throw new AppError("Chat not found", HTTP_STATUS.NOT_FOUND);

  const isOwner = req.role === "customer" && chat.user.toString() === req.userId;
  const isStaff =
    (req.role === "admin" || req.role === "agent") &&
    chat.company.toString() === req.companyId.toString();

  if (!isOwner && !isStaff) {
    throw new AppError(ERROR_MESSAGES.FORBIDDEN, HTTP_STATUS.FORBIDDEN);
  }

  if (chat.status === "closed") {
    throw new AppError(
      "This chat session is closed. Please start a new one.",
      HTTP_STATUS.BAD_REQUEST
    );
  }

  const isCustomer = req.role === "customer";

  const userMessage = await messageModel.create({
    chat: chat._id,
    content: content.trim(),
    role: isCustomer ? "user" : "agent",
    sender: req.userId,
    senderModel: isCustomer ? "user" : "agent"
  });

  await chatModel.findByIdAndUpdate(chat._id, {
    latestMessage: userMessage._id,
    lastActivity: new Date(),
    $inc: { messageCount: 1 }
  });

  socketEmit.newMessage(chat._id.toString(), userMessage);

  // Only customer messages trigger the copilot, and only while no human has
  // taken the chat over — otherwise the AI would talk over the agent.
  if (!isCustomer || chat.assignedAgent) {
    return res.status(HTTP_STATUS.CREATED).json({
      success: true,
      resolved: false,
      message: userMessage
    });
  }

  const result = await answerChatMessage({
    chat,
    content: content.trim(),
    companyId: chat.company,
    workspaceId: chat.workspaceId
  });

  if (result.escalate) {
    return res.status(HTTP_STATUS.OK).json({
      success: true,
      escalate: true,
      message: result.message,
      ticketDraft: {
        title: content.trim().slice(0, 120),
        description: content.trim(),
        priority: result.triage?.urgency >= 4 ? "high" : "medium",
        reason: result.escalationReason || "unknown"
      }
    });
  }

  res.status(HTTP_STATUS.OK).json({
    success: true,
    resolved: true,
    message: result.message
  });
});

// ============================================
// POST /api/chats/:id/confirm-ticket
// Customer accepts the AI's escalation draft → raise a formal ticket from the
// chat. The chat and ticket stay linked so the thread continues in one place.
// ============================================
export const confirmTicket = asyncHandler(async (req, res) => {
  const { title, description, priority, category } = req.body;

  const chat = await chatModel.findById(req.params.id);
  if (!chat) throw new AppError("Chat not found", HTTP_STATUS.NOT_FOUND);

  if (req.role !== "customer" || chat.user.toString() !== req.userId) {
    throw new AppError(ERROR_MESSAGES.FORBIDDEN, HTTP_STATUS.FORBIDDEN);
  }

  if (chat.ticket) {
    const existing = await ticketModel.findById(chat.ticket);
    if (existing) {
      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: "This conversation already has a ticket.",
        data: existing
      });
    }
  }

  const ticket = await ticketModel.create({
    title: (title || "Support request").slice(0, 150),
    description: description || "Escalated from live chat.",
    companyId: chat.company,
    customerId: chat.user,
    priority: priority || "medium",
    category: category || "general",
    source: "chat",
    chat: chat._id,
    // Escalated by the AI — left unassigned for an admin to route to a human.
    escalatedAt: new Date()
  });

  chat.ticket = ticket._id;
  chat.status = "waiting";
  await chat.save();

  emitDomain.ticketCreated(chat.company, ticket);

  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: "Ticket created from this conversation.",
    data: ticket
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
    chatModel.countDocuments({ company: companyId, status: "active" }),
    chatModel.countDocuments({ company: companyId, status: "waiting" }),
    chatModel.countDocuments({ company: companyId, status: "closed" }),
    chatModel.countDocuments({
      company: companyId,
      assignedAgent: null,
      status: "active"
    })
  ]);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: { total, active, waiting, closed, unassigned }
  });
});
