import messageModel from "../models/message.model.js";
import { pageMeta, parsePaging } from "../utils/pagination.js";
import chatModel from "../models/chat.model.js";
import ticketModel from "../models/ticket.model.js";
import { HTTP_STATUS, ERROR_MESSAGES } from "../config/constants.js";
import { AppError, asyncHandler } from "../utils/errorHandler.js";
import { classifyIntent, scoreSentiment, generateReplySuggestions } from "../services/ai.service.js";
import { markCustomerReplied } from "../services/ticketStatus.service.js";
import { socketEmit } from "../sockets/emit.js";
import { actorFromReq, loadChatForActor } from "../services/chatAccess.js";

// ============================================
// Access is delegated to services/chatAccess.js so this file and
// chat.controller cannot drift apart again. The local check this replaces gave
// agents company-wide reach — its isAdmin and isAgent branches were identical,
// so any agent could read, post into and mark read every conversation in the
// tenant, while chat.controller correctly held them to their own assignments.
// ============================================
const assertChatAccess = (chatId, req) => loadChatForActor(chatId, actorFromReq(req));

// ============================================
// POST /api/messages
// Customer or Agent sends a message in an open chat
// ============================================
export const sendMessage = asyncHandler(async (req, res) => {
  // `attachments` is deliberately NOT read from the body. It used to be
  // persisted verbatim, so a client could attach an arbitrary external URL with
  // any filename and mimetype it liked and have the thread render it as ours.
  // Attachments arrive only through the verified upload pipeline.
  const { chat: chatId, content } = req.body;
  const attachments = [];

  const chat = await assertChatAccess(chatId, req);

  if (chat.status === "closed") {
    throw new AppError("This chat session is closed. Please start a new one.", HTTP_STATUS.BAD_REQUEST);
  }

  // senderModel names the collection `sender` points at, and its enum is
  // user|agent|admin — a customer's req.role is "customer", which is not a
  // collection name, so it has to be mapped rather than passed through.
  // Admins post as staff (role "agent") but their document is in `admin`.
  const senderModel = req.role === "customer" ? "user" : req.role;

  const message = await messageModel.create({
    chat: chatId,
    content,
    role: req.role === "customer" ? "user" : "agent",
    sender: req.userId,
    senderModel,
    attachments,
  });

  // Agents are only served conversations already assigned to them, so the
  // claim-by-replying path this used to carry is unreachable and has been
  // removed rather than left as a rule the UI no longer offers.
  await chatModel.findByIdAndUpdate(chatId, {
    latestMessage: message._id,
    lastActivity: new Date(),
    $inc: { messageCount: 1 },
  });

  // Broadcast to the chat room so the other party (e.g. the customer after an
  // escalation) sees the agent's reply in real time.
  socketEmit.newMessage(chatId, message);

  // A customer replying is what moves a ticket off "New" — not the AI opening
  // the conversation, and not an agent being assigned.
  if (req.role === "customer") {
    await markCustomerReplied(chat);
  } else if (chat.ticket) {
    // The single place firstResponseAt is set. assignAgent used to stamp it,
    // which measured how fast an admin triaged rather than how fast the
    // customer actually heard back. The `firstResponseAt: null` filter makes
    // this first-write-wins, so a second reply never moves it.
    await ticketModel.updateOne(
      { _id: chat.ticket, firstResponseAt: null },
      { $set: { firstResponseAt: new Date() } }
    );
  }

  // Fire-and-forget AI classification for customer messages only
  if (req.role === "customer") {
    Promise.all([
      classifyIntent(content),
      scoreSentiment(content)
    ]).then(([intentLabel, sentimentScore]) => {
      messageModel.findByIdAndUpdate(message._id, { intentLabel, sentimentScore }).catch(() => {});
    }).catch(() => {});
  }

  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: "Message sent",
    data: message,
  });
});

// ============================================
// GET /api/messages/:chatId
// Paginated message history for a chat (oldest-first for display)
// Query: ?page=1&limit=30
// ============================================
export const getMessages = asyncHandler(async (req, res) => {
  const { chatId } = req.params;

  const { page, limit, skip } = parsePaging(req.query, { defaultLimit: 30 });

  await assertChatAccess(chatId, req);

  const [messages, total] = await Promise.all([
    messageModel
      .find({ chat: chatId })
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    messageModel.countDocuments({ chat: chatId }),
  ]);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: messages,
    pagination: pageMeta(total, { page, limit }),
  });
});

// ============================================
// PATCH /api/messages/:chatId/read
// Marks all unread messages in a chat as read for the requesting user
// (Customer marks agent messages read; agent marks customer messages read)
// ============================================
export const markMessagesRead = asyncHandler(async (req, res) => {
  const { chatId } = req.params;

  await assertChatAccess(chatId, req);

  // Mark messages sent by the OTHER party as read
  const oppositeRole = req.role === "customer" ? "agent" : "user";

  const result = await messageModel.updateMany(
    { chat: chatId, role: oppositeRole, isRead: false },
    { isRead: true }
  );

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: `${result.modifiedCount} message(s) marked as read`,
  });
});

// ============================================
// GET /api/messages/:messageId/unread-count
// How many unread messages does the requesting user have in a chat
// ============================================
export const getUnreadCount = asyncHandler(async (req, res) => {
  const { chatId } = req.params;

  await assertChatAccess(chatId, req);

  const ownRole = req.role === "customer" ? "agent" : "user";

  const count = await messageModel.countDocuments({
    chat: chatId,
    role: ownRole,
    isRead: false,
  });

  res.status(HTTP_STATUS.OK).json({ success: true, data: { unread: count } });
});

// ============================================
// POST /api/messages/:messageId/suggest
// Agent requests AI co-pilot suggestions for a specific message.
// Enqueues a BullMQ job; result arrives via Socket.IO — not in the HTTP response.
// ============================================
export const requestAiSuggestions = asyncHandler(async (req, res) => {
  const { messageId } = req.params;

  const message = await messageModel.findById(messageId);
  if (!message) throw new AppError("Message not found", HTTP_STATUS.NOT_FOUND);

  // Confirm the agent has access to the parent chat
  await assertChatAccess(message.chat.toString(), req);

  // Only customer messages should trigger suggestions (agent replying to a customer)
  if (message.role !== "user") {
    throw new AppError(
      "AI suggestions are only available for customer messages.",
      HTTP_STATUS.BAD_REQUEST
    );
  }

  // Fetch recent messages for context
  const recentMessages = await messageModel
    .find({ chat: message.chat })
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

  let suggestions;
  try {
    suggestions = await generateReplySuggestions({
      messages: recentMessages.reverse().map(m => ({ role: m.role, content: m.content })),
      companyName: req.companyName || "our company",
    });
  } catch {
    suggestions = [
      { tone: "professional", reply: "Thank you for reaching out. I will look into this right away.", confidence: "medium" }
    ];
  }

  // Persist suggestions on the message for later retrieval
  await messageModel.findByIdAndUpdate(messageId, { aiSuggestions: suggestions });

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "AI reply suggestions generated",
    data: { messageId, suggestions },
  });
});
