import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters long"],
      maxlength: [50, "Name cannot exceed 50 characters"]
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: [true, "Email must be unique"],
      lowercase: true,
      trim: true
    },

    // String — not Number — to support international formats like +92-300-1234567
    phone: {
      type: String,
      default: "",
      trim: true
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      select: false
    },

    role: {
      type: String,
      enum: ["customer"],
      default: "customer"
    },

    // Scopes this customer to a specific company"s support portal
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "company",
      required: [true, "Company is required"]
    },

    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "workspace",
      required: [true, "Workspace is required"]
    },

    profileImage: {
      type: String,
      default: ""
    },

    isVerified: {
      type: Boolean,
      default: false
    },

    lastLogin: {
      type: Date,
      default: null
    },

    // Presence — whether they currently have a session open.
    status: {
      type: String,
      enum: ["online", "offline"],
      default: "offline"
    },

    // Account state — a different axis from presence. "suspended" can still log
    // in but every write is rejected; "deleted" is a soft delete (the document
    // and all their tickets/chats stay put) and blocks login entirely.
    accountStatus: {
      type: String,
      enum: ["active", "suspended", "deleted"],
      default: "active"
    },

    // Optional admin-supplied reason, surfaced in the suspension notice and,
    // when non-empty, emailed to the customer.
    statusReason: {
      type: String,
      default: ""
    },

    statusChangedAt: {
      type: Date,
      default: null
    },

    statusChangedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "admin",
      default: null
    }
  },
  { timestamps: true }
);

userSchema.index({ companyId: 1, workspaceId: 1, accountStatus: 1 });

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const userModel = mongoose.model("user", userSchema);

export default userModel;
