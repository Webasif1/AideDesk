// models/Workspace.js
import mongoose from "mongoose";

const workspaceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Workspace name is required"],
      trim: [true, "Workspace name cannot have leading or trailing spaces"],
      maxlength: 50,
    },

    slug: {
      type: String,
      required: [true, "Workspace slug is required"],
      unique: [true, "Workspace slug must be unique"],
      lowercase: [true, "Workspace slug must be lowercase"],
      trim: [true, "Workspace slug cannot have leading or trailing spaces"],
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: [true, "Workspace owner is required"],
    },

    plan: {
      type: String,
      enum: ["free", "starter", "pro", "enterprise"],
      default: "free",
    },

    status: {
      type: String,
      enum: ["active", "suspended", "cancelled"],
      default: "active",
    },

    branding: {
      logo: String,
      primaryColor: {
        type: String,
        default: "#2563eb",
      },
    },

    usage: {
      ticketsThisMonth: {
        type: Number,
        default: 0,
      },

      messagesThisMonth: {
        type: Number,
        default: 0,
      },

      storageUsedMB: {
        type: Number,
        default: 0,
      },
    },

    resetDate: Date,
  },
  { timestamps: true }
);

const workspaceModel = mongoose.model("Workspace", workspaceSchema);

export default workspaceModel;
