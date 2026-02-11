import { useState } from 'react';
import { Plus, Pencil, Trash2, RotateCcw } from 'lucide-react';
import { useProductStore } from '../../stores/productStore';
import { usePresetStore } from '../../stores/presetStore';
import { useRideConfigStore } from '../../stores/rideConfigStore';
import { useFuelSelectionsStore } from '../../stores/fuelSelectionsStore';
import { SlideOver } from '../shared/SlideOver';
import { ProductForm } from './ProductForm';
import { formatDuration } from '../../lib/formatters';
import type { DrinkMix, GelOrSolid } from '../../types';

type FormState =
  | null
  | { mode: 'addMix' }
  | { mode: 'editMix'; mix: DrinkMix }
  | { mode: 'addSolid' }
  | { mode: 'editSolid'; solid: GelOrSolid };

interface LibraryPanelProps {
  open: boolean;
  onClose: () => void;
}

export function LibraryPanel({ open, onClose }: LibraryPanelProps) {
  const [form, setForm] = useState<FormState>(null);

  const { drinkMixes, solids, addDrinkMix, updateDrinkMix, removeDrinkMix, addSolid, updateSolid, removeSolid, resetToDefaults } = useProductStore();
  const { presets, deletePreset } = usePresetStore();
  const loadRideConfig = useRideConfigStore((s) => s.loadFromPreset);
  const loadFuelSelections = useFuelSelectionsStore((s) => s.loadFromPreset);

  return (
    <SlideOver open={open} onClose={onClose} title="My Library">
      <div className="space-y-6">
        {/* Drink Mixes */}
        <div>
          <h3 className="mb-2 flex items-center gap-2 font-semibold text-[var(--text-primary)]">
            🧪 Drink Mixes
          </h3>
          <div className="space-y-2">
            {drinkMixes.map((mix) => (
              <div key={mix.id} className="flex items-center justify-between rounded-lg border border-[var(--line)] bg-[var(--surface-muted)] p-3">
                <div>
                  <div className="text-sm font-medium text-[var(--text-primary)]">{mix.name}</div>
                  <div className="text-xs text-[var(--text-muted)]">
                    {mix.carbsPerScoop}g carbs · {mix.sodiumPerScoop}mg Na · {mix.caloriesPerScoop} kcal/scoop
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setForm({ mode: 'editMix', mix })}
                    className="rounded p-1.5 text-[var(--text-muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--text-primary)]"
                    aria-label={`Edit ${mix.name}`}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  {!mix.isDefault && (
                    <button
                      type="button"
                      onClick={() => removeDrinkMix(mix.id)}
                      className="rounded p-1.5 text-[var(--text-muted)] hover:bg-[var(--danger-soft)] hover:text-[var(--danger)]"
                      aria-label={`Delete ${mix.name}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setForm({ mode: 'addMix' })}
            className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-[var(--line-strong)] py-2 text-sm text-[var(--text-muted)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
          >
            <Plus className="h-4 w-4" /> Add Drink Mix
          </button>
        </div>

        {/* Gels & Solids */}
        <div>
          <h3 className="mb-2 flex items-center gap-2 font-semibold text-[var(--text-primary)]">
            🍬 Gels & Solids
          </h3>
          <div className="space-y-2">
            {solids.map((solid) => (
              <div key={solid.id} className="flex items-center justify-between rounded-lg border border-[var(--line)] bg-[var(--surface-muted)] p-3">
                <div>
                  <div className="text-sm font-medium text-[var(--text-primary)]">{solid.name}</div>
                  <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                    <span>{solid.carbsPerServing}g carbs · {solid.caloriesPerServing} kcal</span>
                    <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">
                      {solid.type}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setForm({ mode: 'editSolid', solid })}
                    className="rounded p-1.5 text-[var(--text-muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--text-primary)]"
                    aria-label={`Edit ${solid.name}`}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  {!solid.isDefault && (
                    <button
                      type="button"
                      onClick={() => removeSolid(solid.id)}
                      className="rounded p-1.5 text-[var(--text-muted)] hover:bg-[var(--danger-soft)] hover:text-[var(--danger)]"
                      aria-label={`Delete ${solid.name}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setForm({ mode: 'addSolid' })}
            className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-[var(--line-strong)] py-2 text-sm text-[var(--text-muted)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
          >
            <Plus className="h-4 w-4" /> Add Gel/Solid
          </button>
        </div>

        {/* Presets */}
        {presets.length > 0 && (
          <div>
            <h3 className="mb-2 flex items-center gap-2 font-semibold text-[var(--text-primary)]">
              💾 Saved Presets
            </h3>
            <div className="space-y-2">
              {presets.map((preset) => (
                <div key={preset.id} className="flex items-center justify-between rounded-lg border border-[var(--line)] bg-[var(--surface-muted)] p-3">
                  <div>
                    <div className="text-sm font-medium text-[var(--text-primary)]">{preset.name}</div>
                    <div className="text-xs text-[var(--text-muted)]">
                      {formatDuration(preset.rideConfig.durationMinutes)} · {preset.rideConfig.carbTargetPerHour}g/hr · {preset.rideConfig.condition}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        loadRideConfig(preset.rideConfig);
                        loadFuelSelections(preset.fuelSelections);
                        onClose();
                      }}
                      className="rounded bg-[var(--accent-soft)] px-2.5 py-1 text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--surface-muted)]"
                    >
                      Load
                    </button>
                    <button
                      type="button"
                      onClick={() => deletePreset(preset.id)}
                      className="rounded p-1.5 text-[var(--text-muted)] hover:bg-[var(--danger-soft)] hover:text-[var(--danger)]"
                      aria-label={`Delete preset ${preset.name}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reset to Defaults */}
        <button
          type="button"
          onClick={resetToDefaults}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-[var(--line)] py-2 text-sm text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-muted)]"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Reset Products to Defaults
        </button>
      </div>

      {/* Product Form Modal */}
      {form?.mode === 'addMix' && (
        <ProductForm
          type="drinkMix"
          onSave={(data) => {
            addDrinkMix(data as Omit<DrinkMix, 'id' | 'isDefault'>);
            setForm(null);
          }}
          onCancel={() => setForm(null)}
        />
      )}
      {form?.mode === 'editMix' && (
        <ProductForm
          type="drinkMix"
          initial={form.mix}
          onSave={(data) => {
            updateDrinkMix(form.mix.id, data);
            setForm(null);
          }}
          onCancel={() => setForm(null)}
        />
      )}
      {form?.mode === 'addSolid' && (
        <ProductForm
          type="solid"
          onSave={(data) => {
            addSolid(data as Omit<GelOrSolid, 'id' | 'isDefault'>);
            setForm(null);
          }}
          onCancel={() => setForm(null)}
        />
      )}
      {form?.mode === 'editSolid' && (
        <ProductForm
          type="solid"
          initial={form.solid}
          onSave={(data) => {
            updateSolid(form.solid.id, data);
            setForm(null);
          }}
          onCancel={() => setForm(null)}
        />
      )}
    </SlideOver>
  );
}
