import { getExperience } from "@/lib/content";
import { Section } from "@/components/ui/section";
import { ScrollReveal } from "@/components/fx/scroll-reveal";

// Experience as an animated vertical timeline (§21): node + drawing connector,
// each role card revealing as it scrolls into view.
export function ExperienceList() {
  const experience = getExperience();
  const last = experience.length - 1;

  return (
    <Section index="02" title="Experience">
      <div className="flex flex-col">
        {experience.map((job, i) => (
          <div key={`${job.title}-${job.period}`} className="flex gap-4">
            <div className="flex flex-col items-center">
              <span className="mt-1.5 h-3 w-3 shrink-0 rounded-full border-2 border-accent bg-background" />
              {i < last ? (
                <ScrollReveal
                  variant="draw"
                  className="mt-1 w-px flex-1 bg-border"
                />
              ) : null}
            </div>

            <ScrollReveal delay={i * 80} className="flex-1 pb-10">
              <article className="flex flex-col gap-3">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="text-lg font-medium tracking-tight">
                    {job.title}
                    <span className="text-muted"> · {job.company}</span>
                  </h3>
                  <span className="font-mono text-xs text-muted">
                    {job.period}
                  </span>
                </div>
                {job.scope ? (
                  <p className="font-mono text-xs text-accent">{job.scope}</p>
                ) : null}
                <ul className="flex flex-col gap-2">
                  {job.highlights.map((h) => (
                    <li
                      key={h}
                      className="relative pl-4 text-sm leading-relaxed text-muted before:absolute before:left-0 before:top-2.5 before:h-1 before:w-1 before:rounded-full before:bg-accent/60"
                    >
                      {h}
                    </li>
                  ))}
                </ul>
              </article>
            </ScrollReveal>
          </div>
        ))}
      </div>
    </Section>
  );
}
