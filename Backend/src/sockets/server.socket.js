// Socket.IO server — authenticates every connection from the JWT cookie and
// places each socket into rooms used for targeted real-time pushes:
//   user:{userId}          → personal pushes (e.g. ticket:assigned)
//   company:{companyId}    → company-wide domain events (admins + agents)
//   workspace:{workspaceId}→ workspace-scoped events (agents/customers, admin on focus)
//   chat:{chatId}          → live chat messaging (joined on demand)
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { config } from "../config/config.js";
import { markOnline, markOffline } from "../services/presence.service.js";

let io = null;

// Accessor used by emit.js helpers. Throws if the server isn't bound yet so a
// stray emit during boot surfaces clearly instead of silently no-op'ing.
export const getIO = () => {
  if (!io) throw new Error("Socket.IO not initialized");
  return io;
};

// Minimal cookie-header parser — the handshake gives us the raw Cookie string,
// not the express cookie-parser output.
const parseCookie = (cookieHeader = "") =>
  cookieHeader.split(";").reduce((acc, part) => {
    const idx = part.indexOf("=");
    if (idx === -1) return acc;
    const key = part.slice(0, idx).trim();
    const val = part.slice(idx + 1).trim();
    if (key) acc[key] = decodeURIComponent(val);
    return acc;
  }, {});

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: config.FRONTEND_URL,
      credentials: true,
    },
  });

  // ── Handshake auth ─────────────────────────────────────────────────────────
  io.use((socket, next) => {
    try {
      const cookies = parseCookie(socket.handshake.headers?.cookie);
      const token = cookies.token;
      if (!token) return next(new Error("unauthorized"));

      const decoded = jwt.verify(token, config.JWT_SECRET);
      socket.data.user = {
        userId: decoded.userId,
        role: decoded.role,
        companyId: decoded.companyId || null,
        workspaceId: decoded.workspaceId || null,
      };
      next();
    } catch {
      next(new Error("unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    const { userId, role, companyId, workspaceId } = socket.data.user;

    // Personal room — every authenticated socket.
    socket.join(`user:${userId}`);

    // Admins + agents watch company-wide domain events (tickets/customers/agents).
    // Customers are intentionally excluded so they never receive other tenants' data.
    if ((role === "admin" || role === "agent") && companyId) {
      socket.join(`company:${companyId}`);
    }

    // Agents/customers are locked to one workspace.
    if (workspaceId) socket.join(`workspace:${workspaceId}`);

    console.log(`✅ socket ${socket.id} connected (${role})`);

    // Presence follows the connection, so it stays truthful when somebody closes
    // a tab or drops off the network — neither of which produces a logout.
    markOnline(role, userId);

    // Admins float across workspaces — join the one they're actively viewing.
    socket.on("workspace:focus", ({ workspaceId: wsId } = {}) => {
      if (wsId) socket.join(`workspace:${wsId}`);
    });
    socket.on("workspace:blur", ({ workspaceId: wsId } = {}) => {
      if (wsId) socket.leave(`workspace:${wsId}`);
    });

    // ── Live chat rooms ────────────────────────────────────────────────────
    socket.on("chat:join", ({ chatId } = {}) => {
      if (chatId) socket.join(`chat:${chatId}`);
    });
    socket.on("chat:leave", ({ chatId } = {}) => {
      if (chatId) socket.leave(`chat:${chatId}`);
    });
    socket.on("chat:typing", ({ chatId, isTyping } = {}) => {
      if (chatId) {
        socket.to(`chat:${chatId}`).emit("chat:typing", { chatId, userId, isTyping });
      }
    });

    socket.on("disconnect", async () => {
      console.log(`❌ socket ${socket.id} disconnected (${role})`);

      // Only go offline once every session for this person is gone. A reload
      // briefly runs two connections and multiple tabs are normal, so writing
      // offline on any disconnect would flap them offline while still present.
      try {
        const remaining = await io.in(`user:${userId}`).fetchSockets();
        if (remaining.length === 0) await markOffline(role, userId);
      } catch (err) {
        console.error("[socket] presence cleanup failed:", err.message);
      }
    });
  });

  return io;
};
