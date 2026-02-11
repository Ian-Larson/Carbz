import { Minus, Plus } from 'lucide-react';

interface CounterProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
}

export function Counter({ value, onChange, min = 0, max = 99, step = 1, suffix }: CounterProps) {
  const canDecrement = value - step >= min;
  const canIncrement = value + step <= max;

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => canDecrement && onChange(Math.round((value - step) * 100) / 100)}
        disabled={!canDecrement}
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--line)] text-[var(--text-primary)] transition-colors hover:bg-[var(--surface-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] disabled:opacity-30 disabled:hover:bg-transparent"
        aria-label="Decrease"
      >
        <Minus className="h-4 w-4" />
      </button>
      <span className="min-w-[2rem] text-center font-semibold text-[var(--text-primary)]">
        {value}{suffix && <span className="ml-0.5 text-xs text-[var(--text-muted)]">{suffix}</span>}
      </span>
      <button
        type="button"
        onClick={() => canIncrement && onChange(Math.round((value + step) * 100) / 100)}
        disabled={!canIncrement}
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--line)] text-[var(--text-primary)] transition-colors hover:bg-[var(--surface-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] disabled:opacity-30 disabled:hover:bg-transparent"
        aria-label="Increase"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}
