"use client";

// Unified entry for starting a listening turn, switchable at build time via
// NEXT_PUBLIC_STT_PROVIDER (mirrors the server's STT_PROVIDER):
//   browser (default) : free Web Speech API, live interim words.
//   local             : record + POST to /api/stt -> self-hosted whisper.
// Both return a { stop() } handle and drive the same ListenHandlers, so the
// voice hook doesn't care which backend is active.

import type { ListenHandlers } from "./listen";
import { startListening } from "./listen";
import { startListeningLocal, type VoiceListener } from "./record-transcribe";

export type { VoiceListener };

export function sttProvider(): "browser" | "local" {
  return process.env.NEXT_PUBLIC_STT_PROVIDER === "local" ? "local" : "browser";
}

export function startVoiceInput(h: ListenHandlers): VoiceListener | null {
  return sttProvider() === "local" ? startListeningLocal(h) : startListening(h);
}
