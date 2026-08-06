import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const agentSchema = new mongoose.Schema(
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

    password: {
      type: String,
      required: [true, "Password is required"],
      select: false
    },

    role: {
      type: String,
      enum: ["agent"],
      default: "agent"
    },

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
      enum: ["online", "offline", "away"],
      default: "offline"
    },

    // Account state — a different axis from presence. Suspended/removed agents
    // keep their history but stop receiving work and lose write access.
    accountStatus: {
      type: String,
      enum: ["active", "suspended", "deleted"],
      default: "active"
    },

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

agentSchema.index({ companyId: 1, workspaceId: 1, accountStatus: 1 });

agentSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

agentSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const agentModel = mongoose.model("agent", agentSchema);

export default agentModel;
