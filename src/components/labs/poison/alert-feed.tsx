import { errorFor } from "./isolation";

// Mock team-channel alerts, one per isolated record (newest first).
export function AlertFeed({ alerts }: { alerts: number[] }) {
  if (alerts.length === 0) return null;
  return (
    <ul className="flex flex-col gap-1 rounded-md border border-border bg-background/40 p-3 font-mono text-[11px]">
      {alerts
        .map((record, order) => ({ record, error: errorFor(order) }))
        .reverse()
        .map(({ record, error }) => (
          <li key={record} className="text-muted">
            <span className="text-accent">#batch-alerts</span> record{" "}
            <span className="text-foreground">#{record}</span> held: {error}
          </li>
        ))}
    </ul>
  );
}
