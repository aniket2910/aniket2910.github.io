import { Controller, Get } from "@nestjs/common";
import { llmConfig, sttConfig, ttsConfig } from "./agent/config";

// Liveness + a readable view of which backends are wired (no secrets).
@Controller("health")
export class HealthController {
  @Get()
  health() {
    return {
      status: "ok",
      llm: { provider: llmConfig().name, model: llmConfig().model },
      stt: { provider: sttConfig().provider },
      tts: { provider: ttsConfig().provider },
    };
  }
}
