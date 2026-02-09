import { useMemo } from 'react';
import { useRideConfigStore } from '../stores/rideConfigStore';
import { useFuelSelectionsStore } from '../stores/fuelSelectionsStore';
import { useProductStore } from '../stores/productStore';
import { usePreferencesStore } from '../stores/preferencesStore';
import { computeFuelPlan } from '../lib/calculations';
import type { FuelPlanOutput } from '../types';

export function useFuelPlan(): FuelPlanOutput {
  const bottles = useRideConfigStore((s) => s.bottles);
  const durationMinutes = useRideConfigStore((s) => s.durationMinutes);
  const carbTargetPerHour = useRideConfigStore((s) => s.carbTargetPerHour);
  const condition = useRideConfigStore((s) => s.condition);
  const intensity = useRideConfigStore((s) => s.intensity);

  const mixSelections = useFuelSelectionsStore((s) => s.drinkMixes);
  const solidSelections = useFuelSelectionsStore((s) => s.solids);

  const drinkMixes = useProductStore((s) => s.drinkMixes);
  const solids = useProductStore((s) => s.solids);

  const bodyWeightKg = usePreferencesStore((s) => s.bodyWeightKg);
  const sweatRate = usePreferencesStore((s) => s.sweatRate);
  const defaultCondition = usePreferencesStore((s) => s.defaultCondition);
  const defaultIntensity = usePreferencesStore((s) => s.defaultIntensity);
  const defaultCarbTarget = usePreferencesStore((s) => s.defaultCarbTarget);

  return useMemo(() => {
    const rideConfig = { bottles, durationMinutes, carbTargetPerHour, condition, intensity };
    const fuelSelections = { drinkMixes: mixSelections, solids: solidSelections };
    const products = { mixes: drinkMixes, solids };
    const preferences = {
      bodyWeightKg,
      sweatRate,
      defaultCondition,
      defaultIntensity,
      defaultCarbTarget,
    };

    return computeFuelPlan(rideConfig, fuelSelections, products, preferences);
  }, [
    bottles, durationMinutes, carbTargetPerHour, condition, intensity,
    mixSelections, solidSelections, drinkMixes, solids,
    bodyWeightKg, sweatRate, defaultCondition, defaultIntensity, defaultCarbTarget,
  ]);
}
