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
        onClick={() => canDecrement && onChange(Math.round((value - step) * 100) / 100)}
        disabled={!canDecrement}
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-transparent"
        aria-label="Decrease"
      >
        <Minus className="h-4 w-4" />
      </button>
      <span className="min-w-[2rem] text-center font-semibold text-gray-900">
        {value}{suffix && <span className="text-xs text-gray-400 ml-0.5">{suffix}</span>}
      </span>
      <button
        onClick={() => canIncrement && onChange(Math.round((value + step) * 100) / 100)}
        disabled={!canIncrement}
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-transparent"
        aria-label="Increase"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}
