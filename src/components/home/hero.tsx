import { getProfile } from "@/lib/content";
import { Container } from "@/components/ui/container";
import { Portrait } from "./portrait";
import { MetricsRow } from "./metrics-row";

// Landing: warm, confident, credible. Elements enter in a staggered sequence.
export function Hero() {
  const { name, role, formerly, headline, headlineNote, location, headlineMetrics } =
    getProfile();
  const eyebrow = [role, formerly, location].filter(Boolean).join(" · ");

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
              {eyebrow}
            </p>
            <h1
              className="chroma-text animate-rise font-display text-4xl uppercase tracking-tight sm:text-6xl"
              style={{ animationDelay: "200ms" }}
            >
              {name}
            </h1>
            <p className="flex flex-col text-[22px] font-semibold leading-tight tracking-tight text-foreground sm:text-3xl">
              {headline.map((line, i) => (
                <span
                  key={line}
                  className={`animate-rise ${i === headline.length - 1 ? "text-accent" : ""}`}
                  style={{ animationDelay: `${320 + i * 90}ms` }}
                >
                  {line}
                </span>
              ))}
            </p>
            <p
              className="animate-rise max-w-md text-base leading-relaxed text-muted"
              style={{ animationDelay: `${320 + headline.length * 90}ms` }}
            >
              {headlineNote}
            </p>
          </div>
        </div>

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
            href="#now"
            data-press
            className="rounded-md border border-border px-4 py-2 text-sm font-medium transition-colors hover:border-accent hover:text-accent"
          >
            What I&apos;m building
          </a>
        </div>

        <div className="animate-rise pt-4" style={{ animationDelay: "680ms" }}>
          <MetricsRow metrics={headlineMetrics} />
        </div>
      </div>
    </Container>
  );
}
