"use client";

import { BACKEND_URL } from "@/lib/backend";

// Calls the grounded backend /chat endpoint and streams the reply back as text
// deltas, so the UI can print and speak the answer as it arrives (liveness).

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface StreamHandlers {
  onDelta: (text: string) => void;
  onError?: (message: string, status?: number) => void;
  signal?: AbortSignal;
}

// Streams a reply for a full conversation history (multi-turn: follow-ups keep
// context). The route re-validates and caps everything server-side.
export async function streamChat(
  messages: ChatMessage[],
  h: StreamHandlers,
): Promise<void> {
  try {
    const res = await fetch(`${BACKEND_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages }),
      signal: h.signal,
    });
    if (!res.ok || !res.body) {
      const msg =
        (await res.text().catch(() => "")) ||
        "Something went wrong on my end. Please try again.";
      h.onError?.(msg, res.status);
      return;
    }
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      if (chunk) h.onDelta(chunk);
    }
  } catch (err) {
    if ((err as Error)?.name !== "AbortError") {
      h.onError?.("I couldn't reach the assistant — check your connection.");
    }
  }
}
