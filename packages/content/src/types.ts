// Domain types for the portfolio's single source of truth.
// The content lives in `src/content/*`; everything is read through
// `src/lib/content` (never imported directly by UI components).

export type Social = {
  label: string;
  href: string;
  handle?: string;
};

export type Metric = {
  value: string; // e.g. "100×", "87%", "160M+"
  label: string; // e.g. "Kafka throughput"
  sub?: string; // optional context, e.g. "100 → 10,000 rec/min"
};

export type Profile = {
  name: string;
  role: string;
  tagline: string;
  // Hero statement, one short line per entry, plus the line that answers it.
  headline: string[];
  headlineNote: string;
  // Short, warm intro shown under the tagline in the hero.
  intro: string;
  location: string;
  summary: string;
  // Character-forward "about" paragraph, in Aniket's own voice.
  about: string;
  // Signature closing line (shown once, in the sign-off).
  signatureLine: { text: string; source?: string };
  // Optional portrait served from /public; a placeholder shows until it's set.
  photoUrl?: string;
  email: string;
  socials: Social[];
  headlineMetrics: Metric[];
  // "What I build" tiles shown under the hero.
  focusAreas: FocusArea[];
  // What I'm building right now.
  now: { intro: string; items: NowItem[] };
};

export type NowItem = {
  title: string;
  body: string;
  status: string; // short label, e.g. "live", "launching soon"
};

export type FocusArea = {
  title: string;
  body: string;
};

export type Experience = {
  company: string;
  title: string;
  period: string;
  location: string;
  scope?: string;
  highlights: string[];
};

export type ProjectKind = "case-study" | "lab";

// Changelog-style status so the site can read as a living engineering log.
export type ProjectStatus = "shipped" | "building" | "planned";

export type Project = {
  slug: string;
  kind: ProjectKind;
  title: string;
  oneLiner: string;
  status: ProjectStatus;
  featured: boolean;
  year?: string;
  tags: string[];
  metrics?: Metric[];
  // Long-form sections (kept optional so labs and case studies share one shape).
  problem?: string;
  approach?: string;
  tradeoffs?: string;
  outcome?: string;
};

// Work case study (professional work, as opposed to personal `Project`s).
// Shape: context → labelled points → flow diagram → key insight.
export type FlowStep = {
  title: string;
  sub?: string;
  tone?: "ok" | "bad"; // colours a step on the happy / failure path
};

export type FlowRow = {
  label?: string;
  steps: FlowStep[];
};

export type CaseStudy = {
  slug: string;
  title: string;
  oneLiner: string;
  // Role · team · stack line, e.g. "Pluralsight · SE II · NestJS, Kafka".
  context: string;
  year?: string;
  featured: boolean;
  tags: string[];
  metrics: Metric[];
  situation: string;
  // "Feature: what was done, and what it achieved."
  points: { label: string; body: string }[];
  flow: { title: string; rows: FlowRow[]; caption?: string };
  // Alternatives considered and why they lost.
  tradeoffs: { option: string; verdict: string }[];
  insight: string;
  nextTime?: string;
  // Slug of an interactive simulator for this case study, if any.
  lab?: string;
};

export type SkillGroup = {
  category: string;
  items: string[];
};
