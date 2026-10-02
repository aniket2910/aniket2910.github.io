"use client";

import type { ChatTurn } from "./use-text-chat";

export const SUGGESTIONS = [
  "What are you looking for in your next role?",
  "Tell me about your Kafka throughput work.",
  "What does your tech stack look like?",
  "What have you built recently?",
];

// Bouncing dots shown while the first token of a reply is still in flight.
function ThinkingDots() {
  return (
    <span className="inline-flex items-center gap-1" aria-label="Thinking">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-1.5 w-1.5 animate-bounce rounded-full bg-accent"
          style={{ animationDelay: `${i * 0.15}s`, animationDuration: "0.9s" }}
        />
      ))}
    </span>
  );
}

function Bubble({
  turn,
  pending,
  onRetry,
}: {
  turn: ChatTurn;
  pending: boolean;
  onRetry?: () => void;
}) {
  const isUser = turn.role === "user";

  if (turn.error) {
    return (
      <div className="flex flex-col items-start">
        <span className="mb-1 font-mono text-[10px] uppercase tracking-wide text-muted">
          Aniket (AI)
        </span>
        <div className="max-w-[85%] rounded-lg border border-accent/40 bg-accent/5 px-3.5 py-2.5 text-sm text-foreground">
          <p>{turn.content}</p>
          {onRetry && (
            <button
              type="button"
              data-press
              onClick={onRetry}
              className="mt-2 inline-flex items-center gap-1 font-mono text-xs text-accent transition hover:underline"
            >
              ↻ Try again
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}>
      <span className="mb-1 font-mono text-[10px] uppercase tracking-wide text-muted">
        {isUser ? "You" : "Aniket (AI)"}
      </span>
      <div
        className={`max-w-[85%] rounded-lg px-3.5 py-2.5 text-sm ${
          isUser
            ? "bg-accent text-accent-fg"
            : "border border-border bg-background text-foreground"
        }`}
      >
        {pending ? <ThinkingDots /> : turn.content}
      </div>
    </div>
  );
}

export function ChatThread({
  turns,
  busy,
  onPick,
  onRetry,
}: {
  turns: ChatTurn[];
  busy: boolean;
  onPick: (text: string) => void;
  onRetry: () => void;
}) {
  if (turns.length === 0) {
    return (
      <div className="flex flex-col gap-3 py-2">
        <p className="text-sm text-muted">
          Ask about my experience, skills, projects, or the role I&apos;m
          looking for. Try one of these:
        </p>
        <div className="flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              data-press
              onClick={() => onPick(s)}
              className="rounded-full border border-border bg-background px-3 py-1.5 text-left text-xs text-foreground transition hover:border-accent hover:text-accent"
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {turns.map((turn, i) => {
        const isLast = i === turns.length - 1;
        return (
          <Bubble
            key={i}
            turn={turn}
            pending={busy && isLast && turn.role === "assistant" && !turn.content}
            onRetry={turn.error && isLast && !busy ? onRetry : undefined}
          />
        );
      })}
    </div>
  );
}
