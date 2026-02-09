import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SweatRate, Condition, Intensity, UserPreferences } from '../types';

interface PreferencesState extends UserPreferences {
  setBodyWeight: (kg: number | null) => void;
  setSweatRate: (rate: SweatRate) => void;
  setDefaultCondition: (condition: Condition) => void;
  setDefaultIntensity: (intensity: Intensity) => void;
  setDefaultCarbTarget: (target: number) => void;
  getPreferences: () => UserPreferences;
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set, get) => ({
      bodyWeightKg: null,
      sweatRate: 'moderate' as SweatRate,
      defaultCondition: 'mild' as Condition,
      defaultIntensity: 'moderate' as Intensity,
      defaultCarbTarget: 80,

      setBodyWeight: (kg) => set({ bodyWeightKg: kg }),
      setSweatRate: (rate) => set({ sweatRate: rate }),
      setDefaultCondition: (condition) => set({ defaultCondition: condition }),
      setDefaultIntensity: (intensity) => set({ defaultIntensity: intensity }),
      setDefaultCarbTarget: (target) => set({ defaultCarbTarget: target }),

      getPreferences: () => {
        const state = get();
        return {
          bodyWeightKg: state.bodyWeightKg,
          sweatRate: state.sweatRate,
          defaultCondition: state.defaultCondition,
          defaultIntensity: state.defaultIntensity,
          defaultCarbTarget: state.defaultCarbTarget,
        };
      },
    }),
    {
      name: 'carbz-preferences',
      version: 1,
    }
  )
);
