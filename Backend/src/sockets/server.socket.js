// Socket.IO server — authenticates every connection from the JWT cookie and
// places each socket into rooms used for targeted real-time pushes:
//   user:{userId}          → personal pushes (e.g. ticket:assigned)
//   company:{companyId}    → company-wide domain events (admins + agents)
//   workspace:{workspaceId}→ workspace-scoped events (agents/customers, admin on focus)
//   chat:{chatId}          → live chat messaging (joined on demand, authorized)
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { config } from "../config/config.js";
import { markOnline, markOffline } from "../services/presence.service.js";
import { actorFromSocket, canAccessChat } from "../services/chatAccess.js";
import { ACCOUNT_STATUS } from "../config/constants.js";
import adminModel from "../models/admin.model.js";
import agentModel from "../models/aget.model.js";
import userModel from "../models/user.model.js";
import chatModel from "../models/chat.model.js";
import workspaceModel from "../models/workSpace.model.js";

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

const MODELS = { admin: adminModel, agent: agentModel, customer: userModel };

/**
 * Force every live socket for a user to drop.
 *
 * Called when access is revoked — logout, suspension, deletion. Without it a
 * revoked account kept a live event feed for the remaining lifetime of its
 * token, because the handshake is the only place authorization was ever
 * checked.
 */
export const disconnectUser = (userId, reason = "access_revoked") => {
  if (!io || !userId) return;
  try {
    io.in(`user:${userId}`).emit("session:revoked", { reason });
    io.in(`user:${userId}`).disconnectSockets(true);
  } catch (err) {
    console.error("[socket] disconnectUser failed:", err.message);
  }
};

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: config.FRONTEND_URL,
      credentials: true,
    },
  });

  // ── Handshake auth ─────────────────────────────────────────────────────────
  // The JWT alone is not enough. assertAccountUsable is deliberately centralised
  // in protect() so "no write route can miss it" — but sockets never went
  // through protect, so a deleted or suspended account kept a live feed, showed
  // as online on the Team page, and stayed eligible for assignment. Load the
  // account and check its status here too.
  io.use(async (socket, next) => {
    try {
      const cookies = parseCookie(socket.handshake.headers?.cookie);
      const token = cookies.token;
      if (!token) return next(new Error("unauthorized"));

      const decoded = jwt.verify(token, config.JWT_SECRET);
      const Model = MODELS[decoded.role];
      if (!Model) return next(new Error("unauthorized"));

      const user = await Model.findById(decoded.userId).select(
        "accountStatus companyId workspaceId",
      );
      if (!user) return next(new Error("unauthorized"));
      if (user.accountStatus === ACCOUNT_STATUS.DELETED) {
        return next(new Error("account_deleted"));
      }

      socket.data.user = {
        userId: decoded.userId,
        role: decoded.role,
        // From the database, not the token: a re-homed or re-assigned account
        // would otherwise stay pinned to stale claims until its JWT expired.
        companyId: user.companyId ? user.companyId.toString() : null,
        workspaceId:
          decoded.role === "admin"
            ? null
            : user.workspaceId
              ? user.workspaceId.toString()
              : null,
      };
      // Suspended accounts may listen but not act — the same read-only rule
      // accountStatus.middleware applies over REST.
      socket.data.readOnly = user.accountStatus === ACCOUNT_STATUS.SUSPENDED;
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
    // Called unconditionally: markOnline itself refuses to raise a non-active
    // account and drives it offline instead, so suspended users cannot appear
    // available for work. Keeping that rule in one place means the socket path
    // and the login path cannot disagree.
    markOnline(role, userId);

    const deny = (ack, error) => {
      console.warn(`[socket] denied ${error}`, { userId, role, socket: socket.id });
      ack?.({ ok: false, error });
    };

    // Admins float across workspaces — join the one they're actively viewing,
    // provided it is in their own company.
    socket.on("workspace:focus", async ({ workspaceId: wsId } = {}, ack) => {
      if (!mongoose.isValidObjectId(wsId)) return deny(ack, "invalid_id");
      const ok = await workspaceModel.exists({ _id: wsId, companyId });
      if (!ok) return deny(ack, "forbidden");
      socket.join(`workspace:${wsId}`);
      ack?.({ ok: true });
    });

    socket.on("workspace:blur", ({ workspaceId: wsId } = {}) => {
      if (wsId) socket.leave(`workspace:${wsId}`);
    });

    // ── Live chat rooms ────────────────────────────────────────────────────
    // Previously this joined whatever room id it was handed, so any
    // authenticated socket could receive another tenant's private messages in
    // real time simply by knowing a chat id.
    socket.on("chat:join", async ({ chatId } = {}, ack) => {
      if (!mongoose.isValidObjectId(chatId)) return deny(ack, "invalid_id");

      const chat = await chatModel
        .findById(chatId)
        .select("company user assignedAgent assignedAdmin workspaceId");
      if (!chat) return deny(ack, "not_found");
      if (!canAccessChat(chat, actorFromSocket(socket))) return deny(ack, "forbidden");

      socket.join(`chat:${chatId}`);
      ack?.({ ok: true });
    });

    socket.on("chat:leave", ({ chatId } = {}) => {
      if (chatId) socket.leave(`chat:${chatId}`);
    });

    socket.on("chat:typing", ({ chatId, isTyping } = {}) => {
      // Membership is the authorization: a socket can only broadcast into a
      // room it was allowed to join. Without this the event doubled as a way to
      // probe and spam arbitrary chat rooms.
      if (!chatId || !socket.rooms.has(`chat:${chatId}`)) return;
      if (socket.data.readOnly) return;
      socket.to(`chat:${chatId}`).emit("chat:typing", { chatId, userId, isTyping });
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
