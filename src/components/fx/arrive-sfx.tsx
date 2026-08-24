"use client";

import { useEffect, useRef } from "react";

// Fires a single SFX burst the first time this marker fully enters view
// (spec §3.3 beat 6 — WHUMP on the first section arriving). Reduced-motion: off.
export function ArriveSfx({ text = "WHUMP!" }: { text?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      return;
    let done = false;
    const io = new IntersectionObserver(
      (entries) => {
        if (done || !entries.some((e) => e.isIntersecting)) return;
        done = true;
        io.disconnect();
        const r = el.getBoundingClientRect();
        const burst = document.createElement("div");
        burst.className = "comic-burst";
        burst.textContent = text;
        burst.style.left = `${r.left + r.width / 2}px`;
        burst.style.top = `${r.top}px`;
        document.body.appendChild(burst);
        burst.addEventListener("animationend", () => burst.remove());
        window.setTimeout(() => burst.remove(), 1000);
      },
      { threshold: 1 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [text]);

  return <span ref={ref} aria-hidden className="block h-0 w-full" />;
}
