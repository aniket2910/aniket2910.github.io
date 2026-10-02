import type { Experience } from "../types";

// SINGLE SOURCE OF TRUTH — work history. Read via `getExperience()`.
export const experience: Experience[] = [
  {
    company: "Pluralsight India Pvt. Ltd",
    title: "Software Engineer II",
    period: "Dec 2024 – Apr 2026",
    location: "Bengaluru",
    scope: "Curriculum Tool & Author Tool",
    highlights: [
      "Built a fault-tolerant batch job aggregating live Kafka data from 7+ upstream teams into a single reporting table; per-record failure isolation keeps one bad record from failing the batch, holding 100% data integrity on live traffic without vertical scaling.",
      "Resolved a high-priority Kafka consumer bug causing incorrect viewership data in the Author Tool, and hardened the pipeline against upstream null values to prevent recurring data-integrity issues.",
      "Migrated the content-editing surface from Context API to Redux, with slice-level useSelector subscriptions cutting unnecessary re-renders ~40% and Redux Saga giving async data-fetching one predictable owner.",
      "Cut initial page render from ~20s to ~3s (85%) by diagnosing SSR and bundle bottlenecks with Lighthouse and bundle analysis, then applying route-level code splitting, dynamic imports, and Webpack chunk optimization.",
      "Added opt-in server-side pagination to the shared design-system Table component, removing its client-side data ceiling while keeping the composable, accessible API; documented in the component library and adopted by 15+ teams.",
      "Acted as tech lead for a 3-engineer team across 4 sprints, running planning and standups, clearing P1/P2 blockers, and keeping delivery on schedule while still shipping my own work.",
      "Partnered with an internal AI team and curriculum managers to define requirements for, and integrate, an LLM-based content-categorization tool into the curriculum portal, replacing manual spreadsheet tag-mapping.",
    ],
  },
  {
    company: "Pluralsight India Pvt. Ltd",
    title: "Software Engineer I",
    period: "Oct 2022 – Dec 2024",
    location: "Bengaluru",
    scope: "Curriculum Tool",
    highlights: [
      "Built the enrichment stage of the \"Top 10 Courses\" analytics pipeline: drained a 160M+ record Kafka-fed backlog at ~10,000 records/min with resumable flag-based paging and bounded batches, clearing recurring on-call memory alerts.",
      "Cut a key dashboard's response time from 15s to 2s (87%) by replacing a heavy materialized view with scheduled pre-aggregated tables, and streamlining state and rendering on the frontend.",
      "Built a custom React/Node control panel to dynamically manage background cron jobs, eliminating pod restarts and YAML deploys for job toggling.",
      "Led org-wide Cypress E2E testing sessions that drove adoption across 10+ teams, and authored the testing documentation they standardized on.",
      "Prototyped an internal tool in Figma, pitched it to leadership, then mentored an intern through building it end to end, contributing to their full-time conversion.",
    ],
  },
];
