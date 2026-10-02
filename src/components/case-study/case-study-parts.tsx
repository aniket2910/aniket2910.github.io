import type { CaseStudy } from "@/lib/content";

// Labelled "Feature: what, and the outcome" points.
export function PointList({ points }: { points: CaseStudy["points"] }) {
  return (
    <ul className="flex flex-col gap-4">
      {points.map((p) => (
        <li key={p.label} className="border-l-2 border-accent/60 pl-4">
          <h3 className="text-sm font-semibold text-foreground">{p.label}</h3>
          <p className="mt-1 text-sm leading-relaxed text-muted">{p.body}</p>
        </li>
      ))}
    </ul>
  );
}

// Alternatives considered, each with the reason it lost.
export function TradeoffList({ tradeoffs }: { tradeoffs: CaseStudy["tradeoffs"] }) {
  return (
    <dl className="grid gap-3 sm:grid-cols-2">
      {tradeoffs.map((t) => (
        <div key={t.option} className="rounded-lg border border-border p-3">
          <dt className="font-mono text-xs text-foreground">
            <span className="text-red-400">✕</span> {t.option}
          </dt>
          <dd className="mt-1 text-sm leading-relaxed text-muted">{t.verdict}</dd>
        </div>
      ))}
    </dl>
  );
}

// The one idea to remember, set apart as a pull quote.
export function InsightCallout({ insight }: { insight: string }) {
  return (
    <aside className="rounded-xl border border-accent/40 bg-accent/5 p-5">
      <p className="font-mono text-[11px] uppercase tracking-wide text-accent">Key insight</p>
      <p className="mt-2 text-base leading-relaxed text-foreground">{insight}</p>
    </aside>
  );
}

// A short reflection: what I'd do differently next time.
export function NextTime({ text }: { text: string }) {
  return (
    <p className="max-w-2xl text-sm leading-relaxed text-muted">
      <span className="font-mono text-xs text-accent">Next time · </span>
      {text}
    </p>
  );
}
