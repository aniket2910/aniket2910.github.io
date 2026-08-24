import { useCallback, useEffect, useRef, useState } from "react";
import type { Outcome } from "../shared/log-dots";

// LRU cache simulation: each request accesses a random key from the working set.
// When the working set outgrows the cache, evictions thrash and hit-rate craters.
export function useLru() {
  const [cacheSize, setCacheSizeState] = useState(4);
  const [workingSet, setWorkingSet] = useState(8);
  const [rps, setRps] = useState(0);
  const [stats, setStats] = useState({ hits: 0, misses: 0 });
  const [log, setLog] = useState<Outcome[]>([]);
  const [cache, setCache] = useState<number[]>([]); // MRU first
  const cacheRef = useRef<number[]>([]);

  const send = useCallback(() => {
    const key = Math.floor(Math.random() * Math.max(1, workingSet));
    const arr = cacheRef.current;
    const idx = arr.indexOf(key);
    const hit = idx >= 0;
    if (hit) arr.splice(idx, 1);
    arr.unshift(key);
    if (arr.length > cacheSize) arr.pop();
    setCache([...arr]);
    setStats((s) => ({
      hits: s.hits + (hit ? 1 : 0),
      misses: s.misses + (hit ? 0 : 1),
    }));
    setLog((l) =>
      [{ id: performance.now() + Math.random(), ok: hit }, ...l].slice(0, 40),
    );
  }, [cacheSize, workingSet]);

  const setCacheSize = useCallback((n: number) => {
    setCacheSizeState(n);
    cacheRef.current = cacheRef.current.slice(0, n);
    setCache([...cacheRef.current]);
  }, []);

  useEffect(() => {
    if (rps <= 0) return;
    const id = setInterval(send, Math.max(20, 1000 / rps));
    return () => clearInterval(id);
  }, [rps, send]);

  const reset = useCallback(() => {
    cacheRef.current = [];
    setCache([]);
    setStats({ hits: 0, misses: 0 });
    setLog([]);
  }, []);

  return {
    cacheSize,
    setCacheSize,
    workingSet,
    setWorkingSet,
    rps,
    setRps,
    stats,
    log,
    cache,
    send,
    reset,
  };
}
