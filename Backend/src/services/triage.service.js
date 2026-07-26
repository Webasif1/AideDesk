import { callOpenRouter } from './openrouter.service.js';
import { config } from '../config/config.js';

const GROK_MODEL = config.MODELS.triage;

const VALID_INTENTS = [
  'billing_issue',
  'technical_problem',
  'account_access',
  'feature_request',
  'bug_report',
  'general_inquiry',
  'complaint',
  'data_privacy',
  'onboarding_help',
  'other'
];

const VALID_SENTIMENTS = [
  'very_negative',
  'negative',
  'neutral',
  'positive',
  'very_positive'
];

const validateEnum = (value, allowed, fallback) =>
  allowed.includes(value) ? value : fallback;

const clamp = (n, min, max) => {
  const num = Number(n);
  if (isNaN(num)) return null;
  return Math.min(Math.max(num, min), max);
};

// Sentiment label from numeric score (1=very_negative .. 5=very_positive)
export const sentimentLabelFromScore = score => {
  if (score <= 1) return 'very_negative';
  if (score <= 2) return 'negative';
  if (score <= 3) return 'neutral';
  if (score <= 4) return 'positive';
  return 'very_positive';
};

// Priority derived from urgency + sentiment
export const derivePriority = (urgency, sentimentScore) => {
  if (urgency >= 5 || sentimentScore === 1) return 'critical';
  if (urgency >= 4 || sentimentScore === 2) return 'high';
  if (urgency >= 3) return 'medium';
  return 'low';
};

export const triageMessage = async ({
  message,
  conversationHistory = [],
  attachmentTypes = []
}) => {
  const hasImage = attachmentTypes.includes('image');
  const hasPDF = attachmentTypes.includes('pdf');

  const attachmentNote = [
    hasImage && 'User attached a screenshot/image.',
    hasPDF && 'User attached a PDF document.'
  ]
    .filter(Boolean)
    .join(' ');

  const systemPrompt = `You are a customer support triage system for a SaaS platform.
Analyze the user message and classify it. Respond ONLY with a valid JSON object.

JSON format (no extra text, no markdown):
{
  "complexity": "simple" | "medium" | "complex" | "escalate",
  "intent": "billing_issue" | "technical_problem" | "account_access" | "feature_request" | "bug_report" | "general_inquiry" | "complaint" | "data_privacy" | "onboarding_help" | "other",
  "sentiment": "very_negative" | "negative" | "neutral" | "positive" | "very_positive",
  "sentimentScore": 1-5,
  "urgency": 1-5,
  "reasoning": "one short sentence explaining your classification"
}

Complexity guide:
- simple: greetings, basic FAQs, account info, how-to questions
- medium: technical issues needing some reasoning, configuration help
- complex: multi-step debugging, deep technical problems, data issues
- escalate: angry/threatening user, legal/billing disputes, AI clearly cannot help, repeated failures`;

  const recentHistory = conversationHistory.slice(-4).map(m => ({
    role: m.role,
    content: typeof m.content === 'string' ? m.content : '[file attachment]'
  }));

  const userContent = attachmentNote
    ? `${message}\n\n[Context: ${attachmentNote}]`
    : message;

  try {
    const raw = await callOpenRouter({
      model: GROK_MODEL,
      maxTokens: 200,
      jsonMode: true,
      messages: [
        { role: 'system', content: systemPrompt },
        ...recentHistory,
        { role: 'user', content: userContent }
      ]
    });

    const result = JSON.parse(raw);

    return {
      complexity: validateEnum(
        result.complexity,
        ['simple', 'medium', 'complex', 'escalate'],
        'medium'
      ),
      intent: validateEnum(result.intent, VALID_INTENTS, 'other'),
      sentiment: validateEnum(result.sentiment, VALID_SENTIMENTS, 'neutral'),
      sentimentScore: clamp(result.sentimentScore, 1, 5) || 3,
      urgency: clamp(result.urgency, 1, 5) || 3,
      reasoning: result.reasoning || ''
    };
  } catch (err) {
    console.error('[triage] failed, defaulting to medium:', err.message);
    return {
      complexity: 'medium',
      intent: 'other',
      sentiment: 'neutral',
      sentimentScore: 3,
      urgency: 3,
      reasoning: 'triage failed, defaulting to medium'
    };
  }
};
