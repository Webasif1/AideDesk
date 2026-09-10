import rateLimit from "express-rate-limit";
import { config } from "../config/config.js";

// Rate limiting was absent entirely, so login and forgot-password could be
// attacked at whatever rate the network allowed.
//
// Disabled outside production so tests and local development are not throttled
// — the suite makes hundreds of calls from one address in seconds.
const enabled = config.NODE_ENV === "production";

const build = (options) =>
  rateLimit({
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => !enabled,
    message: {
      success: false,
      statusCode: 429,
      message: "Too many requests. Please try again in a few minutes.",
      code: "RATE_LIMITED",
    },
    ...options,
  });

/** Broad ceiling for the API as a whole. */
export const apiLimiter = build({
  windowMs: 15 * 60 * 1000,
  limit: 300,
});

/**
 * Credential endpoints. Counts only failures, so a person legitimately signing
 * in repeatedly is never locked out — only someone guessing wrong is.
 */
export const authLimiter = build({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
});
