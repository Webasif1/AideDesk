import dotenv from "dotenv";
dotenv.config();

if (!process.env.PORT) {
  throw new Error("PORT is not defined in environment variable");
}

if (!process.env.MONGO_URI) {
  throw new Error("MONGO_URI is not defined in environment variable");
}

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variable");
}
// if (!process.env.GOOGLE_CLIENT_ID) {
//   throw new Error("GOOGLE_CLIENT_ID is not defined in environment variable");
// }
// if (!process.env.GOOGLE_CLIENT_SECRET) {
//   throw new Error(
//     "GOOGLE_CLIENT_SECRET is not defined in environment variable",
//   );
// }
// if (!process.env.GOOGLE_REFRESH_TOKEN) {
//   throw new Error(
//     "GOOGLE_REFRESH_TOKEN is not defined in environment variable",
//   );
// }
if (!process.env.GOOGLE_USER_EMAIL) {
  throw new Error("GOOGLE_USER_EMAIL is not defined in environment variable");
}
if (!process.env.NODE_ENV) {
  throw new Error("NODE_ENV is not defined in environment variable");
}

// ── Copilot model funnel (env-driven so models can be swapped without code) ──
// Every slot is an OpenRouter model ID ("vendor/model"). Flow per customer turn:
//   triage classifies complexity → the matching tier generates the reply.
// All defaults are free-tier slugs verified against openrouter.ai/api/v1/models.
const MODELS = {
  // Triage wants a Google model, but OpenRouter currently lists no free Gemini —
  // Gemma 4 is Google's free entry there and handles the JSON classification.
  // Set MODEL_TRIAGE to a Gemini slug the moment one becomes free.
  triage: process.env.MODEL_TRIAGE || "google/gemma-4-26b-a4b-it:free",
  simple: process.env.MODEL_SIMPLE || "openai/gpt-oss-20b:free",
  medium: process.env.MODEL_MEDIUM || "google/gemma-4-26b-a4b-it:free",
  complex: process.env.MODEL_COMPLEX || "openai/gpt-oss-20b:free",
};
// Triage may classify a turn as `escalate`; the AI still attempts a reply first,
// so that slot gets the strongest tier rather than skipping generation.
MODELS.escalate = MODELS.complex;
// Agent hand-off briefing model — defaults to the medium tier.
MODELS.briefing = process.env.MODEL_BRIEFING || MODELS.medium;
// Vision (screenshots attached to a ticket). Gemma 4 accepts image input, so the
// funnel still works when only an OpenRouter key is configured.
MODELS.vision = process.env.MODEL_VISION || MODELS.medium;

export const config = {
  PORT: process.env.PORT || 3000,
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRE: process.env.JWT_EXPIRE || "5d",
  NODE_ENV: process.env.NODE_ENV,
  // GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  // GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  // GOOGLE_REFRESH_TOKEN: process.env.GOOGLE_REFRESH_TOKEN,
  GOOGLE_USER_EMAIL: process.env.GOOGLE_USER_EMAIL,
  GOOGLE_USER_PASSWORD: process.env.GOOGLE_USER_PASSWORD,
  TEST_RECIEVER_EMAIL: process.env.TEST_RECIEVER_EMAIL,
  // Copilot model funnel + escalation patience (AI "give-up" turns before a human).
  MODELS,
  COPILOT_ESCALATE_STRIKES: Number(process.env.COPILOT_ESCALATE_STRIKES) || 2,
  // Optional — defaults to localhost. Set in production to the deployed frontend URL.
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:5173",
  BACKEND_URL: process.env.BACKEND_URL || null,

  // AI provider keys. None are required at boot — the copilot degrades to a
  // handoff message when no provider is configured (see aiProvider.service.js).
  // OpenRouter runs the whole funnel; GEMINI_API_KEY is optional and only adds
  // PDF understanding (Gemini Files API), which OpenRouter has no free path for.
  AI_PROVIDER: process.env.AI_PROVIDER || null,
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY || null,
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY || null,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || null,
};
