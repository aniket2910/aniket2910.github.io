import { useCallback, useEffect, useRef, useState } from "react";
import type { Outcome } from "../shared/log-dots";

// Idempotency simulation: retried requests carry the same key. With keys ON a
// retry is deduped (safe); with keys OFF a retry charges again (double charge).
export function useIdempotency() {
  const [keysOn, setKeysOn] = useState(true);
  const [retryRate, setRetryRate] = useState(30); // % of load that are retries
  const [rps, setRps] = useState(0);
  const [stats, setStats] = useState({ charged: 0, deduped: 0, doubled: 0 });
  const [log, setLog] = useState<Outcome[]>([]);
  const keyCount = useRef(0);

  const push = (ok: boolean) =>
    setLog((l) => [{ id: performance.now() + Math.random(), ok }, ...l].slice(0, 40));

  const charge = useCallback(
    (isRetry: boolean) => {
      const retry = isRetry && keyCount.current > 0;
      if (!retry) {
        keyCount.current += 1;
        setStats((s) => ({ ...s, charged: s.charged + 1 }));
        return push(true);
      }
      if (keysOn) {
        setStats((s) => ({ ...s, deduped: s.deduped + 1 }));
        push(true);
      } else {
        setStats((s) => ({ ...s, doubled: s.doubled + 1 }));
        push(false);
      }
    },
    [keysOn],
  );

  const send = useCallback(
    () => charge(Math.random() * 100 < retryRate),
    [charge, retryRate],
  );
  const newReq = useCallback(() => charge(false), [charge]);
  const retry = useCallback(() => charge(true), [charge]);

  useEffect(() => {
    if (rps <= 0) return;
    const id = setInterval(send, Math.max(20, 1000 / rps));
    return () => clearInterval(id);
  }, [rps, send]);

  const reset = useCallback(() => {
    keyCount.current = 0;
    setStats({ charged: 0, deduped: 0, doubled: 0 });
    setLog([]);
  }, []);

  return {
    keysOn,
    setKeysOn,
    retryRate,
    setRetryRate,
    rps,
    setRps,
    stats,
    log,
    send,
    newReq,
    retry,
    reset,
  };
}
