// Shared health model for the interactive system-design simulators.
export type Health = "healthy" | "degraded" | "failing";

// Map a "bad outcome" rate (drops, double-charges, misses...) to a health state.
export function healthFrom(badRate: number): Health {
  if (badRate < 0.05) return "healthy";
  if (badRate < 0.35) return "degraded";
  return "failing";
}
