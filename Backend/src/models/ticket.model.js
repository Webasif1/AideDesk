import { Schema, model } from 'mongoose';

const TicketSchema = new Schema(
  {
    // ─── Multi-tenant isolation (PDF: companyId on every doc) ───
    companyId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true
    },

    // ─── Customer who raised the ticket ───
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'Customer',
      required: true
    },
    customerEmail: { type: String, required: true },

    // ─── Agent assignment ───
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'Agent',
      default: null
    },

    // ─── Core content ───
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },

    // ─── Channel source (PDF: email/chat/social/phone/form) ───
    channel: {
      type: String,
      enum: ['email', 'chat', 'social', 'phone', 'form'],
      required: true
    },

    // ─── Lifecycle status (PDF: open→in_progress→resolved→closed) ───
    status: {
      type: String,
      enum: ['open', 'in_progress', 'pending', 'resolved', 'closed'],
      default: 'open'
    },

    // ─── Priority (used by SLA engine) ───
    priority: {
      type: String,
      enum: ['urgent', 'high', 'normal', 'low'],
      default: 'normal'
    },

    // ─── AI intent classifier (PDF: 5 intent buckets) ───
    intent: {
      label: {
        type: String,
        enum: [
          'simple_faq',
          'billing_issue',
          'technical_problem',
          'escalate_human',
          'feedback'
        ]
      },
      confidence: { type: Number, min: 0, max: 1 }
    },

    // ─── AI sentiment score (PDF: 1–5 frustration scale) ───
    sentimentScore: {
      type: Number,
      min: 1,
      max: 5,
      default: 1
    },

    // ─── Tags for filtering (PDF: ticket tagging) ───
    tags: [{ type: String }],

    // ─── SLA deadline (set from OrgSettings.sla on create) ───
    sla: {
      dueAt: { type: Date },
      breached: { type: Boolean, default: false },
      firstResponseAt: { type: Date }
    },

    // ─── AI escalation briefing (PDF: 3-sentence agent brief) ───
    escalation: {
      isEscalated: { type: Boolean, default: false },
      escalatedAt: { type: Date },
      escalatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
      aiBriefing: { type: String }
    },

    // ─── AI suggested reply metadata ───
    aiSuggestion: {
      replies: [{ tone: String, reply: String }],
      confidence: { type: String, enum: ['high', 'medium', 'low'] },
      usedReply: { type: String },
      acceptedAt: { type: Date }
    },

    // ─── Timestamps for analytics (PDF: response time, resolution time) ───
    resolvedAt: { type: Date },
    closedAt: { type: Date },
    reopenedAt: { type: Date },

    // ─── CSAT survey (PDF: post-resolution feedback) ───
    csat: {
      score: { type: Number, min: 1, max: 5 },
      comment: { type: String },
      submittedAt: { type: Date }
    },

    // ─── Metadata ───
    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: true }
);

// ─── Critical indexes (PDF: tickets(companyId, status, createdAt)) ───
TicketSchema.index({ companyId: 1, status: 1, createdAt: -1 });
TicketSchema.index({ companyId: 1, sentimentScore: -1, priority: 1 });
TicketSchema.index({ assignedTo: 1, status: 1 });
TicketSchema.index({ customerId: 1 });
TicketSchema.index({ 'sla.dueAt': 1, 'sla.breached': 1 });

// ─── Auto-set SLA deadline on create (from OrgSettings) ───
TicketSchema.pre('save', async function () {
  if (this.isNew) {
    const OrgSettings = require('./orgSettings.model');
    const settings = await OrgSettings.findOne({ orgId: this.companyId });
    if (settings) {
      const hours = settings.sla[this.priority] || 8;
      this.sla.dueAt = new Date(Date.now() + hours * 3600000);
    }
  }
});

module.exports = model('Ticket', TicketSchema);
