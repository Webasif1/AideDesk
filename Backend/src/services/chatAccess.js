// One definition of "may this principal touch this conversation", shared by the
// REST controllers and the Socket.IO layer.
//
// Before this existed there were five copies of the rule and they disagreed.
// chat.controller.getChat correctly held an agent to their own assignments;
// message.controller.assertChatAccess checked only the company, so any agent
// could read, post into and mark read every conversation in the tenant — and
// the socket layer checked nothing at all, so any authenticated socket could
// join any chat room by id. Keeping the rule in one place is the only way those
// three stay in agreement.
import mongoose from "mongoose";
import chatModel from "../models/chat.model.js";
import { ERROR_MESSAGES, HTTP_STATUS } from "../config/constants.js";
import { AppError } from "../utils/errorHandler.js";

/**
 * Normalise a ref that may be an ObjectId, a populated document, or null.
 *
 * This is load-bearing: chat.controller populates `assignedAgent` while
 * message.controller does a bare findById. A predicate that assumed either
 * shape would silently deny every populated chat — locking agents out of their
 * own conversations with no error to explain why.
 */
export const idOf = (ref) => {
  if (!ref) return null;
  if (ref instanceof mongoose.Types.ObjectId) return ref.toString();
  if (typeof ref === "object" && ref._id) return ref._id.toString();
  return ref.toString();
};

const sameId = (a, b) => {
  const [x, y] = [idOf(a), idOf(b)];
  return Boolean(x && y && x === y);
};

/** Principal shape the predicate works against, from a request. */
export const actorFromReq = (req) => ({
  userId: req.userId,
  role: req.role,
  companyId: req.companyId,
  workspaceId: req.workspaceId,
});

/** Same shape, from an authenticated socket. */
export const actorFromSocket = (socket) => socket.data?.user ?? null;

/**
 * @returns {boolean} true if `actor` may read and post in `chat`
 */
export const canAccessChat = (chat, actor) => {
  if (!chat || !actor) return false;

  const sameCompany = sameId(chat.company, actor.companyId);

  switch (actor.role) {
    // Admins float across every workspace in their own company. Workspace
    // narrowing is deliberately NOT applied here: only take-over enforces it
    // today, and tightening it globally would revoke access admins currently
    // have whenever the client holds a stale x-workspace-id.
    case "admin":
      return sameCompany;

    // An agent gets their own assignments only. A chat nobody owns is not
    // fair game — it is assigned through the take-over/assign endpoints.
    case "agent":
      return sameCompany && sameId(chat.assignedAgent, actor.userId);

    // A customer's claim is the chat itself, not the company: their JWT
    // companyId is not consulted, so a re-homed account still reaches its
    // own history.
    case "customer":
      return sameId(chat.user, actor.userId);

    default:
      return false;
  }
};

/**
 * Load a chat and assert access in one step.
 *
 * Throws 404 for a missing chat and 403 for a forbidden one — deliberately
 * distinct, because the id came from a caller who already had to know it.
 * Callers wanting to hide existence entirely should catch and re-throw 404.
 */
export const loadChatForActor = async (chatId, actor, { populate } = {}) => {
  if (!mongoose.isValidObjectId(chatId)) {
    throw new AppError("Invalid chat id", HTTP_STATUS.BAD_REQUEST, "INVALID_ID");
  }

  let query = chatModel.findById(chatId);
  if (populate) for (const p of populate) query = query.populate(...[].concat(p));

  const chat = await query;
  if (!chat) throw new AppError("Chat not found", HTTP_STATUS.NOT_FOUND);
  if (!canAccessChat(chat, actor)) {
    throw new AppError(ERROR_MESSAGES.FORBIDDEN, HTTP_STATUS.FORBIDDEN);
  }
  return chat;
};
