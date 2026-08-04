import knowledgeChunkModel from '../models/knowledgeChunk.model.js';
import { callOpenRouter } from './openrouter.service.js';
import { config } from '../config/config.js';

// Summarising a resolved thread is a cheap job — run it on the funnel's simple tier.
const SUMMARY_MODEL = config.MODELS.simple;

// Keyword-overlap retrieval. Upgrade to vector embeddings when budget allows.
export const getRelevantKnowledge = async ({
  query,
  workspaceId,
  topK = 3
}) => {
  const words = (query || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 3);

  if (words.length === 0) return [];

  return knowledgeChunkModel
    .find({ workspaceId, keywords: { $in: words } })
    .sort({ createdAt: -1 })
    .limit(topK)
    .lean();
};

// Fire-and-forget: store learning chunk after AI or agent resolves a chat.
export const storeConversationLearning = async ({
  chatId,
  ticketId = null,
  messages,
  workspaceId,
  companyId,
  source,
  agentId = null
}) => {
  if (!messages || messages.length < 2) return;

  const transcript = messages
    .slice(-12)
    .map(
      m =>
        `${m.senderType || m.role}: ${
          typeof m.content === 'string' ? m.content : '[attachment]'
        }`
    )
    .join('\n');

  try {
    const raw = await callOpenRouter({
      model: SUMMARY_MODEL,
      maxTokens: 250,
      jsonMode: true,
      messages: [
        {
          role: 'user',
          content: `Analyze this resolved support conversation and extract key learnings.
Respond ONLY with JSON (no markdown):
{
  "problemSummary": "one sentence describing the problem",
  "resolution": "one sentence describing what fixed it",
  "keywords": ["array", "of", "5-8", "relevant", "keywords"],
  "category": "billing | technical | account | feature | other",
  "intentLabel": "billing_issue | technical_problem | account_access | feature_request | bug_report | general_inquiry | complaint | data_privacy | onboarding_help | other"
}

CONVERSATION:
${transcript}`
        }
      ]
    });

    const parsed = JSON.parse(raw);

    await knowledgeChunkModel.create({
      companyId,
      workspaceId,
      chatId,
      ticketId,
      agentId,
      source,
      problemSummary: parsed.problemSummary || 'Unknown problem',
      resolution: parsed.resolution || 'Unknown resolution',
      keywords: Array.isArray(parsed.keywords)
        ? parsed.keywords.slice(0, 8)
        : [],
      category: parsed.category || 'other',
      intentLabel: parsed.intentLabel || 'other'
    });
  } catch (err) {
    console.error('[knowledge] storeConversationLearning failed:', err.message);
  }
};
