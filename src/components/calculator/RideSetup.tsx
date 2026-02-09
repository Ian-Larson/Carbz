import { useRideConfigStore } from '../../stores/rideConfigStore';
import { Card } from '../shared/Card';
import { ChipSelector } from '../shared/ChipSelector';
import { DURATION_OPTIONS, CARB_TARGETS, CONDITIONS, INTENSITIES } from '../../types/constants';
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

  const fluidTarget = calcFluidTarget(condition, durationMinutes);

  return (
    <Card title="Ride Setup" icon="⚙️">
      {/* Duration */}
      <div className="mb-4">
        <label className="mb-2 block text-sm font-medium text-gray-700">Duration</label>
        <ChipSelector
          options={DURATION_OPTIONS.map((m) => ({
            value: m,
            label: formatDuration(m),
          }))}
          selected={durationMinutes}
          onChange={setDuration}
          columns={7}
        />
      </div>

      {/* Carb Target */}
      <div className="mb-4">
        <label className="mb-2 block text-sm font-medium text-gray-700">Carb Target (g/hr)</label>
        <ChipSelector
          options={CARB_TARGETS.map((t) => ({
            value: t,
            label: `${t}g`,
          }))}
          selected={carbTargetPerHour}
          onChange={setCarbTarget}
        />
      </div>

      {/* Conditions */}
      <div className="mb-4">
        <label className="mb-2 block text-sm font-medium text-gray-700">Conditions</label>
        <div className="grid grid-cols-4 gap-2">
          {CONDITIONS.map((c) => {
            const isSelected = c.key === condition;
            return (
              <button
                key={c.key}
                onClick={() => setCondition(c.key as Condition)}
                className={`rounded-lg p-2 text-center text-xs transition-all ${
                  isSelected
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-primary-300'
                }`}
              >
                <span className="text-base block">{c.icon}</span>
                <span className="font-medium">{c.label}</span>
                <span className={`block text-[10px] ${isSelected ? 'text-primary-100' : 'text-gray-400'}`}>
                  {c.tempRange} / {c.fluidPerHour}ml/hr
                </span>
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-xs text-primary-600">
          💧 Fluid target: <strong>{Math.round(fluidTarget)}ml</strong> for a {formatDuration(durationMinutes)} ride
        </p>
      </div>

      {/* Intensity */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">Intensity</label>
        <div className="grid grid-cols-4 gap-2">
          {INTENSITIES.map((int) => {
            const isSelected = int.key === intensity;
            return (
              <button
                key={int.key}
                onClick={() => setIntensity(int.key as Intensity)}
                className={`rounded-lg p-2 text-center text-xs transition-all ${
                  isSelected
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-primary-300'
                }`}
              >
                <span className="text-base block">{int.icon}</span>
                <span className="font-medium">{int.label}</span>
                <span className={`block text-[10px] ${isSelected ? 'text-primary-100' : 'text-gray-400'}`}>
                  {int.description}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
