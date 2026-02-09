import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { RidePreset, RideConfig, FuelSelections } from '../types';
import { nanoid } from 'nanoid';

interface PresetState {
  presets: RidePreset[];
  savePreset: (name: string, config: RideConfig, selections: FuelSelections) => void;
  renamePreset: (id: string, name: string) => void;
  deletePreset: (id: string) => void;
}

export const usePresetStore = create<PresetState>()(
  persist(
    (set) => ({
      presets: [],

      savePreset: (name, rideConfig, fuelSelections) =>
        set((state) => ({
          presets: [
            ...state.presets,
            {
              id: nanoid(),
              name,
              rideConfig,
              fuelSelections,
              createdAt: Date.now(),
              updatedAt: Date.now(),
            },
          ],
        })),

      renamePreset: (id, name) =>
        set((state) => ({
          presets: state.presets.map((p) =>
            p.id === id ? { ...p, name, updatedAt: Date.now() } : p
          ),
        })),

      deletePreset: (id) =>
        set((state) => ({
          presets: state.presets.filter((p) => p.id !== id),
        })),
    }),
    {
      name: 'carbz-presets',
      version: 1,
    }
  )
);
