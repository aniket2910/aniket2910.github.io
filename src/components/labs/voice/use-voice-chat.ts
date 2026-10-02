"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getRecognitionCtor } from "./speech-types";
import { streamChat } from "./brain-client";
import { createAudioPlayer, type AudioPlayer } from "./speak-gemini";
import { stubAnswer } from "./stub-brain";
import {
  sttProvider,
  startVoiceInput,
  type VoiceListener,
} from "./start-listening";

export type VoiceState =
  | "idle"
  | "listening"
  | "thinking"
  | "speaking"
  | "unsupported";

export interface VoiceChat {
  state: VoiceState;
  transcript: string;
  answer: string;
  start: () => void;
  stop: () => void;
  ask: (text: string) => void;
}

// Orchestrates ears (listen) -> brain (streamed /api/chat) -> mouth (Gemini TTS).
// UX goal: the answer text is held back while it's generated + synthesized (the
// UI shows a "thinking" animation), then revealed word-by-word IN SYNC with the
// spoken audio — so text and voice feel live and connected, not desynced.
export function useVoiceChat(): VoiceChat {
  const [state, setState] = useState<VoiceState>("idle");
  const [transcript, setTranscript] = useState("");
  const [answer, setAnswer] = useState("");
  const recRef = useRef<VoiceListener | null>(null);
  const playerRef = useRef<AudioPlayer | null>(null);
  const fullRef = useRef(""); // finished answer, revealed as the audio plays

  // Support detection depends on the active STT backend: browser mode needs the
  // Web Speech API; local mode needs MediaRecorder + getUserMedia. Output (TTS)
  // is server-side either way, so it doesn't affect support here.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const detect = () => {
      const supported =
        sttProvider() === "local"
          ? !!navigator.mediaDevices?.getUserMedia && typeof MediaRecorder !== "undefined"
          : !!getRecognitionCtor();
      if (!supported) setState("unsupported");
    };
    detect();
  }, []);

  // One persistent audio player. Its callbacks drive both the state machine and
  // the synced caption reveal (onProgress -> slice of the full answer).
  const getPlayer = useCallback((): AudioPlayer => {
    if (!playerRef.current) {
      playerRef.current = createAudioPlayer({
        onStart: () => setState("speaking"),
        onProgress: (frac) => {
          const full = fullRef.current;
          const n = Math.min(full.length, Math.ceil(full.length * frac));
          setAnswer(full.slice(0, n));
        },
        // If audio is blocked/fails, still show the full text so nothing is lost.
        onError: () => {
          setAnswer(fullRef.current);
          setState("idle");
        },
        onDone: () => {
          setAnswer(fullRef.current);
          setState("idle");
        },
      });
    }
    return playerRef.current;
  }, []);

  const respond = useCallback(
    (question: string) => {
      setState("thinking");
      setAnswer(""); // hold the answer until the audio is ready
      fullRef.current = "";
      getPlayer().stop();

      let full = "";
      streamChat([{ role: "user", content: question }], {
        onDelta: (d) => {
          full += d; // accumulate silently — do NOT reveal yet
        },
        onError: () => {
          full = stubAnswer(question); // offline resilience
        },
      }).then(() => {
        fullRef.current = full;
        getPlayer().play(full); // reveal (synced) + speak together
      });
    },
    [getPlayer],
  );

  const start = useCallback(() => {
    getPlayer().unlock(); // this click is our chance to satisfy autoplay
    getPlayer().stop();
    setTranscript("");
    setAnswer("");
    const rec = startVoiceInput({
      onTranscript: setTranscript,
      onFinal: (said) => respond(said),
      onIdle: () => {
        recRef.current = null;
        // Only fall back to idle if we're still listening (not thinking/speaking).
        setState((s) => (s === "listening" ? "idle" : s));
      },
    });
    if (!rec) return;
    recRef.current = rec;
    setState("listening");
  }, [respond, getPlayer]);

  const stop = useCallback(() => recRef.current?.stop(), []);

  const ask = useCallback(
    (input: string) => {
      const q = input.trim();
      if (!q) return;
      getPlayer().unlock(); // this submit is our chance to satisfy autoplay
      setTranscript(q);
      respond(q);
    },
    [respond, getPlayer],
  );

  return { state, transcript, answer, start, stop, ask };
}
