import { useProductStore } from '../../stores/productStore';
import { useRideConfigStore } from '../../stores/rideConfigStore';
import { useFuelSelectionsStore } from '../../stores/fuelSelectionsStore';
import { Card } from '../shared/Card';

export function DrinkMixSection() {
  const drinkMixes = useProductStore((s) => s.drinkMixes);
  const bottles = useRideConfigStore((s) => s.bottles);
  const mixSelections = useFuelSelectionsStore((s) => s.drinkMixes);
  const setMixForBottle = useFuelSelectionsStore((s) => s.setMixForBottle);

  const activeBottleIndices = bottles
    .map((b, i) => (b.count > 0 ? i : -1))
    .filter((i) => i >= 0);

  return (
    <Card title="Drink Mix" icon="🧪">
      <div className="space-y-2">
        {drinkMixes.map((mix) => {
          // Find if this mix is assigned to any bottle
          const assignment = mixSelections.find((s) => s.mixId === mix.id);
          const assignedBottle = assignment?.bottleIndex ?? -1;
          const scoops = assignment?.scoops ?? 0;

          return (
            <div
              key={mix.id}
              className="rounded-lg border border-gray-100 bg-gray-50/50 p-3"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900 text-sm">{mix.name}</div>
                  <div className="text-xs text-gray-400">{mix.carbsPerScoop}g/scoop</div>
                </div>
              </div>

              {activeBottleIndices.length > 0 && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex gap-1">
                    {activeBottleIndices.map((bi) => (
                      <button
                        key={bi}
                        onClick={() => {
                          if (assignedBottle === bi) {
                            // Toggle off
                            setMixForBottle(mix.id, bi, 0);
                          } else {
                            // Remove from old bottle, assign to new
                            if (assignedBottle >= 0) {
                              setMixForBottle(mix.id, assignedBottle, 0);
                            }
                            setMixForBottle(mix.id, bi, scoops || 2);
                          }
                        }}
                        className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
                          assignedBottle === bi
                            ? 'bg-primary-600 text-white'
                            : 'bg-white text-gray-500 border border-gray-200 hover:border-primary-300'
                        }`}
                      >
                        B{bi + 1}
                      </button>
                    ))}
                  </div>

                  {assignedBottle >= 0 && (
                    <div className="flex items-center gap-1 ml-auto">
                      <button
                        onClick={() => setMixForBottle(mix.id, assignedBottle, Math.max(0.5, scoops - 0.5))}
                        className="flex h-6 w-6 items-center justify-center rounded border border-gray-200 text-xs text-gray-500 hover:bg-gray-50"
                      >
                        -
                      </button>
                      <span className="min-w-[3rem] text-center text-sm font-medium">
                        {scoops} {scoops === 1 ? 'scoop' : 'scoops'}
                      </span>
                      <button
                        onClick={() => setMixForBottle(mix.id, assignedBottle, scoops + 0.5)}
                        className="flex h-6 w-6 items-center justify-center rounded border border-gray-200 text-xs text-gray-500 hover:bg-gray-50"
                      >
                        +
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
