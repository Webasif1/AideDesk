import mongoose from 'mongoose';

const agentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: [true, 'Email should be unique']
    },
    password: {
      type: String
    },
    role: {
      type: String,
      enum: ['agent'],
      default: 'agent'
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'company'
    }
  },
  { timestamps: true }
);

const agentModel = mongoose.model('agent', agentSchema);

export default agentModel;
