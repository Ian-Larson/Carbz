import { useEffect, useCallback } from 'react';
import { Wand2, Hand } from 'lucide-react';
import { useRideConfigStore } from '../../stores/rideConfigStore';
import { useFuelSelectionsStore } from '../../stores/fuelSelectionsStore';
import { useProductStore } from '../../stores/productStore';
import { suggestFuelPlan } from '../../lib/suggestions';
import { Card } from '../shared/Card';
import type { FuelMode } from '../../types';

export function FuelStrategy() {
  const getRideConfig = useRideConfigStore((s) => s.getRideConfig);
  const bottles = useRideConfigStore((s) => s.bottles);
  const durationMinutes = useRideConfigStore((s) => s.durationMinutes);
  const carbTargetPerHour = useRideConfigStore((s) => s.carbTargetPerHour);
  const condition = useRideConfigStore((s) => s.condition);
  const intensity = useRideConfigStore((s) => s.intensity);

  const mode = useFuelSelectionsStore((s) => s.mode);
  const setMode = useFuelSelectionsStore((s) => s.setMode);
  const selectedProductIds = useFuelSelectionsStore((s) => s.selectedProductIds);
  const toggleProduct = useFuelSelectionsStore((s) => s.toggleProduct);
  const loadSuggestion = useFuelSelectionsStore((s) => s.loadSuggestion);
  const mixSelections = useFuelSelectionsStore((s) => s.drinkMixes);
  const solidSelections = useFuelSelectionsStore((s) => s.solids);

  const drinkMixes = useProductStore((s) => s.drinkMixes);
  const solids = useProductStore((s) => s.solids);

  const runSuggestion = useCallback(() => {
    const config = getRideConfig();
    if (mode === 'auto') {
      const suggestion = suggestFuelPlan(config, drinkMixes, solids);
      loadSuggestion(suggestion);
    } else {
      // Manual: only use selected products
      const selectedMixes = drinkMixes.filter(m => selectedProductIds.includes(m.id));
      const selectedSolids = solids.filter(s => selectedProductIds.includes(s.id));
      if (selectedMixes.length > 0 || selectedSolids.length > 0) {
        const suggestion = suggestFuelPlan(config, selectedMixes, selectedSolids);
        loadSuggestion(suggestion);
      }
    }
  }, [getRideConfig, mode, drinkMixes, solids, selectedProductIds, loadSuggestion]);

  // Auto-run suggestion when config or mode changes
  useEffect(() => {
    runSuggestion();
  }, [bottles, durationMinutes, carbTargetPerHour, condition, intensity, mode, selectedProductIds, runSuggestion]);

  // Show what the suggestion picked
  const usedMixNames = mixSelections.map(s => {
    const mix = drinkMixes.find(m => m.id === s.mixId);
    return mix?.name ?? 'Unknown';
  });
  const usedSolidNames = solidSelections.map(s => {
    const solid = solids.find(p => p.id === s.productId);
    return solid?.name ?? 'Unknown';
  });

  return (
    <Card title="Fuel Strategy" icon="⚡">
      {/* Mode toggle */}
      <div className="mb-4 flex gap-2">
        {([
          { key: 'auto' as FuelMode, label: 'Auto-suggest', icon: Wand2 },
          { key: 'manual' as FuelMode, label: "I'll pick", icon: Hand },
        ]).map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setMode(key)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-medium transition-all ${
              mode === key
                ? 'bg-primary-600 text-white shadow-sm'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-primary-300'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {mode === 'auto' ? (
        <div>
          <p className="mb-2 text-xs text-gray-500">
            Based on your ride setup, here's what the calculator recommends:
          </p>
          {(usedMixNames.length > 0 || usedSolidNames.length > 0) ? (
            <div className="space-y-1.5">
              {usedMixNames.length > 0 && (
                <div className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-800">
                  <span className="text-xs font-semibold">DRINK</span>
                  {[...new Set(usedMixNames)].join(', ')}
                </div>
              )}
              {usedSolidNames.length > 0 && (
                <div className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
                  <span className="text-xs font-semibold">SOLID</span>
                  {[...new Set(usedSolidNames)].join(', ')}
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-400">Add bottles and set your ride to get a suggestion.</p>
          )}
          <button
            onClick={() => setMode('manual')}
            className="mt-2 text-xs text-primary-600 hover:text-primary-700"
          >
            Want to pick your own products? Switch to manual →
          </button>
        </div>
      ) : (
        <div>
          <p className="mb-2 text-xs text-gray-500">
            Select the products you want to use — the calculator handles quantities and timing.
          </p>

          {drinkMixes.length > 0 && (
            <div className="mb-3">
              <span className="mb-1.5 block text-xs font-semibold text-gray-400 uppercase tracking-wider">Drink Mixes</span>
              <div className="space-y-1">
                {drinkMixes.map((mix) => (
                  <label
                    key={mix.id}
                    className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-gray-100 px-3 py-2 transition-colors hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      checked={selectedProductIds.includes(mix.id)}
                      onChange={() => toggleProduct(mix.id)}
                      className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-900">{mix.name}</span>
                    <span className="ml-auto text-xs text-gray-400">{mix.carbsPerScoop}g/scoop</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {solids.length > 0 && (
            <div>
              <span className="mb-1.5 block text-xs font-semibold text-gray-400 uppercase tracking-wider">Gels & Solids</span>
              <div className="space-y-1">
                {solids.map((solid) => (
                  <label
                    key={solid.id}
                    className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-gray-100 px-3 py-2 transition-colors hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      checked={selectedProductIds.includes(solid.id)}
                      onChange={() => toggleProduct(solid.id)}
                      className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-900">{solid.name}</span>
                    <span className="ml-auto text-xs text-gray-400">{solid.carbsPerServing}g</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
