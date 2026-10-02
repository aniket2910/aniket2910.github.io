"use client";

import { useState } from "react";
import { useVoiceSocket, type VoiceState } from "./use-voice-socket";

const STATUS: Record<VoiceState, string> = {
  idle: "Tap the mic or type a question",
  listening: "Listening…",
  thinking: "Thinking…",
  speaking: "Speaking…",
  unsupported: "Voice needs a browser with the Web Speech API — try Chrome.",
};

// Three bouncing dots shown while the answer is being generated + synthesized.
function ThinkingDots() {
  return (
    <span className="inline-flex items-center gap-1 align-middle" aria-hidden>
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

// Blinking caret trailing the caption while the voice is speaking.
function Caret() {
  return (
    <span
      className="ml-0.5 inline-block h-4 w-[2px] translate-y-0.5 animate-pulse bg-accent align-middle"
      aria-hidden
    />
  );
}

export function VoicePlayground() {
  const v = useVoiceSocket();
  const [draft, setDraft] = useState("");
  const listening = v.state === "listening";
  const noVoice = v.state === "unsupported";

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    v.ask(draft);
    setDraft("");
  };

  return (
    <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
      <div className="flex items-center gap-4">
        <button
          type="button"
          data-press
          onClick={listening ? v.stop : v.start}
          disabled={noVoice}
          className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-accent text-xl text-accent-fg transition disabled:opacity-40"
          aria-label={listening ? "Stop listening" : "Start speaking"}
        >
          {listening ? "■" : "🎙"}
        </button>
        <span className={`font-mono text-sm ${listening ? "text-accent" : "text-muted"}`}>
          {STATUS[v.state]}
        </span>
      </div>

      <form onSubmit={submit} className="mt-5 flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="…or type: what are you looking for?"
          className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted"
        />
        <button
          type="submit"
          data-press
          disabled={!draft.trim()}
          className="rounded-md bg-accent px-4 py-2 text-sm text-accent-fg transition disabled:opacity-40"
        >
          Ask
        </button>
      </form>

      {v.transcript && (
        <p className="mt-6 text-sm text-muted">
          <span className="font-mono text-xs uppercase text-accent-2">You</span>{" "}
          {v.transcript}
        </p>
      )}
      {(v.state === "thinking" || v.answer) && (
        <p className="mt-3 border-t border-border pt-3 text-sm text-foreground">
          <span className="font-mono text-xs uppercase text-accent">Aniket (AI)</span>{" "}
          {v.state === "thinking" ? (
            <ThinkingDots />
          ) : (
            <>
              {v.answer}
              {v.state === "speaking" && <Caret />}
            </>
          )}
        </p>
      )}
    </div>
  );
}
