// PROVIDER SWITCHBOARD — the single place that turns env vars into concrete
// backend configs. Three independent switches, each defaulting to the free /
// local option so a fresh clone runs at $0:
//
//   AI_PROVIDER  = local | openai | gemini     (the LLM "brain")
//   STT_PROVIDER = browser | local             (the "ears": speech -> text)
//   TTS_PROVIDER = local | gemini              (the "mouth": text -> speech)
//
// "local" means the Docker stack in docker-compose.yml:
//   - Ollama   (LLM)  on :11434  — OpenAI-compatible at /v1
//   - Speaches (STT+TTS) on :8000 — OpenAI-compatible at /v1
// Everything below is server-side only; keys never reach the browser.

export type LlmProviderName = "local" | "openai" | "gemini";
export type SttProviderName = "browser" | "local";
export type TtsProviderName = "local" | "gemini";

export interface LlmConfig {
  name: LlmProviderName;
  baseUrl: string; // OpenAI-compatible base, e.g. http://localhost:11434/v1
  apiKey: string; // may be a dummy for local
  model: string;
  keyEnv: string; // which env var holds the key (for error messages)
  configured: boolean; // is this provider usable right now?
}

export interface SttConfig {
  provider: SttProviderName;
  baseUrl: string; // OpenAI-compatible STT base (faster-whisper container)
  model: string;
}

export interface TtsConfig {
  provider: TtsProviderName;
  baseUrl: string; // OpenAI-compatible TTS base (Kokoro container, local only)
  model: string;
  voice: string;
  sampleRate: number; // both providers emit 24kHz 16-bit mono PCM
}

// Each model runs in its own container (see docker-compose.yml), so each has its
// own base URL. Swapping a model = changing its image + URL, app untouched.
const LOCAL_LLM_BASE =
  process.env.OLLAMA_BASE_URL?.replace(/\/$/, "") || "http://localhost:11434/v1";
const STT_BASE =
  process.env.STT_URL?.replace(/\/$/, "") || "http://localhost:8001/v1";
const TTS_BASE =
  process.env.TTS_URL?.replace(/\/$/, "") || "http://localhost:8002/v1";

export function llmConfig(): LlmConfig {
  const choice = (process.env.AI_PROVIDER || "local").toLowerCase();

  if (choice === "openai") {
    const apiKey = process.env.OPENAI_API_KEY ?? "";
    return {
      name: "openai",
      baseUrl: "https://api.openai.com/v1",
      apiKey,
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      keyEnv: "OPENAI_API_KEY",
      configured: apiKey.length > 0,
    };
  }

  if (choice === "gemini") {
    const apiKey = process.env.GEMINI_API_KEY ?? "";
    return {
      name: "gemini",
      // Gemini speaks the OpenAI Chat Completions protocol (incl. tool calls)
      // at this compatibility endpoint, so the same llm.ts client works.
      baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai",
      apiKey,
      model: process.env.GEMINI_MODEL || "gemini-3.6-flash",
      keyEnv: "GEMINI_API_KEY",
      configured: apiKey.length > 0,
    };
  }

  // Default: local Ollama. No key needed; we assume the container is up (the
  // route surfaces a clean "start Docker" error if it isn't reachable).
  return {
    name: "local",
    baseUrl: LOCAL_LLM_BASE,
    apiKey: process.env.OLLAMA_API_KEY || "ollama", // dummy; Ollama ignores it
    // Qwen 2.5 3B: best small model for reliable OpenAI-style tool calling on
    // CPU — the crux of "behave like a real agent". Swap to gemma3 via env.
    model: process.env.OLLAMA_MODEL || "qwen2.5:3b",
    keyEnv: "OLLAMA_MODEL",
    configured: true,
  };
}

export function sttConfig(): SttConfig {
  const provider = (process.env.STT_PROVIDER || "browser").toLowerCase() as SttProviderName;
  return {
    provider: provider === "local" ? "local" : "browser",
    baseUrl: STT_BASE,
    model: process.env.STT_MODEL || "Systran/faster-whisper-small",
  };
}

export function ttsConfig(): TtsConfig {
  const provider = (process.env.TTS_PROVIDER || "local").toLowerCase() as TtsProviderName;
  return {
    provider: provider === "gemini" ? "gemini" : "local",
    baseUrl: TTS_BASE,
    // Kokoro via kokoro-fastapi exposes the OpenAI voice id "af_heart" and the
    // model id "kokoro"; both are overridable per deployment.
    model: process.env.TTS_MODEL || "kokoro",
    voice: process.env.TTS_VOICE || "af_heart",
    sampleRate: 24000,
  };
}
