"use client";

// LOCAL STT (client half) — records mic audio with MediaRecorder and posts it
// to /api/stt, which forwards to the self-hosted faster-whisper (Speaches).
// Unlike the browser Web Speech API this is BATCH, not streaming: there are no
// live interim words — we capture until stop(), then transcribe once and emit
// the final text. Used when NEXT_PUBLIC_STT_PROVIDER=local.

import type { ListenHandlers } from "./listen";
import { BACKEND_URL } from "@/lib/backend";

export interface VoiceListener {
  stop: () => void;
}

// Starts one turn of local recording. Returns a handle whose stop() ends the
// clip and kicks off transcription, or null if the browser can't record.
export function startListeningLocal(h: ListenHandlers): VoiceListener | null {
  if (
    typeof navigator === "undefined" ||
    !navigator.mediaDevices?.getUserMedia ||
    typeof MediaRecorder === "undefined"
  ) {
    return null;
  }

  const chunks: Blob[] = [];
  let recorder: MediaRecorder | null = null;
  let stream: MediaStream | null = null;
  let stopped = false;

  const cleanup = () => stream?.getTracks().forEach((t) => t.stop());

  navigator.mediaDevices
    .getUserMedia({ audio: true })
    .then((s) => {
      if (stopped) {
        s.getTracks().forEach((t) => t.stop());
        return;
      }
      stream = s;
      recorder = new MediaRecorder(s);
      recorder.ondataavailable = (e) => e.data.size > 0 && chunks.push(e.data);
      recorder.onstop = async () => {
        cleanup();
        const blob = new Blob(chunks, { type: recorder?.mimeType || "audio/webm" });
        if (blob.size === 0) return h.onIdle();
        h.onTranscript("…"); // no interim words available; show we're working
        try {
          const said = await transcribe(blob);
          if (said) h.onFinal(said);
          else h.onIdle();
        } catch {
          h.onIdle();
        }
      };
      recorder.start();
    })
    .catch(() => h.onIdle()); // mic denied / unavailable

  return {
    stop: () => {
      stopped = true;
      if (recorder && recorder.state !== "inactive") recorder.stop();
      else cleanup();
    },
  };
}

async function transcribe(blob: Blob): Promise<string> {
  const form = new FormData();
  const ext = blob.type.includes("ogg") ? "ogg" : blob.type.includes("mp4") ? "mp4" : "webm";
  form.append("audio", blob, `clip.${ext}`);
  const res = await fetch(`${BACKEND_URL}/stt`, { method: "POST", body: form });
  if (!res.ok) throw new Error(`stt ${res.status}`);
  const json = (await res.json()) as { text?: string };
  return (json.text ?? "").trim();
}
