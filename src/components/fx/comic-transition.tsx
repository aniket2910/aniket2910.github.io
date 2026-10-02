"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { stripBasePath } from "@/lib/base-path";

type Phase = "idle" | "cover" | "reveal";

// Comic panel-wipe between routes: intercept links marked `data-transition`,
// cover the screen with a halftone panel, navigate, then reveal the new page.
export function ComicTransition({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [phase, setPhase] = useState<Phase>("idle");
  const [word, setWord] = useState("THWIP!");
  const pending = useRef<string | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    function onClick(e: MouseEvent) {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)
        return;
      const a = (e.target as HTMLElement | null)?.closest(
        "a[data-transition]",
      ) as HTMLAnchorElement | null;
      const href = a?.getAttribute("href");
      if (!a || !href || href.startsWith("http") || href.startsWith("#")) return;
      if (href === window.location.pathname) return; // same route, no transition
      // Capture phase + stopPropagation so Next's <Link> doesn't also navigate.
      e.preventDefault();
      e.stopPropagation();
      pending.current = href;
      setWord(a.getAttribute("data-transition") || "THWIP!");
      setPhase("cover");
    }
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  // Once the new route is painted, uncover (next frame, so it's not a
  // synchronous cascade and the destination is on screen first).
  useEffect(() => {
    const id = requestAnimationFrame(() =>
      setPhase((p) => (p === "cover" ? "reveal" : p)),
    );
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  function onEnd() {
    if (phase === "cover" && pending.current) {
      // The DOM href already includes the base path; router.push adds it again.
      router.push(stripBasePath(pending.current));
      pending.current = null;
      // Fallback: never stay stuck covering if the route change is missed.
      window.setTimeout(
        () => setPhase((p) => (p === "cover" ? "reveal" : p)),
        700,
      );
    } else if (phase === "reveal") {
      setPhase("idle");
    }
  }

  return (
    <>
      {children}
      {phase !== "idle" ? (
        <div
          key={phase}
          aria-hidden
          onAnimationEnd={onEnd}
          className={`comic-panel ${phase === "cover" ? "comic-cover" : "comic-reveal"}`}
        >
          <span>{word}</span>
        </div>
      ) : null}
    </>
  );
}
