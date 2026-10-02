"use client";

import { useEffect, useRef, useState } from "react";
import { useTextChat } from "./use-text-chat";
import { ChatThread } from "./chat-thread";

export function ChatPanel() {
  const chat = useTextChat();
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Keep the newest turn in view as the conversation grows and text streams in.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [chat.turns]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = draft.trim();
    if (!q || chat.busy) return;
    chat.send(q);
    setDraft("");
  };

  const ask = (text: string) => {
    chat.send(text);
    setDraft("");
  };

  return (
    <div className="rounded-xl border border-border bg-surface shadow-sm">
      <div
        ref={scrollRef}
        className="max-h-[52vh] min-h-[8rem] overflow-y-auto p-6"
        aria-live="polite"
      >
        <ChatThread
          turns={chat.turns}
          busy={chat.busy}
          onPick={ask}
          onRetry={chat.retry}
        />
      </div>

      <form
        onSubmit={submit}
        className="flex items-center gap-2 border-t border-border p-3"
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Ask me anything about my work…"
          maxLength={600}
          aria-label="Your question"
          className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
        />
        {chat.turns.length > 0 && (
          <button
            type="button"
            onClick={chat.reset}
            disabled={chat.busy}
            className="rounded-md px-2 py-2 text-xs text-muted transition hover:text-foreground disabled:opacity-40"
          >
            Clear
          </button>
        )}
        <button
          type="submit"
          data-press
          disabled={!draft.trim() || chat.busy}
          className="rounded-md bg-accent px-4 py-2 text-sm text-accent-fg transition disabled:opacity-40"
        >
          {chat.busy ? "…" : "Ask"}
        </button>
      </form>
    </div>
  );
}
