import { beforeEach, describe, expect, it } from 'vitest';
import { usePresetStore } from './presetStore';
import { useRideConfigStore } from './rideConfigStore';
import { useFuelSelectionsStore } from './fuelSelectionsStore';
import type { FuelSelections, RideConfig } from '../types';

const baselineRide: RideConfig = {
  bottles: [
    { size: 550, count: 1 },
    { size: 750, count: 1 },
  ],
  durationMinutes: 90,
  carbTargetPerHour: 80,
  condition: 'warm',
  intensity: 'moderate',
};

const baselineFuel: FuelSelections = {
  drinkMixes: [],
  solids: [],
};

describe('preset regression', () => {
  beforeEach(() => {
    localStorage.clear();
    usePresetStore.setState({ presets: [] });
    useRideConfigStore.setState({ ...baselineRide });
    useFuelSelectionsStore.setState({
      mode: 'auto',
      selectedProductIds: [],
      drinkMixes: baselineFuel.drinkMixes,
      solids: baselineFuel.solids,
    });
  });

  it('preserves save/load behavior after guided-flow additions', () => {
    const customRide: RideConfig = {
      bottles: [{ size: 950, count: 2 }],
      durationMinutes: 180,
      carbTargetPerHour: 90,
      condition: 'hot',
      intensity: 'race',
    };
    const customFuel: FuelSelections = {
      drinkMixes: [{ mixId: 'mix-a', bottleIndex: 0, scoops: 2.5 }],
      solids: [{ productId: 'solid-a', perHour: 1 }],
    };

    useRideConfigStore.setState({ ...customRide });
    useFuelSelectionsStore.setState({
      mode: 'manual',
      selectedProductIds: ['mix-a', 'solid-a'],
      drinkMixes: customFuel.drinkMixes,
      solids: customFuel.solids,
    });

    usePresetStore.getState().savePreset('Race Day', useRideConfigStore.getState().getRideConfig(), useFuelSelectionsStore.getState().getFuelSelections());
    const saved = usePresetStore.getState().presets[0];

    useRideConfigStore.setState({ ...baselineRide });
    useFuelSelectionsStore.setState({
      mode: 'auto',
      selectedProductIds: [],
      drinkMixes: [],
      solids: [],
    });

    useRideConfigStore.getState().loadFromPreset(saved.rideConfig);
    useFuelSelectionsStore.getState().loadFromPreset(saved.fuelSelections);

    expect(useRideConfigStore.getState().getRideConfig()).toEqual(customRide);
    expect(useFuelSelectionsStore.getState().getFuelSelections()).toEqual(customFuel);
  });
});
