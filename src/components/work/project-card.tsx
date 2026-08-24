import Link from "next/link";
import type { Project } from "@/lib/content";
import { StatusTag } from "./status-tag";

// One entry in the work log — reads like a changelog row, links to detail.
export function ProjectCard({ project }: { project: Project }) {
  const kindLabel = project.kind === "case-study" ? "case study" : "lab";

  return (
    <Link
      href={`/work/${project.slug}`}
      data-transition="THWIP!"
      className="project-card halftone-surface block px-5 py-5"
    >
      <div className="flex items-center justify-between gap-4">
        <span className="font-mono text-[11px] uppercase tracking-wide text-accent">
          {kindLabel}
          {project.year ? ` · ${project.year}` : ""}
        </span>
        <StatusTag status={project.status} />
      </div>

      <h3 className="mt-2 text-lg font-medium tracking-tight text-foreground">
        {project.title}
      </h3>
      <p className="mt-1 max-w-xl text-sm leading-relaxed text-muted">
        {project.oneLiner}
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        {project.tags.map((t) => (
          <span
            key={t}
            className="rounded border border-border px-2 py-0.5 font-mono text-[11px] text-muted"
          >
            {t}
          </span>
        ))}
      </div>
    </Link>
  );
}
