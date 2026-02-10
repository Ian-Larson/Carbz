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
      <p className="mb-3 text-xs text-gray-400">What bottles are you bringing?</p>
      <div className="space-y-2">
        {bottles.map((bottle, idx) => (
          <div
            key={idx}
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white p-2.5"
          >
            <select
              value={bottle.size}
              onChange={(e) => setBottleSize(idx, Number(e.target.value))}
              className="rounded-md border border-gray-200 px-2 py-1.5 text-sm font-medium text-gray-700 focus:border-primary-400 focus:outline-none"
            >
              {COMMON_BOTTLE_SIZES.map((size) => (
                <option key={size} value={size}>{size}ml</option>
              ))}
            </select>
            <div className="flex items-center gap-1 ml-auto">
              <span className="text-xs text-gray-400 mr-1">qty</span>
              <button
                onClick={() => setBottleCount(idx, bottle.count - 1)}
                className="flex h-7 w-7 items-center justify-center rounded border border-gray-200 text-xs text-gray-500 hover:bg-gray-50"
              >
                -
              </button>
              <span className="min-w-[1.5rem] text-center text-sm font-semibold">{bottle.count}</span>
              <button
                onClick={() => setBottleCount(idx, bottle.count + 1)}
                className="flex h-7 w-7 items-center justify-center rounded border border-gray-200 text-xs text-gray-500 hover:bg-gray-50"
              >
                +
              </button>
            </div>
            <button
              onClick={() => removeBottle(idx)}
              className="rounded p-1 text-gray-300 transition-colors hover:bg-red-50 hover:text-red-500"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
      <button
        onClick={() => addBottle(750)}
        className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-gray-300 py-2 text-sm text-gray-500 transition-colors hover:border-primary-400 hover:text-primary-600"
      >
        <Plus className="h-4 w-4" /> Add Bottle
      </button>
      {guidance && (
        <p className="mt-2 rounded-lg bg-amber-50 p-2 text-xs text-amber-700">
          💡 {guidance}
        </p>
      )}
    </Card>
  );
}
