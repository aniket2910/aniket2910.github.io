import type { Profile } from "../types";

// SINGLE SOURCE OF TRUTH — edit your details here only.
// Read everywhere via `getProfile()` from `@/lib/content`.
// The what / why / how questions I start every problem with. The case
// studies are the answers.
const headline = [
  "Why does it break?",
  "How will it scale?",
  "What does the business need?",
];
const headlineNote =
  "I start with those questions, then build. AI speeds up the work; the decisions stay mine.";

export const profile: Profile = {
  name: "Aniket Solanki",
  role: "Full-stack engineer",
  formerly: "ex-Pluralsight",
  tagline: `${headline.join(" ")} ${headlineNote}`,
  headline,
  headlineNote,
  location: "Bengaluru",
  summary:
    "Software engineer with 3.5+ years shipping full-stack products end to end. React and TypeScript on the front, Node.js and event-driven services on the back. I like owning a feature from an empty screen to the pixels a user touches, and I care just as much about the system underneath it.",
  about:
    "What pulls me in is the problem itself. I want to understand real engineering problems from the root, work them out with the skills I have, and contribute something valuable while learning from the people around me. That curiosity, more than anything, is what drives how I work.",
  signatureLine: {
    text: "That's all it is. A leap of faith.",
    source: "Spider-Man: Into the Spider-Verse",
  },
  photoUrl: "/portrait-comic-cutout.png",
  email: "solankianiket0411@gmail.com",
  socials: [
    {
      label: "GitHub",
      href: "https://github.com/aniket2910",
      handle: "aniket2910",
    },
    {
      label: "LinkedIn",
      href: "https://www.linkedin.com/in/solanki-aniket0411",
      handle: "solanki-aniket0411",
    },
    {
      label: "LeetCode",
      href: "https://leetcode.com/u/solankianiket0411/",
      handle: "solankianiket0411",
    },
    {
      label: "Email",
      href: "mailto:solankianiket0411@gmail.com",
      handle: "solankianiket0411@gmail.com",
    },
  ],
  headlineMetrics: [
    { value: "160M+", label: "Records drained", sub: "~10K rec/min, flat memory" },
    { value: "87%", label: "Dashboard latency cut", sub: "15s → 2s" },
    { value: "15+", label: "Teams on my Table pagination", sub: "shared design system" },
    { value: "85%", label: "Faster first load", sub: "~20s → ~3s" },
  ],
  now: {
    intro:
      "Since April 2026 I've been building full time, and going deeper on the AI stack.",
    items: [
      {
        title: "Minimally",
        body: "A privacy-first personal finance tracker. Data lives on the device by default; cloud backup is end-to-end encrypted, so the server only ever stores ciphertext. React, IndexedDB, NestJS, PostgreSQL.",
        status: "launching soon",
      },
      {
        title: "A local AI assistant",
        body: "An agent loop with tool calling, a prompt-injection guard and a scope check, running on local models. Next: RAG, LangGraph and evals.",
        status: "building",
      },
    ],
  },
};
