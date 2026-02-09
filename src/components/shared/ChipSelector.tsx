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
            key={String(opt.value)}
            onClick={() => onChange(opt.value)}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition-all ${
              isSelected
                ? 'bg-primary-600 text-white shadow-sm'
                : 'bg-white text-gray-700 border border-gray-200 hover:border-primary-300 hover:bg-primary-50'
            }`}
          >
            {opt.label}
            {opt.sublabel && (
              <span className={`block text-xs mt-0.5 ${isSelected ? 'text-primary-100' : 'text-gray-400'}`}>
                {opt.sublabel}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
