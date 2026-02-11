import { useState } from 'react';
import { Save } from 'lucide-react';
import { FuelPlan } from './FuelPlan';
import { usePresetStore } from '../../stores/presetStore';
import { useRideConfigStore } from '../../stores/rideConfigStore';
import { useFuelSelectionsStore } from '../../stores/fuelSelectionsStore';

export function FuelPlanPanel() {
  const [showSave, setShowSave] = useState(false);
  const [presetName, setPresetName] = useState('');

  const savePreset = usePresetStore((s) => s.savePreset);
  const getRideConfig = useRideConfigStore((s) => s.getRideConfig);
  const getFuelSelections = useFuelSelectionsStore((s) => s.getFuelSelections);

  const handleSave = () => {
    if (!presetName.trim()) return;
    savePreset(presetName.trim(), getRideConfig(), getFuelSelections());
    setPresetName('');
    setShowSave(false);
  };

  return (
    <div className="space-y-4">
      <FuelPlan />

      {/* Save as preset */}
      {!showSave ? (
        <button
          type="button"
          onClick={() => setShowSave(true)}
          className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-[var(--line)] bg-[var(--surface)] py-2.5 text-sm font-semibold text-[var(--text-primary)] transition-colors hover:border-[var(--line-strong)] hover:bg-[var(--surface-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
        >
          <Save className="h-4 w-4" />
          Save as Preset
        </button>
      ) : (
        <div className="flex flex-wrap gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] p-3">
          <input
            type="text"
            value={presetName}
            onChange={(e) => setPresetName(e.target.value)}
            placeholder="Preset name..."
            className="min-w-[180px] flex-1 rounded-lg border border-[var(--line)] bg-[var(--surface-muted)] px-3 py-1.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-soft)]"
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          />
          <button
            type="button"
            onClick={handleSave}
            disabled={!presetName.trim()}
            className="rounded-lg bg-[var(--accent)] px-3 py-1.5 text-sm font-semibold text-[var(--accent-contrast)] hover:bg-[var(--accent-strong)] disabled:opacity-50"
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => setShowSave(false)}
            className="rounded-lg px-2 py-1.5 text-sm font-medium text-[var(--text-muted)] hover:bg-[var(--surface-muted)]"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
