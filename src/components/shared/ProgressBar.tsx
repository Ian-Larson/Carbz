interface ProgressBarProps {
  current: number;
  target: number;
  label: string;
  icon?: string;
  colorClass?: string;
}

export function ProgressBar({
  current,
  target,
  label,
  icon,
  colorClass = 'bg-[var(--success)]',
}: ProgressBarProps) {
  const pct = target > 0 ? Math.min((current / target) * 100, 100) : 0;
  const isOver = current > target;
  const isShort = current < target * 0.9;
  const barColor = isShort ? 'bg-[var(--warning)]' : isOver ? 'bg-[var(--danger)]' : colorClass;

  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="flex items-center gap-1.5 text-[var(--text-primary)]">
          {icon && <span>{icon}</span>}
          {label}
        </span>
        <span
          className={`font-medium ${
            isShort ? 'text-[var(--warning)]' : isOver ? 'text-[var(--danger)]' : 'text-[var(--success)]'
          }`}
        >
          {Math.round(current)}{target > 0 ? `/${Math.round(target)}` : ''}
        </span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--surface-muted)]">
        <div
          className={`h-full rounded-full transition-[width] duration-[var(--motion-medium)] motion-reduce:transition-none ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
