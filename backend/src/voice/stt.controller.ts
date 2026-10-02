import {
  Controller,
  Post,
  Req,
  Res,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import type { Request, Response } from "express";
import { sttConfig } from "../agent/config";
import { ProviderError } from "../agent/provider";
import { rateLimit } from "../agent/rate-limit";
import { transcribeLocal } from "../agent/stt";

const MAX_BYTES = 8 * 1024 * 1024; // 8MB — short clips only (abuse guard)

// POST /stt — multipart form with an `audio` file -> { text }. Forwards to the
// local faster-whisper container; only active when STT_PROVIDER=local.
@Controller("stt")
export class SttController {
  @Post()
  @UseInterceptors(FileInterceptor("audio", { limits: { fileSize: MAX_BYTES } }))
  async stt(
    @UploadedFile() file: Express.Multer.File | undefined,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || req.ip || "local";
    if (!rateLimit(ip)) {
      res.status(429).json({ error: "rate limited" });
      return;
    }
    if (sttConfig().provider !== "local") {
      res.status(400).json({ error: "local STT is disabled (STT_PROVIDER != local)" });
      return;
    }
    if (!file || file.size === 0) {
      res.status(400).json({ error: "no audio file" });
      return;
    }

    try {
      const b = file.buffer;
      const ab = b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength) as ArrayBuffer;
      const text = await transcribeLocal(ab, file.originalname || "audio.webm", file.mimetype || "audio/webm");
      res.json({ text });
    } catch (err) {
      const status = err instanceof ProviderError ? err.status : 500;
      console.error("[/stt] transcription failed:", err);
      res
        .status(status === 429 ? 429 : 503)
        .json({ error: "couldn't transcribe audio — is the local voice container running?" });
    }
  }
}
