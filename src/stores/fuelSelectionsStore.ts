import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DrinkMixSelection, SolidSelection, FuelSelections } from '../types';

interface FuelSelectionsState {
  drinkMixes: DrinkMixSelection[];
  solids: SolidSelection[];
  setMixForBottle: (mixId: string, bottleIndex: number, scoops: number) => void;
  removeMixFromBottle: (mixId: string, bottleIndex: number) => void;
  setSolidPerHour: (productId: string, perHour: number) => void;
  clearAll: () => void;
  loadFromPreset: (selections: FuelSelections) => void;
  getFuelSelections: () => FuelSelections;
}

export const useFuelSelectionsStore = create<FuelSelectionsState>()(
  persist(
    (set, get) => ({
      drinkMixes: [],
      solids: [],

      setMixForBottle: (mixId, bottleIndex, scoops) =>
        set((state) => {
          const existing = state.drinkMixes.findIndex(
            (s) => s.mixId === mixId && s.bottleIndex === bottleIndex
          );
          if (scoops === 0) {
            // Remove
            return {
              drinkMixes: state.drinkMixes.filter(
                (s) => !(s.mixId === mixId && s.bottleIndex === bottleIndex)
              ),
            };
          }
          if (existing >= 0) {
            const updated = [...state.drinkMixes];
            updated[existing] = { ...updated[existing], scoops };
            return { drinkMixes: updated };
          }
          return {
            drinkMixes: [...state.drinkMixes, { mixId, bottleIndex, scoops }],
          };
        }),

      removeMixFromBottle: (mixId, bottleIndex) =>
        set((state) => ({
          drinkMixes: state.drinkMixes.filter(
            (s) => !(s.mixId === mixId && s.bottleIndex === bottleIndex)
          ),
        })),

      setSolidPerHour: (productId, perHour) =>
        set((state) => {
          const existing = state.solids.findIndex((s) => s.productId === productId);
          if (perHour === 0) {
            return { solids: state.solids.filter((s) => s.productId !== productId) };
          }
          if (existing >= 0) {
            const updated = [...state.solids];
            updated[existing] = { ...updated[existing], perHour };
            return { solids: updated };
          }
          return {
            solids: [...state.solids, { productId, perHour }],
          };
        }),

      clearAll: () => set({ drinkMixes: [], solids: [] }),

      loadFromPreset: (selections) =>
        set({
          drinkMixes: selections.drinkMixes,
          solids: selections.solids,
        }),

      getFuelSelections: () => {
        const state = get();
        return {
          drinkMixes: state.drinkMixes,
          solids: state.solids,
        };
      },
    }),
    {
      name: 'carbz-fuel-selections',
      version: 1,
    }
  )
);
