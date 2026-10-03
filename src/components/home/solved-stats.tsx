import type { Activity } from "@/lib/content";

const LEVELS = [
  ["easy", "Easy"],
  ["medium", "Medium"],
  ["hard", "Hard"],
] as const;

// LeetCode solved count, printed as the masthead of the activity plates card.
export function SolvedStats({ solved }: { solved: Activity["solved"] }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-4 border-b-2 border-[var(--ink)] pb-4">
      <div className="flex items-baseline gap-3">
        <span className="font-display text-5xl leading-none text-[var(--pulse)] [-webkit-text-stroke:1.5px_var(--ink)]">
          {solved.total}
        </span>
        <span className="font-mono text-xs uppercase tracking-wide">LeetCode problems solved</span>
      </div>
      <dl className="flex gap-2 font-mono text-xs">
        {LEVELS.map(([key, label]) => (
          <div key={key} className="border-2 border-[var(--ink)] bg-white/60 px-2 py-1 shadow-[2px_2px_0_var(--ink)]">
            <dt className="inline text-[var(--ink)]/60">{label} </dt>
            <dd className="inline font-semibold">{solved[key]}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
