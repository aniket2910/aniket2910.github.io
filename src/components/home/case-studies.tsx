import Link from "next/link";
import { getCaseStudies, type CaseStudy } from "@/lib/content";
import { Section } from "@/components/ui/section";
import { ScrollReveal } from "@/components/fx/scroll-reveal";

function CaseStudyCard({ study }: { study: CaseStudy }) {
  return (
    <Link
      href={`/case-studies/${study.slug}`}
      data-transition="THWIP!"
      data-press
      className="group block rounded-xl border border-border p-5 transition-colors hover:border-accent sm:p-6"
    >
      <p className="font-mono text-[11px] uppercase tracking-wide text-accent">
        {study.context}
      </p>
      <h3 className="mt-3 font-display text-2xl uppercase tracking-tight text-foreground sm:text-3xl">
        {study.title}
      </h3>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">{study.oneLiner}</p>
      <dl className="mt-5 grid grid-cols-3 gap-4">
        {study.metrics.slice(0, 3).map((m) => (
          <div key={m.label}>
            <dt className="font-mono text-xl text-foreground">{m.value}</dt>
            <dd className="text-[11px] leading-snug text-muted">{m.label}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-5 flex flex-wrap items-center gap-3 font-mono text-xs">
        {study.lab ? (
          <span className="rounded-full border border-accent/50 px-2.5 py-1 text-accent">
            ▶ interactive simulator inside
          </span>
        ) : null}
        <span className="text-muted transition-colors group-hover:text-accent">
          Read the case study →
        </span>
      </div>
    </Link>
  );
}

// Secondary case studies: one line each, so the featured three lead.
function CaseStudyRow({ study }: { study: CaseStudy }) {
  const [lead] = study.metrics;
  return (
    <Link
      href={`/case-studies/${study.slug}`}
      data-transition="THWIP!"
      className="group flex items-baseline justify-between gap-4 border-t border-border py-4"
    >
      <span className="flex flex-col gap-1">
        <span className="font-medium text-foreground transition-colors group-hover:text-accent">
          {study.title}
        </span>
        <span className="text-sm text-muted">{study.oneLiner}</span>
      </span>
      {lead ? (
        <span className="shrink-0 text-right font-mono text-sm text-foreground">
          {lead.value}
          <span className="block text-[11px] text-muted">{lead.label}</span>
        </span>
      ) : null}
    </Link>
  );
}

// Professional work, told as case studies with numbers and diagrams.
export function CaseStudies() {
  const studies = getCaseStudies();
  const featured = studies.filter((s) => s.featured);
  const more = studies.filter((s) => !s.featured);

  return (
    <Section index="01" title="Case studies" id="case-studies">
      <div className="flex flex-col gap-4">
        {featured.map((study) => (
          <ScrollReveal key={study.slug}>
            <CaseStudyCard study={study} />
          </ScrollReveal>
        ))}
      </div>
      {more.length ? (
        <div className="mt-8">
          {more.map((study) => (
            <CaseStudyRow key={study.slug} study={study} />
          ))}
        </div>
      ) : null}
    </Section>
  );
}
