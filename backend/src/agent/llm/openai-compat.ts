// OpenAI-compatible adapter — implements LlmPort against the /v1/chat/completions
// protocol. One adapter serves local Ollama, OpenAI, and Gemini's compat
// endpoint; only config.ts (base URL / key / model) differs between them.

import { llmConfig } from "../config";
import { ProviderError } from "../provider";
import { extractDelta, postChat } from "./transport";
import type {
  CompleteOpts,
  CompleteResult,
  LlmMessage,
  LlmPort,
  RawToolCall,
  StreamOpts,
  ToolCall,
} from "./port";

async function complete(opts: CompleteOpts): Promise<CompleteResult> {
  const body: Record<string, unknown> = {
    model: llmConfig().model,
    messages: opts.messages,
    temperature: opts.temperature ?? 0.3,
    max_tokens: opts.maxTokens ?? 512,
    stream: false,
  };
  if (opts.tools?.length) {
    body.tools = opts.tools.map((t) => ({
      type: "function",
      function: { name: t.name, description: t.description, parameters: t.parameters },
    }));
    body.tool_choice = opts.toolChoice ?? "auto";
  }

  const res = await postChat(body);
  const json = (await res.json()) as {
    choices?: { message?: { content?: string | null; tool_calls?: RawToolCall[] } }[];
  };
  const msg = json.choices?.[0]?.message;
  const toolCalls: ToolCall[] = (msg?.tool_calls ?? []).map((tc) => ({
    id: tc.id,
    name: tc.function.name,
    arguments: tc.function.arguments || "{}",
  }));
  return { content: msg?.content ?? "", toolCalls };
}

async function* streamComplete(opts: StreamOpts): AsyncGenerator<string> {
  const res = await postChat({
    model: llmConfig().model,
    messages: opts.messages,
    temperature: opts.temperature ?? 0.4,
    max_tokens: opts.maxTokens ?? 400,
    stream: true,
  });
  if (!res.body) throw new ProviderError(res.status || 502, llmConfig().name);

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let nl: number;
    while ((nl = buffer.indexOf("\n")) >= 0) {
      const line = buffer.slice(0, nl).trim();
      buffer = buffer.slice(nl + 1);
      if (!line.startsWith("data:")) continue;
      const data = line.slice(5).trim();
      if (!data || data === "[DONE]") continue;
      const text = extractDelta(data);
      if (text) yield text;
    }
  }
}

function assistantToolCallMessage(calls: ToolCall[]): LlmMessage {
  return {
    role: "assistant",
    content: "",
    tool_calls: calls.map((c) => ({
      id: c.id,
      type: "function",
      function: { name: c.name, arguments: c.arguments },
    })),
  };
}

export const openAiCompatAdapter: LlmPort = {
  get name() {
    return llmConfig().name;
  },
  complete,
  streamComplete,
  assistantToolCallMessage,
};
