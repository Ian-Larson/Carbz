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
          onClick={() => setShowSave(true)}
          className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
        >
          <Save className="h-4 w-4" />
          Save as Preset
        </button>
      ) : (
        <div className="flex gap-2 rounded-xl border border-gray-200 bg-white p-3">
          <input
            type="text"
            value={presetName}
            onChange={(e) => setPresetName(e.target.value)}
            placeholder="Preset name..."
            className="flex-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-400"
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          />
          <button
            onClick={handleSave}
            disabled={!presetName.trim()}
            className="rounded-lg bg-primary-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
          >
            Save
          </button>
          <button
            onClick={() => setShowSave(false)}
            className="rounded-lg px-2 py-1.5 text-sm text-gray-500 hover:bg-gray-100"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
