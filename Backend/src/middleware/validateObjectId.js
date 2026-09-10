import mongoose from "mongoose";
import { HTTP_STATUS } from "../config/constants.js";
import { AppError } from "../utils/errorHandler.js";

// Rejects a malformed :id before it reaches a controller, so `/api/tickets/zzz`
// answers 400 with a clean message instead of 500 with a raw Mongoose
// CastError. The message router already did this by hand; this generalises it.
//
// Usage: router.get('/:id', validateObjectId('id'), handler)
export const validateObjectId =
  (...params) =>
  (req, res, next) => {
    for (const param of params) {
      const value = req.params[param];
      if (value !== undefined && !mongoose.isValidObjectId(value)) {
        return next(
          new AppError(`Invalid ${param}`, HTTP_STATUS.BAD_REQUEST, "INVALID_ID"),
        );
      }
    }
    next();
  };
