import type { Profile } from "@/lib/content/types";

// SINGLE SOURCE OF TRUTH — edit your details here only.
// Read everywhere via `getProfile()` from `@/lib/content`.
export const profile: Profile = {
  name: "Aniket Solanki",
  role: "Software Engineer II",
  tagline:
    "An engineer with a curious-kid streak. I like getting to the root of hard problems: what, why, and how.",
  intro:
    "I like getting under the surface of a problem, then turning that understanding into something that actually works.",
  location: "Bengaluru, India",
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
      label: "Email",
      href: "mailto:solankianiket0411@gmail.com",
      handle: "solankianiket0411@gmail.com",
    },
  ],
  headlineMetrics: [
    { value: "100×", label: "Kafka throughput", sub: "100 → 10,000 rec/min" },
    { value: "87%", label: "Latency cut", sub: "15s → 2s dashboard" },
    { value: "160M+", label: "Records processed", sub: "analytics pipeline" },
    { value: "100%", label: "Data integrity", sub: "on live traffic" },
  ],
};
