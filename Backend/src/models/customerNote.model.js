import mongoose from "mongoose";

// A single private note an admin keeps against one customer.
//
// One note per (company, customer) — the sticky editor overwrites rather than
// appends, so the unique index below is what enforces "one per customer" even
// under concurrent upserts.
const customerNoteSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "company",
      required: [true, "Company is required"]
    },

    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: [true, "Customer is required"]
    },

    body: {
      type: String,
      default: "",
      trim: true,
      maxlength: [5000, "Note cannot exceed 5000 characters"]
    },

    // Last admin to touch it — the note is shared across a company's admins.
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "admin",
      default: null
    }
  },
  { timestamps: true }
);

customerNoteSchema.index({ companyId: 1, customerId: 1 }, { unique: true });

const customerNoteModel = mongoose.model("customerNote", customerNoteSchema);

export default customerNoteModel;
