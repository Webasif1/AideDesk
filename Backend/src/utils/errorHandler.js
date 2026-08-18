import { ERROR_MESSAGES, HTTP_STATUS } from "../config/constants.js";

// Promise.resolve, not `fn(...).catch(...)`. A handler declared without `async`
// returns undefined, and calling .catch on that threw
// "Cannot read properties of undefined (reading 'catch')" — after the handler had
// already sent its response, so the request logged a 500 it never actually
// returned. Wrapping accepts sync and async handlers alike.
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    // The try/catch covers a sync handler that throws. Express would catch that
    // itself, but routing every failure through next() keeps all three cases —
    // sync return, async rejection, sync throw — behaving identically.
    try {
      Promise.resolve(fn(req, res, next)).catch(next);
    } catch (err) {
      next(err);
    }
  };
};

export class AppError extends Error {
  // `code` is an optional machine-readable tag (e.g. "ACCOUNT_SUSPENDED") the
  // client can branch on without string-matching the message.
  constructor(message, statusCode, code = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  const message = err.message || ERROR_MESSAGES.INTERNAL_ERROR;

  console.error("Error : ", {
    statusCode,
    message,
    url: req.originalUrl,
    method: req.method,
    timestamp: new Date(),
  });

  // Writing to an already-sent response throws ERR_HTTP_HEADERS_SENT, which
  // replaces the real error in the log with a misleading one. Express's default
  // handler closes the connection instead.
  if (res.headersSent) {
    return next(err);
  }

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    ...(err.code && { code: err.code }),
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

export const notFoundHandler = (req, res) => {
  res.status(HTTP_STATUS.NOT_FOUND).json({
    success: false,
    statusCode: HTTP_STATUS.NOT_FOUND,
    message: `Route ${req.originalUrl} not found`,
  });
};
