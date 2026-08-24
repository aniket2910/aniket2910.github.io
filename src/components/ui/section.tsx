import type { ReactNode } from "react";
import { Container } from "./container";

// Editorial section with a monospace "01 / Title" label — the notebook motif.
export function Section({
  index,
  title,
  id,
  tone = "light",
  children,
}: {
  index: string;
  title: string;
  id?: string;
  tone?: "light" | "dark";
  children: ReactNode;
}) {
  const toneClass =
    tone === "dark"
      ? "dimension-dark halftone-surface"
      : "border-t border-border";
  return (
    <section id={id} className={`py-16 sm:py-24 ${toneClass}`}>
      <Container>
        <div className="mb-10 flex items-baseline gap-3 font-mono text-xs tracking-wide text-muted">
          <span className="text-accent">{index}</span>
          <span className="uppercase">{title}</span>
        </div>
        {children}
      </Container>
    </section>
  );
}
