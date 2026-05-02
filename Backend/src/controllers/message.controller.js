import messageModel from '../models/message.model.js';
import chatModel from '../models/chat.model.js';
import { HTTP_STATUS, ERROR_MESSAGES } from '../config/constants.js';
import { AppError, asyncHandler } from '../utils/errorHandler.js';
import { classifyIntent, scoreSentiment, generateReplySuggestions } from '../services/ai.service.js';

// ============================================
// Helper — verify the requesting user has access to the given chat
// ============================================
const assertChatAccess = async (chatId, req) => {
  const chat = await chatModel.findById(chatId);
  if (!chat) throw new AppError('Chat not found', HTTP_STATUS.NOT_FOUND);

  const isAdmin = req.role === 'admin' && chat.company.toString() === req.companyId.toString();
  const isAgent = req.role === 'agent' && chat.company.toString() === req.companyId.toString();
  const isOwner = req.role === 'customer' && chat.user.toString() === req.userId;

  if (!isAdmin && !isAgent && !isOwner) {
    throw new AppError(ERROR_MESSAGES.FORBIDDEN, HTTP_STATUS.FORBIDDEN);
  }

  return chat;
};

// ============================================
// POST /api/messages
// Customer or Agent sends a message in an open chat
// ============================================
export const sendMessage = asyncHandler(async (req, res) => {
  const { chat: chatId, content, attachments = [] } = req.body;

  const chat = await assertChatAccess(chatId, req);

  if (chat.status === 'closed') {
    throw new AppError('This chat session is closed. Please start a new one.', HTTP_STATUS.BAD_REQUEST);
  }

  const message = await messageModel.create({
    chat: chatId,
    content,
    role: req.role === 'customer' ? 'user' : 'agent',
    sender: req.userId,
    senderModel: req.role === 'customer' ? 'user' : 'agent',
    attachments,
  });

  // Keep chat metadata in sync
  await chatModel.findByIdAndUpdate(chatId, {
    latestMessage: message._id,
    lastActivity: new Date(),
    $inc: { messageCount: 1 },
  });

  // Fire-and-forget AI classification for customer messages only
  if (req.role === 'customer') {
    Promise.all([
      classifyIntent(content),
      scoreSentiment(content)
    ]).then(([intentLabel, sentimentScore]) => {
      messageModel.findByIdAndUpdate(message._id, { intentLabel, sentimentScore }).catch(() => {});
    }).catch(() => {});
  }

  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: 'Message sent',
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
  const { page = 1, limit = 30 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  await assertChatAccess(chatId, req);

  const [messages, total] = await Promise.all([
    messageModel
      .find({ chat: chatId })
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    messageModel.countDocuments({ chat: chatId }),
  ]);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: messages,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit)),
    },
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
  const oppositeRole = req.role === 'customer' ? 'agent' : 'user';

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

  const ownRole = req.role === 'customer' ? 'agent' : 'user';

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
  if (!message) throw new AppError('Message not found', HTTP_STATUS.NOT_FOUND);

  // Confirm the agent has access to the parent chat
  await assertChatAccess(message.chat.toString(), req);

  // Only customer messages should trigger suggestions (agent replying to a customer)
  if (message.role !== 'user') {
    throw new AppError(
      'AI suggestions are only available for customer messages.',
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
      companyName: req.companyName || 'our company',
    });
  } catch {
    suggestions = [
      { tone: 'professional', reply: 'Thank you for reaching out. I will look into this right away.', confidence: 'medium' }
    ];
  }

  // Persist suggestions on the message for later retrieval
  await messageModel.findByIdAndUpdate(messageId, { aiSuggestions: suggestions });

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'AI reply suggestions generated',
    data: { messageId, suggestions },
  });
});
