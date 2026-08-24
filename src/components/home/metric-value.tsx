"use client";

import { useEffect, useRef, useState } from "react";

function parse(value: string) {
  const m = value.match(/^(\d+(?:\.\d+)?)(.*)$/);
  return m
    ? { target: parseFloat(m[1]), suffix: m[2] }
    : { target: NaN, suffix: value };
}

// Counts the numeric part of a metric up to its value the first time it scrolls
// into view (e.g. "100×", "160M+"). Respects reduced motion.
export function MetricValue({ value }: { value: string }) {
  const { target, suffix } = parse(value);
  const [n, setN] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || Number.isNaN(target)) return;
    let raf = 0;
    let done = false;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const io = new IntersectionObserver(
      (entries) => {
        if (done || !entries.some((e) => e.isIntersecting)) return;
        done = true;
        io.disconnect();
        if (reduced) return setN(target);
        const t0 = performance.now();
        const tick = (t: number) => {
          const p = Math.min(1, (t - t0) / 900);
          setN(target * (1 - Math.pow(1 - p, 3)));
          if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [target]);

  if (Number.isNaN(target)) return <span ref={ref}>{value}</span>;
  const shown = Number.isInteger(target) ? Math.round(n) : n.toFixed(1);
  return (
    <span ref={ref}>
      {shown}
      {suffix}
    </span>
  );
}
