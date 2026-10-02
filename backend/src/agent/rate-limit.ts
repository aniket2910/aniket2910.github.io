// Best-effort in-memory rate limiter (per server instance) — P4 abuse guard for
// a public endpoint. Enough for a small portfolio; a shared store (e.g. Redis)
// would be needed to enforce limits across horizontally scaled instances.

const WINDOW_MS = 60_000; // 1 minute
const MAX_PER_WINDOW = 8; // questions per IP per minute

const hits = new Map<string, number[]>();

export function rateLimit(key: string): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) {
    hits.set(key, recent);
    return false;
  }
  recent.push(now);
  hits.set(key, recent);
  return true;
}
