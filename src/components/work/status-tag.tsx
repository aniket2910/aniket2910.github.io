import type { ProjectStatus } from "@/lib/content";

const STYLES: Record<ProjectStatus, { dot: string; label: string }> = {
  shipped: { dot: "bg-emerald-500", label: "shipped" },
  building: { dot: "bg-accent", label: "building" },
  planned: { dot: "bg-muted", label: "planned" },
};

// Small changelog-style status pill.
export function StatusTag({ status }: { status: ProjectStatus }) {
  const s = STYLES[status];
  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-muted">
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} aria-hidden />
      {s.label}
    </span>
  );
}
