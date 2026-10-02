import { STRATEGIES, type Strategy } from "./isolation";

// Segmented control for the four ways a batch job can react to a bad record.
export function StrategyPicker({
  value,
  onChange,
}: {
  value: Strategy;
  onChange: (s: Strategy) => void;
}) {
  const current = STRATEGIES.find((s) => s.id === value);
  return (
    <div className="flex flex-col gap-2">
      <span className="font-mono text-xs text-muted">When a batch fails</span>
      <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4" role="radiogroup">
        {STRATEGIES.map((s, i) => {
          const on = s.id === value;
          return (
            <button
              key={s.id}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => onChange(s.id)}
              data-press
              className={`rounded-md border px-2 py-1.5 text-left font-mono text-[11px] transition-colors ${
                on
                  ? "border-accent bg-accent text-accent-fg"
                  : "border-border text-muted hover:border-accent hover:text-accent"
              }`}
            >
              <span className="opacity-60">{i + 1}.</span> {s.label}
            </button>
          );
        })}
      </div>
      <p className="text-sm leading-relaxed text-muted">{current?.blurb}</p>
    </div>
  );
}
