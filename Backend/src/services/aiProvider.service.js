import { config } from "../config/config.js";

// ============================================
// Single egress point for every LLM call in the app.
//
// Which provider runs is decided by AI_PROVIDER, or — when that is unset — by
// whichever key is present in the environment. Callers never branch on provider;
// they call chatComplete() and get back a plain string.
//
// isAiConfigured() lets callers degrade gracefully (hand off to a human) instead
// of throwing when no key is set, which is the state a fresh clone starts in.
// ============================================

const PROVIDERS = ["openrouter", "anthropic", "gemini"];

const keyFor = (provider) =>
  ({
    openrouter: config.OPENROUTER_API_KEY,
    anthropic: config.ANTHROPIC_API_KEY,
    gemini: config.GEMINI_API_KEY,
  })[provider] || null;

// Explicit AI_PROVIDER wins (and is validated); otherwise first provider with a key.
export const activeProvider = () => {
  if (config.AI_PROVIDER) {
    const wanted = config.AI_PROVIDER.toLowerCase();
    if (!PROVIDERS.includes(wanted)) {
      throw new Error(
        `AI_PROVIDER must be one of: ${PROVIDERS.join(", ")} (got "${config.AI_PROVIDER}")`
      );
    }
    return keyFor(wanted) ? wanted : null;
  }
  return PROVIDERS.find((p) => keyFor(p)) || null;
};

export const isAiConfigured = () => activeProvider() !== null;

// Default model per provider. Callers may override via the `model` option.
const DEFAULT_MODEL = {
  openrouter: "anthropic/claude-sonnet-4.5",
  anthropic: "claude-opus-5",
  gemini: "gemini-2.5-flash",
};

// Retry once on 429/5xx — these providers rate-limit aggressively on free tiers.
const RETRYABLE = new Set([429, 500, 502, 503, 504]);

const postJson = async (url, headers, body) => {
  for (let attempt = 0; attempt < 2; attempt++) {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify(body),
    });

    if (res.ok) return res.json();

    if (RETRYABLE.has(res.status) && attempt === 0) {
      await new Promise((r) => setTimeout(r, 2000));
      continue;
    }

    const detail = await res.text().catch(() => "");
    throw new Error(`AI request failed (${res.status}): ${detail.slice(0, 300)}`);
  }
};

// ── Per-provider adapters ───────────────────────────────────────────────────
// Each takes the normalised shape and returns the assistant's text.

const callOpenRouter = async ({ system, messages, maxTokens, jsonMode, model }) => {
  const body = {
    model: model || DEFAULT_MODEL.openrouter,
    max_tokens: maxTokens,
    messages: system ? [{ role: "system", content: system }, ...messages] : messages,
  };
  if (jsonMode) body.response_format = { type: "json_object" };

  const json = await postJson(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      Authorization: `Bearer ${config.OPENROUTER_API_KEY}`,
      "HTTP-Referer": config.FRONTEND_URL,
      "X-Title": "AideDesk Copilot",
    },
    body
  );
  return json.choices?.[0]?.message?.content?.trim() || "";
};

const callAnthropic = async ({ system, messages, maxTokens, model }) => {
  const body = {
    model: model || DEFAULT_MODEL.anthropic,
    max_tokens: maxTokens,
    messages,
  };
  // cache_control on the system block — system prompts here are stable and reused.
  if (system) {
    body.system = [
      { type: "text", text: system, cache_control: { type: "ephemeral" } },
    ];
  }

  const json = await postJson(
    "https://api.anthropic.com/v1/messages",
    {
      "x-api-key": config.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body
  );

  // Safety classifiers can decline with HTTP 200 — check before reading content.
  if (json.stop_reason === "refusal") {
    throw new Error("AI declined to answer this request");
  }
  return json.content?.find((b) => b.type === "text")?.text?.trim() || "";
};

const callGemini = async ({ system, messages, maxTokens, jsonMode, model }) => {
  const chosen = model || DEFAULT_MODEL.gemini;
  const body = {
    contents: messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    })),
    generationConfig: {
      maxOutputTokens: maxTokens,
      ...(jsonMode ? { responseMimeType: "application/json" } : {}),
    },
  };
  if (system) body.systemInstruction = { parts: [{ text: system }] };

  const json = await postJson(
    `https://generativelanguage.googleapis.com/v1beta/models/${chosen}:generateContent`,
    { "x-goog-api-key": config.GEMINI_API_KEY },
    body
  );
  return (
    json.candidates?.[0]?.content?.parts
      ?.map((p) => p.text || "")
      .join("")
      .trim() || ""
  );
};

const ADAPTERS = {
  openrouter: callOpenRouter,
  anthropic: callAnthropic,
  gemini: callGemini,
};

// ============================================
// chatComplete — provider-agnostic completion
// messages: [{ role: 'user' | 'assistant', content: string }]
// Returns the assistant text. Throws if no provider is configured.
// ============================================
export const chatComplete = async ({
  system = null,
  messages,
  maxTokens = 800,
  jsonMode = false,
  model = null,
}) => {
  const provider = await activeProvider();
  if (!provider) {
    throw new Error(
      "No AI provider configured. Set OPENROUTER_API_KEY, ANTHROPIC_API_KEY, or GEMINI_API_KEY."
    );
  }
  return ADAPTERS[provider]({ system, messages, maxTokens, jsonMode, model });
};

// Convenience wrapper for prompts that must return JSON. Tolerates models that
// wrap output in ```json fences despite being asked not to.
export const chatCompleteJson = async (options) => {
  const raw = await chatComplete({ ...options, jsonMode: true });
  const cleaned = raw.replace(/^\s*```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "");
  return JSON.parse(cleaned);
};
