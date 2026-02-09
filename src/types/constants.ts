import type { BottleSize, ConditionConfig, IntensityConfig } from './index';

export const BOTTLE_SIZES: BottleSize[] = [550, 750, 950];
export const MAX_BOTTLES_ON_BIKE = 2;

export const DURATION_OPTIONS: number[] = Array.from({ length: 19 }, (_, i) => 30 + i * 15);

export const CARB_TARGETS = [50, 60, 70, 80, 90] as const;

export const CONDITIONS: ConditionConfig[] = [
  { key: 'cool', label: 'Cool', icon: '❄️', tempRange: '<65\u00B0F', fluidPerHour: 500 },
  { key: 'mild', label: 'Mild', icon: '🌤️', tempRange: '65-75\u00B0F', fluidPerHour: 700 },
  { key: 'warm', label: 'Warm', icon: '☀️', tempRange: '75-85\u00B0F', fluidPerHour: 900 },
  { key: 'hot', label: 'Hot', icon: '🔥', tempRange: '85\u00B0F+', fluidPerHour: 1100 },
];

export const INTENSITIES: IntensityConfig[] = [
  { key: 'easy', label: 'Easy', icon: '🏃', description: 'Recovery / Z1-Z2' },
  { key: 'moderate', label: 'Moderate', icon: '🚴', description: 'Endurance / Z2-Z3' },
  { key: 'hard', label: 'Hard', icon: '⚡', description: 'Tempo / Z3-Z4' },
  { key: 'race', label: 'Race', icon: '🏁', description: 'Group ride / Race' },
];

export const SWEAT_RATE_SODIUM: Record<string, { label: string; mgPerHour: number }> = {
  light: { label: 'Light Sweater', mgPerHour: 400 },
  moderate: { label: 'Moderate Sweater', mgPerHour: 700 },
  heavy: { label: 'Heavy Sweater', mgPerHour: 1000 },
};

export const CAFFEINE_LIMIT_MG_PER_KG = { min: 3, max: 6 };

export const CONCENTRATION_THRESHOLDS: Array<{ max: number; label: string }> = [
  { max: 4, label: 'Light' },
  { max: 8, label: 'Moderate' },
  { max: 12, label: 'Strong' },
  { max: Infinity, label: 'Very Strong' },
];
