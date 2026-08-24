import { useCallback, useEffect, useRef, useState } from "react";

export type RequestLog = { id: number; ok: boolean };

// Token-bucket simulation: refills continuously, each request consumes a token.
// `tokensRef` mirrors the token count so timers/handlers can read it without a
// stale closure; it is only ever mutated inside callbacks (never during render).
export function useTokenBucket(initialCapacity = 10, initialRefill = 4) {
  const [capacity, setCapacityState] = useState(initialCapacity);
  const [refillRate, setRefillRate] = useState(initialRefill); // tokens / sec
  const [rps, setRps] = useState(0); // incoming load: requests / sec
  const [tokens, setTokens] = useState(initialCapacity);
  const [stats, setStats] = useState({ allowed: 0, blocked: 0 });
  const [log, setLog] = useState<RequestLog[]>([]);
  const tokensRef = useRef(initialCapacity);

  // Continuous refill at ~20fps, clamped to capacity.
  useEffect(() => {
    const step = 0.05;
    const id = setInterval(() => {
      const next = Math.min(capacity, tokensRef.current + refillRate * step);
      tokensRef.current = next;
      setTokens(next);
    }, 50);
    return () => clearInterval(id);
  }, [capacity, refillRate]);

  const send = useCallback(() => {
    const ok = tokensRef.current >= 1;
    if (ok) {
      tokensRef.current -= 1;
      setTokens(tokensRef.current);
    }
    setStats((s) => ({
      allowed: s.allowed + (ok ? 1 : 0),
      blocked: s.blocked + (ok ? 0 : 1),
    }));
    setLog((l) =>
      [{ id: performance.now() + Math.random(), ok }, ...l].slice(0, 40),
    );
  }, []);

  // Traffic generator: fire `rps` requests per second while load is on.
  useEffect(() => {
    if (rps <= 0) return;
    const id = setInterval(send, Math.max(20, 1000 / rps));
    return () => clearInterval(id);
  }, [rps, send]);

  // Clamp tokens when capacity shrinks — handled in the event, not an effect.
  const setCapacity = useCallback((c: number) => {
    setCapacityState(c);
    tokensRef.current = Math.min(tokensRef.current, c);
    setTokens(tokensRef.current);
  }, []);

  const reset = useCallback(() => {
    tokensRef.current = capacity;
    setTokens(capacity);
    setStats({ allowed: 0, blocked: 0 });
    setLog([]);
  }, [capacity]);

  return {
    capacity,
    setCapacity,
    refillRate,
    setRefillRate,
    rps,
    setRps,
    tokens,
    stats,
    log,
    send,
    reset,
  };
}
