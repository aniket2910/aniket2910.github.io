// INPUT GUARDRAIL — a cheap, deterministic pre-check that runs BEFORE any model
// call. It catches prompt-injection / jailbreak attempts and empty input, and
// short-circuits with a fixed refusal so we never spend tokens (or risk the
// model complying) on them. Scope enforcement for merely off-topic questions
// (general knowledge, coding help, personal/political) is handled downstream by
// the agents' system prompts, which are instructed to decline and redirect.

export interface GuardrailResult {
  ok: boolean;
  message?: string; // set when ok === false: the exact reply to send back
}

// Phrases that signal an attempt to override the assistant's instructions or
// extract its prompt. Matched case-insensitively as substrings.
const INJECTION_PATTERNS: RegExp[] = [
  /ignore (all|any|the|your|previous|prior)/i,
  /disregard (all|any|the|your|previous|prior)/i,
  /forget (all|your|the|previous|everything)/i,
  /system prompt/i,
  /\byour (instructions|prompt|rules|guidelines)\b/i,
  /reveal|repeat back|print|show me (your|the) (prompt|instructions|system)/i,
  /you are now|from now on you are|act as|pretend to be|role[- ]?play as/i,
  /developer mode|jailbreak|DAN\b/i,
  /override (your|the|all)/i,
];

const REFUSAL =
  "I'm just here to talk about Aniket's work — his experience, skills, and " +
  "projects. Ask me anything about that and I'm happy to help.";

export function checkGuardrail(userText: string): GuardrailResult {
  const text = (userText || "").trim();
  if (!text) {
    return {
      ok: false,
      message: "Ask me something about Aniket's work and I'll answer.",
    };
  }
  for (const re of INJECTION_PATTERNS) {
    if (re.test(text)) return { ok: false, message: REFUSAL };
  }
  return { ok: true };
}

// Deterministic reply for a bare greeting / thanks, so trivial small talk gets a
// friendly answer without spending a model call — and, more importantly, so the
// orchestrator can force a tool call on everything else without declining "hi".
// Returns null when the message is anything more than a greeting.
const GREETING_RE = /^(hi|hey|hello|yo|howdy|greetings|good (morning|afternoon|evening)|thanks|thank you|thx|ok|okay|cool|nice)[\s!.]*$/i;

export function smalltalkReply(userText: string): string | null {
  if (!GREETING_RE.test((userText || "").trim())) return null;
  return "Hi! I'm Aniket's portfolio assistant — ask me about his experience, skills, or projects.";
}
