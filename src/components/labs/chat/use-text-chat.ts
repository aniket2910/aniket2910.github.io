"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { streamChat, type ChatMessage } from "../voice/brain-client";

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
  error?: boolean; // an assistant turn that failed — rendered with a Retry action
}

export interface TextChat {
  turns: ChatTurn[];
  busy: boolean;
  send: (text: string) => void;
  retry: () => void;
  reset: () => void;
}

// Rewrites the trailing assistant turn (the one currently being filled).
function withReply(turns: ChatTurn[], content: string, error = false): ChatTurn[] {
  if (turns.length === 0) return turns;
  const next = turns.slice();
  next[next.length - 1] = { role: "assistant", content, error };
  return next;
}

// Drops any prior failed bubbles so they never pollute the context we resend.
const clean = (turns: ChatTurn[]) => turns.filter((t) => !t.error && t.content);
const toMessages = (turns: ChatTurn[]): ChatMessage[] =>
  turns.map(({ role, content }) => ({ role, content }));

// Multi-turn text chat. On any failure the trailing assistant turn becomes an
// error bubble with a friendly message (from the route) and a Retry action —
// never a raw stack string or a misleading canned answer.
export function useTextChat(): TextChat {
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [busy, setBusy] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => () => abortRef.current?.abort(), []);

  // `base` already includes the user turn and a fresh empty assistant turn.
  const run = useCallback((history: ChatMessage[]) => {
    const ac = new AbortController();
    abortRef.current = ac;
    setBusy(true);

    let acc = "";
    let failed = false;
    streamChat(history, {
      signal: ac.signal,
      onDelta: (d) => {
        acc += d;
        setTurns((prev) => withReply(prev, acc));
      },
      onError: (message) => {
        failed = true;
        setTurns((prev) => withReply(prev, message, true));
      },
    }).finally(() => {
      if (ac.signal.aborted) return;
      if (!failed && !acc.trim()) {
        setTurns((prev) =>
          withReply(prev, "I didn't catch an answer there — please try again.", true),
        );
      }
      setBusy(false);
    });
  }, []);

  const send = useCallback(
    (input: string) => {
      const q = input.trim();
      if (!q || busy) return;
      const base = clean(turns);
      setTurns([
        ...base,
        { role: "user", content: q },
        { role: "assistant", content: "" },
      ]);
      run([...toMessages(base), { role: "user", content: q }]);
    },
    [turns, busy, run],
  );

  // Re-ask the most recent question, dropping the failed bubble first.
  const retry = useCallback(() => {
    if (busy) return;
    const base = clean(turns);
    if (base.length === 0 || base[base.length - 1].role !== "user") return;
    setTurns([...base, { role: "assistant", content: "" }]);
    run(toMessages(base));
  }, [turns, busy, run]);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setTurns([]);
    setBusy(false);
  }, []);

  return { turns, busy, send, retry, reset };
}
