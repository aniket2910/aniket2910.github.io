import type { SkillGroup } from "../types";

// SINGLE SOURCE OF TRUTH — skills. Read via `getSkills()`.
export const skills: SkillGroup[] = [
  { category: "Languages", items: ["TypeScript", "JavaScript (ES6+)", "SQL"] },
  {
    category: "Frontend",
    items: ["React", "Next.js", "Redux Saga", "Component-Driven UI"],
  },
  {
    category: "Backend",
    items: [
      "Node.js",
      "Express.js",
      "NestJS",
      "REST APIs",
      "Event-driven systems",
      "Caching",
      "Concurrency",
    ],
  },
  {
    category: "Architecture",
    items: [
      "Microservices",
      "Event-driven architecture",
      "System design (HLD/LLD)",
      "Design patterns",
    ],
  },
  {
    category: "Data & Storage",
    items: ["PostgreSQL", "Kafka", "Redis", "Snowflake", "TypeORM", "Data modeling"],
  },
  {
    category: "Cloud & DevOps",
    items: [
      "AWS (S3, EC2, Lambda, EKS)",
      "Docker",
      "Kubernetes",
      "Git",
      "GitLab CI/CD",
      "Grafana",
      "New Relic",
    ],
  },
  {
    category: "Testing",
    items: ["Jest", "Supertest", "Cypress", "Integration & E2E testing"],
  },
];
