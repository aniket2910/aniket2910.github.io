"use client";

import { useTokenBucket } from "./use-token-bucket";
import { RangeControl } from "../shared/range-control";
import { SimPanel } from "../shared/sim-panel";
import { LogDots } from "../shared/log-dots";
import { healthFrom } from "../shared/health";

const PRIMARY =
  "rounded-md bg-foreground px-3 py-1.5 text-sm font-medium text-background transition-opacity hover:opacity-90";
const GHOST =
  "rounded-md border border-border px-3 py-1.5 text-sm transition-colors hover:border-accent hover:text-accent";

// Rate-limiter simulator: drive incoming load and watch the bucket hold,
// degrade, then fail (glitch) as it starts dropping traffic.
export function RateLimiterLab() {
  const b = useTokenBucket();
  const fill = Math.max(0, Math.min(1, b.tokens / b.capacity));
  const dropped = b.log.filter((r) => !r.ok).length;
  const dropRate = b.log.length ? dropped / b.log.length : 0;
  const burst = () => {
    for (let i = 0; i < 5; i++) setTimeout(b.send, i * 60);
  };

  return (
    <SimPanel title="token bucket" health={healthFrom(dropRate)}>
      <div className="grid gap-6 sm:grid-cols-[1fr_auto]">
        <div className="flex flex-col gap-4">
          <RangeControl
            label="Incoming load"
            value={b.rps}
            min={0}
            max={40}
            step={1}
            unit=" req/s"
            onChange={b.setRps}
          />
          <RangeControl
            label="Capacity"
            value={b.capacity}
            min={1}
            max={20}
            step={1}
            unit=" tok"
            onChange={b.setCapacity}
          />
          <RangeControl
            label="Refill rate"
            value={b.refillRate}
            min={0}
            max={12}
            step={0.5}
            unit=" /s"
            onChange={b.setRefillRate}
          />
          <div className="flex flex-wrap gap-2 pt-1">
            <button type="button" onClick={b.send} data-press className={PRIMARY}>
              Send one
            </button>
            <button type="button" onClick={burst} data-press className={GHOST}>
              Burst ×5
            </button>
            <button type="button" onClick={b.reset} data-press className={GHOST}>
              Reset
            </button>
          </div>
        </div>

        <div className="flex items-end justify-center">
          <div className="relative h-32 w-16 overflow-hidden rounded-md border border-border bg-background">
            <div
              className="absolute inset-x-0 bottom-0 bg-accent/70 transition-[height] duration-200 ease-out"
              style={{ height: `${fill * 100}%` }}
            />
            <span className="absolute inset-0 flex items-center justify-center font-mono text-sm font-medium">
              {b.tokens.toFixed(1)}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3 border-t border-border pt-4">
        <div className="flex flex-wrap gap-x-6 gap-y-1 font-mono text-xs">
          <span className="text-emerald-500">allowed {b.stats.allowed}</span>
          <span className="text-red-400">dropped {b.stats.blocked}</span>
          <span className="text-muted">
            drop rate {Math.round(dropRate * 100)}%
          </span>
        </div>
        <LogDots log={b.log} empty="turn up the load →" />
      </div>
    </SimPanel>
  );
}
