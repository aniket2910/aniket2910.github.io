import "dotenv/config"; // load backend/.env (model URLs, provider keys) first
import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { Logger } from "@nestjs/common";
import { WsAdapter } from "@nestjs/platform-ws";
import { AppModule } from "./app.module";

// Boots the NestJS backend. It owns the agent and talks to the model containers
// (LLM/STT/TTS) directly; the Next.js site is a browser client that calls it.
async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: false });

  // Raw-ws adapter powers the WS /voice gateway (binary audio + JSON control).
  app.useWebSocketAdapter(new WsAdapter(app));

  // Allow the Next.js dev origin to call us from the browser. Comma-separated
  // CORS_ORIGINS overrides the default localhost dev origins.
  const origins = (process.env.CORS_ORIGINS || "http://localhost:3000")
    .split(",")
    .map((o) => o.trim());
  app.enableCors({ origin: origins, methods: ["GET", "POST", "OPTIONS"] });

  const port = Number(process.env.PORT || process.env.BACKEND_PORT || 3001);
  await app.listen(port);
  new Logger("Bootstrap").log(`Voice/chat backend listening on :${port}`);
}

void bootstrap();
