import { describe, expect, it } from 'vitest';
import { suggestFuelPlan } from './suggestions';
import type { RideConfig } from '../types';

const mixes = [
  {
    id: 'mix-a',
    name: 'Mix A',
    gramsPerScoop: 30,
    carbsPerScoop: 30,
    sodiumPerScoop: 300,
    caffeinePerScoop: 0,
    caloriesPerScoop: 120,
    isDefault: true,
  },
];

const solids = [
  {
    id: 'solid-a',
    name: 'Solid A',
    type: 'gel' as const,
    carbsPerServing: 30,
    sodiumPerServing: 50,
    caffeinePerServing: 0,
    caloriesPerServing: 120,
    servingDescription: '1 gel',
    isDefault: true,
  },
];

describe('suggestFuelPlan', () => {
  it('accounts for bottle slot count when estimating carbs from drink', () => {
    const rideConfig: RideConfig = {
      bottles: [{ size: 750, count: 2 }],
      durationMinutes: 60,
      carbTargetPerHour: 120,
      condition: 'warm',
      intensity: 'hard',
    };

    const suggestion = suggestFuelPlan(rideConfig, mixes, solids);

    expect(suggestion.drinkMixes).toHaveLength(1);
    expect(suggestion.drinkMixes[0].bottleIndex).toBe(0);
    // 750ml bottle at ~6% is ~45g carbs per bottle, times two bottles ~= 90g.
    expect(suggestion.drinkMixes[0].scoops).toBe(1.5);
    expect(suggestion.solids).toHaveLength(1);
    expect(suggestion.solids[0].perHour).toBe(1);
  });

  it('caps solid recommendation at 3 per hour', () => {
    const rideConfig: RideConfig = {
      bottles: [],
      durationMinutes: 120,
      carbTargetPerHour: 220,
      condition: 'mild',
      intensity: 'race',
    };

    const suggestion = suggestFuelPlan(rideConfig, mixes, solids);

    expect(suggestion.solids[0].perHour).toBeLessThanOrEqual(3);
  });
});
