"use client";

import { useEffect } from "react";

// Spawns a comic onomatopoeia burst ("THWIP!", "POW!") at the pointer whenever
// an element carrying `data-comic` is clicked. Pure DOM — no re-renders.
export function ComicFX() {
  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduced) return;

    function onClick(e: MouseEvent) {
      const el = (e.target as HTMLElement | null)?.closest("[data-comic]");
      if (!el) return;
      const word = el.getAttribute("data-comic") || "POW!";
      const burst = document.createElement("div");
      burst.className = "comic-burst";
      burst.textContent = word;
      burst.style.left = `${e.clientX}px`;
      burst.style.top = `${e.clientY}px`;
      document.body.appendChild(burst);
      burst.addEventListener("animationend", () => burst.remove());
      window.setTimeout(() => burst.remove(), 1000);
    }

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}
