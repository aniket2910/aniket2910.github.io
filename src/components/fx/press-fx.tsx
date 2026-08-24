"use client";

import { useEffect } from "react";

// Spawns a halftone ripple at the exact pointer position on any [data-press]
// element (spec §3.5 — origin must be the pointer, never the element centre).
export function PressFX() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    function onDown(e: PointerEvent) {
      const el = (e.target as HTMLElement | null)?.closest(
        "[data-press]",
      ) as HTMLElement | null;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const ripple = document.createElement("span");
      ripple.className = "comic-ripple";
      ripple.style.left = `${e.clientX - rect.left}px`;
      ripple.style.top = `${e.clientY - rect.top}px`;
      el.appendChild(ripple);
      ripple.addEventListener("animationend", () => ripple.remove());
      window.setTimeout(() => ripple.remove(), 700);
    }

    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, []);

  return null;
}
