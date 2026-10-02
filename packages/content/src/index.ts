// DATA-ACCESS LAYER — the only place the app reads content from.
//
// UI components MUST import from `@/lib/content`, never from `./data/*`.
// Today the source is typed files; to move to a database later, reimplement
// these functions (e.g. async DB queries) and nothing else has to change.
import { profile } from "./data/profile";
import { experience } from "./data/experience";
import { projects } from "./data/projects";
import { skills } from "./data/skills";
import { caseStudies } from "./data/case-studies";
import type {
  CaseStudy,
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

// Professional work case studies, featured first.
export function getCaseStudies(): CaseStudy[] {
  return [...caseStudies].sort(
    (a, b) => Number(b.featured) - Number(a.featured),
  );
}

export function getCaseStudy(slug: string): CaseStudy | undefined {
  return caseStudies.find((c) => c.slug === slug);
}

export function getCaseStudySlugs(): string[] {
  return caseStudies.map((c) => c.slug);
}

export type {
  CaseStudy,
  Experience,
  FlowRow,
  FlowStep,
  FocusArea,
  Metric,
  NowItem,
  Profile,
  Project,
  ProjectKind,
  ProjectStatus,
  SkillGroup,
  Social,
} from "./types";
