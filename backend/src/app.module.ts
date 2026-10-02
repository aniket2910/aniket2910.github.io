import { Module } from "@nestjs/common";
import { ChatController } from "./chat/chat.controller";
import { TtsController } from "./voice/tts.controller";
import { SttController } from "./voice/stt.controller";
import { VoiceGateway } from "./voice/voice.gateway";
import { HealthController } from "./health.controller";

// Root module. Controllers are thin HTTP adapters over the agent in ./agent;
// VoiceGateway is the WS /voice loop over the same agent units. No shared
// mutable state, so no providers yet.
@Module({
  controllers: [HealthController, ChatController, TtsController, SttController],
  providers: [VoiceGateway],
})
export class AppModule {}
