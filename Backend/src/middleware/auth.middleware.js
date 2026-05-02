import { config } from '../config/config.js';
import { ERROR_MESSAGES, HTTP_STATUS } from '../config/constants.js';
import adminModel from '../models/admin.model.js';
import agentModel from '../models/aget.model.js';
import userModel from '../models/user.model.js';
import { AppError, asyncHandler } from '../utils/errorHandler.js';
import jwt from 'jsonwebtoken';

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

  req.user = user;
  req.userId = decoded.userId;
  req.role = decoded.role;
  req.companyId = decoded.companyId;
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
