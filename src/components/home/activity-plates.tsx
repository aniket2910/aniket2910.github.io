"use client";

import { useState } from "react";
import type { Activity, ActivityDay } from "@/lib/content";
import { SolvedStats } from "./solved-stats";

const C = 12; // grid cell size in SVG units

// Dot radius grows with activity; capped at the 90th percentile so one huge
// day doesn't shrink everything else to specks.
function scaleFor(values: number[]) {
  const nz = values.filter(Boolean).sort((a, b) => a - b);
  const cap = nz[Math.floor(nz.length * 0.9)] ?? 1;
  return (n: number) => (n ? 1.3 + Math.sqrt(Math.min(n, cap) / cap) * 3.9 : 0);
}

const fmt = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });

function Plates({
  days,
  className,
  onHover,
}: {
  days: ActivityDay[];
  className: string;
  onHover: (d: ActivityDay | null) => void;
}) {
  const ghR = scaleFor(days.map((d) => d.gh));
  const lcR = scaleFor(days.map((d) => d.lc));
  const w = Math.ceil(days.length / 7) * C;
  const x = (i: number) => Math.floor(i / 7) * C;
  const y = (i: number) => (i % 7) * C;
  const best = days.reduce((b, d, i) => (d.gh + d.lc > days[b].gh + days[b].lc ? i : b), 0);
  const bx = Math.min(Math.max(x(best) - 6, 0), w - 70);

  return (
    <svg className={className} viewBox={`0 -16 ${w} ${7 * C + 16}`} aria-hidden="true">
      <g>
        {days.map((d, i) => (
          <circle key={d.date} className="plate-gh" cx={x(i) + C / 2} cy={y(i) + C / 2} r={ghR(d.gh)} />
        ))}
      </g>
      <g className="plate-lc">
        {days.map((d, i) => (
          <circle key={d.date} cx={x(i) + C / 2} cy={y(i) + C / 2} r={lcR(d.lc)} />
        ))}
      </g>
      <g>
        {days.map((d, i) => (
          <rect
            key={d.date}
            className="plate-hit"
            x={x(i)}
            y={y(i)}
            width={C}
            height={C}
            onMouseEnter={() => onHover(d)}
            onMouseLeave={() => onHover(null)}
          />
        ))}
      </g>
      <text className="plate-sfx" x={bx} y={-3} fontSize="15" transform={`rotate(-6 ${bx} 0)`}>
        KRAK! {days[best].gh + days[best].lc}
      </text>
    </svg>
  );
}

// A year of GitHub + LeetCode activity printed on two misregistered plates.
export function ActivityPlates({ activity: { days, solved } }: { activity: Activity }) {
  const [hover, setHover] = useState<ActivityDay | null>(null);
  const gh = days.reduce((n, d) => n + d.gh, 0);
  const lc = days.reduce((n, d) => n + d.lc, 0);
  const both = days.filter((d) => d.gh && d.lc).length;
  // Phones get the last 26 week-columns (the final column may be partial).
  const recent = days.slice(-(25 * 7 + (days.length % 7 || 7)));

  return (
    <figure
      className="plates px-4 pb-3 pt-5 sm:px-5"
      aria-label={`Last year: ${gh} GitHub contributions and ${lc} LeetCode submissions`}
    >
      <SolvedStats solved={solved} />
      <Plates days={days} className="hidden! sm:block!" onHover={setHover} />
      <Plates days={recent} className="sm:hidden!" onHover={setHover} />
      <figcaption className="mt-4 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 font-mono text-xs text-[var(--ink)]/70">
        <span>
          {hover ? (
            <>
              {fmt(hover.date)} · <span className="plate-gh-text">{hover.gh} contributions</span> ·{" "}
              <span className="text-[var(--pulse)]">{hover.lc} submissions</span>
            </>
          ) : (
            "Two dimensions, one engineer"
          )}
        </span>
        <span>
          <span className="plate-gh-text">● {gh} GitHub contributions</span> ·{" "}
          <span className="text-[var(--pulse)]">● {lc} LeetCode submissions</span> · {both} days both
        </span>
      </figcaption>
    </figure>
  );
}
