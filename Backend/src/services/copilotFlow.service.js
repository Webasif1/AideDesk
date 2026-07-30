// Orchestrates the customer ticket → copilot chat flow:
//  - a customer-created ticket spins up a linked chat
//  - the copilot triages (priority/category/metadata), replies, or escalates
//  - ongoing customer replies keep the same triage→reply→escalate loop
// Reuses the existing AI services; every external call is guarded so the ticket
// and chat are never left in a broken state if a provider fails.
import messageModel from "../models/message.model.js";
import ticketModel from "../models/ticket.model.js";
import agentModel from "../models/aget.model.js";
import { runCopilot } from "./copilot.service.js";
import { derivePriority } from "./triage.service.js";
import { analyzeImage } from "./imageVision.service.js";
import { uploadPDFAndExtract } from "./fileContext.service.js";
import { generateAgentBriefing } from "./agentBriefing.service.js";
import { socketEmit, emitDomain } from "../sockets/emit.js";
import { config } from "../config/config.js";

// triage intent → ticket.category enum (billing|technical|account|general)
const INTENT_TO_CATEGORY = {
  billing_issue: "billing",
  technical_problem: "technical",
  bug_report: "technical",
  account_access: "account",
  data_privacy: "account",
  feature_request: "general",
  general_inquiry: "general",
  complaint: "general",
  onboarding_help: "general",
  other: "general",
};

// triage intent → ticket.intentLabel enum (simple_faq|billing_issue|technical_problem|escalate_human|feedback)
const INTENT_TO_TICKET_LABEL = {
  billing_issue: "billing_issue",
  technical_problem: "technical_problem",
  bug_report: "technical_problem",
  account_access: "technical_problem",
  data_privacy: "technical_problem",
  complaint: "feedback",
  feature_request: "feedback",
  general_inquiry: "simple_faq",
  onboarding_help: "simple_faq",
  other: "simple_faq",
};

const HANDOFF_MESSAGE =
  "Thanks for the details — I'm connecting you with a human specialist who can help further. They'll join this conversation shortly.";

// Posted when the AI is stuck but hasn't hit the escalation threshold yet — it
// keeps trying and asks the customer for more to work with.
const PROBE_MESSAGE =
  "I want to make sure I get this right. Could you share a little more detail — the exact steps you took, any error message, or a screenshot? That'll help me solve it for you.";

// Understand an uploaded reference file so the copilot (and agent) can use it.
const processAttachment = async (file, userMessage) => {
  const out = { imageSummary: null, pdfSummary: null, attachmentTypes: [] };
  if (!file) return out;
  try {
    if (file.mimetype?.startsWith("image/")) {
      out.attachmentTypes = ["image"];
      out.imageSummary = await analyzeImage(file.buffer, file.mimetype, userMessage || "");
    } else if (file.mimetype === "application/pdf") {
      out.attachmentTypes = ["pdf"];
      const { summary } = await uploadPDFAndExtract(file.buffer, file.originalname);
      out.pdfSummary = summary;
    }
  } catch (err) {
    console.error("[copilotFlow] attachment processing failed:", err.message);
  }
  return out;
};

// First online agent in the workspace, else any agent in the workspace/company.
const pickAgent = async (workspaceId, companyId) => {
  return (
    (workspaceId && (await agentModel.findOne({ workspaceId, status: "online" }))) ||
    (workspaceId && (await agentModel.findOne({ workspaceId }))) ||
    (await agentModel.findOne({ companyId }))
  );
};

// Backend message role → OpenRouter chat role.
const toChatRole = (role) => (role === "user" ? "user" : "assistant");

const deriveTicketMeta = (result) => {
  const suggested = derivePriority(result.urgency ?? 3, result.sentimentScore ?? 3);
  return {
    priority: suggested === "critical" ? "urgent" : suggested, // ticket enum has no 'critical'
    category: INTENT_TO_CATEGORY[result.intent] || "general",
    intentLabel: INTENT_TO_TICKET_LABEL[result.intent] || "simple_faq",
    sentimentScore: result.sentimentScore ?? 3,
  };
};

// Shared escalation branch: assign an agent, brief them, and post a hand-off note.
const escalateTicket = async ({ ticket, chat, conversationHistory, copilotAttempt, escalationReason, req }) => {
  const agent = await pickAgent(req.workspaceId, req.companyId);

  if (ticket) {
    if (agent && !ticket.assignedAgent) ticket.assignedAgent = agent._id;
    ticket.status = "in_progress";
    if (!ticket.escalatedAt) ticket.escalatedAt = new Date();
    const briefing = await generateAgentBriefing({
      conversationHistory,
      ticket: {
        title: ticket.title,
        priority: ticket.priority,
        aiAnalysis: {
          intentLabel: ticket.intentLabel,
          sentimentScore: ticket.sentimentScore,
          suggestedResolution: "",
        },
        escalationReason,
      },
      copilotAttempt,
    }).catch(() => null);
    if (briefing) ticket.aiSummary = briefing;
    await ticket.save();
  }

  if (agent && chat.assignedAgent?.toString() !== agent._id?.toString()) {
    chat.assignedAgent = agent._id;
  }

  const handoff = await messageModel.create({
    chat: chat._id,
    content: HANDOFF_MESSAGE,
    role: "ai",
  });

  if (agent) {
    socketEmit.ticketAssigned(agent._id, {
      chatId: chat._id,
      ticketId: ticket?._id,
      title: ticket?.title,
    });
    socketEmit.agentJoined(chat._id, { id: agent._id, name: agent.name });
  }

  return handoff;
};

// Decide what happens after the copilot runs for one turn:
//  - customer asked for a human            → escalate now
//  - AI resolved (gave a real answer)       → post it, reset strikes
//  - AI stuck but under the strike threshold→ post a "need more detail" probe
//  - AI stuck and at/over the threshold      → escalate with full context
// Mutates `chat.copilotStrikes`; the caller persists the chat.
const resolveTurn = async ({ chat, ticket, result, conversationHistory, req }) => {
  const escalate = async (reason) => {
    const aiMessage = await escalateTicket({
      ticket,
      chat,
      conversationHistory,
      copilotAttempt: result.aiResponse,
      escalationReason: reason,
      req,
    });
    return { aiMessage, escalated: true };
  };

  if (result.wantsHuman) {
    chat.copilotStrikes = 0;
    return escalate("customer_requested_human");
  }

  if (result.unresolved) {
    chat.copilotStrikes = (chat.copilotStrikes || 0) + 1;
    if (chat.copilotStrikes >= config.COPILOT_ESCALATE_STRIKES) {
      chat.copilotStrikes = 0;
      return escalate(result.escalationReason || "ai_unresolved");
    }
    // Still trying — keep the copilot engaged, ask for more to work with.
    const aiMessage = await messageModel.create({
      chat: chat._id,
      content: PROBE_MESSAGE,
      role: "ai",
    });
    return { aiMessage, escalated: false };
  }

  // Resolved — post the answer and clear the strike streak.
  chat.copilotStrikes = 0;
  const aiMessage = await messageModel.create({
    chat: chat._id,
    content: result.aiResponse,
    role: "ai",
  });
  if (ticket && !ticket.firstResponseAt) ticket.firstResponseAt = new Date();
  return { aiMessage, escalated: false };
};

const broadcastTicket = async (companyId, ticketId) => {
  try {
    const populated = await ticketModel
      .findById(ticketId)
      .populate("customerId", "name email profileImage")
      .populate("assignedAgent", "name email status profileImage")
      .lean();
    if (populated) emitDomain.ticketUpdated(companyId, populated);
  } catch {
    /* non-fatal */
  }
};

// ── Ticket creation: triage + first reply (or immediate escalation) ──────────
// Runs fire-and-forget from the controller; delivers results over the socket.
export const startTicketCopilot = async ({ ticket, chat, firstMessage, file, req }) => {
  socketEmit.copilotTyping(chat._id, true);
  try {
    const { imageSummary, pdfSummary, attachmentTypes } = await processAttachment(file, firstMessage);

    const result = await runCopilot({
      message: firstMessage,
      conversationHistory: [],
      workspaceId: req.workspaceId,
      companyId: req.companyId,
      imageSummary,
      pdfSummary,
      attachmentTypes,
      workspaceContext: {},
    });

    // Set AI-decided metadata on the ticket (customer never picks these).
    Object.assign(ticket, deriveTicketMeta(result));
    ticket.aiSummary = result.reasoning || ticket.aiSummary;
    await ticket.save(); // persist meta before a possible escalation reads it

    const { aiMessage, escalated } = await resolveTurn({
      chat,
      ticket,
      result,
      conversationHistory: [{ role: "user", content: firstMessage }],
      req,
    });
    await ticket.save(); // resolveTurn may set firstResponseAt

    chat.latestMessage = aiMessage._id;
    chat.lastActivity = new Date();
    chat.messageCount = await messageModel.countDocuments({ chat: chat._id });
    await chat.save();

    socketEmit.newMessage(chat._id, aiMessage);
    await broadcastTicket(req.companyId, ticket._id);
    return { aiMessage, escalated };
  } catch (err) {
    console.error("[copilotFlow] startTicketCopilot failed:", err.message);
    return { aiMessage: null, escalated: false };
  } finally {
    socketEmit.copilotTyping(chat._id, false);
  }
};

// ── Ongoing customer reply in a copilot chat ─────────────────────────────────
// Awaited by the HTTP handler so the reply is returned inline (and via socket).
export const handleCustomerReply = async ({ chat, content, file, req }) => {
  const userMessage = await messageModel.create({
    chat: chat._id,
    content,
    role: "user",
    sender: req.userId,
    senderModel: "user",
  });
  socketEmit.newMessage(chat._id, userMessage);

  // Already handed to a human — the agent owns the thread; don't re-engage the AI.
  // The customer's message is saved + broadcast so the assigned agent sees it live.
  if (chat.assignedAgent) {
    chat.latestMessage = userMessage._id;
    chat.lastActivity = new Date();
    chat.messageCount = await messageModel.countDocuments({ chat: chat._id });
    await chat.save();
    return { userMessage, aiMessage: null, escalated: true };
  }

  socketEmit.copilotTyping(chat._id, true);

  let aiMessage = null;
  let escalated = false;

  try {
    const { imageSummary, pdfSummary, attachmentTypes } = await processAttachment(file, content);

    const history = await messageModel
      .find({ chat: chat._id })
      .sort({ createdAt: 1 })
      .limit(20)
      .lean();
    // Exclude the just-saved message; runCopilot appends the current one itself.
    const conversationHistory = history
      .slice(0, -1)
      .map((m) => ({ role: toChatRole(m.role), content: m.content }));

    const result = await runCopilot({
      message: content,
      conversationHistory,
      workspaceId: req.workspaceId,
      companyId: req.companyId,
      imageSummary,
      pdfSummary,
      attachmentTypes,
      workspaceContext: {},
    });

    const ticket = chat.ticket ? await ticketModel.findById(chat.ticket) : null;
    if (ticket) {
      Object.assign(ticket, deriveTicketMeta(result));
      await ticket.save();
    }

    const outcome = await resolveTurn({
      chat,
      ticket,
      result,
      conversationHistory: [...conversationHistory, { role: "user", content }],
      req,
    });
    aiMessage = outcome.aiMessage;
    escalated = outcome.escalated;

    if (ticket) {
      await ticket.save(); // resolveTurn may set firstResponseAt
      await broadcastTicket(req.companyId, ticket._id);
    }
  } catch (err) {
    console.error("[copilotFlow] handleCustomerReply failed:", err.message);
  } finally {
    socketEmit.copilotTyping(chat._id, false);
  }

  chat.latestMessage = (aiMessage || userMessage)._id;
  chat.lastActivity = new Date();
  chat.messageCount = await messageModel.countDocuments({ chat: chat._id });
  await chat.save();

  if (aiMessage) socketEmit.newMessage(chat._id, aiMessage);

  return { userMessage, aiMessage, escalated };
};
