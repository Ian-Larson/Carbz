import { Plus, Trash2 } from 'lucide-react';
import { useRideConfigStore } from '../../stores/rideConfigStore';
import { Card } from '../shared/Card';
import { COMMON_BOTTLE_SIZES } from '../../types/constants';

export function BottleSelector() {
  const bottles = useRideConfigStore((s) => s.bottles);
  const addBottle = useRideConfigStore((s) => s.addBottle);
  const removeBottle = useRideConfigStore((s) => s.removeBottle);
  const setBottleSize = useRideConfigStore((s) => s.setBottleSize);
  const setBottleCount = useRideConfigStore((s) => s.setBottleCount);
  const durationMinutes = useRideConfigStore((s) => s.durationMinutes);

  const totalBottles = bottles.reduce((s, b) => s + b.count, 0);

  let guidance = '';
  if (durationMinutes <= 180 && totalBottles > 2) {
    guidance = 'That\'s a lot of bottles for a ride under 3 hours — you may not need them all.';
  } else if (durationMinutes > 180 && totalBottles <= 1) {
    guidance = 'For rides over 3 hours, consider bringing more bottles or planning a refill stop.';
  } else if (durationMinutes > 240 && totalBottles <= 2) {
    guidance = 'For 4+ hour rides, a third bottle or refill stop is recommended.';
  }

  return (
    <Card title="Bottles" icon="🍼">
      <p className="mb-3 text-xs text-[var(--text-muted)]">What bottles are you bringing?</p>
      <div className="space-y-2">
        {bottles.map((bottle, idx) => (
          <div
            key={idx}
            className="flex items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface-muted)] p-2.5"
          >
            <select
              value={bottle.size}
              onChange={(e) => setBottleSize(idx, Number(e.target.value))}
              className="rounded-md border border-[var(--line)] bg-[var(--surface)] px-2 py-1.5 text-sm font-medium text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none"
              aria-label={`Bottle ${idx + 1} size`}
            >
              {COMMON_BOTTLE_SIZES.map((size) => (
                <option key={size} value={size}>{size}ml</option>
              ))}
            </select>
            <div className="flex items-center gap-1 ml-auto">
              <span className="text-xs text-[var(--text-muted)] mr-1">qty</span>
              <button
                onClick={() => setBottleCount(idx, bottle.count - 1)}
                className="flex h-7 w-7 items-center justify-center rounded border border-[var(--line)] text-xs text-[var(--text-primary)] hover:bg-[var(--surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                aria-label={`Decrease quantity for bottle ${idx + 1}`}
              >
                -
              </button>
              <span className="min-w-[1.5rem] text-center text-sm font-semibold text-[var(--text-primary)]">{bottle.count}</span>
              <button
                onClick={() => setBottleCount(idx, bottle.count + 1)}
                className="flex h-7 w-7 items-center justify-center rounded border border-[var(--line)] text-xs text-[var(--text-primary)] hover:bg-[var(--surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                aria-label={`Increase quantity for bottle ${idx + 1}`}
              >
                +
              </button>
            </div>
            <button
              onClick={() => removeBottle(idx)}
              className="rounded p-1 text-[var(--text-muted)] transition-colors hover:bg-[var(--danger-soft)] hover:text-[var(--danger)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--danger)]"
              aria-label={`Remove bottle ${idx + 1}`}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
      <button
        onClick={() => addBottle(750)}
        className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-[var(--line-strong)] py-2 text-sm text-[var(--text-primary)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
      >
        <Plus className="h-4 w-4" /> Add Bottle
      </button>
      {guidance && (
        <p className="mt-2 rounded-xl bg-[var(--warning-soft)] p-2 text-xs text-[var(--text-primary)]">
          💡 {guidance}
        </p>
      )}
    </Card>
  );
}
