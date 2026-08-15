import crypto from "crypto";
import mongoose from "mongoose";
import agentModel from "../models/aget.model.js";
import ticketModel from "../models/ticket.model.js";
import companyModel from "../models/company.model.js";
import workspaceModel from "../models/workSpace.model.js";
import { HTTP_STATUS, ERROR_MESSAGES, ACCOUNT_STATUS } from "../config/constants.js";
import { AppError, asyncHandler } from "../utils/errorHandler.js";
import { sendAgentInviteEmail } from "../utils/email.js";
import { sendAccountStatusEmail } from "../utils/accountEmails.js";
import { reassignAgentTickets } from "../services/agentAssignment.service.js";
import { emitDomain } from "../sockets/emit.js";
import { config } from "../config/config.js";
import jwt from "jsonwebtoken";

// ============================================
// Generates a temporary password in the format: <Company4Letters><5RandomChars>
// Example: "Tech" + "3kPmN" → "Tech3kPmN"
// ============================================
const generateAgentPassword = (companyName) => {
  // Strip non-alpha, take first 4, pad with "X" if the name is short
  const prefix = companyName
    .replace(/[^a-zA-Z]/g, "")
    .substring(0, 4)
    .padEnd(4, "X");

  // Charset excludes visually confusing characters (0/O, 1/l/I)
  const charset = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  const random = Array.from(
    crypto.randomBytes(5),
    (byte) => charset[byte % charset.length]
  ).join("");

  return prefix + random;
};

// ============================================
// POST /api/agents
// Admin adds an agent to their company.
// Password is server-generated and sent only via the invite email.
// ============================================
export const createAgent = asyncHandler(async (req, res) => {
  if (!req.companyId) {
    throw new AppError(
      "Please complete your company setup before adding agents.",
      HTTP_STATUS.BAD_REQUEST
    );
  }

  const { name, email } = req.body;

  const exists = await agentModel.findOne({ email, companyId: req.companyId });
  if (exists) {
    throw new AppError(ERROR_MESSAGES.USER_EXISTS, HTTP_STATUS.CONFLICT);
  }

  // Fetch company so we can use the name in the password and in the email
  const company = await companyModel.findById(req.companyId);
  if (!company) {
    throw new AppError("Company not found. Please contact support.", HTTP_STATUS.NOT_FOUND);
  }

  // Guard: company must have a workspace before agents can be added.
  // Prefer the workspace the admin is actually operating in — falling back to
  // "first active workspace" regardless of context filed agents into a workspace
  // the admin was not viewing, and getAgents then returned an empty list.
  const workspace =
    (req.workspaceId &&
      (await workspaceModel.findOne({
        _id: req.workspaceId,
        companyId: req.companyId,
        status: "active",
      }))) ||
    (await workspaceModel.findOne({ companyId: req.companyId, status: "active" }));

  if (!workspace) {
    throw new AppError(
      "You must create a workspace before adding agents.",
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  const tempPassword = generateAgentPassword(company.name);

  // Create agent — bcrypt pre-save hook hashes the password automatically
  const agent = await agentModel.create({
    name,
    email,
    password: tempPassword,
    companyId: req.companyId,
    workspaceId: workspace._id,
  });

  // Invite token — short-lived (7d), contains role so verifyEmailToken picks the right model
  const inviteToken = jwt.sign(
    { userId: agent._id, email: agent.email, role: "agent" },
    config.JWT_SECRET,
    { expiresIn: "7d" },
  );

  const verifyLink = `${config.BACKEND_URL || `http://localhost:${config.PORT}`}/api/auth/verify/${inviteToken}`;

  // Send invite — fire-and-forget, email failure should not block the response
  sendAgentInviteEmail({
    email: agent.email,
    agentName: agent.name,
    companyName: company.name,
    loginEmail: agent.email,
    tempPassword,   // plain-text password, sent before bcrypt hashes it in the DB
    verifyLink,
    workspaceLoginUrl: `${config.FRONTEND_URL}/login?workspaceId=${workspace._id}`,
    frontendUrl: config.FRONTEND_URL,
  }).then((sent) => {
    console.log(
      sent
        ? `📧 Agent invite sent → ${agent.email}`
        : `❎ Agent invite email failed → ${agent.email}`
    );
  });

  emitDomain.agentCreated(req.companyId, {
    _id: agent._id,
    name: agent.name,
    email: agent.email,
    companyId: agent.companyId,
    workspaceId: agent.workspaceId,
    status: agent.status,
    isVerified: agent.isVerified,
    role: agent.role,
    createdAt: agent.createdAt,
  });

  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: `Agent added successfully. An invite email with login credentials has been sent to ${agent.email}.`,
    data: {
      id: agent._id,
      name: agent.name,
      email: agent.email,
      companyId: agent.companyId,
      workspaceId: agent.workspaceId,
      status: agent.status,
      isVerified: agent.isVerified,
    },
  });
});

// ============================================
// GET /api/agents/stats
// Team metrics — total, active (online), pending invites, avg CSAT.
// Workspace-scoped when a workspace context is present (admin header / agent token).
// ============================================
export const getAgentStats = asyncHandler(async (req, res) => {
  const filter = { companyId: req.companyId };
  if (req.workspaceId) filter.workspaceId = req.workspaceId;
  // Removed agents are soft-deleted — they should not inflate team counts.
  filter.accountStatus = { $ne: ACCOUNT_STATUS.DELETED };

  const [total, active, pendingInvites, suspended, csatAgg] = await Promise.all([
    agentModel.countDocuments(filter),
    agentModel.countDocuments({ ...filter, status: "online" }),
    agentModel.countDocuments({ ...filter, isVerified: false }),
    agentModel.countDocuments({ ...filter, accountStatus: ACCOUNT_STATUS.SUSPENDED }),
    // Team CSAT proxy: avg sentiment over human-handled (agent-assigned) tickets.
    ticketModel.aggregate([
      {
        $match: {
          companyId: new mongoose.Types.ObjectId(req.companyId),
          assignedAgent: { $ne: null },
        },
      },
      { $group: { _id: null, avg: { $avg: "$sentimentScore" } } },
    ]),
  ]);

  const avg = csatAgg[0]?.avg ?? null;

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: {
      total,
      active,
      pendingInvites,
      suspended,
      avgCsat: avg != null ? Math.round((avg / 5) * 100) : null,
    },
  });
});

// ============================================
// GET /api/agents
// Admin: all agents in their company
// ============================================
export const getAgents = asyncHandler(async (req, res) => {
  const { status, accountStatus, page = 1, limit = 20 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const filter = { companyId: req.companyId };
  if (req.workspaceId) {filter.workspaceId = req.workspaceId;}
  if (status) {filter.status = status;}

  // Removed agents are soft-deleted so their handled tickets keep a real name,
  // but they must not appear in the team list.
  if (accountStatus) {
    filter.accountStatus = accountStatus;
  } else {
    filter.accountStatus = { $ne: ACCOUNT_STATUS.DELETED };
  }

  const [agents, total] = await Promise.all([
    agentModel
      .find(filter)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    agentModel.countDocuments(filter),
  ]);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: agents,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit)),
    },
  });
});

// ============================================
// GET /api/agents/:id
// Admin: any agent in their company | Agent: own profile
// ============================================
export const getAgent = asyncHandler(async (req, res) => {
  const agent = await agentModel.findById(req.params.id).select("-password");

  if (!agent) {
    throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  }

  const isOwnProfile = req.role === "agent" && agent._id.toString() === req.userId;
  const isAdminOfCompany =
    req.role === "admin" && agent.companyId.toString() === req.companyId.toString();

  if (!isOwnProfile && !isAdminOfCompany) {
    throw new AppError(ERROR_MESSAGES.FORBIDDEN, HTTP_STATUS.FORBIDDEN);
  }

  res.status(HTTP_STATUS.OK).json({ success: true, data: agent });
});

// ============================================
// PATCH /api/agents/:id
// Admin: any field | Agent: own name/profileImage/status only
// ============================================
export const updateAgent = asyncHandler(async (req, res) => {
  const agent = await agentModel.findById(req.params.id);

  if (!agent) {
    throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  }

  const isOwnProfile = req.role === "agent" && agent._id.toString() === req.userId;
  const isAdminOfCompany =
    req.role === "admin" && agent.companyId.toString() === req.companyId.toString();

  if (!isOwnProfile && !isAdminOfCompany) {
    throw new AppError(ERROR_MESSAGES.FORBIDDEN, HTTP_STATUS.FORBIDDEN);
  }

  const updates = isAdminOfCompany ? { ...req.body } : {};

  if (isOwnProfile) {
    const agentAllowed = ["name", "profileImage", "status"];
    agentAllowed.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });
  }

  // Never allow these to be changed via this endpoint
  delete updates.role;
  delete updates.companyId;
  delete updates.password;
  delete updates.isVerified;

  // Presence is not a plain profile field — it is paired with manualPresence, and
  // writing `status` alone would leave a standing "Away" that the next socket
  // connect silently undoes. Route it through the presence service instead.
  const presence = updates.status;
  delete updates.status;
  delete updates.manualPresence;

  if (presence) {
    await setManualPresence("agent", req.params.id, presence);
  }

  const updated = await agentModel
    .findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true })
    .select("-password");

  emitDomain.agentUpdated(updated.companyId, updated.toObject ? updated.toObject() : updated);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Agent updated successfully",
    data: updated,
  });
});

// ============================================
// PATCH /api/agents/:id/password
// Agent changes their own password (requires current password)
// ============================================
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  // Only the agent themselves can change their password
  if (req.role !== "agent" || req.params.id !== req.userId) {
    throw new AppError(ERROR_MESSAGES.FORBIDDEN, HTTP_STATUS.FORBIDDEN);
  }

  const agent = await agentModel.findById(req.userId).select("+password");
  if (!agent) {
    throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  }

  const isMatch = await agent.comparePassword(currentPassword);
  if (!isMatch) {
    throw new AppError("Current password is incorrect", HTTP_STATUS.UNAUTHORIZED);
  }

  agent.password = newPassword; // pre-save hook re-hashes
  await agent.save();

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Password changed successfully.",
  });
});

// ============================================
// Shared by PATCH /:id/account-status and DELETE /:id.
//
// Removal is a soft delete so the agent's handled tickets keep a real name on
// them. Suspending or removing an agent hands their live tickets to another
// active agent — an agent who cannot act must not sit on open work.
// ============================================
const applyAgentAccountStatus = async ({ req, accountStatus, reason }) => {
  const agent = await agentModel.findById(req.params.id);

  if (!agent) {
    throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  }

  if (agent.companyId.toString() !== req.companyId.toString()) {
    throw new AppError(ERROR_MESSAGES.FORBIDDEN, HTTP_STATUS.FORBIDDEN);
  }

  const trimmedReason = (reason || "").trim();

  agent.accountStatus = accountStatus;
  agent.statusReason = trimmedReason;
  agent.statusChangedAt = new Date();
  agent.statusChangedBy = req.userId;
  if (accountStatus !== ACCOUNT_STATUS.ACTIVE) agent.status = "offline";

  await agent.save({ validateBeforeSave: false });

  // Only hand work off when the agent is losing access. Restoring one does not
  // claw tickets back from whoever picked them up.
  const reassignment =
    accountStatus === ACCOUNT_STATUS.ACTIVE
      ? { reassigned: 0, unassigned: 0, total: 0 }
      : await reassignAgentTickets(agent._id, {
          companyId: agent.companyId,
          workspaceId: agent.workspaceId,
        });

  if (trimmedReason) {
    const company = await companyModel.findById(req.companyId).select("name");
    sendAccountStatusEmail({
      email: agent.email,
      recipientName: agent.name,
      companyName: company?.name || "your support team",
      accountStatus,
      reason: trimmedReason,
      loginUrl: `${config.FRONTEND_URL || "http://localhost:5173"}/login`,
    }).catch((err) =>
      console.error("[agent] account status email failed:", err.message)
    );
  }

  if (accountStatus === ACCOUNT_STATUS.DELETED) {
    emitDomain.agentDeleted(agent.companyId, { _id: agent._id });
  } else {
    emitDomain.agentUpdated(agent.companyId, agent.toObject());
  }

  return { agent, reassignment, emailed: Boolean(trimmedReason) };
};

// ============================================
// PATCH /api/agents/:id/account-status
// Body: { accountStatus: 'active' | 'suspended' | 'deleted', reason?: string }
// Distinct from PATCH /api/agents/status, which is an agent's own presence.
// ============================================
export const updateAgentAccountStatus = asyncHandler(async (req, res) => {
  const { accountStatus, reason } = req.body;

  if (!Object.values(ACCOUNT_STATUS).includes(accountStatus)) {
    throw new AppError(
      `accountStatus must be one of: ${Object.values(ACCOUNT_STATUS).join(", ")}`,
      HTTP_STATUS.BAD_REQUEST
    );
  }

  const { agent, reassignment, emailed } = await applyAgentAccountStatus({
    req,
    accountStatus,
    reason,
  });

  const messages = {
    active: "Agent restored",
    suspended: "Agent suspended",
    deleted: "Agent removed",
  };

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: messages[accountStatus],
    emailed,
    reassignment,
    data: agent,
  });
});

// ============================================
// DELETE /api/agents/:id
// Soft-removes an agent and rehomes their live tickets.
// ============================================
export const deleteAgent = asyncHandler(async (req, res) => {
  const { reassignment, emailed } = await applyAgentAccountStatus({
    req,
    accountStatus: ACCOUNT_STATUS.DELETED,
    reason: req.body?.reason,
  });

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Agent removed successfully",
    emailed,
    reassignment,
  });
});

// Setting your own presence lives at PATCH /api/auth/me/status, which serves all
// three roles through the presence service. The agent-only endpoint that used to
// sit here had no caller and did not maintain `manualPresence`.
