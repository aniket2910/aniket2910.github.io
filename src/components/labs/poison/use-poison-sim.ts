import { useCallback, useEffect, useMemo, useState } from "react";
import type { Health } from "../shared/health";
import {
  cellsAfter,
  isRun,
  plan,
  randomBad,
  spreadBad,
  type Strategy,
} from "./isolation";

// Replays a planned strategy step by step. Each tick applies one step, so the
// grid, counters and alerts are always derived from `steps.slice(0, cursor)`.
export function usePoisonSim() {
  const [size, setSizeState] = useState(32);
  const [badCount, setBadCountState] = useState(1);
  const [strategy, setStrategyState] = useState<Strategy>("emit");
  const [bad, setBad] = useState(() => spreadBad(32, 1));
  const [cursor, setCursor] = useState(0);
  const [playing, setPlaying] = useState(false);

  const steps = useMemo(() => plan(strategy, size, bad), [strategy, size, bad]);
  const binaryRuns = useMemo(
    () => plan("binary", size, bad).filter(isRun).length,
    [size, bad],
  );

  // Any change to the setup invalidates the current replay.
  function resetWith(update: () => void) {
    setPlaying(false);
    setCursor(0);
    update();
  }
  const setStrategy = (s: Strategy) => resetWith(() => setStrategyState(s));
  const setSize = (n: number) =>
    resetWith(() => {
      setSizeState(n);
      setBad(spreadBad(n, badCount));
    });
  const setBadCount = (k: number) =>
    resetWith(() => {
      setBadCountState(k);
      setBad(spreadBad(size, k));
    });
  const shuffle = () => resetWith(() => setBad(randomBad(size, badCount)));

  const run = useCallback(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return setCursor(steps.length);
    setCursor(0);
    setPlaying(true);
  }, [steps.length]);

  useEffect(() => {
    if (!playing) return;
    const tick = Math.min(450, Math.max(60, 3500 / steps.length));
    const id = setInterval(() => {
      setCursor((c) => {
        if (c + 1 >= steps.length) setPlaying(false);
        return Math.min(c + 1, steps.length);
      });
    }, tick);
    return () => clearInterval(id);
  }, [playing, steps.length]);

  const applied = steps.slice(0, cursor);
  const cells = cellsAfter(size, bad, applied);
  const runs = applied.filter(isRun);
  const done = cursor >= steps.length;
  const stats = {
    runs: runs.length,
    reprocessed: runs.reduce((sum, s) => sum + (s.hi - s.lo), 0),
    committed: cells.filter((c) => c === "committed").length,
    held: cells.filter((c) => c === "held").length,
    corrupt: cells.filter((c) => c === "corrupt").length,
    blocked: cells.filter((c) => c === "blocked").length,
  };

  let health: Health = "healthy";
  if (stats.corrupt > 0) health = "failing";
  else if (stats.blocked > 0) health = "degraded";
  else if (done && cursor > 0 && stats.runs > binaryRuns * 1.5) health = "degraded";

  return {
    size,
    setSize,
    badCount,
    setBadCount,
    strategy,
    setStrategy,
    shuffle,
    run,
    playing,
    started: cursor > 0 || playing,
    done: done && cursor > 0,
    active: playing ? steps[cursor] : undefined,
    cells,
    isBad: (i: number) => bad.has(i),
    stats,
    binaryRuns,
    alerts: applied.filter((s) => s.outcome === "isolate").map((s) => s.lo),
    health,
  };
}
