// LLM factory — returns the LlmPort for the active provider. Today every
// provider (local / openai / gemini) speaks the OpenAI-compatible protocol, so
// one adapter covers all three. To adopt a platform SDK later, add its adapter
// and switch on llmConfig().name here — nothing else changes.

import { openAiCompatAdapter } from "./openai-compat";
import type { LlmPort } from "./port";

export function getLlm(): LlmPort {
  return openAiCompatAdapter;
}

export type {
  CompleteOpts,
  CompleteResult,
  LlmMessage,
  LlmPort,
  StreamOpts,
  ToolCall,
  ToolSpec,
} from "./port";
