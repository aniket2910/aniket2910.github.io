import { getProfile } from "@/lib/content";
import { Container } from "@/components/ui/container";
import { Portrait } from "./portrait";
import { MetricsRow } from "./metrics-row";

// Landing: warm, confident, credible. Elements enter in a staggered sequence.
export function Hero() {
  const { name, role, tagline, intro, location, headlineMetrics } =
    getProfile();

  return (
    <Container className="py-16 sm:py-24">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
          <div className="animate-rise">
            <Portrait />
          </div>
          <div className="flex flex-col gap-2">
            <p
              className="animate-rise font-mono text-xs uppercase tracking-wide text-accent"
              style={{ animationDelay: "100ms" }}
            >
              {role} · {location}
            </p>
            <h1
              className="chroma-text animate-rise font-display text-4xl uppercase tracking-tight sm:text-6xl"
              style={{ animationDelay: "200ms" }}
            >
              {name}
            </h1>
            <p
              className="animate-rise max-w-lg text-lg font-medium leading-snug text-foreground sm:text-xl"
              style={{ animationDelay: "320ms" }}
            >
              {tagline}
            </p>
          </div>
        </div>

        <p
          className="animate-rise max-w-xl text-base leading-relaxed text-muted"
          style={{ animationDelay: "440ms" }}
        >
          {intro}
        </p>

        <div
          className="animate-rise flex flex-wrap gap-3"
          style={{ animationDelay: "560ms" }}
        >
          <a
            href="#case-studies"
            data-press
            className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90"
          >
            Read case studies
          </a>
          <a
            href="#work"
            data-press
            className="rounded-md border border-border px-4 py-2 text-sm font-medium transition-colors hover:border-accent hover:text-accent"
          >
            Projects
          </a>
        </div>

        <div className="animate-rise pt-4" style={{ animationDelay: "680ms" }}>
          <MetricsRow metrics={headlineMetrics} />
        </div>
      </div>
    </Container>
  );
}
