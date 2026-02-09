import type { RideConfig, DrinkMix, GelOrSolid, FuelSelections } from '../types';

/**
 * Work backwards from the carb target to suggest an optimal fuel plan.
 * Strategy:
 * 1. Fill bottles with drink mix at moderate concentration (~6-8%)
 * 2. Calculate remaining carb gap
 * 3. Fill with solids, preferring highest carbs-per-serving
 */
export function suggestFuelPlan(
  rideConfig: RideConfig,
  availableMixes: DrinkMix[],
  availableSolids: GelOrSolid[]
): FuelSelections {
  const durationHours = rideConfig.durationMinutes / 60;
  const totalCarbTarget = rideConfig.carbTargetPerHour * durationHours;

  const drinkMixSelections: FuelSelections['drinkMixes'] = [];
  let carbsFromDrink = 0;

  // Get active bottles
  const activeBottles = rideConfig.bottles
    .map((b, i) => ({ ...b, index: i }))
    .filter(b => b.count > 0);

  if (activeBottles.length > 0 && availableMixes.length > 0) {
    // Pick the best mix: prefer moderate carbs per scoop (good balance)
    const sortedMixes = [...availableMixes].sort((a, b) => b.carbsPerScoop - a.carbsPerScoop);
    const bestMix = sortedMixes[0];

    for (const bottle of activeBottles) {
      // Target ~6% concentration: carbGrams / bottleSize * 100 = 6
      // So carbGrams = bottleSize * 0.06
      const targetCarbsForBottle = bottle.size * 0.06;
      // Round to nearest 0.5 scoops
      let scoops = Math.round((targetCarbsForBottle / bestMix.carbsPerScoop) * 2) / 2;
      scoops = Math.max(0.5, scoops);

      const actualCarbs = bestMix.carbsPerScoop * scoops;

      // If we're already meeting carb target from drink alone, reduce
      if (carbsFromDrink + actualCarbs > totalCarbTarget * 0.8) {
        const remainingTarget = Math.max(0, totalCarbTarget * 0.7 - carbsFromDrink);
        scoops = Math.round((remainingTarget / bestMix.carbsPerScoop) * 2) / 2;
        scoops = Math.max(0.5, scoops);
      }

      drinkMixSelections.push({
        mixId: bestMix.id,
        bottleIndex: bottle.index,
        scoops,
      });
      carbsFromDrink += bestMix.carbsPerScoop * scoops;
    }
  }

  // Fill remaining carbs with solids
  const remainingCarbs = Math.max(0, totalCarbTarget - carbsFromDrink);
  const solidSelections: FuelSelections['solids'] = [];

  if (remainingCarbs > 0 && availableSolids.length > 0) {
    // Sort by carbs per serving descending
    const sortedSolids = [...availableSolids].sort(
      (a, b) => b.carbsPerServing - a.carbsPerServing
    );

    let carbsFilled = 0;
    for (const solid of sortedSolids) {
      if (carbsFilled >= remainingCarbs) break;

      // How many per hour to fill the gap?
      const carbsNeededPerHour = (remainingCarbs - carbsFilled) / durationHours;
      let perHour = Math.round(carbsNeededPerHour / solid.carbsPerServing);
      perHour = Math.max(0, Math.min(perHour, 3)); // cap at 3 per hour

      if (perHour > 0) {
        solidSelections.push({
          productId: solid.id,
          perHour,
        });
        carbsFilled += solid.carbsPerServing * perHour * durationHours;
      }
    }
  }

  return { drinkMixes: drinkMixSelections, solids: solidSelections };
}
