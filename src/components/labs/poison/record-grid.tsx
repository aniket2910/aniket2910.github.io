import type { CellState, Step } from "./isolation";

const FILL: Record<CellState, string> = {
  pending: "border border-border bg-transparent",
  committed: "bg-emerald-500/85",
  held: "bg-red-500",
  corrupt: "bg-amber-400",
  blocked: "border border-dashed border-muted/60 bg-muted/20",
};

const LEGEND: [CellState, string][] = [
  ["committed", "committed"],
  ["held", "isolated + held"],
  ["corrupt", "wrong status shown"],
  ["blocked", "blocked by batch"],
];

// One square per record. Bad records carry a dot until they are dealt with;
// the range currently being run is outlined in the accent colour.
export function RecordGrid({
  cells,
  bad,
  active,
}: {
  cells: CellState[];
  bad: (i: number) => boolean;
  active?: Step;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-1.5" role="img" aria-label="Batch records">
        {cells.map((state, i) => {
          const running = active && i >= active.lo && i < active.hi;
          return (
            <span
              key={i}
              title={`record #${i}${bad(i) ? " (bad)" : ""}: ${state}`}
              className={`relative flex h-5 w-5 items-center justify-center rounded-[3px] transition-colors duration-150 ${FILL[state]} ${
                running ? "ring-2 ring-accent ring-offset-1 ring-offset-surface" : ""
              }`}
            >
              {bad(i) && state === "pending" ? (
                <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
              ) : null}
            </span>
          );
        })}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11px] text-muted">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-red-500" /> bad record
        </span>
        {LEGEND.map(([state, label]) => (
          <span key={state} className="inline-flex items-center gap-1.5">
            <span className={`h-2.5 w-2.5 rounded-[2px] ${FILL[state]}`} />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
