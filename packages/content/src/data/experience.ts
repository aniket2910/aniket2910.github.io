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
      "Built fault-tolerant Kafka batch processing for 7+ upstream teams: poison-record isolation, 100% data integrity on live traffic.",
      "Cut first load from ~20s to ~3s and form re-renders by ~40% with code splitting and slice-level Redux subscriptions.",
      "Acting tech lead for 3 engineers over 4 sprints; shipped server-side Table pagination adopted by 15+ teams.",
    ],
  },
  {
    company: "Pluralsight India Pvt. Ltd",
    title: "Software Engineer I",
    period: "Oct 2022 – Dec 2024",
    location: "Bengaluru",
    scope: "Curriculum Tool",
    highlights: [
      "Drained a 160M+ record Kafka-fed backlog at ~10K records/min with flat memory and resumable paging.",
      "Cut a key dashboard from 15s to 2s by moving heavy aggregation off the request path.",
      "Drove org-wide Cypress adoption across 10+ teams, and mentored an intern whose project helped earn a full-time offer.",
    ],
  },
];
