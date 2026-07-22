import { callOpenRouter } from './openrouter.service.js';
import { triageMessage } from './triage.service.js';
import { getRelevantKnowledge } from './knowledge.service.js';

// Model chosen by triage complexity — cheaper/faster for simple, stronger for complex.
// Adjust to whichever OpenRouter models the account has access to.
const MODEL_MAP = {
  simple: 'x-ai/grok-3-mini-beta',
  medium: 'deepseek/deepseek-chat-v3-0324:free',
  complex: 'deepseek/deepseek-r1:free'
};

// Phrases that signal AI is not confident enough to answer
const LOW_CONFIDENCE_SIGNALS = [
  "i'm not sure",
  'i cannot help',
  "i don't know",
  'please contact support',
  'i am unable to',
  'i need to escalate',
  'beyond my ability'
];

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
  // Step 1: triage
  const triage = await triageMessage({
    message,
    conversationHistory,
    attachmentTypes
  });

  const { complexity, intent, sentiment, sentimentScore, urgency } = triage;

  if (complexity === 'escalate') {
    return {
      escalate: true,
      complexity,
      intent,
      sentiment,
      sentimentScore,
      urgency,
      aiResponse: null,
      model: null,
      triage,
      escalationReason: 'triage_escalate'
    };
  }

  // Step 2: knowledge retrieval
  const knowledge = await getRelevantKnowledge({
    query: message,
    workspaceId,
    topK: 3
  });

  // Step 3: prompt
  const systemPrompt = buildSystemPrompt({
    knowledge,
    pdfSummary,
    imageSummary,
    workspaceContext
  });
  const model = MODEL_MAP[complexity];

  // Step 4: model call
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

  // Step 5: confidence check
  const isLowConfidence =
    !aiResponse ||
    aiResponse.trim().length < 20 ||
    LOW_CONFIDENCE_SIGNALS.some(s => aiResponse.toLowerCase().includes(s));

  const emotionalEscalation = urgency >= 4 && sentimentScore <= 2;

  return {
    escalate: failed || isLowConfidence || emotionalEscalation,
    aiResponse: isLowConfidence ? null : aiResponse,
    complexity,
    intent,
    sentiment,
    sentimentScore,
    urgency,
    model,
    triage,
    escalationReason: failed
      ? 'model_failure'
      : isLowConfidence
        ? 'low_confidence'
        : emotionalEscalation
          ? 'user_frustration'
          : null
  };
};
