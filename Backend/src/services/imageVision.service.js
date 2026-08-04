import { GoogleGenAI } from '@google/genai';
import { config } from '../config/config.js';

// Screenshot understanding for the copilot.
//
// Two paths, picked by which key is configured:
//   1. GEMINI_API_KEY set  → Gemini (best quality on UI screenshots)
//   2. otherwise           → OpenRouter vision model (config.MODELS.vision)
// The OpenRouter path is what runs on an OpenRouter-only setup: the funnel's
// medium tier (Gemma 4) accepts image input, so attachments still reach the AI.

const VISION_PROMPT = (userMessage) =>
  `The customer sent this image in a support chat with the message: "${userMessage}"

Analyze the image and describe:
1. What the image shows (UI screenshot, error message, photo of hardware, etc.)
2. Any visible error messages, codes, or stack traces — quote them exactly
3. What application or system is visible
4. What the customer's problem appears to be based on the image

Respond in plain text, max 200 words. Be specific — exact error text matters.`;

const analyzeWithGemini = async (imageBuffer, mimeType, userMessage) => {
  const genai = new GoogleGenAI({ apiKey: config.GEMINI_API_KEY });
  const result = await genai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: [
      {
        role: 'user',
        parts: [
          { inlineData: { mimeType, data: imageBuffer.toString('base64') } },
          { text: VISION_PROMPT(userMessage) }
        ]
      }
    ]
  });
  return result.text;
};

// OpenRouter takes images as data URIs inside a multimodal content array, which
// the shared chatComplete() (string content only) cannot express — so this posts
// to the chat-completions endpoint directly.
const analyzeWithOpenRouter = async (imageBuffer, mimeType, userMessage) => {
  const dataUri = `data:${mimeType};base64,${imageBuffer.toString('base64')}`;

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.OPENROUTER_API_KEY}`,
      'HTTP-Referer': config.FRONTEND_URL,
      'X-Title': 'AideDesk Copilot'
    },
    body: JSON.stringify({
      model: config.MODELS.vision,
      max_tokens: 400,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: VISION_PROMPT(userMessage) },
            { type: 'image_url', image_url: { url: dataUri } }
          ]
        }
      ]
    })
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`Vision request failed (${res.status}): ${detail.slice(0, 300)}`);
  }

  const json = await res.json();
  return json.choices?.[0]?.message?.content?.trim() || '';
};

// Returns a plain-text description ready to be injected into the copilot's
// system prompt. Throws when no vision-capable provider is configured; callers
// treat attachment processing as best-effort.
export const analyzeImage = async (imageBuffer, mimeType, userMessage) => {
  if (config.GEMINI_API_KEY) {
    return analyzeWithGemini(imageBuffer, mimeType, userMessage);
  }
  if (config.OPENROUTER_API_KEY) {
    return analyzeWithOpenRouter(imageBuffer, mimeType, userMessage);
  }
  throw new Error('No vision provider configured (set OPENROUTER_API_KEY or GEMINI_API_KEY)');
};
