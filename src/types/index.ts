// ─── Product Types ───────────────────────────────────────────

export interface DrinkMix {
  id: string;
  name: string;
  carbsPerScoop: number;
  sodiumPerScoop: number;
  caffeinePerScoop: number;
  caloriesPerScoop: number;
  costPerServing?: number;
  isDefault: boolean;
}

export interface GelOrSolid {
  id: string;
  name: string;
  type: 'gel' | 'chew' | 'bar' | 'gummy' | 'other';
  carbsPerServing: number;
  sodiumPerServing: number;
  caffeinePerServing: number;
  caloriesPerServing: number;
  servingDescription: string;
  costPerServing?: number;
  isDefault: boolean;
}

export type Product = DrinkMix | GelOrSolid;

export function isDrinkMix(p: Product): p is DrinkMix {
  return 'carbsPerScoop' in p;
}

// ─── Bottle Configuration ────────────────────────────────────

export const COMMON_BOTTLE_SIZES = [550, 750, 950] as const;

export interface BottleSlot {
  size: number;
  count: number;
}

// ─── Ride Configuration ──────────────────────────────────────

export type Condition = 'cool' | 'mild' | 'warm' | 'hot';

export interface ConditionConfig {
  key: Condition;
  label: string;
  icon: string;
  tempRange: string;
  fluidPerHour: number;
}

export type Intensity = 'easy' | 'moderate' | 'hard' | 'race';

export interface IntensityConfig {
  key: Intensity;
  label: string;
  icon: string;
  description: string;
}

export type SweatRate = 'light' | 'moderate' | 'heavy';

export interface RideConfig {
  bottles: BottleSlot[];
  durationMinutes: number;
  carbTargetPerHour: number;
  condition: Condition;
  intensity: Intensity;
}

// ─── Fuel Selections ─────────────────────────────────────────

export type FuelMode = 'auto' | 'manual';

export interface DrinkMixSelection {
  mixId: string;
  bottleIndex: number;
  scoops: number;
}

export interface SolidSelection {
  productId: string;
  perHour: number;
}

export interface FuelSelections {
  drinkMixes: DrinkMixSelection[];
  solids: SolidSelection[];
}

// ─── Computed Fuel Plan Output ───────────────────────────────

export interface BottlePrep {
  bottleIndex: number;
  bottleSize: number;
  mixName: string;
  scoops: number;
  carbsGrams: number;
  sodiumMg: number;
  caffeineMg: number;
  concentration: number;
  concentrationLabel: string;
}

export interface HourSegment {
  hourNumber: number;
  isPartial: boolean;
  startMinute: number;
  endMinute: number;
  durationMinutes: number;
  bottles: Array<{
    bottleIndex: number;
    bottleSize: number;
    drinkMl: number;
    fractionLabel: string;
  }>;
  solids: Array<{
    name: string;
    quantity: number;
    carbsGrams: number;
    sodiumMg: number;
    caffeineMg: number;
  }>;
  totalCarbs: number;
  totalSodium: number;
  totalCaffeine: number;
  totalCalories: number;
}

export interface Warning {
  type: 'capacity' | 'concentration' | 'caffeine' | 'fluid' | 'carbs';
  severity: 'info' | 'warning' | 'error';
  message: string;
}

export interface FuelPlanOutput {
  totalCarbs: number;
  targetCarbs: number;
  totalFluidMl: number;
  targetFluidMl: number;
  totalCalories: number;
  totalSodiumMg: number;
  totalCaffeineMg: number;
  totalCost: number | null;
  bottlePreps: BottlePrep[];
  hourlyPlan: HourSegment[];
  warnings: Warning[];
  quickSummary: string;
}

// ─── Presets ─────────────────────────────────────────────────

export interface RidePreset {
  id: string;
  name: string;
  rideConfig: RideConfig;
  fuelSelections: FuelSelections;
  createdAt: number;
  updatedAt: number;
}

// ─── User Preferences ────────────────────────────────────────

export interface UserPreferences {
  bodyWeightKg: number | null;
  sweatRate: SweatRate;
  defaultCondition: Condition;
  defaultIntensity: Intensity;
  defaultCarbTarget: number;
}
