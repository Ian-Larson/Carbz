import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { BottleSlot, Condition, Intensity, RideConfig } from '../types';

interface RideConfigState {
  bottles: BottleSlot[];
  durationMinutes: number;
  carbTargetPerHour: number;
  condition: Condition;
  intensity: Intensity;
  addBottle: (size: number) => void;
  removeBottle: (index: number) => void;
  setBottleSize: (index: number, size: number) => void;
  setBottleCount: (index: number, count: number) => void;
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
      ],
      durationMinutes: 90,
      carbTargetPerHour: 80,
      condition: 'warm' as Condition,
      intensity: 'moderate' as Intensity,

      addBottle: (size: number) =>
        set((state) => ({
          bottles: [...state.bottles, { size, count: 1 }],
        })),

      removeBottle: (index: number) =>
        set((state) => ({
          bottles: state.bottles.filter((_, i) => i !== index),
        })),

      setBottleSize: (index: number, size: number) =>
        set((state) => {
          const bottles = [...state.bottles];
          bottles[index] = { ...bottles[index], size };
          return { bottles };
        }),

      setBottleCount: (index: number, count: number) =>
        set((state) => {
          const bottles = [...state.bottles];
          if (count <= 0) {
            return { bottles: bottles.filter((_, i) => i !== index) };
          }
          bottles[index] = { ...bottles[index], count };
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
      version: 2,
    }
  )
);
