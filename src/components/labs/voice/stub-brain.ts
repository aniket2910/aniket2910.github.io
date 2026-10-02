import { getProfile, getExperience, getSkills } from "@/lib/content";

// TEMPORARY local "brain" for the voice playground (Phase 1) — no API, no cost.
// It answers ONLY from Aniket's profile, and politely declines anything else,
// so the scope-limiting behaviour is visible before the real model exists.
// Phase 2 replaces this single function with a streamed call to a grounded LLM.
export function stubAnswer(question: string): string {
  const q = question.toLowerCase().trim();
  const p = getProfile();
  if (!q) {
    return "I didn't catch that. Ask me about my experience, my skills, or the kind of role I'm looking for.";
  }

  const has = (...keys: string[]) => keys.some((k) => q.includes(k));

  if (has("your name", "who are you", "introduce")) {
    return `I'm ${p.name}, a ${p.role} based in ${p.location}. ${p.intro}`;
  }
  if (has("experience", "worked", "work at", "job", "career", "pluralsight")) {
    return summarizeExperience();
  }
  if (has("skill", "tech", "stack", "language", "tools", "know")) {
    return summarizeSkills();
  }
  if (has("looking for", "next role", "seeking", "opportunit", "hiring", "fit")) {
    return `${p.about} I'm looking for a role where I can work on real engineering problems from the root and keep learning from strong people around me.`;
  }
  if (has("about you", "yourself", "mindset", "how do you think", "motivat")) {
    return p.about;
  }
  if (has("contact", "email", "reach", "get in touch")) {
    return `The best way to reach me is email: ${p.email}.`;
  }

  // Out-of-scope — honest, polite decline (the guardrail, demonstrated early).
  return "That's a little outside what I can speak to here. I'm happy to talk about my engineering experience, my skills, the problems I've solved, or the kind of role I'm looking for.";
}

function summarizeExperience(): string {
  const latest = getExperience()[0];
  const first = latest.highlights[0].split(";")[0];
  const lead = first.charAt(0).toLowerCase() + first.slice(1);
  return `I have 3.5 plus years of full-stack experience. Right now I'm a ${latest.title} at ${latest.company}, ${latest.period}, where ${lead}.`;
}

function summarizeSkills(): string {
  const parts = getSkills()
    .slice(0, 4)
    .map((g) => `${g.category.toLowerCase()} such as ${g.items.slice(0, 3).join(", ")}`);
  return `My core stack spans ${parts.join("; ")}. I work full-stack, front to back.`;
}
