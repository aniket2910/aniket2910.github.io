"use client";

import { useIdempotency } from "./use-idempotency";
import { RangeControl } from "../shared/range-control";
import { SimPanel } from "../shared/sim-panel";
import { LogDots } from "../shared/log-dots";
import { healthFrom } from "../shared/health";

const PRIMARY =
  "rounded-md bg-foreground px-3 py-1.5 text-sm font-medium text-background transition-opacity hover:opacity-90";
const GHOST =
  "rounded-md border border-border px-3 py-1.5 text-sm transition-colors hover:border-accent hover:text-accent";

// Idempotency simulator: flip keys off and send retries to watch double-charges
// pile up (glitch); with keys on, retries are safely deduped.
export function IdempotencyLab() {
  const s = useIdempotency();
  const bad = s.log.filter((o) => !o.ok).length;
  const badRate = s.log.length ? bad / s.log.length : 0;
  const toggle = s.keysOn
    ? "border-emerald-500 text-emerald-500"
    : "border-red-500 text-red-500";

  return (
    <SimPanel title="idempotency keys" health={healthFrom(badRate)}>
      <div className="flex flex-col gap-4">
        <button
          type="button"
          onClick={() => s.setKeysOn(!s.keysOn)}
          data-press
          className={`self-start rounded-md border px-3 py-1.5 font-mono text-xs transition-colors ${toggle}`}
        >
          idempotency keys: {s.keysOn ? "ON" : "OFF"}
        </button>
        <RangeControl
          label="Retry rate"
          value={s.retryRate}
          min={0}
          max={100}
          step={5}
          unit=" %"
          onChange={s.setRetryRate}
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
          <button type="button" onClick={s.newReq} data-press className={PRIMARY}>
            New request
          </button>
          <button type="button" onClick={s.retry} data-press className={GHOST}>
            Retry last
          </button>
          <button type="button" onClick={s.reset} data-press className={GHOST}>
            Reset
          </button>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3 border-t border-border pt-4">
        <div className="flex flex-wrap gap-x-6 gap-y-1 font-mono text-xs">
          <span className="text-emerald-500">charged {s.stats.charged}</span>
          <span className="text-muted">deduped {s.stats.deduped}</span>
          <span className="text-red-400">
            double-charged {s.stats.doubled}
          </span>
        </div>
        <LogDots log={s.log} empty="send a request, then retry it →" />
      </div>
    </SimPanel>
  );
}
