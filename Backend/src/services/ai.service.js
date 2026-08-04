// Lightweight classification + drafting helpers used outside the copilot funnel
// (staff-created tickets, agent co-pilot, escalation briefings).
//
// These used to call Anthropic directly, which meant they hard-failed whenever
// ANTHROPIC_API_KEY was absent. They now go through aiProvider.service.js, so the
// same OpenRouter funnel that powers the copilot serves them too — classification
// on the cheap `simple` tier, drafting on `medium`.
import { chatComplete } from './aiProvider.service.js';
import { config } from '../config/config.js';

const CLASSIFY_MODEL = config.MODELS.simple;
const DRAFT_MODEL = config.MODELS.medium;

const INTENT_SYSTEM = `You are an intent classifier for a customer support system.
Classify the customer message into exactly ONE of these labels:
- simple_faq: general questions, how-to, informational
- billing_issue: payment, invoice, subscription, pricing concerns
- technical_problem: bugs, errors, product not working, integration issues
- escalate_human: angry customer, urgent, wants human, unresolved issue
- feedback: suggestions, feature requests, compliments, complaints

Respond with ONLY the label, nothing else.`;

const SENTIMENT_SYSTEM = `You are a sentiment analyzer for customer support messages.
Score the customer's emotional state on a scale of 1-5:
1 = very frustrated/angry
2 = somewhat negative
3 = neutral
4 = positive
5 = very satisfied/happy

Respond with ONLY the number (1-5), nothing else.`;

// ============================================
// classifyIntent — returns intentLabel enum string
// ============================================
export const classifyIntent = async (text) => {
  const raw = await chatComplete({
    model: CLASSIFY_MODEL,
    maxTokens: 20,
    system: INTENT_SYSTEM,
    messages: [{ role: 'user', content: text }]
  });

  const label = raw.trim().toLowerCase();
  const valid = ['simple_faq', 'billing_issue', 'technical_problem', 'escalate_human', 'feedback'];
  return valid.includes(label) ? label : 'simple_faq';
};

// ============================================
// scoreSentiment — returns 1-5 integer
// ============================================
export const scoreSentiment = async (text) => {
  const raw = await chatComplete({
    model: CLASSIFY_MODEL,
    maxTokens: 5,
    system: SENTIMENT_SYSTEM,
    messages: [{ role: 'user', content: text }]
  });

  // Small models like to answer "4/5" or "Score: 4" — take the first digit.
  const score = parseInt(raw.replace(/[^\d]/g, '').slice(0, 1), 10);
  return isNaN(score) || score < 1 || score > 5 ? 3 : score;
};

// ============================================
// generateEscalationBriefing — 3-sentence escalation summary
// thread: array of { role: 'user'|'agent', content: string }
// ============================================
export const generateEscalationBriefing = async ({ thread, sentiment, ticketTitle }) => {
  const threadText = (thread || [])
    .map(m => `${m.role === 'user' ? 'Customer' : 'Agent'}: ${m.content}`)
    .join('\n');

  const raw = await chatComplete({
    model: DRAFT_MODEL,
    maxTokens: 300,
    system: `You are a support escalation assistant. Write exactly 3 sentences summarizing this support conversation for a senior agent taking over the case:
Sentence 1: What the customer's issue is
Sentence 2: What was tried and why it failed or what makes this urgent
Sentence 3: Recommended immediate next step with urgency level

Be concise and professional. Current sentiment score: ${sentiment}/5 (1=very frustrated, 5=happy).`,
    messages: [
      {
        role: 'user',
        content: `Ticket: "${ticketTitle}"\n\nConversation:\n${threadText || 'No chat history available.'}`
      }
    ]
  });

  return raw.trim();
};

// ============================================
// generateReplySuggestions — 3 reply options for agent co-pilot
// messages: array of { role: 'user'|'agent', content: string }
// Returns: [{ tone, reply, confidence }]
// ============================================
export const generateReplySuggestions = async ({ messages, companyName }) => {
  const threadText = (messages || [])
    .slice(-5)
    .map(m => `${m.role === 'user' ? 'Customer' : 'Agent'}: ${m.content}`)
    .join('\n');

  const raw = await chatComplete({
    model: DRAFT_MODEL,
    maxTokens: 500,
    jsonMode: true,
    system: `You are an AI co-pilot for ${companyName || 'our company'} support agents.
Generate exactly 3 reply suggestions for the agent responding to the customer's latest message.
Each suggestion: 1-2 sentences, professional, directly addresses the customer's message.
Format response as JSON array only:
[{"tone": "empathetic|professional|direct", "reply": "...", "confidence": "high|medium|low"}]
No other text, just the JSON array.`,
    messages: [{ role: 'user', content: threadText }]
  });

  try {
    // Tolerate models that wrap the array in ```json fences or an object envelope.
    const cleaned = raw.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
    const parsed = JSON.parse(cleaned);
    const list = Array.isArray(parsed) ? parsed : parsed.suggestions;
    if (Array.isArray(list) && list.length > 0) return list;
    throw new Error('unexpected shape');
  } catch {
    return [
      {
        tone: 'professional',
        reply: 'Thank you for reaching out. I will look into this right away and get back to you shortly.',
        confidence: 'medium'
      }
    ];
  }
};
