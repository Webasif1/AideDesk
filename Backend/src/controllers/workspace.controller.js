import crypto from "crypto";
import workspaceModel from "../models/workSpace.model.js";
import agentModel from "../models/aget.model.js";
import userModel from "../models/user.model.js";
import chatModel from "../models/chat.model.js";
import ticketModel from "../models/ticket.model.js";
import { HTTP_STATUS, ERROR_MESSAGES } from "../config/constants.js";
import { AppError, asyncHandler } from "../utils/errorHandler.js";
import companyModel from "../models/company.model.js";
import slaConfigModel from "../models/slaConfig.model.js";

// Auto-generate slug from workspace name + random hex suffix to avoid collisions
const generateSlug = name => {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const suffix = crypto.randomBytes(3).toString("hex");
  return `${base}-${suffix}`;
};

// ============================================
// POST /api/workspaces  (admin only)
// Admin creates a workspace for their company.
// v1: one active workspace per company enforced here as a soft warning, not hard block.
// ============================================
export const createWorkspace = asyncHandler(async (req, res) => {
  if (!req.companyId) {
    throw new AppError(
      "Please complete your company setup before creating a workspace.",
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  const { name, description, branding } = req.body;

  // Build slug — use provided slug or auto-generate from name
  const slug = req.body.slug
    ? req.body.slug.toLowerCase().replace(/[^a-z0-9-]/g, "-")
    : generateSlug(name);

  const slugExists = await workspaceModel.findOne({ slug });
  if (slugExists) {
    throw new AppError(
      "Workspace slug already taken. Choose a different name or provide a custom slug.",
      HTTP_STATUS.CONFLICT,
    );
  }

  const workspace = await workspaceModel.create({
    name,
    slug,
    description: description || "",
    companyId: req.companyId,
    owner: req.userId,
    branding: branding || {},
  });

  // Seed default SLA config — fire-and-forget; ticket flow recreates if missing
  slaConfigModel
    .create({
      workspaceId: workspace._id,
      companyId: req.companyId,
    })
    .catch(err =>
      console.error("[workspace] SLA seed failed:", err.message),
    );

  // Fetch company to include plan in response
  const company = await companyModel.findById(req.companyId);

  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: "Workspace created successfully.",
    data: {
      id: workspace._id,
      name: workspace.name,
      slug: workspace.slug,
      description: workspace.description,
      companyId: workspace.companyId,
      plan: company?.plan || "free",
      status: workspace.status,
      branding: workspace.branding,
      createdAt: workspace.createdAt,
    },
  });
});

// ============================================
// GET /api/workspaces  (admin only)
// Lists all workspaces for admin"s company (plan fetched from company)
// ============================================
export const getWorkspaces = asyncHandler(async (req, res) => {
  const [workspaces, company] = await Promise.all([
    workspaceModel
      .find({ companyId: req.companyId })
      .sort({ createdAt: -1 })
      .select("-__v"),
    companyModel.findById(req.companyId),
  ]);

  const data = workspaces.map(ws => ({
    ...ws.toObject(),
    plan: company?.plan || "free",
  }));

  res.status(HTTP_STATUS.OK).json({
    success: true,
    count: data.length,
    data,
  });
});

// ============================================
// GET /api/workspaces/:id  (admin only)
// Single workspace + member counts + company plan
// ============================================
export const getWorkspace = asyncHandler(async (req, res) => {
  const [workspace, company] = await Promise.all([
    workspaceModel
      .findOne({ _id: req.params.id, companyId: req.companyId })
      .select("-__v"),
    companyModel.findById(req.companyId),
  ]);

  if (!workspace) {
    throw new AppError("Workspace not found", HTTP_STATUS.NOT_FOUND);
  }

  // Member counts for dashboard display
  const [agentCount, customerCount, openTickets, activeChats] =
    await Promise.all([
      agentModel.countDocuments({ workspaceId: workspace._id }),
      userModel.countDocuments({ workspaceId: workspace._id }),
      ticketModel.countDocuments({
        workspaceId: workspace._id,
        status: { $in: ["open", "pending", "in_progress"] },
      }),
      chatModel.countDocuments({ workspaceId: workspace._id, status: "active" }),
    ]);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: {
      ...workspace.toObject(),
      plan: company?.plan || "free",
      stats: { agentCount, customerCount, openTickets, activeChats },
    },
  });
});

// ============================================
// PATCH /api/workspaces/:id  (admin only)
// Update name, description, branding
// ============================================
export const updateWorkspace = asyncHandler(async (req, res) => {
  // Strip fields that must not change via this route
  const { companyId, owner, status, slug, usage, resetDate, ...updateData } =
    req.body;

  const workspace = await workspaceModel.findOneAndUpdate(
    { _id: req.params.id, companyId: req.companyId },
    { $set: updateData },
    { new: true, runValidators: true },
  );

  if (!workspace) {
    throw new AppError("Workspace not found", HTTP_STATUS.NOT_FOUND);
  }

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Workspace updated",
    data: workspace,
  });
});

// ============================================
// PATCH /api/workspaces/:id/status  (admin only)
// Suspend or reactivate workspace
// ============================================
export const updateWorkspaceStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!["active", "suspended"].includes(status)) {
    throw new AppError(
      "Status must be active or suspended",
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  const workspace = await workspaceModel.findOneAndUpdate(
    { _id: req.params.id, companyId: req.companyId },
    { $set: { status } },
    { new: true },
  );

  if (!workspace) {
    throw new AppError("Workspace not found", HTTP_STATUS.NOT_FOUND);
  }

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: `Workspace ${status === "active" ? "reactivated" : "suspended"}`,
    data: { id: workspace._id, status: workspace.status },
  });
});

// ============================================
// DELETE /api/workspaces/:id  (admin only)
// Hard delete — blocks if workspace has active agents or customers
// ============================================
export const deleteWorkspace = asyncHandler(async (req, res) => {
  const workspace = await workspaceModel.findOne({
    _id: req.params.id,
    companyId: req.companyId,
  });

  if (!workspace) {
    throw new AppError("Workspace not found", HTTP_STATUS.NOT_FOUND);
  }

  const [agentCount, customerCount] = await Promise.all([
    agentModel.countDocuments({ workspaceId: workspace._id }),
    userModel.countDocuments({ workspaceId: workspace._id }),
  ]);

  if (agentCount > 0 || customerCount > 0) {
    throw new AppError(
      `Cannot delete workspace with ${agentCount} agent(s) and ${customerCount} customer(s). Remove all members first.`,
      HTTP_STATUS.CONFLICT,
    );
  }

  await workspace.deleteOne();

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Workspace deleted",
  });
});
