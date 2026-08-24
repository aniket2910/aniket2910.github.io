import type { ComponentType } from "react";
import { RateLimiterLab } from "./rate-limiter/rate-limiter-lab";
import { IdempotencyLab } from "./idempotency/idempotency-lab";
import { LruLab } from "./lru/lru-lab";

// Maps a project slug to its interactive simulator (null if it has none yet).
const LABS: Record<string, ComponentType> = {
  "rate-limiter": RateLimiterLab,
  "idempotency-keys": IdempotencyLab,
  "lru-cache": LruLab,
};

export function ProjectLab({ slug }: { slug: string }) {
  const Lab = LABS[slug];
  return Lab ? <Lab /> : null;
}
