import mongoose from "mongoose";
import ticketModel from "../models/ticket.model.js";
import agentModel from "../models/aget.model.js";
import chatModel from "../models/chat.model.js";
import messageModel from "../models/message.model.js";
import { HTTP_STATUS, ERROR_MESSAGES } from "../config/constants.js";
import { AppError, asyncHandler } from "../utils/errorHandler.js";
import { escapeRegex } from "../utils/regex.js";
import { emitDomain } from "../sockets/emit.js";
import {
  classifyIntent,
  scoreSentiment,
  generateEscalationBriefing
} from "../services/ai.service.js";
import { answerTicket } from "../services/ticketCopilot.service.js";
import { startTicketCopilot } from "../services/copilotFlow.service.js";
import { saveUploadedFile } from "../utils/fileStorage.js";

// Friendly labels for the ticket `source` enum (used by the CSAT breakdown).
const SOURCE_LABELS = {
  chat: "Live Chat",
  email: "Email",
  dashboard: "Dashboard",
  portal: "Support Portal",
  api: "API",
};

// ============================================
// Helper — assert ticket belongs to requester"s company
// ============================================
const assertTicketAccess = (ticket, req) => {
  if (ticket.companyId.toString() !== req.companyId.toString()) {
    throw new AppError(ERROR_MESSAGES.FORBIDDEN, HTTP_STATUS.FORBIDDEN);
  }
};

// Re-fetch a populated ticket and broadcast it to the company room. Fire-and-forget
// (never blocks or fails the request) — the client reconciles via stats refetch.
const emitTicketEvent = (companyId, ticketId, event) => {
  ticketModel
    .findById(ticketId)
    .populate("customerId", "name email profileImage accountStatus")
    .populate("assignedAgent", "name email status profileImage")
    .lean()
    .then((populated) => {
      if (populated && typeof emitDomain[event] === "function") {
        emitDomain[event](companyId, populated);
      }
    })
    .catch(() => {});
};

// ============================================
// POST /api/tickets
// Customer creates own ticket; Agent/Admin creates on behalf of a customer (customerId required)
// AI classifies intent + sentiment fire-and-forget after creation
// ============================================
export const createTicket = asyncHandler(async (req, res) => {
  const { title, description, category, priority, source, tags, chat: chatId, customerId: bodyCustomerId } = req.body;

  // ── Customer flow: ticket spawns a copilot-managed chat ────────────────────
  // Customer never picks priority/category — the copilot triage sets them.
  if (req.role === "customer") {
    const ticket = await ticketModel.create({
      title,
      description,
      companyId: req.companyId,
      customerId: req.userId,
      source: "portal",
      createdBy: req.userId,
      createdByModel: "user",
    });

    const chat = await chatModel.create({
      company: req.companyId,
      workspaceId: req.workspaceId,
      user: req.userId,
      ticket: ticket._id,
      status: "active",
    });
    ticket.chat = chat._id;

    // The description/attachments render as a summary card at the top of the
    // chat (read from the ticket itself) — not seeded as a chat message.
    if (req.file) {
      ticket.attachments = [await saveUploadedFile(req.file)];
    }
    await ticket.save();

    emitTicketEvent(req.companyId, ticket._id, "ticketCreated");

    // Run the copilot in the background — the AI reply/escalation arrives via socket.
    startTicketCopilot({
      ticket,
      chat,
      firstMessage: description,
      file: req.file,
      req,
    }).catch((err) => console.error("[createTicket] copilot flow failed:", err.message));

    return res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: "Ticket created. Our assistant is reviewing it now.",
      data: { ticket, chatId: chat._id },
    });
  }

  // ── Staff flow: create on behalf of a customer (unchanged) ─────────────────
  if (!bodyCustomerId) {
    throw new AppError("customerId is required when agent or admin creates a ticket", HTTP_STATUS.BAD_REQUEST);
  }
  const customerId = bodyCustomerId;

  if (chatId) {
    const chat = await chatModel.findById(chatId);
    if (!chat || chat.company.toString() !== req.companyId.toString()) {
      throw new AppError("Chat not found or does not belong to your company", HTTP_STATUS.NOT_FOUND);
    }
  }

  const ticket = await ticketModel.create({
    title,
    description,
    companyId: req.companyId,
    customerId,
    category: category || "general",
    priority: priority || "medium",
    source: source || "dashboard",
    tags: tags || [],
    chat: chatId || null,
    // Staff-raised tickets — this is what the chat sidebar's "Mine" filter keys off.
    createdBy: req.userId,
    createdByModel: req.role === "admin" ? "admin" : "agent",
  });

  if (req.file) {
    ticket.attachments = [await saveUploadedFile(req.file)];
    await ticket.save();
  }

  // Fire-and-forget AI classification — don"t block response
  Promise.all([
    classifyIntent(description),
    scoreSentiment(description)
  ]).then(([intentLabel, sentimentScore]) => {
    ticketModel.findByIdAndUpdate(ticket._id, { intentLabel, sentimentScore })
      .then(() => emitTicketEvent(req.companyId, ticket._id, "ticketUpdated"))
      .catch(() => {});
  }).catch(() => {});

  // AI first responder. Awaited so the response carries the chat the customer
  // should be sent to — the ticket row deep-links straight into that thread.
  // Never throws; on failure it posts a human-handoff message instead.
  let aiOutcome = null;
  try {
    aiOutcome = await answerTicket({
      ticket,
      companyId: req.companyId,
      workspaceId: req.workspaceId,
    });
  } catch (err) {
    console.error("[tickets] AI first response failed:", err.message);
  }

  emitTicketEvent(req.companyId, ticket._id, "ticketCreated");

  const fresh = await ticketModel.findById(ticket._id).lean();

  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message:
      aiOutcome?.outcome === "answered"
        ? "Ticket created. Our AI assistant has replied in your chat."
        : "Ticket created. A support agent will follow up shortly.",
    data: fresh || ticket,
    ai: aiOutcome,
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
    status, priority, category, assignedAgent, search, slaBreached, sort,
    page = 1, limit = 20, from, to
  } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  let filter = { companyId: req.companyId };

  if (req.role === "customer") {
    filter.customerId = req.userId;
  } else if (req.role === "agent") {
    filter.assignedAgent = req.userId;
  }

  // Accepts one status or a comma list ("resolved,closed"), so a tab covering
  // several states resolves server-side instead of being filtered out of the
  // single page the client happens to be holding.
  if (status) {
    const wanted = String(status).split(",").map((s) => s.trim()).filter(Boolean);
    if (wanted.length === 1) filter.status = wanted[0];
    else if (wanted.length > 1) filter.status = { $in: wanted };
  }

  if (priority) filter.priority = priority;
  if (category) filter.category = category;
  if (slaBreached === "true") filter.slaBreached = true;

  // "unassigned" is the Unassigned tab — an explicit token, since an empty value
  // is indistinguishable from the param being absent.
  if (assignedAgent && req.role === "admin") {
    filter.assignedAgent = assignedAgent === "unassigned" ? null : assignedAgent;
  }

  // Title/ticket-number search. The list is paginated server-side, so this has to
  // run here — filtering the current page in the client would only ever search
  // the rows already on screen. Input is escaped: it lands inside a $regex.
  if (search && search.trim()) {
    const term = escapeRegex(search.trim());
    filter.$or = [
      { title: { $regex: term, $options: "i" } },
      { ticketNumber: { $regex: term, $options: "i" } },
    ];
  }

  if (from || to) {
    filter.createdAt = {};
    if (from) filter.createdAt.$gte = new Date(from);
    if (to) filter.createdAt.$lte = new Date(to);
  }

  // Only `updatedAt` is offered as an alternative — it backs the "Recently
  // Updated" tab, which previously re-sorted one page and so lied about order.
  const sortBy = sort === "updatedAt" ? { updatedAt: -1 } : { createdAt: -1 };

  const [tickets, total] = await Promise.all([
    ticketModel
      .find(filter)
      .populate("customerId", "name fullName email profileImage accountStatus")
      .populate("assignedAgent", "name email status profileImage")
      .sort(sortBy)
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
// Dashboard + ticket-page metric counts (admin or agent). Company-scoped —
// tickets are not workspace-partitioned in the schema.
// ============================================
export const getTicketStats = asyncHandler(async (req, res) => {
  const companyId = req.companyId;
  const oid = new mongoose.Types.ObjectId(companyId);
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  // Agents see stats scoped to their own assigned tickets only.
  const isAgent = req.role === "agent";
  const agentOid = isAgent ? new mongoose.Types.ObjectId(req.userId) : null;
  const base = isAgent ? { companyId, assignedAgent: agentOid } : { companyId };
  const matchOid = isAgent ? { companyId: oid, assignedAgent: agentOid } : { companyId: oid };

  const [
    total, open, pending, inProgress, resolved, closed, urgent, slaBreached,
    aiResolved, newThisWeek, respAgg,
  ] = await Promise.all([
    ticketModel.countDocuments(base),
    ticketModel.countDocuments({ ...base, status: "open" }),
    ticketModel.countDocuments({ ...base, status: "pending" }),
    ticketModel.countDocuments({ ...base, status: "in_progress" }),
    ticketModel.countDocuments({ ...base, status: "resolved" }),
    ticketModel.countDocuments({ ...base, status: "closed" }),
    ticketModel.countDocuments({ ...base, priority: "urgent", status: { $nin: ["resolved", "closed"] } }),
    ticketModel.countDocuments({ ...base, slaBreached: true }),
    // Admin: AI-resolved = resolved/closed without any human agent assigned.
    // Agent: their own resolved+closed ticket count.
    isAgent
      ? ticketModel.countDocuments({ ...base, status: { $in: ["resolved", "closed"] } })
      : ticketModel.countDocuments({ companyId, status: { $in: ["resolved", "closed"] }, assignedAgent: null }),
    ticketModel.countDocuments({ ...base, createdAt: { $gte: weekAgo } }),
    // Avg first-response latency (mins) over tickets that received a response.
    ticketModel.aggregate([
      { $match: { ...matchOid, firstResponseAt: { $ne: null } } },
      { $group: { _id: null, avgMs: { $avg: { $subtract: ["$firstResponseAt", "$createdAt"] } } } },
    ]),
  ]);

  const resolvedClosed = resolved + closed;
  const round1 = (n) => Math.round(n * 10) / 10;
  const avgMs = respAgg[0]?.avgMs ?? null;

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: {
      total, open, pending, inProgress, resolved, closed, urgent, slaBreached,
      aiResolved,
      newThisWeek,
      aiResolutionRate: resolvedClosed ? round1((aiResolved / resolvedClosed) * 100) : 0,
      resolutionRate: total ? round1((resolvedClosed / total) * 100) : 0,
      avgFirstResponseMins: avgMs != null ? Math.round(avgMs / 60000) : null,
    },
  });
});

// ============================================
// GET /api/tickets/analytics/volume?days=14
// Daily ticket volume split into AI-managed (no human agent) vs human-handled.
// Returns a contiguous, zero-filled series so the chart renders cleanly.
// ============================================
export const getTicketVolume = asyncHandler(async (req, res) => {
  const oid = new mongoose.Types.ObjectId(req.companyId);
  const days = Math.min(Math.max(parseInt(req.query.days, 10) || 14, 1), 60);

  const since = new Date();
  since.setHours(0, 0, 0, 0);
  since.setDate(since.getDate() - (days - 1));

  const rows = await ticketModel.aggregate([
    { $match: { companyId: oid, createdAt: { $gte: since } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        total: { $sum: 1 },
        ai: { $sum: { $cond: [{ $eq: ["$assignedAgent", null] }, 1, 0] } },
      },
    },
  ]);

  const byDate = new Map(rows.map((r) => [r._id, r]));
  const series = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(since);
    d.setDate(since.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    const row = byDate.get(key);
    series.push({ date: key, total: row?.total || 0, ai: row?.ai || 0 });
  }

  res.status(HTTP_STATUS.OK).json({ success: true, data: series });
});

// ============================================
// GET /api/tickets/analytics/csat
// CSAT derived from sentimentScore (1-5 → %), aggregate + per source channel.
// ============================================
export const getTicketCsat = asyncHandler(async (req, res) => {
  const oid = new mongoose.Types.ObjectId(req.companyId);

  const rows = await ticketModel.aggregate([
    { $match: { companyId: oid } },
    { $group: { _id: "$source", avg: { $avg: "$sentimentScore" }, count: { $sum: 1 } } },
  ]);

  const totalCount = rows.reduce((s, r) => s + r.count, 0);
  const toPct = (avg) => Math.round((avg / 5) * 100);

  const channels = rows
    .map((r) => ({
      source: r._id,
      label: SOURCE_LABELS[r._id] || r._id,
      score: toPct(r.avg),
      count: r.count,
    }))
    .sort((a, b) => b.count - a.count);

  const weightedAvg = totalCount
    ? rows.reduce((s, r) => s + r.avg * r.count, 0) / totalCount
    : null;

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: {
      score: weightedAvg != null ? toPct(weightedAvg) : null,
      channels,
    },
  });
});

// ============================================
// GET /api/tickets/:id
// Single ticket + linked chat messages (if ticket originated from chat)
// ============================================
export const getTicket = asyncHandler(async (req, res) => {
  const ticket = await ticketModel
    .findById(req.params.id)
    .populate("customerId", "name fullName email profileImage accountStatus")
    .populate("assignedAgent", "name email status profileImage")
    .populate("chat");

  if (!ticket) throw new AppError("Ticket not found", HTTP_STATUS.NOT_FOUND);

  assertTicketAccess(ticket, req);

  if (req.role === "customer" && ticket.customerId?._id?.toString() !== req.userId) {
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
  if (!ticket) throw new AppError("Ticket not found", HTTP_STATUS.NOT_FOUND);

  assertTicketAccess(ticket, req);

  if (req.role === "customer") {
    if (ticket.customerId.toString() !== req.userId) {
      throw new AppError(ERROR_MESSAGES.FORBIDDEN, HTTP_STATUS.FORBIDDEN);
    }
    if (!["open", "pending"].includes(ticket.status)) {
      throw new AppError("Cannot edit a ticket that is already in progress or resolved", HTTP_STATUS.BAD_REQUEST);
    }
  }

  const allowedFields = ["title", "description", "category", "priority", "tags"];
  const updates = {};
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  }

  const updated = await ticketModel
    .findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true })
    .populate("customerId", "name fullName email accountStatus")
    .populate("assignedAgent", "name email");

  if (!updated) { throw new AppError("Ticket not found", HTTP_STATUS.NOT_FOUND); }

  emitTicketEvent(req.companyId, updated._id, "ticketUpdated");

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Ticket updated",
    data: updated
  });
});

// ============================================
// PATCH /api/tickets/:id/assign
// Admin assigns agent to ticket. Status is deliberately untouched — a ticket
// is "New" until the customer replies, regardless of who owns it.
// ============================================
export const assignAgent = asyncHandler(async (req, res) => {
  const { agentId } = req.body;
  if (!agentId) throw new AppError("agentId is required", HTTP_STATUS.BAD_REQUEST);

  const ticket = await ticketModel.findById(req.params.id);
  if (!ticket) throw new AppError("Ticket not found", HTTP_STATUS.NOT_FOUND);

  assertTicketAccess(ticket, req);

  const agent = await agentModel.findOne({ _id: agentId, companyId: req.companyId });
  if (!agent) throw new AppError("Agent not found in your company", HTTP_STATUS.NOT_FOUND);

  ticket.assignedAgent = agentId;
  if (!ticket.firstResponseAt) ticket.firstResponseAt = new Date();
  await ticket.save();

  emitTicketEvent(req.companyId, ticket._id, "ticketUpdated");

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
  const validStatuses = ["open", "pending", "in_progress", "resolved", "closed", "forced_closed"];

  if (!validStatuses.includes(status)) {
    throw new AppError(`Status must be one of: ${validStatuses.join(", ")}`, HTTP_STATUS.BAD_REQUEST);
  }

  const ticket = await ticketModel.findById(req.params.id);
  if (!ticket) throw new AppError("Ticket not found", HTTP_STATUS.NOT_FOUND);

  assertTicketAccess(ticket, req);

  if (req.role === "agent" && ticket.assignedAgent?.toString() !== req.userId) {
    throw new AppError(ERROR_MESSAGES.FORBIDDEN, HTTP_STATUS.FORBIDDEN);
  }

  // A ticket force-closed because its customer's account was deleted can only
  // be moved to another status by an admin.
  if (ticket.status === "forced_closed" && status !== "forced_closed" && req.role !== "admin") {
    throw new AppError(
      "Only an admin can reopen a ticket closed due to account deletion.",
      HTTP_STATUS.FORBIDDEN
    );
  }

  ticket.status = status;
  if (status === "resolved" && !ticket.resolvedAt) ticket.resolvedAt = new Date();
  if (status === "closed" && !ticket.closedAt) ticket.closedAt = new Date();
  await ticket.save();

  emitTicketEvent(req.companyId, ticket._id, "ticketUpdated");

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: `Ticket status updated to ${status}`,
    data: { ticketId: ticket._id, status: ticket.status },
  });
});

// ============================================
// POST /api/tickets/:id/escalate
// Agent or Admin escalates ticket
// AI generates 3-sentence briefing (awaited — agent needs it in response)
// Priority bumped to at least "high"; status set to in_progress
// ============================================
export const escalateTicket = asyncHandler(async (req, res) => {
  const ticket = await ticketModel.findById(req.params.id).populate("chat");

  if (!ticket) throw new AppError("Ticket not found", HTTP_STATUS.NOT_FOUND);

  assertTicketAccess(ticket, req);

  if (ticket.status === "forced_closed" && req.role !== "admin") {
    throw new AppError(
      "Only an admin can modify a ticket closed due to account deletion.",
      HTTP_STATUS.FORBIDDEN
    );
  }

  if (ticket.escalatedAt) {
    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Ticket already escalated",
      data: {
        ticketId: ticket._id,
        aiSummary: ticket.aiSummary,
        escalatedAt: ticket.escalatedAt
      }
    });
  }

  // The original description was never persisted as a chat message (it shows
  // as a summary card instead), so prepend it here — otherwise the briefing
  // loses the customer's original problem statement.
  let thread = [{ role: "user", content: ticket.description }];
  if (ticket.chat) {
    const chatThread = await messageModel
      .find({ chat: ticket.chat._id })
      .sort({ createdAt: 1 })
      .select("role content")
      .lean();
    thread = thread.concat(chatThread);
  }

  let aiSummary;
  try {
    aiSummary = await generateEscalationBriefing({
      thread,
      sentiment: ticket.sentimentScore || 3,
      ticketTitle: ticket.title,
    });
  } catch {
    aiSummary = `Ticket "${ticket.title}" escalated. Sentiment: ${ticket.sentimentScore || "unknown"}/5. Review chat history for full context.`;
  }

  ticket.escalatedAt = new Date();
  ticket.aiSummary = aiSummary;
  ticket.status = "in_progress";
  // Bump priority: low/medium → high; high/urgent unchanged
  if (["low", "medium"].includes(ticket.priority)) ticket.priority = "high";
  await ticket.save();

  emitTicketEvent(req.companyId, ticket._id, "ticketUpdated");

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Ticket escalated",
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
// Admin: hard delete | Agent/Customer: soft close (status = "closed")
// ============================================
export const deleteTicket = asyncHandler(async (req, res) => {
  const ticket = await ticketModel.findById(req.params.id);
  if (!ticket) throw new AppError("Ticket not found", HTTP_STATUS.NOT_FOUND);

  assertTicketAccess(ticket, req);

  if (req.role === "customer" && ticket.customerId.toString() !== req.userId) {
    throw new AppError(ERROR_MESSAGES.FORBIDDEN, HTTP_STATUS.FORBIDDEN);
  }

  if (req.role === "admin") {
    await ticketModel.findByIdAndDelete(req.params.id);
    emitDomain.ticketDeleted(req.companyId, { _id: req.params.id, ticketId: req.params.id });
    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Ticket permanently deleted"
    });
  }

  if (ticket.status === "forced_closed" && req.role !== "admin") {
    throw new AppError(
      "Only an admin can modify a ticket closed due to account deletion.",
      HTTP_STATUS.FORBIDDEN
    );
  }

  // Soft-close for agent / customer
  ticket.status = "closed";
  ticket.closedAt = new Date();
  await ticket.save();

  emitTicketEvent(req.companyId, ticket._id, "ticketUpdated");

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Ticket closed",
    data: { ticketId: ticket._id, status: "closed" }
  });
});
