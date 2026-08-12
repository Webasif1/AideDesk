import mongoose from "mongoose";
import chatModel from "../models/chat.model.js";
import messageModel from "../models/message.model.js";
import agentModel from "../models/aget.model.js";
import ticketModel from "../models/ticket.model.js";
import userModel from "../models/user.model.js";
import { HTTP_STATUS, ERROR_MESSAGES, ACCOUNT_STATUS } from "../config/constants.js";
import { AppError, asyncHandler } from "../utils/errorHandler.js";
import { escapeRegex } from "../utils/regex.js";
import { emitDomain } from "../sockets/emit.js";
import { handleCustomerReply } from "../services/copilotFlow.service.js";

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
    workspaceId: req.workspaceId, // required by schema; comes from the customer JWT
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
  const { status, customerId, page = 1, limit = 20 } = req.query;
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

  // Staff pick a customer in the sidebar first; the conversation list is then
  // scoped to that person rather than showing every chat in the company.
  if (customerId && req.role !== "customer") filter.user = customerId;

  const [chats, total] = await Promise.all([
    chatModel
      .find(filter)
      // `status` here is the customer's presence — it drives the online/offline
      // dot in the conversation list.
      .populate("user", "name email profileImage status accountStatus")
      .populate("assignedAgent", "name email status profileImage")
      .populate("assignedAdmin", "name email profileImage")
      .populate("latestMessage", "content role createdAt")
      // Each chat belongs to at most one ticket — the list labels rows by it,
      // since a customer's own chats would otherwise all read as their name.
      .populate("ticket", "ticketNumber title description status priority attachments createdBy createdByModel")
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
    .populate("user", "name email profileImage status accountStatus")
    .populate("assignedAgent", "name email status profileImage")
    .populate("assignedAdmin", "name email profileImage")
    .populate("ticket", "ticketNumber title description status priority attachments createdBy createdByModel");

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

  // Record that this staff member has now seen the conversation. The chat
  // sidebar's "Unread" filter is exactly "my id is not in openedBy".
  if (req.role === "admin" || req.role === "agent") {
    const seen = chat.openedBy?.find(
      (entry) => entry.user?.toString() === req.userId
    );
    if (seen) {
      seen.lastOpenedAt = new Date();
    } else {
      chat.openedBy.push({ user: req.userId, role: req.role, lastOpenedAt: new Date() });
    }
    await chat.save();
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
  // Handing the chat to an agent releases any admin who had taken it over.
  chat.assignedAdmin = null;
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
// PATCH /api/chats/:id/take-over
// Admin claims a conversation for themselves so they can reply to it. Staff are
// otherwise read-only on chats that are not assigned to them.
// ============================================
export const takeOverChat = asyncHandler(async (req, res) => {
  const chat = await chatModel.findById(req.params.id);
  if (!chat) throw new AppError("Chat not found", HTTP_STATUS.NOT_FOUND);

  if (chat.company.toString() !== req.companyId.toString()) {
    throw new AppError(ERROR_MESSAGES.FORBIDDEN, HTTP_STATUS.FORBIDDEN);
  }

  if (chat.status === "closed") {
    throw new AppError(
      "This conversation is closed. Reopen it before taking it over.",
      HTTP_STATUS.BAD_REQUEST
    );
  }

  chat.assignedAdmin = req.userId;
  // Only one owner at a time — taking over supersedes the agent assignment.
  chat.assignedAgent = null;
  chat.status = "active";
  await chat.save();

  const populated = await chatModel
    .findById(chat._id)
    .populate("user", "name email profileImage status accountStatus")
    .populate("assignedAgent", "name email status profileImage")
    .populate("assignedAdmin", "name email profileImage")
    .populate("ticket", "ticketNumber title description status priority attachments createdBy createdByModel")
    .lean();

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "You have taken over this conversation.",
    data: populated
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
    createdBy: chat.user,
    createdByModel: "user",
    // Escalated by the AI — left unassigned for an admin to route to a human.
    escalatedAt: new Date(),
    // The customer was already talking when this was raised, so it is not "New".
    customerRepliedAt: new Date(),
    status: "in_progress"
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
// GET /api/chats/customers
// Feeds the chat page's customer column: every customer in the workspace who
// has at least one ticket, newest activity first. Staff pick a person here and
// the conversation list is then scoped to them.
// Query: ?search=
// ============================================
export const getChatCustomers = asyncHandler(async (req, res) => {
  const { search } = req.query;

  // Resolve the visible customers FIRST, then count only their tickets.
  //
  // Tickets carry no workspaceId (see ticket.controller.js getTicketStats), so a
  // company-wide ticket aggregate would fold in other workspaces' tickets while
  // the customer list stayed workspace-scoped — that mismatch is what made the
  // badges overcount. A customer belongs to exactly one workspace, so scoping the
  // customers and then counting by customerId makes the totals correct by proxy.
  const customerFilter = {
    companyId: req.companyId,
    // Only fully active customers appear here. Suspended accounts are read-only
    // and soft-deleted ones keep their tickets but drop out of the list.
    accountStatus: ACCOUNT_STATUS.ACTIVE,
  };
  if (req.workspaceId) customerFilter.workspaceId = req.workspaceId;
  if (search) {
    const term = escapeRegex(search);
    customerFilter.$or = [
      { name: { $regex: term, $options: "i" } },
      { email: { $regex: term, $options: "i" } },
    ];
  }

  const customers = await userModel
    .find(customerFilter)
    .select("name email profileImage status accountStatus")
    .lean();

  if (!customers.length) {
    return res.status(HTTP_STATUS.OK).json({ success: true, data: [] });
  }

  const grouped = await ticketModel.aggregate([
    {
      $match: {
        companyId: new mongoose.Types.ObjectId(req.companyId),
        customerId: { $in: customers.map((c) => c._id) },
      },
    },
    {
      $group: {
        _id: "$customerId",
        // Lifetime total, every status.
        ticketCount: { $sum: 1 },
        // "Open" here means the same thing it means on the Tickets page and in
        // getTicketStats — status === "open", nothing broader.
        openCount: {
          $sum: { $cond: [{ $eq: ["$status", "open"] }, 1, 0] },
        },
        lastActivity: { $max: "$lastMessageAt" },
      },
    },
  ]);

  const statsById = new Map(grouped.map((g) => [g._id.toString(), g]));

  const data = customers
    // Customers with no support history at all are not shown.
    .filter((customer) => statsById.has(customer._id.toString()))
    .map((customer) => {
      const stats = statsById.get(customer._id.toString());
      return {
        ...customer,
        ticketCount: stats.ticketCount,
        openCount: stats.openCount,
        lastActivity: stats.lastActivity || null,
      };
    })
    .sort(
      (a, b) => new Date(b.lastActivity || 0) - new Date(a.lastActivity || 0)
    );

  res.status(HTTP_STATUS.OK).json({ success: true, data });
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
