import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'chat',
      required: [true, 'Chat is require']
    },
    content: {
      type: String,
      required: [true, 'Content is require']
    },
    role: {
      type: String,
      enum: ['user', 'agent', 'ai'],
      required: [true, 'Role is require']
    },
    agent: {
      type: this.role === 'agent' ? mongoose.Schema.Types.ObjectId : 'ai',
      ref: this.role === 'agent' ? 'agent' : 'ai'
    }
  },
  { timestamps: true }
);

const messageModel = mongoose.model('message', messageSchema);

export default messageModel;
