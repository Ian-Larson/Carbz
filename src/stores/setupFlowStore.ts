import { create } from 'zustand';
import type { FuelSelections, RideConfig } from '../types';

export const SETUP_STEPS = ['ride', 'hydration', 'fuel', 'review'] as const;
export type SetupStep = (typeof SETUP_STEPS)[number];

export interface SetupSnapshot {
  rideConfig: RideConfig;
  fuelSelections: FuelSelections;
}

export type SetupCompletion = Record<SetupStep, boolean>;

export function getSetupCompletion(snapshot: SetupSnapshot): SetupCompletion {
  const { rideConfig, fuelSelections } = snapshot;
  const hasDuration = rideConfig.durationMinutes > 0;
  const hasCondition = !!rideConfig.condition;
  const hasIntensity = !!rideConfig.intensity;
  const hasCarbTarget = rideConfig.carbTargetPerHour > 0;
  const hasBottleCapacity = rideConfig.bottles.some((b) => b.count > 0 && b.size > 0);
  const hasFuelSelection =
    fuelSelections.drinkMixes.some((m) => m.scoops > 0) ||
    fuelSelections.solids.some((s) => s.perHour > 0);

  const ride = hasDuration && hasCondition && hasIntensity && hasCarbTarget;
  const hydration = hasBottleCapacity;
  const fuel = hasFuelSelection;
  const review = ride && hydration && fuel;

  return { ride, hydration, fuel, review };
}

export function getFirstIncompleteStep(completion: SetupCompletion): SetupStep {
  return SETUP_STEPS.find((step) => !completion[step]) ?? 'review';
}

interface SetupFlowState {
  currentStep: SetupStep;
  setStep: (step: SetupStep) => void;
  moveToNextStep: (completion: SetupCompletion) => void;
  moveToPreviousStep: () => void;
  moveToFirstIncomplete: (completion: SetupCompletion) => void;
}

export const useSetupFlowStore = create<SetupFlowState>()((set, get) => ({
  currentStep: 'ride',
  setStep: (step) => set({ currentStep: step }),
  moveToNextStep: (completion) => {
    const { currentStep } = get();
    const currentIndex = SETUP_STEPS.indexOf(currentStep);
    const next = SETUP_STEPS[currentIndex + 1];
    if (!next) return;
    if (!completion[currentStep] && currentStep !== 'review') return;
    set({ currentStep: next });
  },
  moveToPreviousStep: () => {
    const { currentStep } = get();
    const currentIndex = SETUP_STEPS.indexOf(currentStep);
    const previous = SETUP_STEPS[currentIndex - 1];
    if (previous) set({ currentStep: previous });
  },
  moveToFirstIncomplete: (completion) => set({ currentStep: getFirstIncompleteStep(completion) }),
}));
