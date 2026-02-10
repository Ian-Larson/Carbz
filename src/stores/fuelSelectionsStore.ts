import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DrinkMixSelection, SolidSelection, FuelSelections, FuelMode } from '../types';

interface FuelSelectionsState {
  mode: FuelMode;
  selectedProductIds: string[];
  drinkMixes: DrinkMixSelection[];
  solids: SolidSelection[];
  setMode: (mode: FuelMode) => void;
  toggleProduct: (productId: string) => void;
  setSelectedProducts: (ids: string[]) => void;
  setMixForBottle: (mixId: string, bottleIndex: number, scoops: number) => void;
  removeMixFromBottle: (mixId: string, bottleIndex: number) => void;
  setSolidPerHour: (productId: string, perHour: number) => void;
  clearAll: () => void;
  loadFromPreset: (selections: FuelSelections) => void;
  loadSuggestion: (selections: FuelSelections) => void;
  getFuelSelections: () => FuelSelections;
}

export const useFuelSelectionsStore = create<FuelSelectionsState>()(
  persist(
    (set, get) => ({
      mode: 'auto' as FuelMode,
      selectedProductIds: [],
      drinkMixes: [],
      solids: [],

      setMode: (mode) => set({ mode }),

      toggleProduct: (productId) =>
        set((state) => {
          const ids = state.selectedProductIds.includes(productId)
            ? state.selectedProductIds.filter(id => id !== productId)
            : [...state.selectedProductIds, productId];
          return { selectedProductIds: ids };
        }),

      setSelectedProducts: (ids) => set({ selectedProductIds: ids }),

      setMixForBottle: (mixId, bottleIndex, scoops) =>
        set((state) => {
          const existing = state.drinkMixes.findIndex(
            (s) => s.mixId === mixId && s.bottleIndex === bottleIndex
          );
          if (scoops === 0) {
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

      loadSuggestion: (selections) =>
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
      version: 2,
    }
  )
);
