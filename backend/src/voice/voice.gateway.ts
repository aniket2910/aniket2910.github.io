import { Logger } from "@nestjs/common";
import { WebSocketGateway, OnGatewayConnection } from "@nestjs/websockets";
import type { WebSocket } from "ws";
import { runAssistant } from "../agent/agents/orchestrator";
import { sttConfig } from "../agent/config";
import { ProviderError, type ChatMessage } from "../agent/provider";
import { transcribeLocal } from "../agent/stt";
import { streamSpeechChunks, TTS_SAMPLE_RATE } from "../agent/tts";

// WS /voice — the full-duplex-ish voice loop. Protocol (client ⇄ server):
//   client → binary frames  : audio chunks of one utterance
//   client → {type:"end", mime?}      : end of utterance, run the turn
//   client → {type:"text", content}   : typed turn (skip STT)
//   client → {type:"reset"}           : drop buffered audio
//   server → {type:"transcript"|"token"|"answer_done"|"speaking"|"audio_done"
//             |"turn_done"|"error", ...} + binary frames : answer audio (PCM)
// STT/agent/TTS are the same units the HTTP routes use, so behaviour matches.
@WebSocketGateway({ path: "/voice" })
export class VoiceGateway implements OnGatewayConnection {
  private readonly log = new Logger("VoiceGateway");

  handleConnection(client: WebSocket): void {
    const audio: Buffer[] = [];
    const history: ChatMessage[] = [];
    let busy = false;

    client.on("message", (data: Buffer, isBinary: boolean) => {
      if (isBinary) {
        audio.push(Buffer.from(data));
        return;
      }
      let msg: { type?: string; content?: string; mime?: string };
      try {
        msg = JSON.parse(data.toString());
      } catch {
        return;
      }
      if (msg.type === "reset") {
        audio.length = 0;
        return;
      }
      if (msg.type !== "end" && msg.type !== "text") return;
      if (busy) return;
      busy = true;
      const clip = Buffer.concat(audio.splice(0));
      void this.runTurn(client, msg, clip, history).finally(() => {
        busy = false;
      });
    });

    client.on("error", (e) => this.log.warn(`socket error: ${e.message}`));
  }

  private async runTurn(
    client: WebSocket,
    msg: { type?: string; content?: string; mime?: string },
    clip: Buffer,
    history: ChatMessage[],
  ): Promise<void> {
    try {
      const userText = await this.resolveUserText(msg, clip);
      if (!userText) {
        send(client, { type: "error", message: "I couldn't hear that — try again." });
        return;
      }
      send(client, { type: "transcript", text: userText });

      history.push({ role: "user", content: userText });
      let full = "";
      for await (const delta of runAssistant(history)) {
        full += delta;
        send(client, { type: "token", text: delta });
      }
      history.push({ role: "assistant", content: full });
      send(client, { type: "answer_done", text: full });

      if (full.trim()) {
        send(client, { type: "speaking", rate: TTS_SAMPLE_RATE });
        for await (const pcm of streamSpeechChunks(full)) {
          if (client.readyState === client.OPEN) client.send(pcm);
        }
        send(client, { type: "audio_done" });
      }
      send(client, { type: "turn_done" });
    } catch (err) {
      const status = err instanceof ProviderError ? err.status : 0;
      this.log.error(`turn failed (status ${status}): ${String(err)}`);
      send(client, {
        type: "error",
        message:
          status === 429
            ? "I've hit my usage limit for a moment — try again shortly."
            : "I couldn't complete that just now. Please try again.",
      });
    }
  }

  private async resolveUserText(
    msg: { type?: string; content?: string; mime?: string },
    clip: Buffer,
  ): Promise<string> {
    if (msg.type === "text") return (msg.content ?? "").trim();
    if (sttConfig().provider !== "local") {
      throw new ProviderError(400, "stt", "STT_PROVIDER != local");
    }
    if (clip.length === 0) return "";
    const ab = clip.buffer.slice(clip.byteOffset, clip.byteOffset + clip.byteLength) as ArrayBuffer;
    return transcribeLocal(ab, "clip.webm", msg.mime || "audio/webm");
  }
}

function send(client: WebSocket, obj: Record<string, unknown>): void {
  if (client.readyState === client.OPEN) client.send(JSON.stringify(obj));
}
