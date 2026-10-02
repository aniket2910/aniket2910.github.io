import { getProfile } from "@/lib/content";
import { Section } from "@/components/ui/section";
import { ScrollReveal } from "@/components/fx/scroll-reveal";

// What I'm building right now: keeps the page current between roles.
export function Now() {
  const { now } = getProfile();

  return (
    <Section index="03" title="Now" id="now">
      <p className="mb-6 max-w-xl text-base leading-relaxed text-foreground">
        {now.intro}
      </p>
      <div className="flex flex-col gap-3">
        {now.items.map((item, i) => (
          <ScrollReveal key={item.title} delay={i * 60}>
            <div className="rounded-lg border border-border p-4">
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="font-medium text-foreground">{item.title}</h3>
                <span className="shrink-0 font-mono text-[11px] uppercase tracking-wide text-accent">
                  {item.status}
                </span>
              </div>
              <p className="mt-1 text-sm leading-relaxed text-muted">{item.body}</p>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </Section>
  );
}
