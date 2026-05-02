import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema(
  {
    ticketNumber: {
      type: String,
      unique: [true, 'Ticket number should be unique']
    },

    title: {
      type: String,
      required: [true, 'Title is require'],
      trim: [true, 'Title cannot have leading or trailing spaces'],
      minlength: [3, 'Title must be at least 3 characters long'],
      maxlength: [150, 'Title cannot be more than 150 characters long']
    },

    description: {
      type: String,
      required: [true, 'Description is require'],
      trim: [true, 'Description cannot have leading or trailing spaces'],
      maxlength: [300, 'Description cannot be more than 300 characters long']
    },

    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'company',
      required: [true, 'Company is require']
    },

    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: [true, 'Customer is require']
    },

    assignedAgent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'agent',
      default: null
    },

    category: {
      type: String,
      enum: ['billing', 'technical', 'account', 'general'],
      default: 'general'
    },

    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    },

    status: {
      type: String,
      enum: ['open', 'pending', 'in_progress', 'resolved', 'closed'],
      default: 'open'
    },

    // source: {
    //   type: String,
    //   enum: ['dashboard', 'chat', 'email', 'website'],
    //   default: 'dashboard'
    // },

    tags: {
      type: [String],
      default: []
    },

    firstResponseAt: {
      type: Date,
      default: null
    },

    resolvedAt: {
      type: Date,
      default: null
    },

    closedAt: {
      type: Date,
      default: null
    },

    lastMessageAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Auto-generate ticket number
ticketSchema.pre('save', function (next) {
  if (!this.ticketNumber) {
    this.ticketNumber = 'TKT-' + Date.now().toString().slice(-6);
  }
  next();
});

const ticketModel = mongoose.model('ticket', ticketSchema);
export default ticketModel;
