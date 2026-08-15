import adminModel from "../models/admin.model.js";
import agentModel from "../models/aget.model.js";
import userModel from "../models/user.model.js";
import { emitDomain } from "../sockets/emit.js";

// ============================================
// Presence — who currently has the app open.
//
// Driven by the socket lifecycle, not by login/logout: closing a tab or losing a
// laptop never produces a logout request, so login-driven presence goes stale and
// escalation then routes work to somebody who went home hours ago.
//
// Two fields carry it:
//   status         — effective presence, what the UI and the agent picker read
//   manualPresence — a deliberate "Away"/"Offline" choice from the header menu
//
// They are separate because otherwise reconnecting would silently overwrite the
// choice. `manualPresence` wins while connected; a disconnect always lands on
// offline regardless, since the session really is gone.
// ============================================

const MODELS = {
  admin: adminModel,
  agent: agentModel,
  customer: userModel,
};

// Customers have no "away" — their enum is online/offline only (user.model.js).
const ALLOWED_BY_ROLE = {
  admin: ["online", "away", "offline"],
  agent: ["online", "away", "offline"],
  customer: ["online", "offline"],
};

export const presenceOptionsFor = (role) => ALLOWED_BY_ROLE[role] || [];

// Agents are the only presence the admin Team page renders live.
const broadcast = (role, companyId, doc) => {
  if (role !== "agent" || !companyId || !doc) return;
  emitDomain.agentUpdated(companyId, {
    _id: doc._id,
    name: doc.name,
    email: doc.email,
    status: doc.status,
    accountStatus: doc.accountStatus,
    isVerified: doc.isVerified,
    workspaceId: doc.workspaceId,
  });
};

// Every write goes through here so a presence failure can never take down the
// socket handshake or a request — presence is not worth failing a login over.
const applyPresence = async (role, userId, update) => {
  const Model = MODELS[role];
  if (!Model || !userId) return null;

  try {
    const doc = await Model.findByIdAndUpdate(userId, update, { new: true });
    if (doc) broadcast(role, doc.companyId, doc);
    return doc;
  } catch (err) {
    console.error(`[presence] ${role} ${userId} update failed:`, err.message);
    return null;
  }
};

// ============================================
// A session opened. Respect a standing Away/Offline choice rather than yanking
// them back online just because a tab loaded.
// ============================================
export const markOnline = async (role, userId) => {
  const Model = MODELS[role];
  if (!Model || !userId) return null;

  try {
    const current = await Model.findById(userId).select("manualPresence").lean();
    const status = current?.manualPresence || "online";
    return applyPresence(role, userId, { status });
  } catch (err) {
    console.error(`[presence] ${role} ${userId} markOnline failed:`, err.message);
    return null;
  }
};

// ============================================
// Last session closed. `manualPresence` is deliberately left alone so an "Away"
// agent is still Away when they come back.
// ============================================
export const markOffline = (role, userId) =>
  applyPresence(role, userId, { status: "offline" });

// ============================================
// An explicit pick from the header menu.
// "Online" clears the override and resumes following the socket; anything else
// becomes sticky until they change it.
// ============================================
export const setManualPresence = (role, userId, status) => {
  const manualPresence = status === "online" ? null : status;
  return applyPresence(role, userId, { status, manualPresence });
};
