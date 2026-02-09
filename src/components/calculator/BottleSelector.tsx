import { useRideConfigStore } from '../../stores/rideConfigStore';
import { Counter } from '../shared/Counter';
import { Card } from '../shared/Card';
import { BOTTLE_SIZES, MAX_BOTTLES_ON_BIKE } from '../../types/constants';

export function BottleSelector() {
  const bottles = useRideConfigStore((s) => s.bottles);
  const setBottle = useRideConfigStore((s) => s.setBottle);

  const totalBottles = bottles.reduce((s, b) => s + b.count, 0);

  return (
    <Card title="Bottles Available" icon="🍼">
      <p className="mb-3 text-xs text-gray-400">
        What bottles do you have today? ({MAX_BOTTLES_ON_BIKE} max on the bike)
      </p>
      <div className="space-y-2">
        {bottles.map((bottle, idx) => {
          const maxForThis = Math.min(
            MAX_BOTTLES_ON_BIKE,
            MAX_BOTTLES_ON_BIKE - totalBottles + bottle.count
          );
          return (
            <div
              key={BOTTLE_SIZES[idx]}
              className={`flex items-center justify-between rounded-lg border p-3 transition-colors ${
                bottle.count > 0
                  ? 'border-primary-200 bg-primary-50/50'
                  : 'border-gray-100 bg-gray-50/50'
              }`}
            >
              <span className={`font-medium ${bottle.count > 0 ? 'text-primary-700' : 'text-gray-500'}`}>
                {bottle.count > 0 && <span className="mr-1.5">🔴</span>}
                {BOTTLE_SIZES[idx]}ml
              </span>
              <Counter
                value={bottle.count}
                onChange={(count) => setBottle(idx, { ...bottle, count })}
                min={0}
                max={maxForThis}
              />
            </div>
          );
        })}
      </div>
    </Card>
  );
}
