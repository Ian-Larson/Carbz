import { useEffect, useCallback, useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, Hand, Wand2 } from 'lucide-react';
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

  const [showAutoDetails, setShowAutoDetails] = useState(false);
  const [showManualChooser, setShowManualChooser] = useState(true);

  const runSuggestion = useCallback(() => {
    const config = getRideConfig();
    if (mode === 'auto') {
      const suggestion = suggestFuelPlan(config, drinkMixes, solids);
      loadSuggestion(suggestion);
      return;
    }

    const selectedMixes = drinkMixes.filter((mix) => selectedProductIds.includes(mix.id));
    const selectedSolids = solids.filter((solid) => selectedProductIds.includes(solid.id));
    if (selectedMixes.length > 0 || selectedSolids.length > 0) {
      const suggestion = suggestFuelPlan(config, selectedMixes, selectedSolids);
      loadSuggestion(suggestion);
    }
  }, [getRideConfig, mode, drinkMixes, solids, selectedProductIds, loadSuggestion]);

  useEffect(() => {
    runSuggestion();
  }, [bottles, durationMinutes, carbTargetPerHour, condition, intensity, mode, selectedProductIds, runSuggestion]);

  const usedMixNames = useMemo(
    () =>
      mixSelections
        .map((selection) => drinkMixes.find((mix) => mix.id === selection.mixId)?.name ?? 'Unknown')
        .filter((value, index, list) => list.indexOf(value) === index),
    [mixSelections, drinkMixes]
  );

  const usedSolidNames = useMemo(
    () =>
      solidSelections
        .map((selection) => solids.find((solid) => solid.id === selection.productId)?.name ?? 'Unknown')
        .filter((value, index, list) => list.indexOf(value) === index),
    [solidSelections, solids]
  );

  const hasAutoSuggestion = usedMixNames.length > 0 || usedSolidNames.length > 0;

  return (
    <Card title="Fuel Strategy" icon="⚡">
      <div className="mb-4 flex gap-2">
        {([
          { key: 'auto' as FuelMode, label: 'Auto-suggest', icon: Wand2 },
          { key: 'manual' as FuelMode, label: 'Manual', icon: Hand },
        ]).map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setMode(key)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl border py-2 text-sm font-semibold transition-colors ${
              mode === key
                ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--text-primary)]'
                : 'border-[var(--line)] bg-[var(--surface)] text-[var(--text-primary)] hover:border-[var(--line-strong)]'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {mode === 'auto' ? (
        <div className="space-y-2">
          <p className="text-xs text-[var(--text-muted)]">
            The app builds a plan from your setup and keeps it updated as you change ride details.
          </p>
          {hasAutoSuggestion ? (
            <div className="rounded-xl border border-[var(--line)] bg-[var(--surface-muted)] p-3">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-semibold text-[var(--text-primary)]">Current recommendation ready</p>
                <button
                  type="button"
                  onClick={() => setShowAutoDetails((v) => !v)}
                  className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                >
                  {showAutoDetails ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                  {showAutoDetails ? 'Hide details' : 'Show details'}
                </button>
              </div>
              {showAutoDetails && (
                <div className="space-y-1.5 text-sm">
                  {usedMixNames.length > 0 && (
                    <div className="rounded-lg bg-[var(--surface)] px-3 py-2 text-[var(--text-primary)]">
                      <span className="mr-2 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">
                        Drink
                      </span>
                      {usedMixNames.join(', ')}
                    </div>
                  )}
                  {usedSolidNames.length > 0 && (
                    <div className="rounded-lg bg-[var(--surface)] px-3 py-2 text-[var(--text-primary)]">
                      <span className="mr-2 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">
                        Solid
                      </span>
                      {usedSolidNames.join(', ')}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <p className="rounded-lg bg-[var(--surface-muted)] px-3 py-2 text-sm text-[var(--text-muted)]">
              Add bottles and ride details to generate an automatic fuel plan.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-[var(--text-muted)]">
            Select which products are allowed, then the plan computes quantities from those choices.
          </p>
          <button
            type="button"
            onClick={() => setShowManualChooser((v) => !v)}
            className="inline-flex items-center gap-1 rounded-lg border border-[var(--line)] bg-[var(--surface-muted)] px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.1em] text-[var(--text-primary)] hover:border-[var(--line-strong)]"
          >
            {showManualChooser ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            {showManualChooser ? 'Hide product chooser' : 'Choose products'}
          </button>

          {showManualChooser && (
            <>
              {drinkMixes.length > 0 && (
                <div>
                  <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)]">
                    Drink mixes
                  </span>
                  <div className="space-y-1.5">
                    {drinkMixes.map((mix) => (
                      <label
                        key={mix.id}
                        className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 hover:border-[var(--line-strong)]"
                      >
                        <input
                          type="checkbox"
                          checked={selectedProductIds.includes(mix.id)}
                          onChange={() => toggleProduct(mix.id)}
                          className="h-4 w-4 rounded border-[var(--line)] accent-[var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                          aria-label={`Toggle ${mix.name}`}
                        />
                        <span className="text-sm text-[var(--text-primary)]">{mix.name}</span>
                        <span className="ml-auto text-xs text-[var(--text-muted)]">{mix.carbsPerScoop}g/scoop</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {solids.length > 0 && (
                <div>
                  <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)]">
                    Gels and solids
                  </span>
                  <div className="space-y-1.5">
                    {solids.map((solid) => (
                      <label
                        key={solid.id}
                        className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 hover:border-[var(--line-strong)]"
                      >
                        <input
                          type="checkbox"
                          checked={selectedProductIds.includes(solid.id)}
                          onChange={() => toggleProduct(solid.id)}
                          className="h-4 w-4 rounded border-[var(--line)] accent-[var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                          aria-label={`Toggle ${solid.name}`}
                        />
                        <span className="text-sm text-[var(--text-primary)]">{solid.name}</span>
                        <span className="ml-auto text-xs text-[var(--text-muted)]">{solid.carbsPerServing}g</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </Card>
  );
}
