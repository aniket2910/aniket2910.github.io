import Link from "next/link";
import type { CaseStudy } from "@/lib/content";
import { MetricsRow } from "@/components/home/metrics-row";

// Top of a case study: context line, title, one-liner, tags and the numbers.
export function CaseStudyHeader({ study }: { study: CaseStudy }) {
  return (
    <header className="flex flex-col gap-4">
      <Link
        href="/#case-studies"
        className="font-mono text-xs text-muted transition-colors hover:text-accent"
      >
        ← back to case studies
      </Link>
      <p className="mt-4 font-mono text-[11px] uppercase tracking-wide text-accent">
        case study{study.year ? ` · ${study.year}` : ""}
      </p>
      <h1 className="chroma-text font-display text-4xl uppercase tracking-tight sm:text-5xl">
        {study.title}
      </h1>
      <p className="max-w-2xl text-lg leading-relaxed text-muted">{study.oneLiner}</p>
      <p className="font-mono text-xs text-foreground/80">{study.context}</p>
      <div className="flex flex-wrap gap-2">
        {study.tags.map((t) => (
          <span
            key={t}
            className="rounded border border-border px-2 py-0.5 font-mono text-[11px] text-muted"
          >
            {t}
          </span>
        ))}
      </div>
      <div className="mt-6">
        <MetricsRow metrics={study.metrics} />
      </div>
    </header>
  );
}
