import Link from "next/link";
import type { Project } from "@/lib/content";
import { Container } from "@/components/ui/container";
import { MetricsRow } from "@/components/home/metrics-row";
import { StatusTag } from "./status-tag";

const SECTIONS = [
  ["Problem", "problem"],
  ["Approach", "approach"],
  ["Trade-offs", "tradeoffs"],
  ["Outcome", "outcome"],
] as const;

// Long-form case study / lab page body.
export function ProjectDetail({ project }: { project: Project }) {
  const kindLabel = project.kind === "case-study" ? "case study" : "lab";

  return (
    <Container className="py-16 sm:py-24">
      <Link
        href="/#work"
        className="font-mono text-xs text-muted transition-colors hover:text-accent"
      >
        ← back to work
      </Link>

      <div className="mt-8 flex items-center justify-between gap-4">
        <span className="font-mono text-[11px] uppercase tracking-wide text-accent">
          {kindLabel}
          {project.year ? ` · ${project.year}` : ""}
        </span>
        <StatusTag status={project.status} />
      </div>

      <h1 className="chroma-text mt-3 font-display text-4xl uppercase tracking-tight sm:text-5xl">
        {project.title}
      </h1>
      <p className="mt-3 max-w-2xl text-lg leading-relaxed text-muted">
        {project.oneLiner}
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {project.tags.map((t) => (
          <span
            key={t}
            className="rounded border border-border px-2 py-0.5 font-mono text-[11px] text-muted"
          >
            {t}
          </span>
        ))}
      </div>

      {project.metrics?.length ? (
        <div className="mt-10">
          <MetricsRow metrics={project.metrics} />
        </div>
      ) : null}

      <div className="mt-12 flex flex-col gap-8">
        {SECTIONS.map(([label, key], i) => {
          const body = project[key];
          if (!body) return null;
          return (
            <div key={key} className="flex flex-col gap-2">
              <h2 className="flex items-baseline gap-2 font-mono text-xs uppercase tracking-wide text-muted">
                <span className="text-accent">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {label}
              </h2>
              <p className="max-w-2xl text-base leading-relaxed text-foreground">
                {body}
              </p>
            </div>
          );
        })}
      </div>
    </Container>
  );
}
