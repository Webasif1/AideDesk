import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'chat',
      required: [true, 'Chat is required']
    },

    content: {
      type: String,
      required: [true, 'Content is required'],
      trim: true,
      maxlength: [5000, 'Message cannot exceed 5000 characters']
    },

    // 'user' = customer, 'agent' = human agent, 'ai' = AI-generated,
    // 'system' = an event notice (agent handover), rendered centred rather than
    // as a bubble and never attributed to a sender.
    role: {
      type: String,
      enum: ['user', 'agent', 'ai', 'system'],
      required: [true, 'Role is required']
    },

    // Populated only when role is 'user' or 'agent'; null for AI messages
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },

    // Which collection `sender` points at. Admins post with role 'agent' (they are
    // staff to the customer) but live in their own collection.
    senderModel: {
      type: String,
      enum: ['user', 'agent', 'admin'],
      default: null
    },

    isRead: {
      type: Boolean,
      default: false
    },

    attachments: [
      {
        url: { type: String, required: true },
        filename: { type: String, required: true },
        mimetype: { type: String, required: true }
      }
    ],

    // AI engine output: frustration score 1 (calm) – 5 (very frustrated)
    sentimentScore: {
      type: Number,
      min: 1,
      max: 5,
      default: null
    },

    // AI intent classification result
    intentLabel: {
      type: String,
      enum: ['simple_faq', 'billing_issue', 'technical_problem', 'escalate_human', 'feedback'],
      default: null
    },

    // 3 co-pilot reply suggestions surfaced in the agent sidebar
    aiSuggestions: [
      {
        tone: { type: String },
        reply: { type: String },
        confidence: { type: String, enum: ['high', 'medium', 'low'] }
      }
    ]
  },
  { timestamps: true }
);

const messageModel = mongoose.model('message', messageSchema);

export default messageModel;
