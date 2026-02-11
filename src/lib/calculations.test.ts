import { describe, expect, it } from 'vitest';
import {
  calcBottlePreps,
  calcTotals,
  generateWarnings,
} from './calculations';
import type { FuelSelections, RideConfig, UserPreferences } from '../types';

const mixes = [
  {
    id: 'mix-a',
    name: 'Mix A',
    gramsPerScoop: 30,
    carbsPerScoop: 30,
    sodiumPerScoop: 200,
    caffeinePerScoop: 0,
    caloriesPerScoop: 120,
    isDefault: true,
  },
  {
    id: 'mix-caf',
    name: 'Mix Caffeine',
    gramsPerScoop: 35,
    carbsPerScoop: 32,
    sodiumPerScoop: 120,
    caffeinePerScoop: 80,
    caloriesPerScoop: 128,
    isDefault: true,
  },
];

const solids = [
  {
    id: 'solid-a',
    name: 'Solid A',
    type: 'gel' as const,
    carbsPerServing: 25,
    sodiumPerServing: 50,
    caffeinePerServing: 0,
    caloriesPerServing: 100,
    servingDescription: '1 gel',
    isDefault: true,
  },
  {
    id: 'solid-caf',
    name: 'Solid Caffeine',
    type: 'gel' as const,
    carbsPerServing: 25,
    sodiumPerServing: 40,
    caffeinePerServing: 100,
    caloriesPerServing: 100,
    servingDescription: '1 gel',
    isDefault: true,
  },
];

const basePreferences: UserPreferences = {
  bodyWeightKg: null,
  sweatRate: 'moderate',
  defaultCondition: 'mild',
  defaultIntensity: 'moderate',
  defaultCarbTarget: 80,
};

describe('calculations', () => {
  it('multiplies bottle prep and totals by bottle slot count', () => {
    const rideConfig: RideConfig = {
      bottles: [{ size: 750, count: 2 }],
      durationMinutes: 120,
      carbTargetPerHour: 80,
      condition: 'mild',
      intensity: 'moderate',
    };
    const selections: FuelSelections = {
      drinkMixes: [{ mixId: 'mix-a', bottleIndex: 0, scoops: 1 }],
      solids: [],
    };

    const bottlePreps = calcBottlePreps(rideConfig.bottles, selections.drinkMixes, mixes);
    const totals = calcTotals(rideConfig, selections, { mixes, solids });

    expect(bottlePreps).toHaveLength(1);
    expect(bottlePreps[0].quantity).toBe(2);
    expect(bottlePreps[0].carbsGrams).toBe(60);
    expect(totals.totalCarbs).toBe(60);
    expect(totals.totalFluidMl).toBe(1500);
  });

  it('flags fluid deficit on a long hot ride', () => {
    const rideConfig: RideConfig = {
      bottles: [{ size: 550, count: 2 }],
      durationMinutes: 300,
      carbTargetPerHour: 80,
      condition: 'hot',
      intensity: 'moderate',
    };
    const selections: FuelSelections = {
      drinkMixes: [{ mixId: 'mix-a', bottleIndex: 0, scoops: 1 }],
      solids: [],
    };
    const bottlePreps = calcBottlePreps(rideConfig.bottles, selections.drinkMixes, mixes);
    const totals = calcTotals(rideConfig, selections, { mixes, solids });
    const warnings = generateWarnings(totals, bottlePreps, rideConfig, basePreferences);

    expect(warnings.some((warning) => warning.type === 'fluid')).toBe(true);
  });

  it('returns both carb shortfall and excess warnings in the right scenarios', () => {
    const shortRide: RideConfig = {
      bottles: [{ size: 550, count: 1 }],
      durationMinutes: 120,
      carbTargetPerHour: 80,
      condition: 'mild',
      intensity: 'moderate',
    };
    const shortSelections: FuelSelections = {
      drinkMixes: [{ mixId: 'mix-a', bottleIndex: 0, scoops: 1 }],
      solids: [],
    };
    const shortPreps = calcBottlePreps(shortRide.bottles, shortSelections.drinkMixes, mixes);
    const shortTotals = calcTotals(shortRide, shortSelections, { mixes, solids });
    const shortWarnings = generateWarnings(shortTotals, shortPreps, shortRide, basePreferences);
    expect(shortWarnings.some((warning) => warning.type === 'carbs' && warning.severity === 'warning')).toBe(true);

    const highRide: RideConfig = {
      bottles: [{ size: 950, count: 1 }],
      durationMinutes: 60,
      carbTargetPerHour: 50,
      condition: 'mild',
      intensity: 'moderate',
    };
    const highSelections: FuelSelections = {
      drinkMixes: [{ mixId: 'mix-a', bottleIndex: 0, scoops: 4 }],
      solids: [{ productId: 'solid-a', perHour: 2 }],
    };
    const highPreps = calcBottlePreps(highRide.bottles, highSelections.drinkMixes, mixes);
    const highTotals = calcTotals(highRide, highSelections, { mixes, solids });
    const highWarnings = generateWarnings(highTotals, highPreps, highRide, basePreferences);
    expect(highWarnings.some((warning) => warning.type === 'carbs' && warning.severity === 'info')).toBe(true);
  });

  it('warns on high concentration and includes bottle context', () => {
    const rideConfig: RideConfig = {
      bottles: [{ size: 550, count: 1 }],
      durationMinutes: 90,
      carbTargetPerHour: 60,
      condition: 'mild',
      intensity: 'hard',
    };
    const selections: FuelSelections = {
      drinkMixes: [{ mixId: 'mix-a', bottleIndex: 0, scoops: 5 }],
      solids: [],
    };
    const preps = calcBottlePreps(rideConfig.bottles, selections.drinkMixes, mixes);
    const totals = calcTotals(rideConfig, selections, { mixes, solids });
    const warnings = generateWarnings(totals, preps, rideConfig, basePreferences);
    const concentration = warnings.find((warning) => warning.type === 'concentration');

    expect(concentration?.context?.bottleIndex).toBe(0);
  });

  it('warns when caffeine exceeds body-weight ceiling', () => {
    const rideConfig: RideConfig = {
      bottles: [{ size: 750, count: 1 }],
      durationMinutes: 120,
      carbTargetPerHour: 80,
      condition: 'mild',
      intensity: 'hard',
    };
    const selections: FuelSelections = {
      drinkMixes: [],
      solids: [{ productId: 'solid-caf', perHour: 2 }],
    };
    const preps = calcBottlePreps(rideConfig.bottles, selections.drinkMixes, mixes);
    const totals = calcTotals(rideConfig, selections, { mixes, solids });
    const warnings = generateWarnings(totals, preps, rideConfig, {
      ...basePreferences,
      bodyWeightKg: 50,
    });

    expect(warnings.some((warning) => warning.type === 'caffeine')).toBe(true);
  });

  it('uses ride duration + sweat rate for sodium low/high warnings', () => {
    const lowRide: RideConfig = {
      bottles: [{ size: 550, count: 1 }],
      durationMinutes: 180,
      carbTargetPerHour: 60,
      condition: 'mild',
      intensity: 'moderate',
    };
    const lowSelections: FuelSelections = {
      drinkMixes: [{ mixId: 'mix-a', bottleIndex: 0, scoops: 1 }],
      solids: [],
    };
    const lowPreps = calcBottlePreps(lowRide.bottles, lowSelections.drinkMixes, mixes);
    const lowTotals = calcTotals(lowRide, lowSelections, { mixes, solids });
    const lowWarnings = generateWarnings(lowTotals, lowPreps, lowRide, {
      ...basePreferences,
      sweatRate: 'heavy',
    });
    expect(lowWarnings.some((warning) => warning.type === 'sodium' && warning.severity === 'warning')).toBe(true);

    const highRide: RideConfig = {
      bottles: [{ size: 750, count: 1 }],
      durationMinutes: 60,
      carbTargetPerHour: 60,
      condition: 'mild',
      intensity: 'moderate',
    };
    const highSelections: FuelSelections = {
      drinkMixes: [{ mixId: 'mix-a', bottleIndex: 0, scoops: 4 }],
      solids: [],
    };
    const highPreps = calcBottlePreps(highRide.bottles, highSelections.drinkMixes, mixes);
    const highTotals = calcTotals(highRide, highSelections, { mixes, solids });
    const highWarnings = generateWarnings(highTotals, highPreps, highRide, {
      ...basePreferences,
      sweatRate: 'light',
    });
    expect(highWarnings.some((warning) => warning.type === 'sodium' && warning.severity === 'info')).toBe(true);
  });
});
