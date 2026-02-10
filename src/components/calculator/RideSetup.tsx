import { useState } from 'react';
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

  const [showCustomDuration, setShowCustomDuration] = useState(false);
  const [customHours, setCustomHours] = useState('');
  const [customMinutes, setCustomMinutes] = useState('');

  const fluidTarget = calcFluidTarget(condition, durationMinutes);

  const handleCustomDuration = () => {
    const h = parseInt(customHours) || 0;
    const m = parseInt(customMinutes) || 0;
    const total = h * 60 + m;
    if (total >= 15 && total <= 600) {
      setDuration(total);
      setShowCustomDuration(false);
    }
  };

  return (
    <Card title="Ride Setup" icon="⚙️">
      {/* Duration - Grouped */}
      <div className="mb-5">
        <label className="mb-2 block text-sm font-medium text-gray-700">Duration</label>
        {DURATION_GROUPS.map((group) => (
          <div key={group.label} className="mb-2">
            <span className="mb-1 block text-xs text-gray-400">{group.label}</span>
            <div className="flex flex-wrap gap-1.5">
              {group.options.map((m) => {
                const isSelected = m === durationMinutes;
                return (
                  <button
                    key={m}
                    onClick={() => setDuration(m)}
                    className={`rounded-lg px-2.5 py-1.5 text-sm font-medium transition-all ${
                      isSelected
                        ? 'bg-primary-600 text-white shadow-sm'
                        : 'bg-white text-gray-700 border border-gray-200 hover:border-primary-300 hover:bg-primary-50'
                    }`}
                  >
                    {formatDuration(m)}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
        {!showCustomDuration ? (
          <button
            onClick={() => setShowCustomDuration(true)}
            className="text-xs text-primary-600 hover:text-primary-700"
          >
            Custom duration...
          </button>
        ) : (
          <div className="mt-1 flex items-center gap-2">
            <input
              type="number"
              value={customHours}
              onChange={(e) => setCustomHours(e.target.value)}
              placeholder="hrs"
              className="w-16 rounded-md border border-gray-200 px-2 py-1 text-sm"
              min={0}
              max={10}
            />
            <span className="text-xs text-gray-400">h</span>
            <input
              type="number"
              value={customMinutes}
              onChange={(e) => setCustomMinutes(e.target.value)}
              placeholder="min"
              className="w-16 rounded-md border border-gray-200 px-2 py-1 text-sm"
              min={0}
              max={59}
            />
            <span className="text-xs text-gray-400">m</span>
            <button
              onClick={handleCustomDuration}
              className="rounded-md bg-primary-600 px-2 py-1 text-xs text-white"
            >
              Set
            </button>
          </div>
        )}
      </div>

      {/* Carb Target */}
      <div className="mb-5">
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
      <div className="mb-5">
        <label className="mb-2 block text-sm font-medium text-gray-700">Conditions</label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {CONDITIONS.map((c) => {
            const isSelected = c.key === condition;
            return (
              <button
                key={c.key}
                onClick={() => setCondition(c.key as Condition)}
                className={`rounded-lg p-2.5 text-center text-xs transition-all ${
                  isSelected
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-primary-300'
                }`}
              >
                <span className="text-base block">{c.icon}</span>
                <span className="font-medium">{c.label}</span>
                <span className={`block text-[10px] mt-0.5 ${isSelected ? 'text-primary-200' : 'text-gray-400'}`}>
                  {c.tempRange}
                </span>
                <span className={`block text-[10px] ${isSelected ? 'text-primary-200' : 'text-gray-400'}`}>
                  {c.fluidPerHour}ml/hr
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
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {INTENSITIES.map((int) => {
            const isSelected = int.key === intensity;
            return (
              <button
                key={int.key}
                onClick={() => setIntensity(int.key as Intensity)}
                className={`rounded-lg p-2.5 text-center text-xs transition-all ${
                  isSelected
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-primary-300'
                }`}
              >
                <span className="text-base block">{int.icon}</span>
                <span className="font-medium">{int.label}</span>
                <span className={`block text-[10px] mt-0.5 ${isSelected ? 'text-primary-200' : 'text-gray-400'}`}>
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
