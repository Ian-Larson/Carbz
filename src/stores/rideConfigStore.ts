import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { BottleSlot, Condition, Intensity, RideConfig } from '../types';

interface RideConfigState {
  bottles: BottleSlot[];
  durationMinutes: number;
  carbTargetPerHour: number;
  condition: Condition;
  intensity: Intensity;
  setBottle: (index: number, slot: BottleSlot) => void;
  setDuration: (minutes: number) => void;
  setCarbTarget: (target: number) => void;
  setCondition: (condition: Condition) => void;
  setIntensity: (intensity: Intensity) => void;
  loadFromPreset: (config: RideConfig) => void;
  getRideConfig: () => RideConfig;
}

export const useRideConfigStore = create<RideConfigState>()(
  persist(
    (set, get) => ({
      bottles: [
        { size: 550, count: 1 },
        { size: 750, count: 1 },
        { size: 950, count: 0 },
      ],
      durationMinutes: 90,
      carbTargetPerHour: 80,
      condition: 'warm' as Condition,
      intensity: 'moderate' as Intensity,

      setBottle: (index, slot) =>
        set((state) => {
          const bottles = [...state.bottles];
          bottles[index] = slot;
          // Enforce max 2 bottles total
          const totalCount = bottles.reduce((s, b) => s + b.count, 0);
          if (totalCount > 2) {
            // Reduce other bottles
            let excess = totalCount - 2;
            for (let i = 0; i < bottles.length && excess > 0; i++) {
              if (i !== index && bottles[i].count > 0) {
                const reduce = Math.min(bottles[i].count, excess);
                bottles[i] = { ...bottles[i], count: bottles[i].count - reduce };
                excess -= reduce;
              }
            }
          }
          return { bottles };
        }),

      setDuration: (minutes) => set({ durationMinutes: minutes }),
      setCarbTarget: (target) => set({ carbTargetPerHour: target }),
      setCondition: (condition) => set({ condition }),
      setIntensity: (intensity) => set({ intensity }),

      loadFromPreset: (config) =>
        set({
          bottles: config.bottles,
          durationMinutes: config.durationMinutes,
          carbTargetPerHour: config.carbTargetPerHour,
          condition: config.condition,
          intensity: config.intensity,
        }),

      getRideConfig: () => {
        const state = get();
        return {
          bottles: state.bottles,
          durationMinutes: state.durationMinutes,
          carbTargetPerHour: state.carbTargetPerHour,
          condition: state.condition,
          intensity: state.intensity,
        };
      },
    }),
    {
      name: 'carbz-ride-config',
      version: 1,
    }
  )
);
