"use client";

import { usePoisonSim } from "./use-poison-sim";
import { RangeControl } from "../shared/range-control";
import { SimPanel } from "../shared/sim-panel";
import { StrategyPicker } from "./strategy-picker";
import { RecordGrid } from "./record-grid";
import { AlertFeed } from "./alert-feed";

const PRIMARY =
  "rounded-md bg-foreground px-3 py-1.5 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50";
const GHOST =
  "rounded-md border border-border px-3 py-1.5 text-sm transition-colors hover:border-accent hover:text-accent";

type Sim = ReturnType<typeof usePoisonSim>;

function verdict(s: Sim) {
  const { stats, size, badCount, binaryRuns } = s;
  if (stats.corrupt)
    return `${stats.corrupt} wrong status${stats.corrupt > 1 ? "es" : ""} shown as correct. Nobody knows to distrust ${stats.corrupt > 1 ? "them" : "it"}.`;
  if (stats.blocked)
    return `Correct, but all ${size} records are stuck behind ${badCount} bad one${badCount > 1 ? "s" : ""}.`;
  if (!badCount) return "Clean batch: one run, everything committed.";
  const base = `${stats.committed} committed, ${stats.held} held, in ${stats.runs} runs.`;
  // Splitting only pays off when bad records are rare; say so when it doesn't.
  const marginal = binaryRuns > (size + 1) * 0.7;
  const note = marginal
    ? " With this many bad records spread out, splitting barely helps. It shines when bad records are rare, which is the normal case."
    : "";
  return s.strategy === "binary"
    ? `${base} Retrying one by one would take ${size + 1}.${note}`
    : `${base} Binary split would take ${binaryRuns}.${note}`;
}

// Simulator for the poison-record case study: plant bad records in a batch,
// pick a failure strategy, and watch how it isolates (or hides) them.
export function PoisonLab() {
  const s = usePoisonSim();

  return (
    <SimPanel title="Poison-record isolation" health={s.health}>
      <div className="flex flex-col gap-5">
        <StrategyPicker value={s.strategy} onChange={s.setStrategy} />
        <div className="grid gap-4 sm:grid-cols-2">
          <RangeControl label="Batch size" value={s.size} min={8} max={64} step={8} unit=" records" onChange={s.setSize} />
          <RangeControl label="Bad records" value={s.badCount} min={0} max={4} step={1} unit="" onChange={s.setBadCount} />
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={s.run} disabled={s.playing} data-press className={PRIMARY}>
            {s.started ? "Run again" : "Run batch"}
          </button>
          <button type="button" onClick={s.shuffle} data-press className={GHOST}>
            Move bad records
          </button>
        </div>
      </div>

      <div className="mt-6">
        <RecordGrid cells={s.cells} bad={s.isBad} active={s.active} />
      </div>

      <div className="mt-5 flex flex-col gap-3 border-t border-border pt-4">
        <div className="flex flex-wrap gap-x-6 gap-y-1 font-mono text-xs">
          <span className="text-foreground">runs {s.stats.runs}</span>
          <span className="text-muted">records re-processed {s.stats.reprocessed}</span>
          <span className="text-emerald-500">committed {s.stats.committed}</span>
          <span className="text-red-400">held {s.stats.held}</span>
        </div>
        <p className="text-sm text-foreground" aria-live="polite">
          {s.done ? verdict(s) : s.playing ? "Running…" : "Pick a strategy, then run the batch."}
        </p>
        <AlertFeed alerts={s.alerts} />
      </div>
    </SimPanel>
  );
}
