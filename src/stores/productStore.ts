import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DrinkMix, GelOrSolid } from '../types';
import { DEFAULT_DRINK_MIXES, DEFAULT_SOLIDS } from '../lib/defaults';
import { nanoid } from 'nanoid';

interface ProductState {
  drinkMixes: DrinkMix[];
  solids: GelOrSolid[];
  addDrinkMix: (mix: Omit<DrinkMix, 'id' | 'isDefault'>) => void;
  updateDrinkMix: (id: string, updates: Partial<DrinkMix>) => void;
  removeDrinkMix: (id: string) => void;
  addSolid: (solid: Omit<GelOrSolid, 'id' | 'isDefault'>) => void;
  updateSolid: (id: string, updates: Partial<GelOrSolid>) => void;
  removeSolid: (id: string) => void;
  resetToDefaults: () => void;
}

export const useProductStore = create<ProductState>()(
  persist(
    (set) => ({
      drinkMixes: DEFAULT_DRINK_MIXES,
      solids: DEFAULT_SOLIDS,

      addDrinkMix: (mix) =>
        set((state) => ({
          drinkMixes: [...state.drinkMixes, { ...mix, id: nanoid(), isDefault: false }],
        })),

      updateDrinkMix: (id, updates) =>
        set((state) => ({
          drinkMixes: state.drinkMixes.map((m) =>
            m.id === id ? { ...m, ...updates } : m
          ),
        })),

      removeDrinkMix: (id) =>
        set((state) => ({
          drinkMixes: state.drinkMixes.filter((m) => m.id !== id),
        })),

      addSolid: (solid) =>
        set((state) => ({
          solids: [...state.solids, { ...solid, id: nanoid(), isDefault: false }],
        })),

      updateSolid: (id, updates) =>
        set((state) => ({
          solids: state.solids.map((s) =>
            s.id === id ? { ...s, ...updates } : s
          ),
        })),

      removeSolid: (id) =>
        set((state) => ({
          solids: state.solids.filter((s) => s.id !== id),
        })),

      resetToDefaults: () =>
        set({ drinkMixes: DEFAULT_DRINK_MIXES, solids: DEFAULT_SOLIDS }),
    }),
    {
      name: 'carbz-products',
      version: 1,
    }
  )
);
