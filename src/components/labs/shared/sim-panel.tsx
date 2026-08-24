import type { CSSProperties, ReactNode } from "react";
import type { Health } from "./health";
import { HealthBadge } from "./health-badge";

// Shared shell for every simulator: title + health badge, and the dimension
// glitch (scanline / chroma-rip / shake) driven by health via CSS.
export function SimPanel({
  title,
  health,
  children,
}: {
  title: string;
  health: Health;
  children: ReactNode;
}) {
  const stateClass =
    health === "failing"
      ? "is-failing"
      : health === "degraded"
        ? "is-degraded"
        : "";
  return (
    <div
      className={`sim-panel rounded-xl border border-border bg-surface p-5 sm:p-6 ${stateClass}`}
      style={{ "--chroma": health === "failing" ? 6 : 0 } as CSSProperties}
    >
      <div className="mb-5 flex items-center justify-between gap-4">
        <span className="chroma-text font-mono text-xs uppercase tracking-wide text-accent">
          {title}
        </span>
        <HealthBadge health={health} />
      </div>
      {children}
    </div>
  );
}
