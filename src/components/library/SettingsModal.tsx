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
          <label className="mb-1 block text-sm font-medium text-[var(--text-primary)]">Body Weight (kg)</label>
          <input
            type="number"
            value={bodyWeightKg ?? ''}
            onChange={(e) => setBodyWeight(e.target.value ? Number(e.target.value) : null)}
            placeholder="For caffeine ceiling calc"
            className="w-full rounded-lg border border-[var(--line)] bg-[var(--surface-muted)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-soft)]"
          />
          <p className="mt-1 text-xs text-[var(--text-muted)]">Used to calculate caffeine safety limits</p>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-[var(--text-primary)]">Sweat Rate</label>
          <div className="flex gap-2">
            {(['light', 'moderate', 'heavy'] as SweatRate[]).map((rate) => (
              <button
                key={rate}
                type="button"
                onClick={() => setSweatRate(rate)}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${
                  sweatRate === rate
                    ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--text-primary)]'
                    : 'border-[var(--line)] bg-[var(--surface)] text-[var(--text-primary)] hover:border-[var(--line-strong)]'
                }`}
              >
                {rate.charAt(0).toUpperCase() + rate.slice(1)}
              </button>
            ))}
          </div>
          <p className="mt-1 text-xs text-[var(--text-muted)]">Affects sodium target recommendations</p>
        </div>
      </div>
    </Modal>
  );
}
