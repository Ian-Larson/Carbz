import { useMemo, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useRideConfigStore } from '../../stores/rideConfigStore';
import { Card } from '../shared/Card';
import { ChipSelector } from '../shared/ChipSelector';
import { DURATION_GROUPS, CARB_TARGETS, CONDITIONS, INTENSITIES } from '../../types/constants';
import { calcFluidTarget } from '../../lib/calculations';
import { formatDuration } from '../../lib/formatters';
import type { Condition, Intensity } from '../../types';

export function RideSetup() {
  const durationMinutes = useRideConfigStore((s) => s.durationMinutes);
  const setDuration = useRideConfigStore((s) => s.setDuration);
  const carbTargetPerHour = useRideConfigStore((s) => s.carbTargetPerHour);
  const setCarbTarget = useRideConfigStore((s) => s.setCarbTarget);
  const condition = useRideConfigStore((s) => s.condition);
  const setCondition = useRideConfigStore((s) => s.setCondition);
  const intensity = useRideConfigStore((s) => s.intensity);
  const setIntensity = useRideConfigStore((s) => s.setIntensity);

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showCustomDuration, setShowCustomDuration] = useState(false);
  const [customHours, setCustomHours] = useState('');
  const [customMinutes, setCustomMinutes] = useState('');

  const fluidTarget = useMemo(
    () => Math.round(calcFluidTarget(condition, durationMinutes)),
    [condition, durationMinutes]
  );

  const handleCustomDuration = () => {
    const h = parseInt(customHours, 10) || 0;
    const m = parseInt(customMinutes, 10) || 0;
    const total = h * 60 + m;
    if (total >= 15 && total <= 600) {
      setDuration(total);
      setShowCustomDuration(false);
      setCustomHours('');
      setCustomMinutes('');
    }
  };

  return (
    <Card title="Ride Setup" icon="⚙️">
      <div className="space-y-5">
        <div>
          <label className="mb-2 block text-sm font-semibold text-[var(--text-primary)]">Duration</label>
          {DURATION_GROUPS.map((group) => (
            <div key={group.label} className="mb-2">
              <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--text-muted)]">
                {group.label}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {group.options.map((minutes) => {
                  const selected = minutes === durationMinutes;
                  return (
                    <button
                      key={minutes}
                      type="button"
                      onClick={() => setDuration(minutes)}
                      className={`rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors ${
                        selected
                          ? 'bg-[var(--accent)] text-[var(--accent-contrast)]'
                          : 'border border-[var(--line)] bg-[var(--surface)] text-[var(--text-primary)] hover:border-[var(--line-strong)]'
                      }`}
                    >
                      {formatDuration(minutes)}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          {showAdvanced && (
            <div className="mt-2">
              {!showCustomDuration ? (
                <button
                  type="button"
                  onClick={() => setShowCustomDuration(true)}
                  className="text-xs font-semibold text-[var(--accent)] hover:text-[var(--accent-strong)]"
                >
                  Set custom duration...
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={customHours}
                    onChange={(e) => setCustomHours(e.target.value)}
                    placeholder="hrs"
                    className="w-16 rounded-lg border border-[var(--line)] bg-[var(--surface)] px-2 py-1 text-sm text-[var(--text-primary)]"
                    min={0}
                    max={10}
                  />
                  <span className="text-xs text-[var(--text-muted)]">h</span>
                  <input
                    type="number"
                    value={customMinutes}
                    onChange={(e) => setCustomMinutes(e.target.value)}
                    placeholder="min"
                    className="w-16 rounded-lg border border-[var(--line)] bg-[var(--surface)] px-2 py-1 text-sm text-[var(--text-primary)]"
                    min={0}
                    max={59}
                  />
                  <span className="text-xs text-[var(--text-muted)]">m</span>
                  <button
                    type="button"
                    onClick={handleCustomDuration}
                    className="rounded-lg bg-[var(--accent)] px-2.5 py-1 text-xs font-semibold text-[var(--accent-contrast)]"
                  >
                    Set
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-[var(--text-primary)]">Conditions</label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {CONDITIONS.map((c) => {
              const selected = c.key === condition;
              return (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => setCondition(c.key as Condition)}
                  className={`rounded-xl border p-2.5 text-center transition-colors ${
                    selected
                      ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--text-primary)]'
                      : 'border-[var(--line)] bg-[var(--surface)] text-[var(--text-primary)] hover:border-[var(--line-strong)]'
                  }`}
                >
                  <span className="mb-0.5 block text-base">{c.icon}</span>
                  <span className="block text-xs font-semibold">{c.label}</span>
                  <span className="block text-[10px] text-[var(--text-muted)]">{c.tempRange}</span>
                  <span className="block text-[10px] text-[var(--text-muted)]">{c.fluidPerHour}ml/hr</span>
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-xs text-[var(--text-muted)]">
            Fluid target: <strong className="text-[var(--text-primary)]">{fluidTarget}ml</strong> for {formatDuration(durationMinutes)}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAdvanced((v) => !v)}
          className="inline-flex items-center gap-1 rounded-lg border border-[var(--line)] bg-[var(--surface-muted)] px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.1em] text-[var(--text-primary)] hover:border-[var(--line-strong)]"
        >
          {showAdvanced ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          {showAdvanced ? 'Hide advanced options' : 'Show advanced options'}
        </button>

        {showAdvanced && (
          <div className="space-y-5 border-t border-[var(--line)] pt-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-[var(--text-primary)]">Carb Target (g/hr)</label>
              <ChipSelector
                options={CARB_TARGETS.map((target) => ({ value: target, label: `${target}g` }))}
                selected={carbTargetPerHour}
                onChange={setCarbTarget}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[var(--text-primary)]">Intensity</label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {INTENSITIES.map((item) => {
                  const selected = item.key === intensity;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setIntensity(item.key as Intensity)}
                      className={`rounded-xl border p-2.5 text-center transition-colors ${
                        selected
                          ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--text-primary)]'
                          : 'border-[var(--line)] bg-[var(--surface)] text-[var(--text-primary)] hover:border-[var(--line-strong)]'
                      }`}
                    >
                      <span className="mb-0.5 block text-base">{item.icon}</span>
                      <span className="block text-xs font-semibold">{item.label}</span>
                      <span className="block text-[10px] text-[var(--text-muted)]">{item.description}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
