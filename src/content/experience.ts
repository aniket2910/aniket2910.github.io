import type { Experience } from "@/lib/content/types";

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
      "Migrated state management from Context API to Redux Saga, cutting unnecessary re-renders 40% and making data-fetching predictable across the app.",
      "Acted as tech lead for a 3-engineer team across 4 sprints, running planning and standups, clearing P1/P2 blockers, and keeping delivery on schedule while still shipping my own work.",
      "Designed a dual-credential, least-privilege access strategy (separate scoped connections per schema) that kept cross-team data flowing after an org-wide security policy locked down direct schema access.",
      "Built a feature-flagged self-service onboarding portal (React/Node) that replaced manual ops and back-and-forth Slack coordination.",
      "Strengthened production observability with New Relic, Grafana dashboards, OpsGenie incident workflows, and structured logging.",
    ],
  },
  {
    company: "Pluralsight India Pvt. Ltd",
    title: "Software Engineer I",
    period: "Oct 2022 – Dec 2024",
    location: "Bengaluru",
    scope: "Curriculum Tool",
    highlights: [
      "Built the \"Top 10 Courses\" analytics pipeline on Kafka (160M+ records), scaling processing throughput 100× (100 → 10,000 rec/min) and clearing recurring on-call memory alerts.",
      "Cut a key dashboard's response time from 15s to 2s (87%) by replacing a heavy materialized view with scheduled pre-aggregated tables, and streamlining state and rendering on the frontend.",
      "Built a custom React/Node control panel to dynamically manage background cron jobs, eliminating pod restarts and YAML deploys for job toggling.",
      "Built the Content Freshness Workflow, an interactive, accessible UI visualizing content-categorization signals and top-viewed courses.",
      "Led org-wide Cypress E2E testing sessions that drove adoption across 10+ teams, and authored the testing documentation they standardized on.",
      "Prototyped an internal tool in Figma, pitched it to leadership, then mentored an intern through building it end to end, contributing to their full-time conversion.",
    ],
  },
];
