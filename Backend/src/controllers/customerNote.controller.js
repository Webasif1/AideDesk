import customerNoteModel from "../models/customerNote.model.js";
import userModel from "../models/user.model.js";
import { HTTP_STATUS } from "../config/constants.js";
import { AppError, asyncHandler } from "../utils/errorHandler.js";

// Private admin notes about a customer. Never exposed to agents or to the
// customer themselves — both routes are admin-only and company-scoped.

// Confirm the customer exists inside the caller's company before touching a note,
// so an admin cannot read or write notes against another tenant's customer by id.
const assertCustomerInCompany = async (customerId, req) => {
  const customer = await userModel
    .findOne({ _id: customerId, companyId: req.companyId })
    .select("_id")
    .lean();

  if (!customer) {
    throw new AppError("Customer not found", HTTP_STATUS.NOT_FOUND);
  }
  return customer;
};

// ============================================
// GET /api/users/:id/note
// Returns the note, or an empty body when none has been written yet.
// ============================================
export const getCustomerNote = asyncHandler(async (req, res) => {
  await assertCustomerInCompany(req.params.id, req);

  const note = await customerNoteModel
    .findOne({ companyId: req.companyId, customerId: req.params.id })
    .lean();

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: {
      customerId: req.params.id,
      body: note?.body || "",
      updatedAt: note?.updatedAt || null
    }
  });
});

// ============================================
// PUT /api/users/:id/note
// Creates or overwrites the note. An empty body deletes it, so clearing the
// sticky doesn't leave an empty record behind.
// ============================================
export const upsertCustomerNote = asyncHandler(async (req, res) => {
  const { body } = req.body;

  if (typeof body !== "string") {
    throw new AppError("Note body must be a string", HTTP_STATUS.BAD_REQUEST);
  }

  const trimmed = body.trim();
  if (trimmed.length > 5000) {
    throw new AppError(
      "Note cannot exceed 5000 characters",
      HTTP_STATUS.BAD_REQUEST
    );
  }

  await assertCustomerInCompany(req.params.id, req);

  if (!trimmed) {
    await customerNoteModel.deleteOne({
      companyId: req.companyId,
      customerId: req.params.id
    });
    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Note cleared",
      data: { customerId: req.params.id, body: "", updatedAt: null }
    });
  }

  const note = await customerNoteModel.findOneAndUpdate(
    { companyId: req.companyId, customerId: req.params.id },
    { body: trimmed, updatedBy: req.userId },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: "Note saved",
    data: {
      customerId: req.params.id,
      body: note.body,
      updatedAt: note.updatedAt
    }
  });
});
