import { getProfile } from "@/lib/content";
import { Container } from "@/components/ui/container";
import { ScrollReveal } from "@/components/fx/scroll-reveal";

// "What I build": four tiles that position the work in a few seconds.
export function FocusAreas() {
  const { focusAreas } = getProfile();

  return (
    <Container className="pb-16 sm:pb-24">
      <p className="mb-4 font-mono text-xs uppercase tracking-wide text-muted">
        What I build
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {focusAreas.map((area, i) => (
          <ScrollReveal key={area.title} delay={i * 60}>
            <div className="h-full rounded-lg border border-border p-4">
              <h3 className="font-mono text-xs uppercase tracking-wide text-accent">
                <span className="text-muted">{String(i + 1).padStart(2, "0")} </span>
                {area.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{area.body}</p>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </Container>
  );
}
