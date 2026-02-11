import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import type { DrinkMix, GelOrSolid } from '../../types';

type ProductType = 'drinkMix' | 'solid';

interface ProductFormProps {
  type: ProductType;
  initial?: DrinkMix | GelOrSolid;
  onSave: (data: Omit<DrinkMix, 'id' | 'isDefault'> | Omit<GelOrSolid, 'id' | 'isDefault'>) => void;
  onCancel: () => void;
}

export function ProductForm({ type, initial, onSave, onCancel }: ProductFormProps) {
  const [name, setName] = useState(initial ? initial.name : '');
  const [carbs, setCarbs] = useState(
    initial
      ? 'carbsPerScoop' in initial ? initial.carbsPerScoop : initial.carbsPerServing
      : 0
  );
  const [sodium, setSodium] = useState(
    initial
      ? 'sodiumPerScoop' in initial ? initial.sodiumPerScoop : initial.sodiumPerServing
      : 0
  );
  const [caffeine, setCaffeine] = useState(
    initial
      ? 'caffeinePerScoop' in initial ? initial.caffeinePerScoop : initial.caffeinePerServing
      : 0
  );
  const [calories, setCalories] = useState(
    initial
      ? 'caloriesPerScoop' in initial ? initial.caloriesPerScoop : initial.caloriesPerServing
      : 0
  );
  const [solidType, setSolidType] = useState<GelOrSolid['type']>(
    initial && 'type' in initial ? initial.type : 'gel'
  );
  const [servingDesc, setServingDesc] = useState(
    initial && 'servingDescription' in initial ? initial.servingDescription : '1 packet'
  );
  const [gramsPerScoop, setGramsPerScoop] = useState<string>(
    initial && 'gramsPerScoop' in initial && (initial as DrinkMix).gramsPerScoop != null
      ? (initial as DrinkMix).gramsPerScoop!.toString()
      : ''
  );
  const [cost, setCost] = useState<string>(
    initial?.costPerServing != null ? initial.costPerServing.toString() : ''
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const costValue = cost ? parseFloat(cost) : undefined;

    if (type === 'drinkMix') {
      const gramsValue = gramsPerScoop ? parseFloat(gramsPerScoop) : undefined;
      onSave({
        name: name.trim(),
        gramsPerScoop: gramsValue,
        carbsPerScoop: carbs,
        sodiumPerScoop: sodium,
        caffeinePerScoop: caffeine,
        caloriesPerScoop: calories,
        costPerServing: costValue,
      } as Omit<DrinkMix, 'id' | 'isDefault'>);
    } else {
      onSave({
        name: name.trim(),
        type: solidType,
        carbsPerServing: carbs,
        sodiumPerServing: sodium,
        caffeinePerServing: caffeine,
        caloriesPerServing: calories,
        servingDescription: servingDesc,
        costPerServing: costValue,
      } as Omit<GelOrSolid, 'id' | 'isDefault'>);
    }
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onCancel]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30" onClick={onCancel}>
      <div
        className="w-full max-w-md rounded-t-2xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[var(--shadow-strong)]"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={initial ? 'Edit product' : 'Add product'}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            {initial ? 'Edit' : 'Add'} {type === 'drinkMix' ? 'Drink Mix' : 'Gel/Solid'}
          </h3>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg p-1 text-[var(--text-muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--text-primary)]"
            aria-label="Close product form"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <Field label="Name" value={name} onChange={setName} type="text" />
          {type === 'drinkMix' && (
            <Field
              label="Grams per scoop"
              value={gramsPerScoop}
              onChange={setGramsPerScoop}
              type="text"
              placeholder="Weight of one scoop in grams"
            />
          )}
          <Field
            label={type === 'drinkMix' ? 'Carbs per scoop (g)' : 'Carbs per serving (g)'}
            value={carbs}
            onChange={(v) => setCarbs(Number(v))}
            type="number"
          />
          <Field
            label={type === 'drinkMix' ? 'Sodium per scoop (mg)' : 'Sodium per serving (mg)'}
            value={sodium}
            onChange={(v) => setSodium(Number(v))}
            type="number"
          />
          <Field
            label="Caffeine (mg)"
            value={caffeine}
            onChange={(v) => setCaffeine(Number(v))}
            type="number"
          />
          <Field
            label="Calories"
            value={calories}
            onChange={(v) => setCalories(Number(v))}
            type="number"
          />
          <Field
            label="Cost per serving ($)"
            value={cost}
            onChange={setCost}
            type="text"
            placeholder="Optional"
          />

          {type === 'solid' && (
            <>
              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--text-primary)]">Type</label>
                <select
                  value={solidType}
                  onChange={(e) => setSolidType(e.target.value as GelOrSolid['type'])}
                  className="w-full rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text-primary)]"
                >
                  <option value="gel">Gel</option>
                  <option value="chew">Chew</option>
                  <option value="bar">Bar</option>
                  <option value="gummy">Gummy</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <Field label="Serving description" value={servingDesc} onChange={setServingDesc} type="text" />
            </>
          )}

          <button
            type="submit"
            disabled={!name.trim()}
            className="w-full rounded-lg bg-[var(--accent)] py-2.5 text-sm font-medium text-[var(--accent-contrast)] transition-colors hover:bg-[var(--accent-strong)] disabled:opacity-50"
          >
            {initial ? 'Save Changes' : 'Add Product'}
          </button>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type,
  placeholder,
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  type: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-[var(--text-primary)]">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-soft)]"
      />
    </div>
  );
}
