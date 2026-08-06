import chatModel from "../models/chat.model.js";
import messageModel from "../models/message.model.js";
import ticketModel from "../models/ticket.model.js";
import companyModel from "../models/company.model.js";
import { runCopilot } from "./copilot.service.js";
import { isAiConfigured } from "./aiProvider.service.js";
import { socketEmit } from "../sockets/emit.js";

// ============================================
// The AI first responder.
//
// A customer-raised ticket is answered here before any human sees it. The reply
// is delivered as a role:"ai" message on the ticket's linked chat, so the
// customer reads and continues the conversation in the existing chat UI.
//
// Outcome is one of:
//   answered   — AI resolved it; ticket moves to "pending" (awaiting customer)
//   escalated  — AI could not resolve it; ticket stays "open" and unassigned so
//                an admin can hand it to a human, with aiSummary as the briefing
//
// Ticket stays unassigned in both cases: assignedAgent === null is what the
// dashboard counts as AI-handled (see getTicketStats / getTicketVolume).
// ============================================

const HANDOFF_TEXT =
  "Thanks for getting in touch. I'm connecting you with a member of our support team, who will follow up on this ticket shortly.";

// One chat per ticket. Each ticket gets its own dedicated thread rather than
// sharing the customer's open conversation, so the two never interleave and a
// chat can always be read as the history of exactly one ticket.
export const ensureTicketChat = async ({ ticket, companyId, workspaceId }) => {
  // Already linked (retry, or ticket raised from an existing chat).
  if (ticket.chat) {
    const existing = await chatModel.findById(ticket.chat);
    if (existing) return existing;
  }

  // A chat may already point at this ticket even when the ticket doesn't point
  // back yet — repair the link instead of creating a duplicate.
  const orphaned = await chatModel.findOne({ ticket: ticket._id });
  if (orphaned) {
    ticket.chat = orphaned._id;
    await ticket.save();
    return orphaned;
  }

  const chat = await chatModel.create({
    company: companyId,
    workspaceId,
    user: ticket.customerId,
    ticket: ticket._id,
    status: "active",
  });

  // Link both directions so the ticket row can deep-link into the chat.
  ticket.chat = chat._id;
  await ticket.save();

  return chat;
};

// Persist a message and keep the parent chat's denormalised counters in sync.
const postMessage = async ({ chat, role, content, sender = null, senderModel = null }) => {
  const message = await messageModel.create({
    chat: chat._id,
    content,
    role,
    sender,
    senderModel,
  });

  await chatModel.findByIdAndUpdate(chat._id, {
    latestMessage: message._id,
    lastActivity: new Date(),
    $inc: { messageCount: 1 },
  });

  socketEmit.newMessage(chat._id.toString(), message);
  return message;
};

// ============================================
// answerTicket — run the copilot against a newly created ticket.
// Never throws: a failure here must not fail ticket creation, so the customer
// always gets a reply, even if it is only the human-handoff message.
// ============================================
export const answerTicket = async ({ ticket, companyId, workspaceId }) => {
  const chat = await ensureTicketChat({ ticket, companyId, workspaceId });

  // Seed the thread with the customer's own words so the chat reads as a
  // conversation rather than starting with an unprompted AI reply.
  await postMessage({
    chat,
    role: "user",
    content: ticket.description,
    sender: ticket.customerId,
    senderModel: "user",
  });

  // No provider configured — hand off rather than leaving the ticket silent.
  if (!isAiConfigured()) {
    await postMessage({ chat, role: "ai", content: HANDOFF_TEXT });
    return { outcome: "escalated", chatId: chat._id, reason: "ai_not_configured" };
  }

  socketEmit.copilotTyping(chat._id.toString(), true);

  let result;
  try {
    const company = await companyModel.findById(companyId).select("name").lean();
    const history = await messageModel
      .find({ chat: chat._id })
      .sort({ createdAt: 1 })
      .limit(20)
      .select("role content")
      .lean();

    result = await runCopilot({
      message: ticket.description,
      // Exclude the message we just seeded — it is passed as `message`.
      conversationHistory: history.slice(0, -1).map((m) => ({
        role: m.role === "user" ? "user" : "assistant",
        content: m.content,
      })),
      workspaceId,
      companyId,
      workspaceContext: { companyName: company?.name },
    });
  } catch (err) {
    console.error("[ticketCopilot] copilot failed:", err.message);
    result = { escalate: true, escalationReason: "copilot_error" };
  } finally {
    socketEmit.copilotTyping(chat._id.toString(), false);
  }

  const updates = {};

  if (result.sentimentScore) updates.sentimentScore = result.sentimentScore;

  if (result.escalate || !result.aiResponse) {
    await postMessage({ chat, role: "ai", content: HANDOFF_TEXT });

    updates.status = "open";
    updates.escalatedAt = new Date();
    updates.aiSummary = [
      `AI could not resolve this ticket (${result.escalationReason || "unknown"}).`,
      result.triage?.reasoning ? `Triage: ${result.triage.reasoning}` : null,
      `Customer sentiment: ${result.sentimentScore || "unknown"}/5.`,
    ]
      .filter(Boolean)
      .join(" ");

    await ticketModel.findByIdAndUpdate(ticket._id, updates);
    socketEmit.escalating(chat._id.toString(), { ticketId: ticket._id });

    return {
      outcome: "escalated",
      chatId: chat._id,
      reason: result.escalationReason || "unknown",
    };
  }

  await postMessage({ chat, role: "ai", content: result.aiResponse });

  // Deliberately does NOT touch status. The ticket stays "New" until the
  // customer replies to this opening answer — see ticketStatus.service.js.
  // Left unassigned so the dashboard attributes the resolution to AI.
  updates.firstResponseAt = ticket.firstResponseAt || new Date();
  updates.lastMessageAt = new Date();
  await ticketModel.findByIdAndUpdate(ticket._id, updates);

  return { outcome: "answered", chatId: chat._id };
};

// ============================================
// answerChatMessage — copilot reply to a follow-up message in an open chat.
// Returns the persisted AI message, or null when handing off to a human.
// ============================================
export const answerChatMessage = async ({ chat, content, companyId, workspaceId }) => {
  if (!isAiConfigured()) {
    return {
      escalate: true,
      message: await postMessage({ chat, role: "ai", content: HANDOFF_TEXT }),
    };
  }

  socketEmit.copilotTyping(chat._id.toString(), true);

  try {
    const company = await companyModel.findById(companyId).select("name").lean();
    const history = await messageModel
      .find({ chat: chat._id })
      .sort({ createdAt: -1 })
      .limit(20)
      .select("role content")
      .lean();

    const result = await runCopilot({
      message: content,
      conversationHistory: history
        .reverse()
        .slice(0, -1)
        .map((m) => ({
          role: m.role === "user" ? "user" : "assistant",
          content: m.content,
        })),
      workspaceId,
      companyId,
      workspaceContext: { companyName: company?.name },
    });

    if (result.escalate || !result.aiResponse) {
      return {
        escalate: true,
        escalationReason: result.escalationReason,
        triage: result.triage,
        message: await postMessage({ chat, role: "ai", content: HANDOFF_TEXT }),
      };
    }

    return {
      escalate: false,
      message: await postMessage({ chat, role: "ai", content: result.aiResponse }),
    };
  } catch (err) {
    console.error("[ticketCopilot] chat reply failed:", err.message);
    return {
      escalate: true,
      escalationReason: "copilot_error",
      message: await postMessage({ chat, role: "ai", content: HANDOFF_TEXT }),
    };
  } finally {
    socketEmit.copilotTyping(chat._id.toString(), false);
  }
};
