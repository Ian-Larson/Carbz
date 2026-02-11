interface ChipOption<T> {
  value: T;
  label: string;
  sublabel?: string;
}

interface ChipSelectorProps<T> {
  options: ChipOption<T>[];
  selected: T;
  onChange: (value: T) => void;
  columns?: number;
}

export function ChipSelector<T extends string | number>({
  options,
  selected,
  onChange,
  columns,
}: ChipSelectorProps<T>) {
  const gridClass = columns
    ? `grid gap-2`
    : 'flex flex-wrap gap-2';
  const gridStyle = columns
    ? { gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }
    : undefined;

  return (
    <div className={gridClass} style={gridStyle}>
      {options.map((opt) => {
        const isSelected = opt.value === selected;
        return (
          <button
            type="button"
            key={String(opt.value)}
            onClick={() => onChange(opt.value)}
            className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${
              isSelected
                ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--text-primary)]'
                : 'border-[var(--line)] bg-[var(--surface)] text-[var(--text-primary)] hover:border-[var(--line-strong)]'
            }`}
            aria-pressed={isSelected}
          >
            {opt.label}
            {opt.sublabel && (
              <span className={`mt-0.5 block text-xs ${isSelected ? 'text-[var(--text-muted)]' : 'text-[var(--text-muted)]'}`}>
                {opt.sublabel}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
