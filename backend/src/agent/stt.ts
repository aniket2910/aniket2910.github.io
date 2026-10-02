// SPEECH-TO-TEXT — switchable via STT_PROVIDER (see config.ts):
//   browser (default) : the free Web Speech API in the visitor's browser.
//                       No server call — the client transcribes and posts text.
//   local             : audio is posted to /api/stt, which forwards it to the
//                       self-hosted faster-whisper via Speaches ($0, in Docker).
// This module is the SERVER side of "local": it takes an audio blob and returns
// the transcript. Keys aren't needed; the container is on localhost.

import { sttConfig } from "./config";
import { ProviderError } from "./provider";

// Transcribes an audio buffer via the local Speaches (OpenAI-compatible)
// /v1/audio/transcriptions endpoint. Throws ProviderError on failure so the
// route can map it to a clean status.
export async function transcribeLocal(
  audio: ArrayBuffer,
  filename = "audio.webm",
  contentType = "audio/webm",
): Promise<string> {
  const cfg = sttConfig();
  const form = new FormData();
  form.append("file", new Blob([audio], { type: contentType }), filename);
  form.append("model", cfg.model);
  form.append("response_format", "json");

  let res: Response;
  try {
    res = await fetch(`${cfg.baseUrl}/audio/transcriptions`, {
      method: "POST",
      body: form,
    });
  } catch (err) {
    throw new ProviderError(503, "speaches", err instanceof Error ? err.message : undefined);
  }
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new ProviderError(res.status, "speaches", detail.slice(0, 200));
  }
  const json = (await res.json()) as { text?: string };
  return (json.text ?? "").trim();
}
