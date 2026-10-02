"use client";

import { createPcmSink, type PcmSink } from "./pcm-schedule";
import { BACKEND_URL } from "@/lib/backend";

// Streams the spoken answer from the backend /tts endpoint and plays it
// live via the Web Audio API — playback begins as the first PCM chunks arrive,
// not after the whole clip is synthesized. Captions are revealed in step with
// playback position (onProgress) so text and voice feel synced.
//
// Autoplay: browsers require the AudioContext to be started from a user gesture,
// so unlock() must be called from the mic tap / Ask submit handler.

export interface AudioPlayer {
  unlock(): void;
  play(text: string): Promise<void>;
  stop(): void;
}

export interface AudioPlayerCallbacks {
  onStart?: () => void; // first audio actually began playing
  onProgress?: (fraction: number) => void; // 0..1, for synced captions
  onError?: () => void; // synthesis or playback failed/blocked
  onDone?: () => void; // playback finished, failed, or nothing to say
}

const CHARS_PER_SEC = 15; // ~natural speaking rate, to pace the caption reveal

export function createAudioPlayer(cb: AudioPlayerCallbacks = {}): AudioPlayer {
  let ctx: AudioContext | null = null;
  let sink: PcmSink | null = null;
  let token = 0; // invalidates an in-flight stream on stop()/new ask
  let raf = 0;
  let startAt = 0;
  let textLen = 0;

  const getCtx = (): AudioContext | null => {
    if (typeof window === "undefined") return null;
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AC) return null;
    if (!ctx) ctx = new AC();
    return ctx;
  };

  const tick = () => {
    if (!ctx) return;
    const played = Math.max(0, ctx.currentTime - startAt);
    const shown = Math.min(textLen, Math.floor(played * CHARS_PER_SEC));
    cb.onProgress?.(textLen ? shown / textLen : 0);
    raf = requestAnimationFrame(tick);
  };

  return {
    unlock() {
      const c = getCtx();
      if (c && c.state === "suspended") c.resume().catch(() => {});
    },

    async play(text) {
      const t = text.trim();
      const mine = ++token;
      textLen = t.length;
      const c = getCtx();
      if (!t || !c) {
        cb.onDone?.();
        return;
      }
      try {
        if (c.state === "suspended") await c.resume();
        const res = await fetch(`${BACKEND_URL}/tts`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: t }),
        });
        if (!res.ok || !res.body) throw new Error(`tts ${res.status}`);
        const rate = Number(res.headers.get("X-Sample-Rate")) || 24000;

        let anyAudio = false;
        sink = createPcmSink(c, () => {
          anyAudio = true;
          startAt = c.currentTime;
          cb.onStart?.();
          raf = requestAnimationFrame(tick);
        });

        const reader = res.body.getReader();
        let rem = new Uint8Array(0);
        for (;;) {
          const { value, done } = await reader.read();
          if (mine !== token) return; // superseded
          if (done) break;
          const merged = new Uint8Array(rem.length + value.length);
          merged.set(rem);
          merged.set(value, rem.length);
          const usable = merged.length - (merged.length % 2); // whole samples
          if (usable) {
            sink.push(new Int16Array(merged.buffer.slice(0, usable)), rate);
          }
          rem = merged.slice(usable);
        }
        if (mine !== token) return;
        if (!anyAudio) throw new Error("no audio");

        // Finish the caption when the last scheduled audio actually ends.
        const waitMs = Math.max(0, (sink.endTime() - c.currentTime) * 1000) + 60;
        window.setTimeout(() => {
          if (mine !== token) return;
          cancelAnimationFrame(raf);
          cb.onProgress?.(1);
          cb.onDone?.();
        }, waitMs);
      } catch {
        if (mine !== token) return;
        cancelAnimationFrame(raf);
        cb.onError?.();
        cb.onDone?.();
      }
    },

    stop() {
      token++;
      cancelAnimationFrame(raf);
      sink?.stop();
      sink = null;
    },
  };
}
