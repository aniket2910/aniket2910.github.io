// LLM PORT — the provider-agnostic interface the agent talks to. Today the only
// adapter is openai-compat.ts (drives local Ollama, OpenAI, and Gemini-compat
// over one protocol). When we move to platform SDKs, we add OpenAiSdkAdapter /
// GoogleGenAiAdapter / AnthropicAdapter implementing THIS interface, and the
// orchestrator doesn't change — that's the whole point of the port.

export interface LlmMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  name?: string;
  tool_call_id?: string;
  // Present on an assistant turn that requested tools; echoed back so the
  // follow-up request can attach tool results to the right call ids.
  tool_calls?: RawToolCall[];
}

export interface ToolSpec {
  name: string;
  description: string;
  parameters: Record<string, unknown>; // JSON Schema for the arguments
}

export interface ToolCall {
  id: string;
  name: string;
  arguments: string; // raw JSON string as the model emitted it
}

export interface RawToolCall {
  id: string;
  type: "function";
  function: { name: string; arguments: string };
}

export interface CompleteResult {
  content: string;
  toolCalls: ToolCall[];
}

export interface CompleteOpts {
  messages: LlmMessage[];
  tools?: ToolSpec[];
  // "auto" (default) lets the model choose; "required" forces at least one tool
  // call — used to stop a weak model freelancing an ungrounded answer.
  toolChoice?: "auto" | "required";
  temperature?: number;
  maxTokens?: number;
}

export interface StreamOpts {
  messages: LlmMessage[];
  temperature?: number;
  maxTokens?: number;
}

export interface LlmPort {
  name: string;
  // One call that MAY return tool calls (the agent's decision step).
  complete(opts: CompleteOpts): Promise<CompleteResult>;
  // A streamed text answer (yielded as deltas for live print/speech).
  streamComplete(opts: StreamOpts): AsyncGenerator<string>;
  // Builds the assistant message carrying tool calls, required before tool
  // results in the next request (OpenAI ordering rule).
  assistantToolCallMessage(calls: ToolCall[]): LlmMessage;
}
