// TEXT-TO-SPEECH — switchable via TTS_PROVIDER (see config.ts):
//   local  (default) : self-hosted Kokoro via Speaches, $0, runs in Docker.
//   gemini           : Google Gemini native TTS, fixed voice "Achernar".
// BOTH emit raw signed-16-bit little-endian mono PCM at 24 kHz, so the browser
// player (pcm-schedule.ts) is identical for either backend — only the source
// differs. Streaming lets playback start within a few chunks instead of waiting
// for the whole clip, so replies feel live.

import { ttsConfig } from "./config";

export const TTS_SAMPLE_RATE = 24000; // 24kHz 16-bit mono PCM, both providers

// --- Gemini (cloud) ---------------------------------------------------------
const GEMINI_MODEL = process.env.GEMINI_TTS_MODEL || "gemini-3.1-flash-tts-preview";
const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta/models";
export const VOICE_NAME = "Achernar";
const GEMINI_STYLE =
  "Read aloud in a warm, welcoming tone. Speak softly with a gentle, " +
  "slightly higher pitch and a neutral, natural pace: ";

// True when the SELECTED provider is ready: local needs no key (assumes the
// Speaches container is up); gemini needs a key.
export function ttsConfigured(): boolean {
  const cfg = ttsConfig();
  if (cfg.provider === "gemini") return (process.env.GEMINI_API_KEY ?? "").length > 0;
  return true; // local
}

// Yields raw 16-bit PCM chunks for the active provider. Throws on a non-OK
// response so the route can surface a clean error.
export async function* streamSpeechChunks(
  text: string,
): AsyncGenerator<Uint8Array> {
  const cfg = ttsConfig();
  if (cfg.provider === "gemini") {
    yield* streamGeminiSpeech(text);
    return;
  }
  yield* streamLocalSpeech(text, cfg.baseUrl, cfg.model, cfg.voice);
}

// --- Local: Speaches / Kokoro (OpenAI-compatible /v1/audio/speech) ----------
// Requesting response_format "pcm" gives the same 24kHz 16-bit mono stream as
// Gemini, so nothing downstream has to change. We stream the response body.
async function* streamLocalSpeech(
  text: string,
  baseUrl: string,
  model: string,
  voice: string,
): AsyncGenerator<Uint8Array> {
  const res = await fetch(`${baseUrl}/audio/speech`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      voice,
      input: text,
      response_format: "pcm",
    }),
  });
  if (!res.ok || !res.body) {
    throw new Error(
      `local tts ${res.status}: ${res.ok ? "no body" : (await res.text()).slice(0, 200)}`,
    );
  }
  const reader = res.body.getReader();
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    if (value) yield value;
  }
}

// --- Gemini: native streaming TTS (SSE of base64 L16 PCM chunks) ------------
async function* streamGeminiSpeech(text: string): AsyncGenerator<Uint8Array> {
  const apiKey = process.env.GEMINI_API_KEY ?? "";
  const url = `${GEMINI_BASE}/${GEMINI_MODEL}:streamGenerateContent?alt=sse&key=${apiKey}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: GEMINI_STYLE + text }] }],
      generationConfig: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: VOICE_NAME } },
        },
      },
    }),
  });
  if (!res.ok || !res.body) {
    throw new Error(`gemini tts ${res.status}: ${res.ok ? "no body" : await res.text()}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let nl: number;
    while ((nl = buffer.indexOf("\n")) >= 0) {
      const line = buffer.slice(0, nl).trim();
      buffer = buffer.slice(nl + 1);
      if (!line.startsWith("data:")) continue;
      const json = line.slice(5).trim();
      if (!json || json === "[DONE]") continue;
      const b64 = extractAudio(json);
      if (b64) yield new Uint8Array(Buffer.from(b64, "base64"));
    }
  }
}

function extractAudio(json: string): string {
  try {
    const obj = JSON.parse(json) as {
      candidates?: { content?: { parts?: { inlineData?: { data?: string } }[] } }[];
    };
    const parts = obj.candidates?.[0]?.content?.parts ?? [];
    for (const p of parts) if (p.inlineData?.data) return p.inlineData.data;
  } catch {
    // ignore malformed SSE lines
  }
  return "";
}
