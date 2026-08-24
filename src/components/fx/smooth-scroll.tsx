"use client";

import { useEffect } from "react";
import Lenis from "lenis";

// Smooth scroll (Lenis) + scroll-velocity → --chroma (spec §3.2).
// One variable drives whole-site misregistration energy. Off for reduced motion.
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({ lerp: 0.1 });
    const root = document.documentElement.style;
    lenis.on("scroll", (e: { velocity: number }) => {
      const v = Math.min(Math.abs(e.velocity) / 35, 1);
      root.setProperty("--chroma", String(v * 6));
    });

    // Smooth-scroll same-page anchor links (nav, CTAs) through Lenis.
    function onClick(e: MouseEvent) {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)
        return;
      const a = (e.target as HTMLElement | null)?.closest("a[href]");
      const href = a?.getAttribute("href") ?? "";
      const hash = href.startsWith("#")
        ? href
        : href.startsWith("/#")
          ? href.slice(1)
          : "";
      if (!hash || hash === "#") return;
      const target = document.querySelector(hash);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target as HTMLElement, { offset: -72 });
    }
    document.addEventListener("click", onClick);

    let raf = 0;
    const loop = (t: number) => {
      lenis.raf(t);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      document.removeEventListener("click", onClick);
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, []);

  return null;
}
