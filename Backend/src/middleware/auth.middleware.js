import { config } from '../config/config.js';
import { ERROR_MESSAGES, HTTP_STATUS } from '../config/constants.js';
import adminModel from '../models/admin.model.js';
import agentModel from '../models/aget.model.js';
import userModel from '../models/user.model.js';
import { AppError, asyncHandler } from '../utils/errorHandler.js';
import { assertAccountUsable } from './accountStatus.middleware.js';
import workspaceModel from '../models/workSpace.model.js';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

// An admin's x-workspace-id was previously trusted verbatim, so the header
// chose the scope for every controller keying off req.workspaceId. Resolving it
// here — against the caller's own company — covers every current and future
// controller with one check rather than relying on each to re-validate.
//
// Cached briefly because it would otherwise add a query to every admin request;
// workspace membership changes far more slowly than this TTL.
const WORKSPACE_TTL_MS = 30_000;
const workspaceCache = new Map();

const resolveAdminWorkspace = async (headerValue, companyId) => {
  if (!headerValue) return null;

  if (!mongoose.isValidObjectId(headerValue)) {
    throw new AppError('Invalid workspace', HTTP_STATUS.BAD_REQUEST, 'INVALID_WORKSPACE');
  }

  const key = `${companyId}:${headerValue}`;
  const hit = workspaceCache.get(key);
  if (hit && hit.expires > Date.now()) {
    if (!hit.ok) {
      throw new AppError('Workspace not found in your company', HTTP_STATUS.FORBIDDEN, 'FORBIDDEN');
    }
    return headerValue;
  }

  const exists = await workspaceModel.exists({ _id: headerValue, companyId });
  workspaceCache.set(key, { ok: Boolean(exists), expires: Date.now() + WORKSPACE_TTL_MS });

  if (!exists) {
    // Deliberately NOT a silent fallback to null: falling back would widen the
    // request from one workspace to the whole company, which is the opposite of
    // what the caller asked for and the opposite of safe.
    throw new AppError('Workspace not found in your company', HTTP_STATUS.FORBIDDEN, 'FORBIDDEN');
  }
  return headerValue;
};

// Verifies the JWT cookie, loads the user from the correct model, and injects
// req.user, req.userId, req.role, and req.companyId into the request.
export const protect = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) {
    throw new AppError(ERROR_MESSAGES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED);
  }

  let decoded;
  try {
    decoded = jwt.verify(token, config.JWT_SECRET);
  } catch {
    throw new AppError(ERROR_MESSAGES.INVALID_TOKEN, HTTP_STATUS.UNAUTHORIZED);
  }

  let user = null;
  if (decoded.role === 'admin') {
    user = await adminModel.findById(decoded.userId);
  } else if (decoded.role === 'agent') {
    user = await agentModel.findById(decoded.userId);
  } else if (decoded.role === 'customer') {
    user = await userModel.findById(decoded.userId);
  }

  if (!user) {
    throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
  }

  // Blocks deleted accounts outright and makes suspended accounts read-only.
  // Lives here rather than on individual routes so no write route can miss it.
  assertAccountUsable(user, req);

  req.user = user;
  req.userId = decoded.userId;
  req.role = decoded.role;
  req.companyId = decoded.companyId;
  // Admin floats across workspaces — workspaceId comes from the x-workspace-id
  // header, validated against their own company. Agents/customers have it
  // locked in their JWT and the header is ignored for them.
  req.workspaceId =
    decoded.role === 'admin'
      ? await resolveAdminWorkspace(req.headers['x-workspace-id'], decoded.companyId)
      : decoded.workspaceId || null;
  next();
});

// Usage: requireRole('admin') or requireRole('admin', 'agent')
export const requireRole =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.role)) {
      return next(
        new AppError(ERROR_MESSAGES.FORBIDDEN, HTTP_STATUS.FORBIDDEN)
      );
    }
    next();
  };
