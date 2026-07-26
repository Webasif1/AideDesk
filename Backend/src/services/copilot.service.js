import { callOpenRouter } from './openrouter.service.js';
import { triageMessage } from './triage.service.js';
import { getRelevantKnowledge } from './knowledge.service.js';
import { config } from '../config/config.js';

// Model chosen by triage complexity — cheaper/faster for simple, stronger for complex.
// Env-driven (config.MODELS) so slots can be swapped without code changes.
// `escalate` complexity still gets the strongest model so the AI attempts a reply
// before any hand-off decision is made downstream.
const MODEL_MAP = {
  simple: config.MODELS.simple,
  medium: config.MODELS.medium,
  complex: config.MODELS.complex,
  escalate: config.MODELS.complex
};

// The AI is told to emit this exact phrase when it genuinely cannot resolve.
const ESCALATION_SENTINEL = 'i need to escalate';

// Customer explicitly asking for a human — immediate hand-off regardless of AI.
const WANTS_HUMAN_RE =
  /\b(human|real (person|agent|human)|live (agent|person|chat)|actual person|speak (to|with) (a|an|someone|somebody|a person)|talk (to|with) (a|an|someone|somebody|a person|an agent)|customer (service|support) (rep|representative|agent)|representative|agent please)\b/i;

const buildSystemPrompt = ({
  knowledge,
  pdfSummary,
  imageSummary,
  workspaceContext
}) => {
  const { companyName = 'the company', productInfo = '' } = workspaceContext;

  let prompt = `You are Copilot, an expert AI support assistant for ${companyName}.
Be concise, friendly, and solution-focused. Always provide actionable steps.
If you genuinely cannot resolve the issue, say exactly: "I need to escalate this to a human agent."
Do not guess. Do not hallucinate steps that may not work.`;

  if (productInfo) prompt += `\n\nPRODUCT CONTEXT:\n${productInfo}`;
  if (pdfSummary) prompt += `\n\nDOCUMENT THE USER SHARED:\n${pdfSummary}`;
  if (imageSummary)
    prompt += `\n\nSCREENSHOT/IMAGE THE USER SHARED:\n${imageSummary}`;

  if (knowledge.length > 0) {
    const kbText = knowledge
      .map(k => `- Problem: ${k.problemSummary}\n  Resolution: ${k.resolution}`)
      .join('\n');
    prompt += `\n\nRELEVANT PAST RESOLVED ISSUES (use these as reference):\n${kbText}`;
  }

  return prompt;
};

export const runCopilot = async ({
  message,
  conversationHistory = [],
  workspaceId,
  companyId,
  pdfSummary = null,
  imageSummary = null,
  attachmentTypes = [],
  workspaceContext = {}
}) => {
  // Step 1: triage (classification only — decides which model handles the reply)
  const triage = await triageMessage({
    message,
    conversationHistory,
    attachmentTypes
  });

  const { complexity, intent, sentiment, sentimentScore, urgency } = triage;

  // Step 2: knowledge retrieval (the "resources" the AI gets to try with)
  const knowledge = await getRelevantKnowledge({
    query: message,
    workspaceId,
    topK: 3
  });

  // Step 3: prompt + model selection by complexity (escalate → strongest model)
  const systemPrompt = buildSystemPrompt({
    knowledge,
    pdfSummary,
    imageSummary,
    workspaceContext
  });
  const model = MODEL_MAP[complexity] || MODEL_MAP.medium;

  // Step 4: model call — the AI always attempts, even for 'escalate' complexity.
  let aiResponse = null;
  let failed = false;
  try {
    aiResponse = await callOpenRouter({
      model,
      maxTokens: 900,
      messages: [
        { role: 'system', content: systemPrompt },
        ...conversationHistory.slice(-10),
        { role: 'user', content: message }
      ]
    });
  } catch (err) {
    console.error('[copilot] model call failed:', err.message);
    failed = true;
  }

  // Step 5: signals only — the flow layer decides whether to escalate, applying a
  // strike threshold so a human is brought in only after repeated genuine failure.
  const text = (aiResponse || '').trim();
  const gaveUp = text.toLowerCase().includes(ESCALATION_SENTINEL);
  const unresolved = failed || text.length < 20 || gaveUp;
  const wantsHuman = WANTS_HUMAN_RE.test(message || '');

  return {
    aiResponse: text || null,
    unresolved,
    wantsHuman,
    complexity,
    intent,
    sentiment,
    sentimentScore,
    urgency,
    model,
    triage,
    reasoning: triage?.reasoning || null,
    escalationReason: failed ? 'model_failure' : gaveUp ? 'ai_gave_up' : null
  };
};
