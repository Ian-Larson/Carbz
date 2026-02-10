import { WorkoutInput } from './WorkoutInput';
import { BottleSelector } from './BottleSelector';
import { RideSetup } from './RideSetup';
import { FuelStrategy } from './FuelStrategy';

export function RideSetupPanel() {
  return (
    <div className="space-y-4">
      <WorkoutInput />
      <BottleSelector />
      <RideSetup />
      <FuelStrategy />
    </div>
  );
}
