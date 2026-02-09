import { useState } from 'react';
import { Plus, Pencil, Trash2, RotateCcw } from 'lucide-react';
import { useProductStore } from '../../stores/productStore';
import { usePresetStore } from '../../stores/presetStore';
import { useRideConfigStore } from '../../stores/rideConfigStore';
import { useFuelSelectionsStore } from '../../stores/fuelSelectionsStore';
import { usePreferencesStore } from '../../stores/preferencesStore';
import { Card } from '../shared/Card';
import { ProductForm } from './ProductForm';
import type { DrinkMix, GelOrSolid, SweatRate } from '../../types';
import { formatDuration } from '../../lib/formatters';

type FormState =
  | null
  | { mode: 'addMix' }
  | { mode: 'editMix'; mix: DrinkMix }
  | { mode: 'addSolid' }
  | { mode: 'editSolid'; solid: GelOrSolid };

export function LibraryTab() {
  const [form, setForm] = useState<FormState>(null);
  const [presetName, setPresetName] = useState('');
  const [showSavePreset, setShowSavePreset] = useState(false);

  const { drinkMixes, solids, addDrinkMix, updateDrinkMix, removeDrinkMix, addSolid, updateSolid, removeSolid, resetToDefaults } = useProductStore();
  const { presets, savePreset, deletePreset } = usePresetStore();
  const rideConfig = useRideConfigStore((s) => s.getRideConfig);
  const loadRideConfig = useRideConfigStore((s) => s.loadFromPreset);
  const fuelSelections = useFuelSelectionsStore((s) => s.getFuelSelections);
  const loadFuelSelections = useFuelSelectionsStore((s) => s.loadFromPreset);
  const bodyWeightKg = usePreferencesStore((s) => s.bodyWeightKg);
  const setBodyWeight = usePreferencesStore((s) => s.setBodyWeight);
  const sweatRate = usePreferencesStore((s) => s.sweatRate);
  const setSweatRate = usePreferencesStore((s) => s.setSweatRate);

  const handleSavePreset = () => {
    if (!presetName.trim()) return;
    savePreset(presetName.trim(), rideConfig(), fuelSelections());
    setPresetName('');
    setShowSavePreset(false);
  };

  return (
    <div className="space-y-4 py-4">
      {/* Preferences */}
      <Card title="Preferences" icon="⚙️">
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Body Weight (kg)</label>
            <input
              type="number"
              value={bodyWeightKg ?? ''}
              onChange={(e) => setBodyWeight(e.target.value ? Number(e.target.value) : null)}
              placeholder="For caffeine ceiling calc"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-400"
            />
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
          </div>
        </div>
      </Card>

      {/* Drink Mixes */}
      <Card title="Drink Mixes" icon="🧪">
        <div className="space-y-2">
          {drinkMixes.map((mix) => (
            <div key={mix.id} className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50/50 p-3">
              <div>
                <div className="text-sm font-medium text-gray-900">{mix.name}</div>
                <div className="text-xs text-gray-400">
                  {mix.carbsPerScoop}g carbs · {mix.sodiumPerScoop}mg Na · {mix.caloriesPerScoop} kcal/scoop
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => setForm({ mode: 'editMix', mix })}
                  className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                {!mix.isDefault && (
                  <button
                    onClick={() => removeDrinkMix(mix.id)}
                    className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={() => setForm({ mode: 'addMix' })}
          className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-gray-300 py-2 text-sm text-gray-500 transition-colors hover:border-primary-400 hover:text-primary-600"
        >
          <Plus className="h-4 w-4" /> Add Drink Mix
        </button>
      </Card>

      {/* Gels & Solids */}
      <Card title="Gels & Solids" icon="🍬">
        <div className="space-y-2">
          {solids.map((solid) => (
            <div key={solid.id} className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50/50 p-3">
              <div>
                <div className="text-sm font-medium text-gray-900">{solid.name}</div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <span>{solid.carbsPerServing}g carbs · {solid.caloriesPerServing} kcal</span>
                  <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">
                    {solid.type}
                  </span>
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => setForm({ mode: 'editSolid', solid })}
                  className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                {!solid.isDefault && (
                  <button
                    onClick={() => removeSolid(solid.id)}
                    className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={() => setForm({ mode: 'addSolid' })}
          className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-gray-300 py-2 text-sm text-gray-500 transition-colors hover:border-primary-400 hover:text-primary-600"
        >
          <Plus className="h-4 w-4" /> Add Gel/Solid
        </button>
      </Card>

      {/* Reset to Defaults */}
      <button
        onClick={resetToDefaults}
        className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-gray-200 py-2 text-sm text-gray-500 transition-colors hover:bg-gray-50"
      >
        <RotateCcw className="h-3.5 w-3.5" /> Reset Products to Defaults
      </button>

      {/* Ride Presets */}
      <Card title="Ride Presets" icon="💾">
        {presets.length === 0 && (
          <p className="text-sm text-gray-400 mb-3">No saved presets yet. Set up a ride and save it here.</p>
        )}
        <div className="space-y-2">
          {presets.map((preset) => (
            <div key={preset.id} className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50/50 p-3">
              <div>
                <div className="text-sm font-medium text-gray-900">{preset.name}</div>
                <div className="text-xs text-gray-400">
                  {formatDuration(preset.rideConfig.durationMinutes)} · {preset.rideConfig.carbTargetPerHour}g/hr · {preset.rideConfig.condition}
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => {
                    loadRideConfig(preset.rideConfig);
                    loadFuelSelections(preset.fuelSelections);
                  }}
                  className="rounded bg-primary-50 px-2.5 py-1 text-xs font-medium text-primary-700 hover:bg-primary-100"
                >
                  Load
                </button>
                <button
                  onClick={() => deletePreset(preset.id)}
                  className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {!showSavePreset ? (
          <button
            onClick={() => setShowSavePreset(true)}
            className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-gray-300 py-2 text-sm text-gray-500 transition-colors hover:border-primary-400 hover:text-primary-600"
          >
            <Plus className="h-4 w-4" /> Save Current Setup as Preset
          </button>
        ) : (
          <div className="mt-3 flex gap-2">
            <input
              type="text"
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              placeholder="Preset name (e.g., Saturday Group Ride)"
              className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-400"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleSavePreset()}
            />
            <button
              onClick={handleSavePreset}
              disabled={!presetName.trim()}
              className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
            >
              Save
            </button>
          </div>
        )}
      </Card>

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
    </div>
  );
}
