import type { Project } from "../types";

// SINGLE SOURCE OF TRUTH — personal projects (interactive systems labs and
// self-built work). Pluralsight work lives under Experience, not here.
// Read via `getProjects()` / `getProject(slug)`.
//
// `kind: "lab"` = a canonical systems problem built as an interactive teaching
// artifact. Add new personal projects here — the UI renders whatever is present.
export const projects: Project[] = [
  {
    slug: "rate-limiter",
    kind: "lab",
    title: "Rate limiter, visualized",
    oneLiner:
      "Token bucket vs sliding window vs fixed window. Tune the parameters live and watch where each one breaks.",
    status: "building",
    featured: true,
    tags: ["Systems", "Concurrency", "Visualization", "API design"],
    problem:
      "Rate limiting is everywhere in fintech and dev-tools, but the trade-offs between algorithms are usually explained in prose. This makes them tangible.",
    approach:
      "An interactive canvas that simulates request bursts against each algorithm with live, tunable parameters.",
  },
  {
    slug: "idempotency-keys",
    kind: "lab",
    title: "Idempotency keys & exactly-once",
    oneLiner:
      "How payment systems make a retried request safe, visualized end to end.",
    status: "building",
    featured: false,
    tags: ["Systems", "Payments", "Reliability"],
  },
  {
    slug: "lru-cache",
    kind: "lab",
    title: "LRU / LFU cache with TTL",
    oneLiner:
      "Eviction policies you can watch: what stays, what gets dropped, and why.",
    status: "building",
    featured: false,
    tags: ["Systems", "Caching", "Data structures"],
  },
];
