// AGENT TOOLS — the functions the LLM can call to fetch grounded facts. These
// are the agent's ONLY window onto Aniket's data; the model is told to answer
// from tool results, never from memory.
//
// Today each tool returns its whole grounded slice from `src/content/*` (tiny
// corpus → context-stuffing wins). This is the RAG seam: when the knowledge
// base grows, a tool's `run` swaps to vector/keyword retrieval over `query`
// WITHOUT changing the agent loop, the tool's signature, or the orchestrator.

import {
  experienceContext,
  profileContext,
  projectsContext,
  skillsContext,
} from "./context";
import type { ToolSpec } from "../llm";

export interface AgentTool {
  spec: ToolSpec;
  // Returns grounded text for the given args. Async so a future retrieval /
  // embedding lookup (I/O) drops in without touching callers.
  run: (args: { query?: string }) => Promise<string> | string;
}

const queryParam: ToolSpec["parameters"] = {
  type: "object",
  properties: {
    query: {
      type: "string",
      description: "The specific thing to look up, in a few words.",
    },
  },
  required: ["query"],
};

export const TOOLS: AgentTool[] = [
  {
    spec: {
      name: "search_experience",
      description:
        "Aniket's work history: employers, roles, seniority, tenure, and " +
        "measurable on-the-job impact. Use for questions about his jobs/career.",
      parameters: queryParam,
    },
    run: () => experienceContext(),
  },
  {
    spec: {
      name: "search_projects",
      description:
        "Aniket's personal projects, case studies, and labs — problem, " +
        "approach, trade-offs, outcomes. Use for questions about what he built.",
      parameters: queryParam,
    },
    run: () => projectsContext(),
  },
  {
    spec: {
      name: "search_skills",
      description:
        "Aniket's technical skills: languages, frameworks, tools, and depth " +
        "areas. Use for questions about technologies he knows.",
      parameters: queryParam,
    },
    run: () => skillsContext(),
  },
  {
    spec: {
      name: "search_profile",
      description:
        "Who Aniket is: background, mindset, location, the role he wants, " +
        "headline metrics, and contact info. Use for 'about him' questions.",
      parameters: queryParam,
    },
    run: () => profileContext(),
  },
];

export function toolSpecs(): ToolSpec[] {
  return TOOLS.map((t) => t.spec);
}

// Runs a tool by the name the model emitted; returns a clear miss so the model
// can recover rather than hallucinate if it invents a tool name.
export async function runTool(name: string, args: { query?: string }): Promise<string> {
  const tool = TOOLS.find((t) => t.spec.name === name);
  if (!tool) return `No tool named "${name}".`;
  return tool.run(args);
}
