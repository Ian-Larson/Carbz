import { useFuelPlan } from '../../hooks/useFuelPlan';
import { Card } from '../shared/Card';
import { CollapsibleSection } from '../shared/CollapsibleSection';
import { ProgressBar } from '../shared/ProgressBar';
import { formatScoops, formatPlanAsText } from '../../lib/formatters';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';

export function FuelPlan() {
  const plan = useFuelPlan();
  const [copied, setCopied] = useState(false);

  const hasFuel = plan.bottlePreps.length > 0 || plan.hourlyPlan.some(h => h.solids.length > 0);
  const errorWarnings = plan.warnings.filter(w => w.severity === 'error');
  const nonErrorWarnings = plan.warnings.filter(w => w.severity !== 'error');

  const handleCopy = async () => {
    await navigator.clipboard.writeText(formatPlanAsText(plan));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card title="Your Fuel Plan" icon="📊">
      {!hasFuel ? (
        <div className="flex flex-col items-center py-8 text-center">
          <div className="mb-3 text-4xl">🍌</div>
          <h4 className="mb-1 font-semibold text-gray-900">No fuel plan yet</h4>
          <p className="max-w-[240px] text-sm text-gray-500">
            Set up your ride and choose a fuel strategy. Your plan will appear here.
          </p>
        </div>
      ) : (
        <>
          {/* Quick Summary */}
          {plan.quickSummary && (
            <div className="mb-4 rounded-lg bg-primary-50 border border-primary-100 p-3 text-sm text-primary-800">
              {plan.quickSummary}
            </div>
          )}

          {/* Error Warnings — promoted to top */}
          {errorWarnings.length > 0 && (
            <div className="mb-4 space-y-2">
              {errorWarnings.map((w, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-red-100 border-l-4 border-l-red-400 bg-red-50 p-3 text-sm text-red-700"
                >
                  <span className="mr-1">🚨</span>
                  {w.message}
                </div>
              ))}
            </div>
          )}

          {/* Progress Bars */}
          <div className="mb-4 space-y-3">
            <ProgressBar
              current={plan.totalCarbs}
              target={plan.targetCarbs}
              label="Carbs"
              icon="⚡"
              colorClass="bg-green-500"
            />
            <ProgressBar
              current={plan.totalFluidMl}
              target={plan.targetFluidMl}
              label="Fluid"
              icon="💧"
              colorClass="bg-blue-500"
            />
          </div>

          {/* Summary Cards */}
          <div className="mb-4 grid grid-cols-3 gap-2">
            <SummaryCard value={Math.round(plan.totalCarbs)} unit="g carbs" color="text-green-600" bgColor="bg-green-50" />
            <SummaryCard value={Math.round(plan.totalCalories)} unit="kcal" color="text-blue-600" bgColor="bg-blue-50" />
            <SummaryCard value={Math.round(plan.totalSodiumMg)} unit="mg Na" color="text-orange-600" bgColor="bg-orange-50" />
          </div>

          {/* Caffeine & Cost row */}
          {(plan.totalCaffeineMg > 0 || plan.totalCost !== null) && (
            <div className="mb-4 grid grid-cols-2 gap-2">
              {plan.totalCaffeineMg > 0 && (
                <SummaryCard value={Math.round(plan.totalCaffeineMg)} unit="mg caffeine" color="text-purple-600" bgColor="bg-purple-50" />
              )}
              {plan.totalCost !== null && (
                <SummaryCard value={`$${plan.totalCost.toFixed(2)}`} unit="fuel cost" color="text-gray-600" bgColor="bg-gray-50" />
              )}
            </div>
          )}

          {/* Non-error Warnings */}
          {nonErrorWarnings.length > 0 && (
            <div className="mb-4 space-y-2">
              {nonErrorWarnings.map((w, i) => (
                <div
                  key={i}
                  className={`rounded-lg p-3 text-sm ${
                    w.severity === 'warning'
                      ? 'bg-amber-50 text-amber-700 border border-amber-100'
                      : 'bg-blue-50 text-blue-700 border border-blue-100'
                  }`}
                >
                  <span className="mr-1">
                    {w.severity === 'warning' ? '⚠️' : 'ℹ️'}
                  </span>
                  {w.message}
                </div>
              ))}
            </div>
          )}

          {/* Bottle Prep */}
          {plan.bottlePreps.length > 0 && (
            <CollapsibleSection
              title="Bottle Prep"
              icon="🧴"
              badge={`(${plan.bottlePreps.length})`}
              defaultOpen={true}
            >
              <div className="space-y-2">
                {plan.bottlePreps.map((bp, i) => (
                  <div key={i} className="rounded-lg border border-gray-100 bg-gray-50/50 p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="mr-2 inline-flex h-6 items-center rounded bg-primary-100 px-1.5 text-xs font-bold text-primary-700">
                          B{bp.bottleIndex + 1}
                        </span>
                        <span className="font-medium text-gray-900">{bp.bottleSize}ml bottle</span>
                      </div>
                      <span className={`text-sm font-medium ${
                        bp.concentration > 10 ? 'text-red-600' : bp.concentration > 6 ? 'text-amber-600' : 'text-green-600'
                      }`}>
                        {bp.concentration.toFixed(1)}%
                        <span className="ml-1 text-xs">{bp.concentrationLabel}</span>
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      {bp.totalGrams !== null ? (
                        <>Add {bp.totalGrams}g {bp.mixName} ({formatScoops(bp.scoops)} scoops, {Math.round(bp.carbsGrams)}g carbs)</>
                      ) : (
                        <>Add {formatScoops(bp.scoops)} scoops {bp.mixName} ({Math.round(bp.carbsGrams)}g carbs) — <span className="italic text-gray-400">add gram weight in Library for scale-friendly prep</span></>
                      )}
                    </p>
                  </div>
                ))}
              </div>
            </CollapsibleSection>
          )}

          {/* Hourly Timeline */}
          {plan.hourlyPlan.length > 0 && (
            <CollapsibleSection
              title="Hour by Hour"
              icon="🕐"
              badge={`(${plan.hourlyPlan.length} ${plan.hourlyPlan.length === 1 ? 'hour' : 'hours'})`}
              defaultOpen={false}
            >
              <div className="relative pl-6">
                {/* Timeline line */}
                <div className="absolute left-2.5 top-2 bottom-2 w-px bg-gray-200" />

                {plan.hourlyPlan.map((hour, i) => (
                  <div key={i} className="relative mb-4 last:mb-0">
                    {/* Timeline dot */}
                    <div className={`absolute -left-3.5 top-1.5 h-3 w-3 rounded-full border-2 ${
                      hour.isPartial ? 'border-gray-300 bg-white' : 'border-primary-400 bg-primary-100'
                    }`} />

                    <div className="rounded-lg border border-gray-100 bg-white p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-gray-900">
                          Hour {hour.hourNumber}
                          {hour.isPartial && <span className="text-gray-400 font-normal"> (partial)</span>}
                        </span>
                        <span className="rounded bg-green-50 px-2 py-0.5 text-sm font-semibold text-green-700">
                          {Math.round(hour.totalCarbs)}g
                        </span>
                      </div>
                      <div className="text-xs text-gray-400 mb-2">
                        {formatTime(hour.startMinute)} – {formatTime(hour.endMinute)}
                      </div>

                      {hour.bottles.map((b, bi) => (
                        <div key={bi} className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                          <span className="inline-flex h-5 items-center rounded bg-primary-100 px-1 text-[10px] font-bold text-primary-700">
                            B{b.bottleIndex + 1}
                          </span>
                          Drink {b.fractionLabel} of B{b.bottleIndex + 1} ({b.bottleSize}ml)
                        </div>
                      ))}

                      {hour.solids.map((s, si) => (
                        <div key={si} className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                          <span className="inline-flex h-5 items-center rounded bg-amber-100 px-1 text-[10px] font-bold text-amber-700">
                            eat
                          </span>
                          {s.quantity >= 1 ? Math.round(s.quantity) : s.quantity.toFixed(1)}x {s.name} ({Math.round(s.carbsGrams)}g)
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Finish marker */}
                <div className="relative">
                  <div className="absolute -left-3.5 top-0.5 h-3 w-3 rounded-full bg-green-500 border-2 border-green-300" />
                  <span className="text-sm font-semibold text-green-600">🏁 Finish!</span>
                </div>
              </div>
            </CollapsibleSection>
          )}

          {/* Export button */}
          <button
            onClick={handleCopy}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Copied!' : 'Copy Fuel Plan'}
          </button>
        </>
      )}
    </Card>
  );
}

function SummaryCard({ value, unit, color, bgColor }: { value: number | string; unit: string; color: string; bgColor: string }) {
  return (
    <div className={`rounded-lg ${bgColor} p-3 text-center`}>
      <div className={`text-xl font-bold ${color}`}>{value}</div>
      <div className="text-xs text-gray-500">{unit}</div>
    </div>
  );
}

function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}:${m.toString().padStart(2, '0')}`;
}
