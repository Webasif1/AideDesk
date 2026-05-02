import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();
const MODEL = 'claude-opus-4-7';

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
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 20,
    system: [
      {
        type: 'text',
        text: INTENT_SYSTEM,
        cache_control: { type: 'ephemeral' }
      }
    ],
    messages: [{ role: 'user', content: text }]
  });

  const label = response.content[0].text.trim().toLowerCase();
  const valid = ['simple_faq', 'billing_issue', 'technical_problem', 'escalate_human', 'feedback'];
  return valid.includes(label) ? label : 'simple_faq';
};

// ============================================
// scoreSentiment — returns 1-5 integer
// ============================================
export const scoreSentiment = async (text) => {
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 5,
    system: [
      {
        type: 'text',
        text: SENTIMENT_SYSTEM,
        cache_control: { type: 'ephemeral' }
      }
    ],
    messages: [{ role: 'user', content: text }]
  });

  const score = parseInt(response.content[0].text.trim());
  return isNaN(score) || score < 1 || score > 5 ? 3 : score;
};

// ============================================
// generateEscalationBriefing — 3-sentence escalation summary
// thread: array of { role: 'user'|'agent', content: string }
// ============================================
export const generateEscalationBriefing = async ({ thread, sentiment, ticketTitle }) => {
  const threadText = thread
    .map(m => `${m.role === 'user' ? 'Customer' : 'Agent'}: ${m.content}`)
    .join('\n');

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 300,
    system: [
      {
        type: 'text',
        text: `You are a support escalation assistant. Write exactly 3 sentences summarizing this support conversation for a senior agent taking over the case:
Sentence 1: What the customer's issue is
Sentence 2: What was tried and why it failed or what makes this urgent
Sentence 3: Recommended immediate next step with urgency level

Be concise and professional. Current sentiment score: ${sentiment}/5 (1=very frustrated, 5=happy).`,
        cache_control: { type: 'ephemeral' }
      }
    ],
    messages: [
      {
        role: 'user',
        content: `Ticket: "${ticketTitle}"\n\nConversation:\n${threadText || 'No chat history available.'}`
      }
    ]
  });

  return response.content[0].text.trim();
};

// ============================================
// generateReplySuggestions — 3 reply options for agent co-pilot
// messages: array of { role: 'user'|'agent', content: string }
// Returns: [{ tone, reply, confidence }]
// ============================================
export const generateReplySuggestions = async ({ messages, companyName }) => {
  const lastFive = messages.slice(-5);
  const threadText = lastFive
    .map(m => `${m.role === 'user' ? 'Customer' : 'Agent'}: ${m.content}`)
    .join('\n');

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 500,
    system: [
      {
        type: 'text',
        text: `You are an AI co-pilot for ${companyName || 'our company'} support agents.
Generate exactly 3 reply suggestions for the agent responding to the customer's latest message.
Each suggestion: 1-2 sentences, professional, directly addresses the customer's message.
Format response as JSON array only:
[{"tone": "empathetic|professional|direct", "reply": "...", "confidence": "high|medium|low"}]
No other text, just the JSON array.`,
        cache_control: { type: 'ephemeral' }
      }
    ],
    messages: [{ role: 'user', content: threadText }]
  });

  try {
    return JSON.parse(response.content[0].text.trim());
  } catch {
    return [
      { tone: 'professional', reply: 'Thank you for reaching out. I will look into this right away and get back to you shortly.', confidence: 'medium' }
    ];
  }
};
