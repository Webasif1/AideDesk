import { callOpenRouter } from './openrouter.service.js';
import { config } from '../config/config.js';

const BRIEFING_MODEL = config.MODELS.briefing;

// Markdown briefing pushed to agent the moment they're assigned.
export const generateAgentBriefing = async ({
  conversationHistory,
  ticket,
  copilotAttempt
}) => {
  const transcript = conversationHistory
    .slice(-8)
    .map(
      m =>
        `**${m.role}:** ${
          typeof m.content === 'string' ? m.content : '[file attachment]'
        }`
    )
    .join('\n');

  const aiAttemptSection = copilotAttempt
    ? `AI ATTEMPTED RESPONSE: ${copilotAttempt}`
    : 'AI could not generate a response.';

  try {
    const raw = await callOpenRouter({
      model: BRIEFING_MODEL,
      maxTokens: 500,
      messages: [
        {
          role: 'user',
          content: `You are briefing a human support agent who is taking over a customer chat.
          Write a concise structured briefing in this exact format:
          **SITUATION:** [1-2 sentences: what the customer's problem is]
          **WHAT WAS TRIED:** [what the AI did or tried — or "AI escalated immediately"]
          **CUSTOMER MOOD:** [based on sentiment: frustrated / neutral / calm]
          **RECOMMENDED FIRST STEP:** [single most important action the agent should take]
          **WATCH OUT FOR:** [one specific thing that could make this worse]
          ---
          TICKET: ${ticket.title}
          PRIORITY: ${ticket.sla?.priority || ticket.priority || 'medium'}
          INTENT: ${ticket.aiAnalysis?.intentLabel || 'unknown'}
          SENTIMENT SCORE: ${ticket.aiAnalysis?.sentimentScore || 3}/5
          ESCALATION REASON: ${ticket.escalationReason || 'unknown'}
          ${aiAttemptSection}
          AI SUGGESTED RESOLUTION: ${ticket.aiAnalysis?.suggestedResolution || 'none'}
          CONVERSATION:
          ${transcript}`
        }
      ]
    });

    return raw;
  } catch (err) {
    console.error('[agentBriefing] failed:', err.message);
    return `**SITUATION:** ${ticket.title}\n**PRIORITY:** ${
      ticket.sla?.priority || 'medium'
    }\n**ESCALATION REASON:** ${
      ticket.escalationReason || 'unknown'
    }\n\nReview chat history for full context.`;
  }
};
