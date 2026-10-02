import { Controller, Post, Req, Res } from "@nestjs/common";
import type { Request, Response } from "express";
import { runAssistant } from "../agent/agents/orchestrator";
import { llmConfig } from "../agent/config";
import { ProviderError, type ChatMessage } from "../agent/provider";
import { rateLimit } from "../agent/rate-limit";

const MAX_CHARS = 600; // cap per-message length (cost + abuse guard)
const MAX_TURNS = 12; // cap history sent to the model (cost guard)

// POST /chat — runs the multi-agent orchestrator and streams the answer as
// plain text. Ports the former Next.js /api/chat handler; behaviour identical.
@Controller("chat")
export class ChatController {
  @Post()
  async chat(@Req() req: Request, @Res() res: Response): Promise<void> {
    const ip = clientIp(req);
    if (!rateLimit(ip)) {
      send(res, 429, "I'm getting a lot of questions right now — give me a moment and try again.");
      return;
    }

    const messages = extractMessages(req.body);
    if (!messages) {
      send(res, 400, "Ask me something about my work and I'll answer.");
      return;
    }

    const cfg = llmConfig();
    if (!cfg.configured) {
      send(res, 200, `The assistant isn't fully set up yet — the ${cfg.name} backend is missing config.`);
      return;
    }

    const gen = runAssistant(messages);

    // Preflight: the first upstream call happens on this .next(), so a provider
    // failure surfaces as a real status instead of leaking into the stream.
    let first: IteratorResult<string>;
    try {
      first = await gen.next();
    } catch (err) {
      providerError(res, err, cfg.name);
      return;
    }

    res.status(200).set({
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    });
    try {
      if (!first.done && first.value) res.write(first.value);
      for (;;) {
        const { value, done } = await gen.next();
        if (done) break;
        if (value) res.write(value);
      }
    } catch (err) {
      console.error("[/chat] orchestrator stream failed mid-answer:", err);
    } finally {
      res.end();
    }
  }
}

function providerError(res: Response, err: unknown, provider: string): void {
  const status = err instanceof ProviderError ? err.status : 0;
  console.error(`[/chat] ${provider} request failed (status ${status}):`, err);
  if (status === 429) {
    send(res, 429, "I've hit my AI usage limit for the moment — this runs on a small free quota. Give it a minute and try again.");
  } else if (status === 401 || status === 403) {
    send(res, 503, "My AI assistant is temporarily unavailable. Please try again a little later.");
  } else {
    send(res, 503, "I couldn't reach my AI assistant just now. Please try again in a moment.");
  }
}

function extractMessages(body: unknown): ChatMessage[] | null {
  if (!body || typeof body !== "object") return null;
  const raw = (body as { messages?: unknown }).messages;
  if (!Array.isArray(raw)) return null;

  const clean: ChatMessage[] = [];
  for (const m of raw) {
    const role = (m as { role?: unknown })?.role;
    const content = (m as { content?: unknown })?.content;
    if (role !== "user" && role !== "assistant") continue;
    if (typeof content !== "string") continue;
    const trimmed = content.trim().slice(0, MAX_CHARS);
    if (trimmed) clean.push({ role, content: trimmed });
  }

  const recent = clean.slice(-MAX_TURNS);
  if (recent.length === 0 || recent[recent.length - 1].role !== "user") return null;
  return recent;
}

function clientIp(req: Request): string {
  const fwd = req.headers["x-forwarded-for"];
  const first = Array.isArray(fwd) ? fwd[0] : fwd?.split(",")[0];
  return first?.trim() || req.ip || "local";
}

function send(res: Response, status: number, body: string): void {
  res.status(status).type("text/plain; charset=utf-8").send(body);
}
