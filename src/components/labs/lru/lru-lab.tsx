"use client";

import { useLru } from "./use-lru";
import { RangeControl } from "../shared/range-control";
import { SimPanel } from "../shared/sim-panel";
import { LogDots } from "../shared/log-dots";
import { healthFrom } from "../shared/health";

const PRIMARY =
  "rounded-md bg-foreground px-3 py-1.5 text-sm font-medium text-background transition-opacity hover:opacity-90";
const GHOST =
  "rounded-md border border-border px-3 py-1.5 text-sm transition-colors hover:border-accent hover:text-accent";

// LRU simulator: push the working set past the cache size and watch hit-rate
// collapse into thrashing (glitch). Cache chips show current contents (MRU first).
export function LruLab() {
  const s = useLru();
  const total = s.stats.hits + s.stats.misses;
  const hitRate = total ? s.stats.hits / total : 0;
  const missRate = s.log.length
    ? s.log.filter((o) => !o.ok).length / s.log.length
    : 0;

  return (
    <SimPanel title="LRU cache" health={healthFrom(missRate)}>
      <div className="flex flex-col gap-4">
        <RangeControl
          label="Cache size"
          value={s.cacheSize}
          min={1}
          max={16}
          step={1}
          unit=" slots"
          onChange={s.setCacheSize}
        />
        <RangeControl
          label="Working set"
          value={s.workingSet}
          min={1}
          max={40}
          step={1}
          unit=" keys"
          onChange={s.setWorkingSet}
        />
        <RangeControl
          label="Incoming load"
          value={s.rps}
          min={0}
          max={40}
          step={1}
          unit=" req/s"
          onChange={s.setRps}
        />
        <div className="flex flex-wrap gap-2 pt-1">
          <button type="button" onClick={s.send} data-press className={PRIMARY}>
            Access one
          </button>
          <button type="button" onClick={s.reset} data-press className={GHOST}>
            Reset
          </button>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-1.5">
        {s.cache.length === 0 ? (
          <span className="font-mono text-xs text-muted">cache empty</span>
        ) : (
          s.cache.map((k, i) => (
            <span
              key={`${k}-${i}`}
              className="rounded border border-accent/50 px-2 py-0.5 font-mono text-xs text-accent"
            >
              {k}
            </span>
          ))
        )}
      </div>

      <div className="mt-5 flex flex-col gap-3 border-t border-border pt-4">
        <div className="flex flex-wrap gap-x-6 gap-y-1 font-mono text-xs">
          <span className="text-emerald-500">hits {s.stats.hits}</span>
          <span className="text-red-400">misses {s.stats.misses}</span>
          <span className="text-muted">hit rate {Math.round(hitRate * 100)}%</span>
        </div>
        <LogDots log={s.log} empty="access some keys →" />
      </div>
    </SimPanel>
  );
}
