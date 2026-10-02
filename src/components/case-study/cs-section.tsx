import type { ReactNode } from "react";

// Numbered sub-section inside a case study ("01 Situation"), matching the
// notebook-style labels used across the site.
export function CsSection({
  n,
  label,
  children,
}: {
  n: number;
  label: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="flex items-baseline gap-2 font-mono text-xs uppercase tracking-wide text-muted">
        <span className="text-accent">{String(n).padStart(2, "0")}</span>
        {label}
      </h2>
      {children}
    </section>
  );
}
