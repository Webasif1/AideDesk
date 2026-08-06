import {
  ACCOUNT_STATUS,
  ERROR_CODES,
  ERROR_MESSAGES,
  HTTP_STATUS,
} from '../config/constants.js';
import { AppError } from '../utils/errorHandler.js';

// Requests a suspended account is still allowed to make. Everything else is a
// write and gets rejected — suspended means read-only, not logged out.
const READ_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

// Ending a session is not a "change" — a suspended user must still be able to
// log out, and marking messages as read is a side effect of simply viewing.
const ALWAYS_ALLOWED = [
  { method: 'POST', pattern: /\/logout$/ },
  { method: 'PATCH', pattern: /\/messages\/.*\/read$/ },
];

const isReadOnlyRequest = (req) => {
  if (READ_METHODS.has(req.method)) return true;
  return ALWAYS_ALLOWED.some(
    ({ method, pattern }) => req.method === method && pattern.test(req.originalUrl)
  );
};

// Called from `protect` immediately after the account document is loaded, so a
// new write route can never be added without this running. Deleted accounts are
// soft-deleted: the document and all its tickets/chats survive, but the account
// can no longer authenticate until an admin restores it.
export const assertAccountUsable = (user, req) => {
  const accountStatus = user?.accountStatus || ACCOUNT_STATUS.ACTIVE;

  if (accountStatus === ACCOUNT_STATUS.DELETED) {
    throw new AppError(
      ERROR_MESSAGES.ACCOUNT_DELETED,
      HTTP_STATUS.UNAUTHORIZED,
      ERROR_CODES.ACCOUNT_DELETED
    );
  }

  if (accountStatus === ACCOUNT_STATUS.SUSPENDED && !isReadOnlyRequest(req)) {
    throw new AppError(
      user.statusReason
        ? `${ERROR_MESSAGES.ACCOUNT_SUSPENDED} Reason: ${user.statusReason}`
        : ERROR_MESSAGES.ACCOUNT_SUSPENDED,
      HTTP_STATUS.FORBIDDEN,
      ERROR_CODES.ACCOUNT_SUSPENDED
    );
  }
};

// Route-level guard for the rare case a GET needs to be blocked too.
export const requireActiveAccount = (req, res, next) => {
  const accountStatus = req.user?.accountStatus || ACCOUNT_STATUS.ACTIVE;
  if (accountStatus !== ACCOUNT_STATUS.ACTIVE) {
    return next(
      new AppError(
        accountStatus === ACCOUNT_STATUS.DELETED
          ? ERROR_MESSAGES.ACCOUNT_DELETED
          : ERROR_MESSAGES.ACCOUNT_SUSPENDED,
        accountStatus === ACCOUNT_STATUS.DELETED
          ? HTTP_STATUS.UNAUTHORIZED
          : HTTP_STATUS.FORBIDDEN,
        accountStatus === ACCOUNT_STATUS.DELETED
          ? ERROR_CODES.ACCOUNT_DELETED
          : ERROR_CODES.ACCOUNT_SUSPENDED
      )
    );
  }
  next();
};
