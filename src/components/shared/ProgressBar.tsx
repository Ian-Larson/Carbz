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
  colorClass = 'bg-green-500',
}: ProgressBarProps) {
  const pct = target > 0 ? Math.min((current / target) * 100, 100) : 0;
  const isOver = current > target;
  const isShort = current < target * 0.9;
  const barColor = isShort ? 'bg-amber-400' : isOver ? 'bg-red-400' : colorClass;

  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="flex items-center gap-1.5 text-gray-600">
          {icon && <span>{icon}</span>}
          {label}
        </span>
        <span className={`font-medium ${isShort ? 'text-amber-600' : isOver ? 'text-red-600' : 'text-green-600'}`}>
          {Math.round(current)}{target > 0 ? `/${Math.round(target)}` : ''}
        </span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
