import { useMemo, useState } from 'react';
import { Check, Copy, Wrench } from 'lucide-react';
import { useFuelPlan } from '../../hooks/useFuelPlan';
import { Card } from '../shared/Card';
import { CollapsibleSection } from '../shared/CollapsibleSection';
import { ProgressBar } from '../shared/ProgressBar';
import { formatScoops, formatPlanAsText } from '../../lib/formatters';
import { useRideConfigStore } from '../../stores/rideConfigStore';
import { useFuelSelectionsStore } from '../../stores/fuelSelectionsStore';
import { useProductStore } from '../../stores/productStore';
import { useSetupFlowStore, getSetupCompletion } from '../../stores/setupFlowStore';
import type { Warning } from '../../types';

type WarningAction = {
  label: string;
  run: () => void;
};

export function FuelPlan() {
  const plan = useFuelPlan();
  const [copied, setCopied] = useState(false);

  const bottles = useRideConfigStore((s) => s.bottles);
  const durationMinutes = useRideConfigStore((s) => s.durationMinutes);
  const carbTargetPerHour = useRideConfigStore((s) => s.carbTargetPerHour);
  const condition = useRideConfigStore((s) => s.condition);
  const intensity = useRideConfigStore((s) => s.intensity);
  const addBottle = useRideConfigStore((s) => s.addBottle);

  const drinkMixSelections = useFuelSelectionsStore((s) => s.drinkMixes);
  const solidSelections = useFuelSelectionsStore((s) => s.solids);
  const setMixForBottle = useFuelSelectionsStore((s) => s.setMixForBottle);
  const setSolidPerHour = useFuelSelectionsStore((s) => s.setSolidPerHour);

  const drinkMixes = useProductStore((s) => s.drinkMixes);
  const solids = useProductStore((s) => s.solids);

  const moveToFirstIncomplete = useSetupFlowStore((s) => s.moveToFirstIncomplete);

  const hasFuel = plan.bottlePreps.length > 0 || plan.hourlyPlan.some((hour) => hour.solids.length > 0);

  const completion = useMemo(
    () =>
      getSetupCompletion({
        rideConfig: { bottles, durationMinutes, carbTargetPerHour, condition, intensity },
        fuelSelections: { drinkMixes: drinkMixSelections, solids: solidSelections },
      }),
    [bottles, durationMinutes, carbTargetPerHour, condition, intensity, drinkMixSelections, solidSelections]
  );

  const warningActions = useMemo(
    () =>
      new Map(
        plan.warnings.map((warning, index) => [
          `${warning.type}-${index}`,
          buildWarningAction(
            warning,
            addBottle,
            drinkMixSelections,
            setMixForBottle,
            solidSelections,
            setSolidPerHour,
            drinkMixes,
            solids
          ),
        ])
      ),
    [
      plan.warnings,
      addBottle,
      drinkMixSelections,
      setMixForBottle,
      solidSelections,
      setSolidPerHour,
      drinkMixes,
      solids,
    ]
  );

  const handleCopy = async () => {
    await navigator.clipboard.writeText(formatPlanAsText(plan));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card title="Fuel Plan" icon="📊">
      {!hasFuel ? (
        <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface-muted)] p-6 text-center">
          <div className="mb-3 text-4xl">🍌</div>
          <h4 className="mb-1 text-lg font-semibold text-[var(--text-primary)]">No fuel plan yet</h4>
          <p className="mx-auto max-w-[250px] text-sm text-[var(--text-muted)]">
            Complete the guided setup and this panel will generate your final fueling details.
          </p>
          <button
            type="button"
            onClick={() => moveToFirstIncomplete(completion)}
            className="mt-4 rounded-lg bg-[var(--accent)] px-3 py-1.5 text-sm font-semibold text-[var(--accent-contrast)] hover:bg-[var(--accent-strong)]"
          >
            Go to first incomplete step
          </button>
        </div>
      ) : (
        <>
          {plan.quickSummary && (
            <div className="mb-4 rounded-xl border border-[var(--line)] bg-[var(--surface-muted)] p-3 text-sm text-[var(--text-primary)]">
              {plan.quickSummary}
            </div>
          )}

          <div className="mb-4 space-y-3">
            <ProgressBar current={plan.totalCarbs} target={plan.targetCarbs} label="Carbs" icon="⚡" />
            <ProgressBar current={plan.totalFluidMl} target={plan.targetFluidMl} label="Fluid" icon="💧" colorClass="bg-[var(--accent)]" />
          </div>

          <div className="mb-4 grid grid-cols-3 gap-2">
            <SummaryCard value={Math.round(plan.totalCarbs)} unit="g carbs" color="text-[var(--success)]" />
            <SummaryCard value={Math.round(plan.totalCalories)} unit="kcal" color="text-[var(--text-primary)]" />
            <SummaryCard value={Math.round(plan.totalSodiumMg)} unit="mg Na" color="text-[var(--warning)]" />
          </div>

          {(plan.totalCaffeineMg > 0 || plan.totalCost !== null) && (
            <div className="mb-4 grid grid-cols-2 gap-2">
              {plan.totalCaffeineMg > 0 && (
                <SummaryCard value={Math.round(plan.totalCaffeineMg)} unit="mg caffeine" color="text-[var(--danger)]" />
              )}
              {plan.totalCost !== null && (
                <SummaryCard value={`$${plan.totalCost.toFixed(2)}`} unit="fuel cost" color="text-[var(--text-primary)]" />
              )}
            </div>
          )}

          {plan.warnings.length > 0 && (
            <div className="mb-4 space-y-2">
              {plan.warnings.map((warning, index) => {
                const action = warningActions.get(`${warning.type}-${index}`);
                return (
                  <WarningCard
                    key={`${warning.type}-${index}`}
                    warning={warning}
                    action={action}
                  />
                );
              })}
            </div>
          )}

          {plan.bottlePreps.length > 0 && (
            <CollapsibleSection
              title="Bottle Prep"
              icon="🧴"
              badge={`(${plan.bottlePreps.length})`}
              defaultOpen={true}
            >
              <div className="space-y-2">
                {plan.bottlePreps.map((prep, index) => {
                  const perBottleCarbs = prep.quantity > 0 ? prep.carbsGrams / prep.quantity : prep.carbsGrams;
                  const quantityLabel = prep.quantity > 1 ? `x${prep.quantity}` : null;
                  return (
                    <div key={index} className="rounded-xl border border-[var(--line)] bg-[var(--surface-muted)] p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex h-6 items-center rounded bg-[var(--accent-soft)] px-1.5 text-xs font-bold text-[var(--text-primary)]">
                            B{prep.bottleIndex + 1}
                          </span>
                          <span className="font-medium text-[var(--text-primary)]">{prep.bottleSize}ml bottle</span>
                          {quantityLabel && (
                            <span className="rounded-full border border-[var(--line)] bg-[var(--surface)] px-2 py-0.5 text-xs font-semibold text-[var(--text-muted)]">
                              {quantityLabel}
                            </span>
                          )}
                        </div>
                        <span
                          className={`text-sm font-semibold ${
                            prep.concentration > 10
                              ? 'text-[var(--danger)]'
                              : prep.concentration > 6
                                ? 'text-[var(--warning)]'
                                : 'text-[var(--success)]'
                          }`}
                        >
                          {prep.concentration.toFixed(1)}%
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-[var(--text-muted)]">
                        {prep.totalGrams !== null ? (
                          <>
                            Add {prep.totalGrams}g {prep.mixName} per bottle ({formatScoops(prep.scoops)} scoops, {Math.round(perBottleCarbs)}g carbs each)
                          </>
                        ) : (
                          <>
                            Add {formatScoops(prep.scoops)} scoops {prep.mixName} per bottle ({Math.round(perBottleCarbs)}g carbs each)
                          </>
                        )}
                      </p>
                    </div>
                  );
                })}
              </div>
            </CollapsibleSection>
          )}

          {plan.hourlyPlan.length > 0 && (
            <CollapsibleSection
              title="Hour by Hour"
              icon="🕐"
              badge={`(${plan.hourlyPlan.length} ${plan.hourlyPlan.length === 1 ? 'hour' : 'hours'})`}
              defaultOpen={false}
            >
              <div className="relative pl-6">
                <div className="absolute bottom-2 left-2.5 top-2 w-px bg-[var(--line)]" />

                {plan.hourlyPlan.map((hour, index) => (
                  <div key={index} className="relative mb-4 last:mb-0">
                    <div
                      className={`absolute -left-3.5 top-1.5 h-3 w-3 rounded-full border-2 ${
                        hour.isPartial
                          ? 'border-[var(--line-strong)] bg-[var(--surface)]'
                          : 'border-[var(--accent)] bg-[var(--accent-soft)]'
                      }`}
                    />

                    <div className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-3">
                      <div className="mb-1 flex items-center justify-between">
                        <span className="font-semibold text-[var(--text-primary)]">
                          Hour {hour.hourNumber}
                          {hour.isPartial && <span className="font-normal text-[var(--text-muted)]"> (partial)</span>}
                        </span>
                        <span className="rounded bg-[var(--accent-soft)] px-2 py-0.5 text-sm font-semibold text-[var(--text-primary)]">
                          {Math.round(hour.totalCarbs)}g
                        </span>
                      </div>
                      <div className="mb-2 text-xs text-[var(--text-muted)]">
                        {formatTime(hour.startMinute)} - {formatTime(hour.endMinute)}
                      </div>

                      {hour.bottles.map((bottle, bottleIndex) => (
                        <div key={bottleIndex} className="mb-1 flex items-center gap-2 text-sm text-[var(--text-primary)]">
                          <span className="inline-flex h-5 items-center rounded bg-[var(--accent-soft)] px-1 text-[10px] font-bold text-[var(--text-primary)]">
                            B{bottle.bottleIndex + 1}
                          </span>
                          Drink {bottle.fractionLabel} of B{bottle.bottleIndex + 1} ({bottle.bottleSize}ml)
                        </div>
                      ))}

                      {hour.solids.map((solid, solidIndex) => (
                        <div key={solidIndex} className="mb-1 flex items-center gap-2 text-sm text-[var(--text-primary)]">
                          <span className="inline-flex h-5 items-center rounded bg-[var(--warning-soft)] px-1 text-[10px] font-bold text-[var(--text-primary)]">
                            eat
                          </span>
                          {solid.quantity >= 1 ? Math.round(solid.quantity) : solid.quantity.toFixed(1)}x {solid.name} ({Math.round(solid.carbsGrams)}g)
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                <div className="relative">
                  <div className="absolute -left-3.5 top-0.5 h-3 w-3 rounded-full border-2 border-[var(--success-soft)] bg-[var(--success)]" />
                  <span className="text-sm font-semibold text-[var(--success)]">Finish</span>
                </div>
              </div>
            </CollapsibleSection>
          )}

          <button
            type="button"
            onClick={handleCopy}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] py-2.5 text-sm font-semibold text-[var(--text-primary)] transition-colors hover:border-[var(--line-strong)] hover:bg-[var(--surface-muted)]"
          >
            {copied ? <Check className="h-4 w-4 text-[var(--success)]" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Copied' : 'Copy Fuel Plan'}
          </button>
        </>
      )}
    </Card>
  );
}

function buildWarningAction(
  warning: Warning,
  addBottle: (size: number) => void,
  drinkMixSelections: Array<{ mixId: string; bottleIndex: number; scoops: number }>,
  setMixForBottle: (mixId: string, bottleIndex: number, scoops: number) => void,
  solidSelections: Array<{ productId: string; perHour: number }>,
  setSolidPerHour: (productId: string, perHour: number) => void,
  drinkMixes: Array<{ id: string; sodiumPerScoop: number; caffeinePerScoop: number }>,
  solids: Array<{ id: string; carbsPerServing: number; sodiumPerServing: number; caffeinePerServing: number }>
): WarningAction | null {
  if (warning.type === 'fluid' || warning.type === 'capacity') {
    return {
      label: 'Add bottle',
      run: () => addBottle(750),
    };
  }

  if (warning.type === 'concentration') {
    return {
      label: 'Lower concentration',
      run: () => {
        const bottleIndex = warning.context?.bottleIndex;
        const selection = drinkMixSelections.find((mix) =>
          bottleIndex != null ? mix.bottleIndex === bottleIndex : true
        );
        if (!selection) return;
        setMixForBottle(selection.mixId, selection.bottleIndex, Math.max(0.5, selection.scoops - 0.5));
      },
    };
  }

  if (warning.type === 'carbs' && warning.severity === 'warning') {
    return {
      label: 'Increase carbs',
      run: () => {
        const highCarbSolid = [...solids].sort((a, b) => b.carbsPerServing - a.carbsPerServing)[0];
        if (highCarbSolid) {
          const existing = solidSelections.find((selection) => selection.productId === highCarbSolid.id);
          setSolidPerHour(highCarbSolid.id, (existing?.perHour ?? 0) + 1);
          return;
        }
        const firstMix = drinkMixSelections[0];
        if (firstMix) {
          setMixForBottle(firstMix.mixId, firstMix.bottleIndex, firstMix.scoops + 0.5);
        }
      },
    };
  }

  if (warning.type === 'carbs' && warning.severity === 'info') {
    return {
      label: 'Lower carbs',
      run: () => {
        const firstSolid = solidSelections[0];
        if (firstSolid) {
          setSolidPerHour(firstSolid.productId, Math.max(0, firstSolid.perHour - 1));
          return;
        }
        const firstMix = drinkMixSelections[0];
        if (firstMix) {
          setMixForBottle(firstMix.mixId, firstMix.bottleIndex, Math.max(0.5, firstMix.scoops - 0.5));
        }
      },
    };
  }

  if (warning.type === 'sodium' && warning.severity === 'warning') {
    return {
      label: 'Adjust sodium',
      run: () => {
        const bestSodiumMix = [...drinkMixes].sort((a, b) => b.sodiumPerScoop - a.sodiumPerScoop)[0];
        if (!bestSodiumMix) return;
        const existing = drinkMixSelections.find((selection) => selection.mixId === bestSodiumMix.id);
        if (existing) {
          setMixForBottle(existing.mixId, existing.bottleIndex, existing.scoops + 0.5);
          return;
        }
        const firstBottle = drinkMixSelections[0]?.bottleIndex ?? 0;
        setMixForBottle(bestSodiumMix.id, firstBottle, 1);
      },
    };
  }

  if (warning.type === 'sodium' && warning.severity === 'info') {
    return {
      label: 'Reduce sodium',
      run: () => {
        const bestSodiumMix = [...drinkMixes].sort((a, b) => b.sodiumPerScoop - a.sodiumPerScoop)[0];
        if (!bestSodiumMix) return;
        const existing = drinkMixSelections.find((selection) => selection.mixId === bestSodiumMix.id);
        if (!existing) return;
        setMixForBottle(existing.mixId, existing.bottleIndex, Math.max(0.5, existing.scoops - 0.5));
      },
    };
  }

  if (warning.type === 'caffeine') {
    return {
      label: 'Reduce caffeine',
      run: () => {
        const caffeinatedSolid = solids.find((solid) => solid.caffeinePerServing > 0);
        if (caffeinatedSolid) {
          const existing = solidSelections.find((selection) => selection.productId === caffeinatedSolid.id);
          if (existing) {
            setSolidPerHour(caffeinatedSolid.id, Math.max(0, existing.perHour - 1));
            return;
          }
        }

        const caffeinatedMix = drinkMixes.find((mix) => mix.caffeinePerScoop > 0);
        if (!caffeinatedMix) return;
        const existingMixSelection = drinkMixSelections.find((selection) => selection.mixId === caffeinatedMix.id);
        if (!existingMixSelection) return;
        setMixForBottle(
          existingMixSelection.mixId,
          existingMixSelection.bottleIndex,
          Math.max(0.5, existingMixSelection.scoops - 0.5)
        );
      },
    };
  }

  return null;
}

function WarningCard({ warning, action }: { warning: Warning; action: WarningAction | null | undefined }) {
  const tone =
    warning.severity === 'warning'
      ? 'border-[var(--warning)] bg-[var(--warning-soft)]'
      : warning.severity === 'error'
        ? 'border-[var(--danger)] bg-[var(--danger-soft)]'
        : 'border-[var(--line)] bg-[var(--surface-muted)]';

  return (
    <div className={`rounded-xl border p-3 ${tone}`}>
      <p className="text-sm text-[var(--text-primary)]">{warning.message}</p>
      {action && (
        <button
          type="button"
          onClick={action.run}
          className="mt-2 inline-flex items-center gap-1 rounded-lg border border-[var(--line)] bg-[var(--surface)] px-2.5 py-1 text-xs font-semibold text-[var(--text-primary)] hover:border-[var(--line-strong)]"
        >
          <Wrench className="h-3.5 w-3.5" />
          {action.label}
        </button>
      )}
    </div>
  );
}

function SummaryCard({ value, unit, color }: { value: number | string; unit: string; color: string }) {
  return (
    <div className="rounded-xl border border-[var(--line)] bg-[var(--surface-muted)] p-3 text-center">
      <div className={`text-xl font-bold ${color}`}>{value}</div>
      <div className="text-xs text-[var(--text-muted)]">{unit}</div>
    </div>
  );
}

function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}:${m.toString().padStart(2, '0')}`;
}
