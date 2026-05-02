import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'company',
      required: [true, 'Company is require']
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: [true, 'User is require']
    },
    isOpen: {
      type: Boolean,
      default: true
    },
    messageCount: {
      type: Number,
      default: 0
    },
    latestMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'message'
    },
    lastActivity: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

const chatModel = mongoose.model('chat', chatSchema);

export default chatModel;
