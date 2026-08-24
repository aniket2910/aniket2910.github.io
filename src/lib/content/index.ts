// DATA-ACCESS LAYER — the only place the app reads content from.
//
// UI components MUST import from `@/lib/content`, never from `@/content/*`.
// Today the source is typed files; to move to a database later, reimplement
// these functions (e.g. async DB queries) and nothing else has to change.
import { profile } from "@/content/profile";
import { experience } from "@/content/experience";
import { projects } from "@/content/projects";
import { skills } from "@/content/skills";
import type {
  Experience,
  Profile,
  Project,
  ProjectKind,
  SkillGroup,
} from "./types";

export function getProfile(): Profile {
  return profile;
}

export function getExperience(): Experience[] {
  return experience;
}

export function getSkills(): SkillGroup[] {
  return skills;
}

export function getProjects(filter?: {
  kind?: ProjectKind;
  featured?: boolean;
}): Project[] {
  return projects.filter((p) => {
    if (filter?.kind && p.kind !== filter.kind) return false;
    if (filter?.featured !== undefined && p.featured !== filter.featured)
      return false;
    return true;
  });
}

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

export function getProjectSlugs(): string[] {
  return projects.map((p) => p.slug);
}

export type {
  Experience,
  Metric,
  Profile,
  Project,
  ProjectKind,
  ProjectStatus,
  SkillGroup,
  Social,
} from "./types";
