import { Modal } from '../shared/Modal';
import { usePreferencesStore } from '../../stores/preferencesStore';
import type { SweatRate } from '../../types';

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

export function SettingsModal({ open, onClose }: SettingsModalProps) {
  const bodyWeightKg = usePreferencesStore((s) => s.bodyWeightKg);
  const setBodyWeight = usePreferencesStore((s) => s.setBodyWeight);
  const sweatRate = usePreferencesStore((s) => s.sweatRate);
  const setSweatRate = usePreferencesStore((s) => s.setSweatRate);

  return (
    <Modal open={open} onClose={onClose} title="Settings">
      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Body Weight (kg)</label>
          <input
            type="number"
            value={bodyWeightKg ?? ''}
            onChange={(e) => setBodyWeight(e.target.value ? Number(e.target.value) : null)}
            placeholder="For caffeine ceiling calc"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-400"
          />
          <p className="mt-1 text-xs text-gray-400">Used to calculate caffeine safety limits</p>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Sweat Rate</label>
          <div className="flex gap-2">
            {(['light', 'moderate', 'heavy'] as SweatRate[]).map((rate) => (
              <button
                key={rate}
                onClick={() => setSweatRate(rate)}
                className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  sweatRate === rate
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-primary-300'
                }`}
              >
                {rate.charAt(0).toUpperCase() + rate.slice(1)}
              </button>
            ))}
          </div>
          <p className="mt-1 text-xs text-gray-400">Affects sodium target recommendations</p>
        </div>
      </div>
    </Modal>
  );
}
