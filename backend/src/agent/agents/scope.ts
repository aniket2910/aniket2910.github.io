// SCOPE-GATE AGENT — a fast, constrained classifier that decides whether a
// message is in scope BEFORE the answer loop runs. Decoupling "is this about
// Aniket?" from "which tool answers it?" is what makes scope reliable on a weak
// local model: asking a 3B model to self-censor mid-answer fails, but a
// one-word RELEVANT/UNRELATED judgement is accurate (validated on qwen2.5:3b).

import { getLlm } from "../llm";

const SCOPE_SYSTEM = [
  "You classify messages for a portfolio assistant that speaks AS Aniket",
  'Solanki, a software engineer. So "you"/"your" refer to Aniket. Reply with',
  "EXACTLY one word.",
  "RELEVANT = anything about Aniket: his work, jobs, experience, skills,",
  "technologies he knows, projects, background, the role he wants, or contact.",
  'This includes short questions like "Do you know Kafka?" or "Where have you',
  'worked?".',
  "UNRELATED = general world knowledge, coding help, math, current events,",
  "politics, or personal/sensitive topics not about his career.",
  'Examples: "Where have you worked?"->RELEVANT | "Do you know React?"->RELEVANT',
  '| "Do you know Kafka?"->RELEVANT | "What is the capital of France?"',
  '->UNRELATED | "Write a Python function"->UNRELATED',
].join("\n");

// Recruiter phrasings that probe the person's own knowledge/experience are
// ALWAYS in scope, and are exactly the ambiguous cases a 3B classifier flip-
// flops on ("Do you know Kafka?"). Match them deterministically for reliable
// recall; note these are knowledge PROBES, not imperative requests ("write
// me…"), so off-topic tasks don't slip through.
const IN_SCOPE_HINT =
  /\b(do|did|have) you (know|use[d]?|work(ed)? with|built?|written|made)\b|\bare you familiar\b|\byour experience (with|in)\b|\bworked? (with|on|at)\b/i;

// Returns true when the message is about Aniket. Ambiguous/garbled classifier
// output leans true (proceed) — the answer path still speaks only from grounded
// data, so a rare misclassification can't produce an ungrounded answer.
export async function classifyInScope(userText: string): Promise<boolean> {
  if (IN_SCOPE_HINT.test(userText)) return true;
  const res = await getLlm().complete({
    messages: [
      { role: "system", content: SCOPE_SYSTEM },
      { role: "user", content: userText },
    ],
    temperature: 0,
    maxTokens: 3,
  });
  return !res.content.toUpperCase().includes("UNRELATED");
}
