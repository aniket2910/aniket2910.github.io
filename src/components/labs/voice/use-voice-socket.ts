"use client";

// Voice mode over the backend WS /voice gateway. One persistent socket carries
// the whole conversation (the server keeps per-connection history). Mirrors the
// shape of use-voice-chat so the playground can use either transport.

import { useCallback, useRef, useState } from "react";
import { openVoiceSocket, type VoiceSocket } from "./voice-socket";

export type VoiceState = "idle" | "listening" | "thinking" | "speaking" | "unsupported";

export interface VoiceChat {
  state: VoiceState;
  transcript: string;
  answer: string;
  start: () => void;
  stop: () => void;
  ask: (text: string) => void;
}

export function useVoiceSocket(): VoiceChat {
  const [state, setState] = useState<VoiceState>("idle");
  const [transcript, setTranscript] = useState("");
  const [answer, setAnswer] = useState("");
  const sockRef = useRef<VoiceSocket | null>(null);
  const recRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const socket = useCallback((): VoiceSocket => {
    if (sockRef.current) return sockRef.current;
    const s = openVoiceSocket({
      onTranscript: setTranscript,
      onToken: (d) => setAnswer((a) => a + d),
      onSpeaking: () => setState("speaking"),
      onDone: () => setState("idle"),
      onError: (m) => {
        setAnswer(m);
        setState("idle");
      },
      onClose: () => {
        sockRef.current = null;
      },
    });
    sockRef.current = s;
    return s;
  }, []);

  const start = useCallback(async () => {
    if (
      typeof navigator === "undefined" ||
      !navigator.mediaDevices?.getUserMedia ||
      typeof MediaRecorder === "undefined"
    ) {
      setState("unsupported");
      return;
    }
    const sock = socket();
    await sock.ready.catch(() => undefined);
    await sock.unlockAudio(); // this gesture satisfies autoplay
    setTranscript("");
    setAnswer("");
    sock.reset();

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    streamRef.current = stream;
    const rec = new MediaRecorder(stream);
    let clip: Blob | null = null;
    rec.ondataavailable = (e) => {
      if (e.data.size > 0) clip = e.data;
    };
    rec.onstop = async () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      if (clip) sock.sendAudio(await clip.arrayBuffer()); // audio before "end"
      sock.endTurn(rec.mimeType || "audio/webm");
      setState("thinking");
    };
    rec.start();
    recRef.current = rec;
    setState("listening");
  }, [socket]);

  const stop = useCallback(() => {
    const r = recRef.current;
    if (r && r.state !== "inactive") r.stop();
  }, []);

  const ask = useCallback(
    async (text: string) => {
      const q = text.trim();
      if (!q) return;
      const sock = socket();
      await sock.ready.catch(() => undefined);
      await sock.unlockAudio();
      setTranscript(q);
      setAnswer("");
      setState("thinking");
      sock.sendText(q);
    },
    [socket],
  );

  return { state, transcript, answer, start, stop, ask };
}
