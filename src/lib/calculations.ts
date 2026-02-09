import type {
  Condition,
  BottleSlot,
  DrinkMixSelection,
  DrinkMix,
  GelOrSolid,
  BottlePrep,
  HourSegment,
  Warning,
  FuelPlanOutput,
  FuelSelections,
  RideConfig,
  UserPreferences,
} from '../types';
import { CONDITIONS, CONCENTRATION_THRESHOLDS, SWEAT_RATE_SODIUM, CAFFEINE_LIMIT_MG_PER_KG } from '../types/constants';
import { formatScoops, formatFraction } from './formatters';

// ─── Target Calculations ─────────────────────────────────────

export function getFluidPerHour(condition: Condition): number {
  return CONDITIONS.find(c => c.key === condition)?.fluidPerHour ?? 700;
}

export function calcFluidTarget(condition: Condition, durationMinutes: number): number {
  return getFluidPerHour(condition) * (durationMinutes / 60);
}

export function calcCarbTarget(carbsPerHour: number, durationMinutes: number): number {
  return carbsPerHour * (durationMinutes / 60);
}

// ─── Bottle Prep ─────────────────────────────────────────────

export function getConcentrationLabel(percent: number): string {
  for (const t of CONCENTRATION_THRESHOLDS) {
    if (percent <= t.max) return t.label;
  }
  return 'Very Strong';
}

export function calcBottlePreps(
  bottles: BottleSlot[],
  selections: DrinkMixSelection[],
  mixes: DrinkMix[]
): BottlePrep[] {
  const preps: BottlePrep[] = [];

  bottles.forEach((bottle, idx) => {
    if (bottle.count === 0) return;

    const bottleSelections = selections.filter(s => s.bottleIndex === idx);
    if (bottleSelections.length === 0) return;

    for (const sel of bottleSelections) {
      const mix = mixes.find(m => m.id === sel.mixId);
      if (!mix || sel.scoops === 0) continue;

      const carbsGrams = mix.carbsPerScoop * sel.scoops;
      const sodiumMg = mix.sodiumPerScoop * sel.scoops;
      const caffeineMg = mix.caffeinePerScoop * sel.scoops;
      // Concentration: grams of carbs per 100ml
      const concentration = (carbsGrams / bottle.size) * 100;

      preps.push({
        bottleIndex: idx,
        bottleSize: bottle.size,
        mixName: mix.name,
        scoops: sel.scoops,
        carbsGrams,
        sodiumMg,
        caffeineMg,
        concentration,
        concentrationLabel: getConcentrationLabel(concentration),
      });
    }
  });

  return preps;
}

// ─── Active Bottles ──────────────────────────────────────────

function getActiveBottles(bottles: BottleSlot[]): Array<{ index: number; size: number }> {
  const active: Array<{ index: number; size: number }> = [];
  bottles.forEach((b, idx) => {
    for (let i = 0; i < b.count; i++) {
      active.push({ index: idx, size: b.size });
    }
  });
  return active;
}

function getTotalBottleCapacity(bottles: BottleSlot[]): number {
  return bottles.reduce((sum, b) => sum + b.size * b.count, 0);
}

// ─── Hourly Plan ─────────────────────────────────────────────

export function calcHourlyPlan(
  rideConfig: RideConfig,
  fuelSelections: FuelSelections,
  products: { mixes: DrinkMix[]; solids: GelOrSolid[] }
): HourSegment[] {
  const { durationMinutes } = rideConfig;
  if (durationMinutes === 0) return [];

  const totalHours = durationMinutes / 60;
  const fullHours = Math.floor(totalHours);
  const partialMinutes = durationMinutes - fullHours * 60;
  const segmentCount = partialMinutes > 0 ? fullHours + 1 : fullHours;

  const activeBottles = getActiveBottles(rideConfig.bottles);

  // Calculate total carbs/sodium/caffeine from bottles
  const bottlePreps = calcBottlePreps(rideConfig.bottles, fuelSelections.drinkMixes, products.mixes);
  const totalDrinkCarbs = bottlePreps.reduce((s, b) => s + b.carbsGrams, 0);
  const totalDrinkSodium = bottlePreps.reduce((s, b) => s + b.sodiumMg, 0);
  const totalDrinkCaffeine = bottlePreps.reduce((s, b) => s + b.caffeineMg, 0);
  const totalDrinkCalories = bottlePreps.reduce((s, b) => {
    const mix = products.mixes.find(m => m.name === b.mixName);
    return s + (mix ? mix.caloriesPerScoop * b.scoops : 0);
  }, 0);

  const segments: HourSegment[] = [];

  for (let i = 0; i < segmentCount; i++) {
    const isPartial = i === segmentCount - 1 && partialMinutes > 0;
    const segDuration = isPartial ? partialMinutes : 60;
    const segFraction = segDuration / durationMinutes;

    // Bottle breakdown for this segment
    const segBottles = activeBottles.map(b => {
      const bottleFluid = b.size * segFraction;
      // Calculate fraction of this bottle consumed this hour
      const fracNum = Math.round(segFraction * 60);
      const fracDen = 60;
      return {
        bottleIndex: b.index,
        bottleSize: b.size as 550 | 750 | 950,
        drinkMl: bottleFluid,
        fractionLabel: formatFraction(segDuration, durationMinutes) !== '0'
          ? formatFraction(segDuration, durationMinutes)
          : formatFraction(fracNum, fracDen),
      };
    });

    // Carbs from drink proportional to fluid consumed
    const drinkCarbs = totalDrinkCarbs * segFraction;
    const drinkSodium = totalDrinkSodium * segFraction;
    const drinkCaffeine = totalDrinkCaffeine * segFraction;
    const drinkCalories = totalDrinkCalories * segFraction;

    // Solids per hour (scale for partial hours)
    const hourFraction = segDuration / 60;
    const segSolids = fuelSelections.solids
      .filter(s => s.perHour > 0)
      .map(sel => {
        const product = products.solids.find(p => p.id === sel.productId);
        if (!product) return null;
        const qty = sel.perHour * hourFraction;
        return {
          name: product.name,
          quantity: qty,
          carbsGrams: product.carbsPerServing * qty,
          sodiumMg: product.sodiumPerServing * qty,
          caffeineMg: product.caffeinePerServing * qty,
        };
      })
      .filter((s): s is NonNullable<typeof s> => s !== null);

    const solidCarbs = segSolids.reduce((s, x) => s + x.carbsGrams, 0);
    const solidSodium = segSolids.reduce((s, x) => s + x.sodiumMg, 0);
    const solidCaffeine = segSolids.reduce((s, x) => s + x.caffeineMg, 0);
    const solidCalories = segSolids.reduce((s, x) => {
      const product = products.solids.find(p => p.name === x.name);
      return s + (product ? product.caloriesPerServing * x.quantity : 0);
    }, 0);

    segments.push({
      hourNumber: i + 1,
      isPartial,
      startMinute: i * 60,
      endMinute: i * 60 + segDuration,
      durationMinutes: segDuration,
      bottles: segBottles,
      solids: segSolids,
      totalCarbs: drinkCarbs + solidCarbs,
      totalSodium: drinkSodium + solidSodium,
      totalCaffeine: drinkCaffeine + solidCaffeine,
      totalCalories: drinkCalories + solidCalories,
    });
  }

  return segments;
}

// ─── Totals ──────────────────────────────────────────────────

export function calcTotals(
  rideConfig: RideConfig,
  fuelSelections: FuelSelections,
  products: { mixes: DrinkMix[]; solids: GelOrSolid[] }
): {
  totalCarbs: number;
  targetCarbs: number;
  totalFluidMl: number;
  targetFluidMl: number;
  totalCalories: number;
  totalSodiumMg: number;
  totalCaffeineMg: number;
  totalCost: number | null;
} {
  const bottlePreps = calcBottlePreps(rideConfig.bottles, fuelSelections.drinkMixes, products.mixes);
  const durationHours = rideConfig.durationMinutes / 60;

  const drinkCarbs = bottlePreps.reduce((s, b) => s + b.carbsGrams, 0);
  const drinkSodium = bottlePreps.reduce((s, b) => s + b.sodiumMg, 0);
  const drinkCaffeine = bottlePreps.reduce((s, b) => s + b.caffeineMg, 0);
  const drinkCalories = bottlePreps.reduce((s, b) => {
    const mix = products.mixes.find(m => m.name === b.mixName);
    return s + (mix ? mix.caloriesPerScoop * b.scoops : 0);
  }, 0);

  let drinkCost: number | null = 0;
  for (const bp of bottlePreps) {
    const mix = products.mixes.find(m => m.name === bp.mixName);
    if (mix?.costPerServing != null) {
      drinkCost! += mix.costPerServing * bp.scoops;
    } else {
      drinkCost = null;
      break;
    }
  }

  const solidSelections = fuelSelections.solids.filter(s => s.perHour > 0);
  let solidCarbs = 0, solidSodium = 0, solidCaffeine = 0, solidCalories = 0;
  let solidCost: number | null = 0;

  for (const sel of solidSelections) {
    const product = products.solids.find(p => p.id === sel.productId);
    if (!product) continue;
    const totalServings = sel.perHour * durationHours;
    solidCarbs += product.carbsPerServing * totalServings;
    solidSodium += product.sodiumPerServing * totalServings;
    solidCaffeine += product.caffeinePerServing * totalServings;
    solidCalories += product.caloriesPerServing * totalServings;
    if (product.costPerServing != null && solidCost !== null) {
      solidCost += product.costPerServing * totalServings;
    } else {
      solidCost = null;
    }
  }

  const totalCost = drinkCost !== null && solidCost !== null ? drinkCost + solidCost : null;

  return {
    totalCarbs: drinkCarbs + solidCarbs,
    targetCarbs: calcCarbTarget(rideConfig.carbTargetPerHour, rideConfig.durationMinutes),
    totalFluidMl: getTotalBottleCapacity(rideConfig.bottles),
    targetFluidMl: calcFluidTarget(rideConfig.condition, rideConfig.durationMinutes),
    totalCalories: drinkCalories + solidCalories,
    totalSodiumMg: drinkSodium + solidSodium,
    totalCaffeineMg: drinkCaffeine + solidCaffeine,
    totalCost,
  };
}

// ─── Warnings ────────────────────────────────────────────────

export function generateWarnings(
  totals: ReturnType<typeof calcTotals>,
  bottlePreps: BottlePrep[],
  preferences: UserPreferences
): Warning[] {
  const warnings: Warning[] = [];

  // Fluid capacity warning
  if (totals.totalFluidMl < totals.targetFluidMl * 0.9) {
    const deficit = Math.round(totals.targetFluidMl - totals.totalFluidMl);
    warnings.push({
      type: 'fluid',
      severity: 'warning',
      message: `You need more liquid capacity. You're ${deficit}ml short. Swap to bigger bottles or plan a refill.`,
    });
  }

  // Carb shortfall
  if (totals.totalCarbs < totals.targetCarbs * 0.9) {
    warnings.push({
      type: 'carbs',
      severity: 'warning',
      message: `Below carb target — you have ${Math.round(totals.totalCarbs)}g but targeting ${Math.round(totals.targetCarbs)}g. Add more mix or solids.`,
    });
  }

  // Carb excess
  if (totals.totalCarbs > totals.targetCarbs * 1.15) {
    warnings.push({
      type: 'carbs',
      severity: 'info',
      message: `Exceeding carb target by ${Math.round(((totals.totalCarbs / totals.targetCarbs) - 1) * 100)}%. This is fine if your gut can handle it.`,
    });
  }

  // High concentration
  for (const bp of bottlePreps) {
    if (bp.concentration > 10) {
      warnings.push({
        type: 'concentration',
        severity: 'warning',
        message: `B${bp.bottleIndex + 1} concentration is ${bp.concentration.toFixed(1)}% — may cause GI issues. Consider spreading across bottles.`,
      });
    }
  }

  // Caffeine ceiling
  if (preferences.bodyWeightKg && totals.totalCaffeineMg > 0) {
    const maxCaffeine = preferences.bodyWeightKg * CAFFEINE_LIMIT_MG_PER_KG.max;
    if (totals.totalCaffeineMg > maxCaffeine) {
      warnings.push({
        type: 'caffeine',
        severity: 'warning',
        message: `Caffeine (${Math.round(totals.totalCaffeineMg)}mg) exceeds recommended ceiling of ${Math.round(maxCaffeine)}mg for your weight.`,
      });
    }
  }

  // Sodium guidance
  if (preferences.sweatRate) {
    const sodiumTarget = SWEAT_RATE_SODIUM[preferences.sweatRate];
    if (sodiumTarget) {
      const durationHours = totals.targetFluidMl / (totals.targetFluidMl > 0 ? totals.targetFluidMl / (totals.targetFluidMl / 700) : 1);
      // Simple: just compare total sodium to target * hours implied by fluid target
      // Actually let's use the ride duration from the carb target
      const rideHours = totals.targetCarbs > 0 ? totals.targetCarbs / 80 : 1; // rough estimate
      const targetSodium = sodiumTarget.mgPerHour * Math.max(rideHours, durationHours);
      if (totals.totalSodiumMg < targetSodium * 0.7) {
        warnings.push({
          type: 'capacity',
          severity: 'info',
          message: `Sodium is low for a ${preferences.sweatRate} sweater. Consider a higher-sodium mix or salt tabs.`,
        });
      }
    }
  }

  return warnings;
}

// ─── Quick Summary ───────────────────────────────────────────

export function generateQuickSummary(
  rideConfig: RideConfig,
  bottlePreps: BottlePrep[],
  fuelSelections: FuelSelections,
  products: { mixes: DrinkMix[]; solids: GelOrSolid[] }
): string {
  const parts: string[] = [];

  // Bottles to bring
  const activeBottles = getActiveBottles(rideConfig.bottles);
  if (activeBottles.length > 0) {
    const bottleStr = activeBottles.map(b => `${b.size}ml`).join(' + ');
    parts.push(`Bring your ${bottleStr}.`);
  }

  // Mix instructions
  for (const bp of bottlePreps) {
    parts.push(`Add ${formatScoops(bp.scoops)} scoops to B${bp.bottleIndex + 1}.`);
  }

  // Solid instructions
  const activeSolids = fuelSelections.solids.filter(s => s.perHour > 0);
  for (const sel of activeSolids) {
    const product = products.solids.find(p => p.id === sel.productId);
    if (product) {
      const qty = sel.perHour === 1 ? '1' : sel.perHour.toString();
      parts.push(`Eat ${qty} ${product.name.split('(')[0].trim()} per hour.`);
    }
  }

  // Drinking order
  if (bottlePreps.length > 1) {
    parts.push('Drink B1 first.');
  }

  return parts.join(' ');
}

// ─── Full Fuel Plan ──────────────────────────────────────────

export function computeFuelPlan(
  rideConfig: RideConfig,
  fuelSelections: FuelSelections,
  products: { mixes: DrinkMix[]; solids: GelOrSolid[] },
  preferences: UserPreferences
): FuelPlanOutput {
  const bottlePreps = calcBottlePreps(rideConfig.bottles, fuelSelections.drinkMixes, products.mixes);
  const hourlyPlan = calcHourlyPlan(rideConfig, fuelSelections, products);
  const totals = calcTotals(rideConfig, fuelSelections, products);
  const warnings = generateWarnings(totals, bottlePreps, preferences);
  const quickSummary = generateQuickSummary(rideConfig, bottlePreps, fuelSelections, products);

  return {
    ...totals,
    bottlePreps,
    hourlyPlan,
    warnings,
    quickSummary,
  };
}
