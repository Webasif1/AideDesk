import { chatComplete } from "./aiProvider.service.js";

// Compatibility shim for the copilot pipeline (triage / knowledge / ticketDraft /
// agentBriefing), which was written against an OpenRouter-specific client.
//
// Routing now goes through aiProvider.service.js so the same pipeline runs on
// whichever provider is configured. The `model` argument is treated as a hint:
// it is honoured when the active provider is OpenRouter (whose IDs are namespaced
// like "vendor/model") and ignored otherwise, where the provider's own default
// applies.
export const callOpenRouter = async ({
  model,
  messages,
  maxTokens = 800,
  jsonMode = false,
}) => {
  // Callers put the system prompt in messages[0]; the provider layer takes it
  // as a separate field.
  const system = messages[0]?.role === "system" ? messages[0].content : null;
  const turns = (system ? messages.slice(1) : messages).map((m) => ({
    role: m.role === "assistant" ? "assistant" : "user",
    content: m.content,
  }));

  return chatComplete({
    system,
    messages: turns,
    maxTokens,
    jsonMode,
    model: typeof model === "string" && model.includes("/") ? model : null,
  });
};
