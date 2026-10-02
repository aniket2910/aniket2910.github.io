// Pure model of the batch job behind the "poison-record isolation" case study.
// A strategy is planned up front as a list of steps; the UI replays them.

export type Strategy = "emit" | "fail-batch" | "one-by-one" | "binary";

export type Outcome =
  | "commit" // range ran clean and committed
  | "rollback" // range failed, nothing written
  | "isolate" // single bad record dead-lettered
  | "emit" // the bug: committed anyway, bad records show wrong status
  | "hold"; // whole batch held back, nothing progresses

export type Step = { lo: number; hi: number; outcome: Outcome };

export type CellState = "pending" | "committed" | "held" | "corrupt" | "blocked";

export const STRATEGIES: { id: Strategy; label: string; blurb: string }[] = [
  {
    id: "emit",
    label: "Skip & emit",
    blurb: "The original bug: the batch half-fails and the job emits statuses anyway.",
  },
  {
    id: "fail-batch",
    label: "Fail whole batch",
    blurb: "Correct, but one bad record holds every good record hostage.",
  },
  {
    id: "one-by-one",
    label: "Retry one by one",
    blurb: "Correct, but pays one run per record even when almost all are fine.",
  },
  {
    id: "binary",
    label: "Binary split",
    blurb: "Halve whatever fails, commit whatever passes, until each bad record is alone.",
  },
];

const hasBad = (bad: Set<number>, lo: number, hi: number) => {
  for (let i = lo; i < hi; i++) if (bad.has(i)) return true;
  return false;
};

function binary(bad: Set<number>, lo: number, hi: number, out: Step[]) {
  if (!hasBad(bad, lo, hi)) return void out.push({ lo, hi, outcome: "commit" });
  if (hi - lo === 1) return void out.push({ lo, hi, outcome: "isolate" });
  out.push({ lo, hi, outcome: "rollback" });
  const mid = Math.floor((lo + hi) / 2);
  binary(bad, lo, mid, out);
  binary(bad, mid, hi, out);
}

export function plan(strategy: Strategy, n: number, bad: Set<number>): Step[] {
  if (bad.size === 0) return [{ lo: 0, hi: n, outcome: "commit" }];
  if (strategy === "emit") return [{ lo: 0, hi: n, outcome: "emit" }];
  if (strategy === "fail-batch")
    return [
      { lo: 0, hi: n, outcome: "rollback" },
      { lo: 0, hi: n, outcome: "hold" },
    ];
  const out: Step[] = [];
  if (strategy === "binary") binary(bad, 0, n, out);
  else {
    out.push({ lo: 0, hi: n, outcome: "rollback" });
    for (let i = 0; i < n; i++)
      out.push({ lo: i, hi: i + 1, outcome: bad.has(i) ? "isolate" : "commit" });
  }
  return out;
}

// Apply the first `count` steps to a fresh batch.
export function cellsAfter(n: number, bad: Set<number>, steps: Step[]) {
  const cells: CellState[] = Array(n).fill("pending");
  for (const { lo, hi, outcome } of steps)
    for (let i = lo; i < hi; i++) {
      if (outcome === "commit") cells[i] = "committed";
      else if (outcome === "isolate") cells[i] = "held";
      else if (outcome === "hold") cells[i] = "blocked";
      else if (outcome === "emit") cells[i] = bad.has(i) ? "corrupt" : "committed";
    }
  return cells;
}

// A "run" is one database transaction attempt; holding the batch is not a run.
export const isRun = (s: Step) => s.outcome !== "hold";

export function randomBad(n: number, k: number): Set<number> {
  const bad = new Set<number>();
  while (bad.size < Math.min(k, n)) bad.add(Math.floor(Math.random() * n));
  return bad;
}

// Deterministic first batch so server and client render the same thing.
export function spreadBad(n: number, k: number): Set<number> {
  return new Set(Array.from({ length: k }, (_, i) => Math.floor(((i + 0.6) * n) / (k + 0.4))));
}

const ERRORS = [
  "null owning_domain from upstream",
  "unknown course id",
  "schema mismatch on status",
  "duplicate plan reference",
];
// `order` is the alert's position, so consecutive alerts show different errors.
export const errorFor = (order: number) => ERRORS[order % ERRORS.length];
