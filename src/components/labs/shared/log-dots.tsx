export type Outcome = { id: number; ok: boolean };

// Rolling event log rendered as green (ok) / red (bad) squares.
export function LogDots({
  log,
  empty = "turn up the load →",
}: {
  log: Outcome[];
  empty?: string;
}) {
  return (
    <div className="flex min-h-[10px] flex-wrap gap-1">
      {log.length === 0 ? (
        <span className="font-mono text-xs text-muted">{empty}</span>
      ) : (
        log.map((r) => (
          <span
            key={r.id}
            className={`h-2.5 w-2.5 rounded-sm ${r.ok ? "bg-emerald-500" : "bg-red-500"}`}
          />
        ))
      )}
    </div>
  );
}
