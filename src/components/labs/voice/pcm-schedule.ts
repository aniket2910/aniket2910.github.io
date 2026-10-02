"use client";

// Gapless playback of streamed 16-bit PCM chunks via the Web Audio API.
// Each chunk is queued to start exactly when the previous one ends, so the
// audio plays continuously even though it arrives in many small pieces.

export interface PcmSink {
  push(pcm: Int16Array, rate: number): void;
  endTime(): number; // AudioContext time at which scheduled audio finishes
  stop(): void;
}

export function createPcmSink(
  ctx: AudioContext,
  onFirst: () => void,
): PcmSink {
  let nextAt = 0;
  let started = false;
  let sources: AudioBufferSourceNode[] = [];

  return {
    push(pcm, rate) {
      const buffer = ctx.createBuffer(1, pcm.length, rate);
      const channel = buffer.getChannelData(0);
      for (let i = 0; i < pcm.length; i++) channel[i] = pcm[i] / 32768;

      const src = ctx.createBufferSource();
      src.buffer = buffer;
      src.connect(ctx.destination);
      src.onended = () => src.disconnect();

      const now = ctx.currentTime;
      if (nextAt < now) nextAt = now; // first chunk, or we fell behind
      if (!started) {
        started = true;
        onFirst();
      }
      src.start(nextAt);
      nextAt += buffer.duration;
      sources.push(src);
    },
    endTime() {
      return nextAt;
    },
    stop() {
      for (const s of sources) {
        try {
          s.stop();
        } catch {
          // already stopped
        }
      }
      sources = [];
      nextAt = 0;
      started = false;
    },
  };
}
