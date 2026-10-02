// GROUNDING SLICES — turns the single source of truth (`src/content/*`, read
// through `@portfolio/content`) into focused text blocks, one per specialist agent.
// Each agent only ever sees its own slice, so it can't drift outside its lane
// and the model stays cheap. This is the ONLY data the assistant may use.

import {
  getProfile,
  getExperience,
  getSkills,
  getProjects,
} from "@portfolio/content";

export function profileContext(): string {
  const p = getProfile();
  const metrics = p.headlineMetrics
    .map((m) => `- ${m.value} ${m.label}${m.sub ? ` (${m.sub})` : ""}`)
    .join("\n");
  return [
    `NAME: ${p.name}`,
    `ROLE: ${p.role}`,
    `LOCATION: ${p.location}`,
    `TAGLINE: ${p.tagline}`,
    `SUMMARY: ${p.summary}`,
    `ABOUT / MINDSET / WHAT HE WANTS: ${p.about}`,
    `EMAIL: ${p.email}`,
    `LINKS: ${p.socials.map((s) => `${s.label} ${s.handle ?? s.href}`).join(", ")}`,
    `HEADLINE METRICS:\n${metrics}`,
  ].join("\n");
}

export function experienceContext(): string {
  return getExperience()
    .map((e) => {
      const head = `${e.title}, ${e.company} — ${e.period} (${e.location})`;
      const scope = e.scope ? `\n  Scope: ${e.scope}` : "";
      const hi = e.highlights.map((h) => `\n  • ${h}`).join("");
      return `${head}${scope}${hi}`;
    })
    .join("\n\n");
}

export function skillsContext(): string {
  return getSkills()
    .map((g) => `${g.category}: ${g.items.join(", ")}`)
    .join("\n");
}

// Everything in one block — the grounded fallback when the model is asked an
// in-scope question but misroutes its tool calls; safe because the scope gate
// already judged the question relevant.
export function fullContext(): string {
  return [
    `## PROFILE\n${profileContext()}`,
    `## EXPERIENCE\n${experienceContext()}`,
    `## SKILLS\n${skillsContext()}`,
    `## PROJECTS\n${projectsContext()}`,
  ].join("\n\n");
}

export function projectsContext(): string {
  return getProjects()
    .map((pr) => {
      const parts = [
        `${pr.title} [${pr.kind}, ${pr.status}${pr.year ? `, ${pr.year}` : ""}]`,
        `  ${pr.oneLiner}`,
        pr.tags.length ? `  Tags: ${pr.tags.join(", ")}` : "",
        pr.problem ? `  Problem: ${pr.problem}` : "",
        pr.approach ? `  Approach: ${pr.approach}` : "",
        pr.tradeoffs ? `  Trade-offs: ${pr.tradeoffs}` : "",
        pr.outcome ? `  Outcome: ${pr.outcome}` : "",
        pr.metrics?.length
          ? `  Metrics: ${pr.metrics.map((m) => `${m.value} ${m.label}`).join("; ")}`
          : "",
      ].filter(Boolean);
      return parts.join("\n");
    })
    .join("\n\n");
}
