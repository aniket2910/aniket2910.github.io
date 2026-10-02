// Shared LLM types + the typed error the /api/chat route maps to a status.
//
// The active LLM backend is chosen in config.ts (AI_PROVIDER) and reached
// through the OpenAI-compatible client in llm.ts. The multi-agent loop that
// answers a question lives in ./agents/orchestrator.ts.

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatArgs {
  system: string;
  messages: ChatMessage[];
}

// Thrown when the upstream LLM responds with a non-OK status (or is
// unreachable), so the route can map the status to a meaningful, visitor-facing
// message (a 429 quota vs. an auth/config problem vs. the local container being
// down) instead of a generic error. `detail` is for server logs only.
export class ProviderError extends Error {
  constructor(
    public status: number,
    public provider: string,
    public detail?: string,
  ) {
    super(`${provider} ${status}${detail ? `: ${detail}` : ""}`);
    this.name = "ProviderError";
  }
}
