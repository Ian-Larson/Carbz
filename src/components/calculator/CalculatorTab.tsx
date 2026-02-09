import { Wand2 } from 'lucide-react';
import { BottleSelector } from './BottleSelector';
import { RideSetup } from './RideSetup';
import { DrinkMixSection } from './DrinkMixSection';
import { GelsSolidsSection } from './GelsSolidsSection';
import { FuelPlan } from '../fuelplan/FuelPlan';
import { useRideConfigStore } from '../../stores/rideConfigStore';
import { useFuelSelectionsStore } from '../../stores/fuelSelectionsStore';
import { useProductStore } from '../../stores/productStore';
import { suggestFuelPlan } from '../../lib/suggestions';

export function CalculatorTab() {
  const getRideConfig = useRideConfigStore((s) => s.getRideConfig);
  const loadFuelSelections = useFuelSelectionsStore((s) => s.loadFromPreset);
  const drinkMixes = useProductStore((s) => s.drinkMixes);
  const solids = useProductStore((s) => s.solids);

  const handleAutoSuggest = () => {
    const config = getRideConfig();
    const suggestion = suggestFuelPlan(config, drinkMixes, solids);
    loadFuelSelections(suggestion);
  };

  return (
    <div className="space-y-4 py-4">
      <BottleSelector />
      <RideSetup />

      {/* Auto-suggest button */}
      <button
        onClick={handleAutoSuggest}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 py-3 text-sm font-medium text-white shadow-sm transition-all hover:from-primary-600 hover:to-primary-700 active:scale-[0.98]"
      >
        <Wand2 className="h-4 w-4" />
        Auto-suggest Fuel Plan
      </button>

      <DrinkMixSection />
      <GelsSolidsSection />
      <FuelPlan />
    </div>
  );
}
