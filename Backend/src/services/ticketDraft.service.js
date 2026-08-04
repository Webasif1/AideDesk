import { callOpenRouter } from './openrouter.service.js';
import {
  derivePriority,
  sentimentLabelFromScore
} from './triage.service.js';
import slaConfigModel from '../models/slaConfig.model.js';
import { config } from '../config/config.js';

const DRAFT_MODEL = config.MODELS.simple;

const DEFAULT_SLA = {
  firstResponseHours: { critical: 1, high: 4, medium: 8, low: 24 },
  resolutionHours: { critical: 4, high: 24, medium: 72, low: 168 }
};

export const computeSLADeadlines = async (workspaceId, priority) => {
  const now = new Date();
  const slaConfig = await slaConfigModel.findOne({ workspaceId }).lean();
  const cfg = slaConfig || DEFAULT_SLA;

  const frHours =
    cfg.firstResponseHours?.[priority] ??
    DEFAULT_SLA.firstResponseHours[priority];
  const resHours =
    cfg.resolutionHours?.[priority] ?? DEFAULT_SLA.resolutionHours[priority];

  return {
    firstResponse: new Date(now.getTime() + frHours * 3600 * 1000),
    resolution: new Date(now.getTime() + resHours * 3600 * 1000)
  };
};

export const draftEnrichedTicket = async ({
  conversationHistory,
  latestMessage,
  triage,
  attachments = [],
  workspaceId,
  escalationReason
}) => {
  const { sentimentScore, urgency, intent } = triage;
  const suggestedPriority = derivePriority(urgency, sentimentScore);

  const transcript = conversationHistory
    .slice(-8)
    .map(
      m =>
        `${m.role}: ${
          typeof m.content === 'string' ? m.content : '[attachment]'
        }`
    )
    .join('\n');

  let aiFields = {
    title: 'Support Request',
    description: latestMessage || 'No description provided.',
    aiSummary: '',
    suggestedResolution: '',
    category: 'general',
    confidence: 0.5
  };

  try {
    const raw = await callOpenRouter({
      model: DRAFT_MODEL,
      maxTokens: 400,
      jsonMode: true,
      messages: [
        {
          role: 'user',
          content: `Generate a support ticket from this conversation. Respond ONLY with JSON:
{
  "title": "max 10 words, specific problem statement",
  "description": "2-3 sentences explaining what the customer is experiencing",
  "aiSummary": "1-2 sentences: what happened and why it escalated to human support",
  "suggestedResolution": "1-2 sentences: what you would try first to resolve this",
  "category": "billing | technical | account | feature | bug | general",
  "confidence": 0.0-1.0
}

CONVERSATION:
${transcript}

LATEST MESSAGE: ${latestMessage}
DETECTED INTENT: ${intent}
ESCALATION REASON: ${escalationReason || 'unknown'}`
        }
      ]
    });

    const parsed = JSON.parse(raw);
    aiFields = {
      title: parsed.title || aiFields.title,
      description: parsed.description || aiFields.description,
      aiSummary: parsed.aiSummary || '',
      suggestedResolution: parsed.suggestedResolution || '',
      category: parsed.category || 'general',
      confidence: Math.min(
        Math.max(Number(parsed.confidence) || 0.5, 0),
        1
      )
    };
  } catch (err) {
    console.error('[ticketDraft] AI generation failed:', err.message);
  }

  // Map AI category -> ticket model enum (billing/technical/account/general)
  const categoryMap = {
    billing: 'billing',
    technical: 'technical',
    account: 'account',
    feature: 'general',
    bug: 'technical',
    general: 'general'
  };
  const mappedCategory = categoryMap[aiFields.category] || 'general';

  // Map critical -> 'urgent' for ticket model enum (priority enum: low|medium|high|urgent)
  const ticketPriority =
    suggestedPriority === 'critical' ? 'urgent' : suggestedPriority;

  const slaDeadlines = await computeSLADeadlines(workspaceId, suggestedPriority);

  return {
    title: aiFields.title,
    description: aiFields.description,
    priority: ticketPriority,
    category: mappedCategory,

    aiAnalysis: {
      intentLabel: intent,
      sentimentScore,
      sentimentLabel: sentimentLabelFromScore(sentimentScore),
      urgencyScore: urgency,
      suggestedPriority,
      suggestedCategory: aiFields.category,
      aiSummary: aiFields.aiSummary,
      suggestedResolution: aiFields.suggestedResolution,
      confidence: aiFields.confidence,
      analysisModel: DRAFT_MODEL
    },

    sla: {
      priority: suggestedPriority,
      firstResponseDeadline: slaDeadlines.firstResponse,
      resolutionDeadline: slaDeadlines.resolution
    },

    attachments,
    escalationReason
  };
};
