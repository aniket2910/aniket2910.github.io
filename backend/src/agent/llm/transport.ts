// HTTP transport for the OpenAI-compatible adapter. Isolated so the adapter
// stays focused on request/response shapes.

import { llmConfig } from "../config";
import { ProviderError } from "../provider";

const DEFAULT_TIMEOUT_MS = 60_000;

// POSTs a chat-completions body to the active provider. Throws ProviderError on
// a non-OK status or a network/timeout failure so the route can map it cleanly.
export async function postChat(
  body: Record<string, unknown>,
): Promise<Response> {
  const cfg = llmConfig();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);
  let res: Response;
  try {
    res = await fetch(`${cfg.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cfg.apiKey}`,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timer);
    // Network error / container not running / timeout. 503 = try again.
    throw new ProviderError(503, cfg.name, err instanceof Error ? err.message : undefined);
  }
  clearTimeout(timer);
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new ProviderError(res.status, cfg.name, detail.slice(0, 200));
  }
  return res;
}

// Pulls the text delta out of one streamed SSE `data:` payload.
export function extractDelta(data: string): string {
  try {
    const obj = JSON.parse(data) as {
      choices?: { delta?: { content?: string } }[];
    };
    return obj.choices?.[0]?.delta?.content ?? "";
  } catch {
    return "";
  }
}
