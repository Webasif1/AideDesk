import { config } from '../config/config.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

// Generates the main auth access token and sets it in an httpOnly cookie.
// workspaceId is null for admins (they float across workspaces via x-workspace-id header).
export const generateToken = (res, userId, email, role, companyId = null, workspaceId = null) => {
  const token = jwt.sign(
    { userId, email, role, companyId, workspaceId },
    config.JWT_SECRET,
    { expiresIn: config.JWT_EXPIRE || '5d' }
  );
  setTokenInCookies(res, token);
  return token;
};

export const regenerateToken = (res, userId, email, role, companyId, workspaceId = null) => {
  const token = jwt.sign(
    { userId, email, role, companyId, workspaceId },
    config.JWT_SECRET,
    { expiresIn: config.JWT_EXPIRE || '5d' }
  );
  setTokenInCookies(res, token);
  return token;
};

// Email-verification token. Purpose-scoped and NOT a session credential.
//
// Registration previously signed a full 5-day session JWT, set it as a cookie,
// returned it in the response body AND emailed it as the verification link — so
// the link in an inbox (or a mail log, or a proxy log) was a working login, and
// the token from the register response could be replayed against /verify to
// self-verify without ever receiving the email.
//
// `purpose` is what makes the two kinds non-interchangeable; verifyEmailToken
// checks it, as resetPassword already did.
export const generateVerificationToken = (userId, email, role = 'admin') =>
  jwt.sign({ userId, email, role, purpose: 'email-verify' }, config.JWT_SECRET, {
    expiresIn: '24h'
  });

// Stored on the user so a link works exactly once. Hashed rather than stored
// raw: a database read should not yield a usable verification credential.
export const hashToken = token =>
  crypto.createHash('sha256').update(token).digest('hex');

// Short-lived token (15 min) used only for password reset links — never stored in cookies
export const generateResetToken = userId => {
  return jwt.sign({ userId, purpose: 'password-reset' }, config.JWT_SECRET, {
    expiresIn: '15m'
  });
};

const setTokenInCookies = (res, token) => {
  res.cookie('token', token, {
    httpOnly: true,
    secure: config.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
  });
};
