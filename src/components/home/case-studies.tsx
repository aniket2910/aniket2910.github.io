import Link from "next/link";
import { getCaseStudies, type CaseStudy } from "@/lib/content";
import { Section } from "@/components/ui/section";
import { ScrollReveal } from "@/components/fx/scroll-reveal";

// The stack is the last part of the context line ("… · NestJS, Kafka").
const stackOf = (study: CaseStudy) => study.context.split(" · ").at(-1);

// Compact, scannable card: the full story lives on the case study page.
function CaseStudyCard({ study }: { study: CaseStudy }) {
  return (
    <Link
      href={`/case-studies/${study.slug}`}
      data-transition="THWIP!"
      data-press
      className="group flex h-full flex-col rounded-xl border border-border p-5 transition-colors hover:border-accent"
    >
      <p className="font-mono text-[11px] uppercase tracking-wide text-accent">
        {study.year ? `${study.year} · ` : ""}
        {stackOf(study)}
      </p>
      <h3 className="mt-3 font-display text-xl uppercase leading-tight tracking-tight text-foreground sm:text-2xl">
        {study.title}
      </h3>
      <dl className="mt-auto grid grid-cols-2 gap-4 pt-5">
        {study.metrics.slice(0, 2).map((m) => (
          <div key={m.label}>
            <dt className="font-mono text-lg text-foreground">{m.value}</dt>
            <dd className="text-[11px] leading-snug text-muted">{m.label}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-4 flex items-center justify-between gap-3 font-mono text-xs">
        {study.lab ? (
          <span className="rounded-full border border-accent/50 px-2.5 py-1 text-accent">
            ▶ simulator inside
          </span>
        ) : (
          <span />
        )}
        <span className="text-muted transition-colors group-hover:text-accent">
          Read →
        </span>
      </div>
    </Link>
  );
}

// Professional work, told as case studies with numbers and diagrams.
// Every study uses the same card; order (featured first) sets priority.
export function CaseStudies() {
  return (
    <Section index="01" title="Case studies" id="case-studies">
      <div className="grid gap-4 sm:grid-cols-2">
        {getCaseStudies().map((study) => (
          <ScrollReveal key={study.slug} className="h-full">
            <CaseStudyCard study={study} />
          </ScrollReveal>
        ))}
      </div>
    </Section>
  );
}
