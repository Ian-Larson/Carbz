import { beforeEach, describe, expect, it } from 'vitest';
import {
  getFirstIncompleteStep,
  getSetupCompletion,
  useSetupFlowStore,
} from './setupFlowStore';
import type { RideConfig, FuelSelections } from '../types';

function makeSnapshot(rideConfig: RideConfig, fuelSelections: FuelSelections) {
  return { rideConfig, fuelSelections };
}

describe('setupFlowStore', () => {
  beforeEach(() => {
    useSetupFlowStore.setState({ currentStep: 'ride' });
  });

  it('computes completion deterministically from state snapshot', () => {
    const emptyRide: RideConfig = {
      bottles: [],
      durationMinutes: 0,
      carbTargetPerHour: 0,
      condition: 'mild',
      intensity: 'moderate',
    };
    const emptyFuel: FuelSelections = { drinkMixes: [], solids: [] };
    const emptyCompletion = getSetupCompletion(makeSnapshot(emptyRide, emptyFuel));
    expect(emptyCompletion.ride).toBe(false);
    expect(emptyCompletion.hydration).toBe(false);
    expect(emptyCompletion.fuel).toBe(false);
    expect(getFirstIncompleteStep(emptyCompletion)).toBe('ride');

    const completeRide: RideConfig = {
      bottles: [{ size: 750, count: 2 }],
      durationMinutes: 120,
      carbTargetPerHour: 80,
      condition: 'warm',
      intensity: 'hard',
    };
    const completeFuel: FuelSelections = {
      drinkMixes: [{ mixId: 'mix-a', bottleIndex: 0, scoops: 2 }],
      solids: [{ productId: 'solid-a', perHour: 1 }],
    };
    const completeCompletion = getSetupCompletion(makeSnapshot(completeRide, completeFuel));
    expect(completeCompletion.review).toBe(true);
  });

  it('progresses steps only when current step is complete', () => {
    const store = useSetupFlowStore.getState();

    store.moveToNextStep({ ride: false, hydration: false, fuel: false, review: false });
    expect(useSetupFlowStore.getState().currentStep).toBe('ride');

    store.moveToNextStep({ ride: true, hydration: false, fuel: false, review: false });
    expect(useSetupFlowStore.getState().currentStep).toBe('hydration');

    useSetupFlowStore.getState().moveToNextStep({ ride: true, hydration: true, fuel: true, review: true });
    expect(useSetupFlowStore.getState().currentStep).toBe('fuel');

    useSetupFlowStore.getState().moveToPreviousStep();
    expect(useSetupFlowStore.getState().currentStep).toBe('hydration');
  });
});
