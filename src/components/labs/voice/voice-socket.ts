"use client";

// Client transport for the backend WS /voice gateway. Sends one utterance
// (binary audio chunks + an "end" control frame) or a typed turn, and receives
// the transcript, streamed answer tokens, and streamed answer audio (binary
// PCM) which it plays gaplessly via the Web Audio API (pcm-schedule).

import { BACKEND_URL } from "@/lib/backend";
import { createPcmSink, type PcmSink } from "./pcm-schedule";

export interface VoiceSocketEvents {
  onTranscript?: (text: string) => void; // what the user said (from STT)
  onToken?: (delta: string) => void; // answer text delta
  onSpeaking?: () => void; // first answer-audio chunk started playing
  onDone?: (answer: string) => void; // turn finished
  onError?: (message: string) => void;
  onClose?: () => void;
}

interface ServerMsg {
  type: string;
  text?: string;
  message?: string;
  rate?: number;
}

export interface VoiceSocket {
  ready: Promise<void>;
  unlockAudio: () => Promise<void>; // call from a user gesture (autoplay)
  sendAudio: (chunk: ArrayBuffer) => void;
  endTurn: (mime: string) => void;
  sendText: (content: string) => void;
  reset: () => void;
  close: () => void;
}

export function openVoiceSocket(ev: VoiceSocketEvents): VoiceSocket {
  const url = `${BACKEND_URL.replace(/^http/, "ws")}/voice`;
  const ws = new WebSocket(url);
  ws.binaryType = "arraybuffer";

  let ctx: AudioContext | null = null;
  let sink: PcmSink | null = null;
  let rate = 24000;
  let answer = "";

  const ready = new Promise<void>((resolve, reject) => {
    ws.addEventListener("open", () => resolve());
    ws.addEventListener("error", () => reject(new Error("voice socket error")));
  });

  ws.addEventListener("message", (e: MessageEvent) => {
    if (typeof e.data !== "string") {
      if (sink) sink.push(new Int16Array(e.data as ArrayBuffer), rate);
      return;
    }
    let m: ServerMsg;
    try {
      m = JSON.parse(e.data) as ServerMsg;
    } catch {
      return;
    }
    if (m.type === "transcript") ev.onTranscript?.(m.text ?? "");
    else if (m.type === "token") {
      answer += m.text ?? "";
      ev.onToken?.(m.text ?? "");
    } else if (m.type === "speaking") rate = m.rate ?? 24000;
    else if (m.type === "answer_done") answer = m.text ?? answer;
    else if (m.type === "turn_done") {
      ev.onDone?.(answer);
      answer = "";
    } else if (m.type === "error") ev.onError?.(m.message ?? "voice error");
  });
  ws.addEventListener("close", () => ev.onClose?.());

  const sendJson = (obj: Record<string, unknown>) => {
    if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(obj));
  };

  return {
    ready,
    async unlockAudio() {
      if (!ctx) {
        ctx = new AudioContext();
        sink = createPcmSink(ctx, () => ev.onSpeaking?.());
      }
      if (ctx.state === "suspended") await ctx.resume();
    },
    sendAudio(chunk) {
      if (ws.readyState === WebSocket.OPEN) ws.send(chunk);
    },
    endTurn(mime) {
      sendJson({ type: "end", mime });
    },
    sendText(content) {
      sendJson({ type: "text", content });
    },
    reset() {
      sink?.stop();
      sendJson({ type: "reset" });
    },
    close() {
      sink?.stop();
      ws.close();
    },
  };
}
