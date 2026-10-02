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
    // Built and running in this repo's assistant backend.
    category: "AI and LLM integration",
    items: [
      "OpenAI and Gemini APIs",
      "Local LLMs (Ollama)",
      "Tool calling and agent loops",
      "Guardrails (prompt injection, scope checks)",
      "Streaming responses",
      "Provider-agnostic LLM adapters",
      "Speech-to-text and text-to-speech",
      "AI-assisted development (Claude Code, Copilot)",
    ],
  },
  {
    // Studying, not yet built: listed separately on purpose.
    category: "AI, learning now",
    items: [
      "RAG (embeddings, pgvector, hybrid search)",
      "LangChain, LangGraph, LangSmith",
      "Claude and OpenAI Agents SDKs",
      "MCP",
      "LLM evals and tracing",
      "Prompt caching and model routing",
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
