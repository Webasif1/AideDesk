import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "company",
      required: [true, "Company is required"]
    },

    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "workspace",
      required: [true, "Workspace is required"]
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: [true, "User is required"]
    },

    // Assigned when an agent joins or when escalated
    assignedAgent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "agent",
      default: null
    },

    // Populated when this chat is escalated to a formal ticket
    ticket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ticket",
      default: null
    },

    status: {
      type: String,
      enum: ["active", "waiting", "closed"],
      default: "active"
    },

    messageCount: {
      type: Number,
      default: 0
    },

    // Consecutive turns the copilot could not resolve — escalates at the threshold.
    copilotStrikes: {
      type: Number,
      default: 0
    },

    latestMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "message",
      default: null
    },

    lastActivity: {
      type: Date,
      default: Date.now
    },

    // Staff members who have opened this conversation at least once. The chat
    // sidebar's "Unread" filter is "my id is not in here".
    openedBy: [
      {
        _id: false,
        user: { type: mongoose.Schema.Types.ObjectId, required: true },
        role: { type: String, enum: ["admin", "agent"], required: true },
        lastOpenedAt: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

const chatModel = mongoose.model("chat", chatSchema);

export default chatModel;
