import { getIO } from "./server.socket.js";

// Wraps every push so getIO() failure (server not yet bound) never crashes a request.
const safeEmit = (room, event, payload) => {
  try {
    getIO().to(room).emit(event, payload);
  } catch (err) {
    console.error(`[socket] emit ${event} -> ${room} failed:`, err.message);
  }
};

// ── Generic room emitters ──────────────────────────────────────────────────
export const emitToUser = (userId, event, payload) => {
  if (userId) safeEmit(`user:${userId}`, event, payload);
};
export const emitToCompany = (companyId, event, payload) => {
  if (companyId) safeEmit(`company:${companyId}`, event, payload);
};
export const emitToWorkspace = (workspaceId, event, payload) => {
  if (workspaceId) safeEmit(`workspace:${workspaceId}`, event, payload);
};

// ── Live-chat events (existing copilot/chat pipeline) ───────────────────────
export const socketEmit = {
  newMessage(chatId, message) {
    safeEmit(`chat:${chatId}`, "message:new", { message, chat: { _id: chatId } });
  },
  copilotTyping(chatId, isTyping) {
    safeEmit(`chat:${chatId}`, "copilot:typing", { chatId, isTyping });
  },
  escalating(chatId, ticketDraft) {
    safeEmit(`chat:${chatId}`, "copilot:escalating", { chatId, ticketDraft });
  },
  ticketAssigned(agentId, payload) {
    safeEmit(`user:${agentId}`, "ticket:assigned", payload);
  },
  agentJoined(chatId, agent) {
    safeEmit(`chat:${chatId}`, "agent:joined", { chatId, agent });
  },
};

// ── Domain events for dashboards/lists ──────────────────────────────────────
// Broadcast to the company room (admins + agents). Payloads carry enough to
// upsert a list row; the client refetches the small stats payloads to stay exact.
export const emitDomain = {
  ticketCreated(companyId, ticket) {
    emitToCompany(companyId, "ticket:created", ticket);
  },
  ticketUpdated(companyId, ticket) {
    emitToCompany(companyId, "ticket:updated", ticket);
  },
  ticketDeleted(companyId, payload) {
    emitToCompany(companyId, "ticket:deleted", payload);
  },
  customerCreated(companyId, customer) {
    emitToCompany(companyId, "customer:created", customer);
  },
  customerDeleted(companyId, payload) {
    emitToCompany(companyId, "customer:deleted", payload);
  },
  agentCreated(companyId, agent) {
    emitToCompany(companyId, "agent:created", agent);
  },
  agentUpdated(companyId, agent) {
    emitToCompany(companyId, "agent:updated", agent);
  },
  agentDeleted(companyId, payload) {
    emitToCompany(companyId, "agent:deleted", payload);
  },
};
