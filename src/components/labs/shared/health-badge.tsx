import type { Health } from "./health";

const STYLES: Record<Health, { dot: string; text: string }> = {
  healthy: { dot: "bg-emerald-500", text: "text-emerald-500" },
  degraded: { dot: "bg-amber-400", text: "text-amber-400" },
  failing: { dot: "bg-red-500", text: "text-red-500" },
};

export function HealthBadge({ health }: { health: Health }) {
  const s = STYLES[health];
  return (
    <span
      className={`inline-flex items-center gap-2 font-mono text-xs ${s.text}`}
    >
      <span className={`h-2 w-2 rounded-full ${s.dot}`} aria-hidden />
      {health}
    </span>
  );
}
