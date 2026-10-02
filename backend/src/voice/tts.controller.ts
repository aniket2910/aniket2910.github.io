import { Controller, Post, Req, Res } from "@nestjs/common";
import type { Request, Response } from "express";
import { streamSpeechChunks, ttsConfigured, TTS_SAMPLE_RATE } from "../agent/tts";
import { rateLimit } from "../agent/rate-limit";

const MAX_CHARS = 1200; // answers are short; cap for cost + abuse guard

// POST /tts — { text } -> a stream of raw 16-bit PCM (24kHz mono). The client
// plays chunks as they arrive via the Web Audio API.
@Controller("tts")
export class TtsController {
  @Post()
  async tts(@Req() req: Request, @Res() res: Response): Promise<void> {
    const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || req.ip || "local";
    if (!rateLimit(ip)) {
      res.status(429).send("rate limited");
      return;
    }
    if (!ttsConfigured()) {
      res.status(503).send("TTS not configured (set GEMINI_API_KEY, or TTS_PROVIDER=local with Docker up)");
      return;
    }

    const raw = (req.body as { text?: unknown })?.text;
    const text = typeof raw === "string" ? raw.trim().slice(0, MAX_CHARS) : "";
    if (!text) {
      res.status(400).send("no text");
      return;
    }

    res.status(200).set({
      "Content-Type": `audio/l16; rate=${TTS_SAMPLE_RATE}`,
      "X-Sample-Rate": String(TTS_SAMPLE_RATE),
      "Cache-Control": "no-store",
    });
    try {
      for await (const chunk of streamSpeechChunks(text)) {
        res.write(Buffer.from(chunk));
      }
    } catch (err) {
      console.error("[/tts] synthesis failed:", err);
    } finally {
      res.end();
    }
  }
}
