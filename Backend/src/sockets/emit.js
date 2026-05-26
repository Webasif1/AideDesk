import { getIO } from "./server.socket.js";

// Wraps every push so getIO() failure (server not yet bound) never crashes a request.
const safeEmit = (room, event, payload) => {
  try {
    getIO().to(room).emit(event, payload);
  } catch (err) {
    console.error(`[socket] emit ${event} -> ${room} failed:`, err.message);
  }
};

export const socketEmit = {
  newMessage(chatId, message) {
    safeEmit(`chat:${chatId}`, "message:new", message);
  },

  copilotTyping(chatId, isTyping) {
    safeEmit(`chat:${chatId}`, "copilot:typing", { isTyping });
  },

  escalating(chatId, ticketDraft) {
    safeEmit(`chat:${chatId}`, "copilot:escalating", { ticketDraft });
  },

  ticketAssigned(agentId, payload) {
    safeEmit(`user:${agentId}`, "ticket:assigned", payload);
  },

  agentJoined(chatId, agent) {
    safeEmit(`chat:${chatId}`, "agent:joined", { agent });
  },

  ticketUpdated(workspaceId, ticket) {
    safeEmit(`workspace:${workspaceId}:agents`, "ticket:updated", ticket);
  }
};
