import { config } from '../config/config.js';
import { ERROR_MESSAGES, HTTP_STATUS } from '../config/constants.js';
import adminModel from '../models/admin.model.js';
import { AppError, asyncHandler } from '../utils/errorHandler.js';
import jwt from 'jsonwebtoken';

export const authenticateAdmin = asyncHandler(async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    throw new AppError(HTTP_STATUS.UNAUTHORIZED, ERROR_MESSAGES.UNAUTHORIZED);
  }

  const decoded = jwt.verify(token, config.JWT_SECRET);

  const user = await adminModel.findById(decoded.id);

  if (!user) {
    throw new AppError(HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND);
  }

  if (user.role !== 'admin') {
    throw new AppError(HTTP_STATUS.FORBIDDEN, ERROR_MESSAGES.FORBIDDEN);
  }

  req.user = user;

  next();
});
