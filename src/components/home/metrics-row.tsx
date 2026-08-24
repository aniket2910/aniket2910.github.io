import type { Metric } from "@/lib/content";
import { MetricValue } from "./metric-value";

// Quiet, credible headline numbers — not confetti. Values count up in view.
export function MetricsRow({ metrics }: { metrics: Metric[] }) {
  return (
    <dl className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4">
      {metrics.map((m) => (
        <div key={m.label} className="flex flex-col gap-1">
          <dt className="font-mono text-2xl font-medium tracking-tight text-foreground">
            <MetricValue value={m.value} />
          </dt>
          <dd className="text-xs leading-snug text-muted">
            {m.label}
            {m.sub ? <span className="block opacity-70">{m.sub}</span> : null}
          </dd>
        </div>
      ))}
    </dl>
  );
}
