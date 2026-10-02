import type { CaseStudy, FlowStep } from "@/lib/content";

const TONE: Record<NonNullable<FlowStep["tone"]> | "none", string> = {
  none: "border-border",
  ok: "border-emerald-500/60",
  bad: "border-red-500/70",
};

// Data-driven architecture diagram: each row is a left-to-right pipeline of
// boxes. Arrows point right on wide screens and down on phones.
export function FlowDiagram({ flow }: { flow: CaseStudy["flow"] }) {
  return (
    <figure className="flex flex-col gap-5 rounded-xl border border-border bg-surface p-4 sm:p-5">
      <figcaption className="font-mono text-[11px] uppercase tracking-wide text-accent">
        {flow.title}
      </figcaption>
      {flow.rows.map((row, r) => (
        <div key={r} className="flex flex-col gap-2">
          {row.label ? (
            <span className="font-mono text-[11px] uppercase tracking-wide text-muted">
              {row.label}
            </span>
          ) : null}
          <ol className="flex flex-col items-stretch gap-1 sm:flex-row sm:items-center">
            {row.steps.map((step, i) => (
              <li key={step.title} className="flex flex-col items-center gap-1 sm:flex-1 sm:flex-row">
                <div
                  className={`w-full rounded-md border bg-background/40 px-2.5 py-2 text-center ${TONE[step.tone ?? "none"]}`}
                >
                  <div className="text-xs font-medium text-foreground">{step.title}</div>
                  {step.sub ? (
                    <div className="mt-0.5 font-mono text-[10px] leading-tight text-muted">
                      {step.sub}
                    </div>
                  ) : null}
                </div>
                {i < row.steps.length - 1 ? (
                  <span aria-hidden className="font-mono text-xs text-accent">
                    <span className="sm:hidden">↓</span>
                    <span className="hidden sm:inline">→</span>
                  </span>
                ) : null}
              </li>
            ))}
          </ol>
        </div>
      ))}
      {flow.caption ? (
        <p className="border-t border-border pt-3 text-xs leading-relaxed text-muted">
          {flow.caption}
        </p>
      ) : null}
    </figure>
  );
}
