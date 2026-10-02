// AGENT LOOP — answers one user turn as a real tool-calling agent:
//
//   1. GUARDRAIL   deterministic pre-check; refuse injection/empty input.
//   2. THINK/ACT   the LLM is given the search tools and decides which to call
//                  (several at once for cross-topic questions). We run the
//                  tools (deterministic grounded lookups) and feed results back,
//                  looping up to MAX_ROUNDS so it can gather more if needed.
//   3. ANSWER      once the model stops calling tools, a STREAMED call composes
//                  the final first-person answer from the tool results.
//
// Tools are FUNCTIONS, not sub-agent LLM calls, so a normal turn is ~2 model
// calls (act + answer) instead of N+2 — the difference between snappy and
// painful on a CPU-only local model. The first upstream call happens before we
// yield, so a provider failure throws and /api/chat maps it to a status.

import type { ChatMessage } from "../provider";
import { getLlm, type LlmMessage } from "../llm";
import { fullContext } from "./context";
import { checkGuardrail, smalltalkReply } from "./guardrail";
import { AGENT_SYSTEM, DIRECT_SYSTEM, SYNTH_SYSTEM } from "./prompts";
import { classifyInScope } from "./scope";
import { runTool, toolSpecs } from "./tools";

const MAX_ROUNDS = 3; // tool-gathering rounds before we force an answer

const OUT_OF_SCOPE =
  "That's outside what I can speak to here — but I can tell you about Aniket's " +
  "experience, skills, or projects. What would you like to know?";

export async function* runAssistant(
  messages: ChatMessage[],
): AsyncGenerator<string> {
  const lastUser = [...messages].reverse().find((m) => m.role === "user")?.content ?? "";

  // 1. Injection / empty → deterministic refusal (no model call).
  const guard = checkGuardrail(lastUser);
  if (!guard.ok) {
    yield guard.message ?? "";
    return;
  }
  // 2. Bare greeting → deterministic friendly reply (no model call).
  const hello = smalltalkReply(lastUser);
  if (hello) {
    yield hello;
    return;
  }
  // 3. Scope gate → off-topic is declined before we ever try to answer it, so
  //    the model can't respond from world knowledge (coding help, trivia, …).
  if (!(await classifyInScope(lastUser))) {
    yield OUT_OF_SCOPE;
    return;
  }

  const llm = getLlm();
  const convo: LlmMessage[] = [
    { role: "system", content: AGENT_SYSTEM },
    ...messages.map((m) => ({ role: m.role, content: m.content })),
  ];

  let usedTools = false;
  for (let round = 0; round < MAX_ROUNDS; round++) {
    const res = await llm.complete({
      messages: convo,
      tools: toolSpecs(),
      // Ask for a tool on the first round (best-effort; some backends ignore
      // "required"). The real guarantee is below: no tool results => decline.
      toolChoice: round === 0 ? "required" : "auto",
      temperature: 0.2,
      maxTokens: 512,
    });

    if (res.toolCalls.length === 0) break; // model has gathered enough

    usedTools = true;
    convo.push(llm.assistantToolCallMessage(res.toolCalls));
    for (const call of res.toolCalls) {
      const output = await runTool(call.name, parseArgs(call.arguments));
      convo.push({
        role: "tool",
        tool_call_id: call.id,
        name: call.name,
        content: output,
      });
    }
  }

  // The question is in scope (gate passed). If the model misrouted and called
  // no tool, don't decline — answer straight from the full grounded profile.
  if (!usedTools) {
    yield* llm.streamComplete({
      messages: [
        { role: "system", content: `${DIRECT_SYSTEM}\n\nFACTS:\n${fullContext()}` },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ],
      temperature: 0.4,
      maxTokens: 400,
    });
    return;
  }

  // ANSWER — stream the reply grounded on the gathered tool results.
  yield* llm.streamComplete({
    messages: [{ role: "system", content: SYNTH_SYSTEM }, ...convo.slice(1)],
    temperature: 0.4,
    maxTokens: 400,
  });
}

function parseArgs(args: string): { query?: string } {
  try {
    const obj = JSON.parse(args) as { query?: unknown };
    return { query: typeof obj.query === "string" ? obj.query : undefined };
  } catch {
    return {};
  }
}
