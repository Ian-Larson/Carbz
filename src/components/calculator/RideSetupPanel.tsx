import { useMemo } from 'react';
import { Check, ChevronLeft, ChevronRight, Droplets, Flag, FlaskConical, Route } from 'lucide-react';
import { WorkoutInput } from './WorkoutInput';
import { BottleSelector } from './BottleSelector';
import { RideSetup } from './RideSetup';
import { FuelStrategy } from './FuelStrategy';
import { useRideConfigStore } from '../../stores/rideConfigStore';
import { useFuelSelectionsStore } from '../../stores/fuelSelectionsStore';
import {
  SETUP_STEPS,
  useSetupFlowStore,
  getSetupCompletion,
  getFirstIncompleteStep,
  type SetupStep,
} from '../../stores/setupFlowStore';

const STEP_META: Record<SetupStep, { label: string; hint: string; icon: typeof Route }> = {
  ride: { label: 'Ride', hint: 'Duration and conditions', icon: Route },
  hydration: { label: 'Hydration', hint: 'Bottle setup', icon: Droplets },
  fuel: { label: 'Fuel', hint: 'Strategy and products', icon: FlaskConical },
  review: { label: 'Review', hint: 'Final checks', icon: Flag },
};

export function RideSetupPanel() {
  const bottles = useRideConfigStore((s) => s.bottles);
  const durationMinutes = useRideConfigStore((s) => s.durationMinutes);
  const carbTargetPerHour = useRideConfigStore((s) => s.carbTargetPerHour);
  const condition = useRideConfigStore((s) => s.condition);
  const intensity = useRideConfigStore((s) => s.intensity);
  const drinkMixes = useFuelSelectionsStore((s) => s.drinkMixes);
  const solids = useFuelSelectionsStore((s) => s.solids);

  const currentStep = useSetupFlowStore((s) => s.currentStep);
  const setStep = useSetupFlowStore((s) => s.setStep);
  const moveToNextStep = useSetupFlowStore((s) => s.moveToNextStep);
  const moveToPreviousStep = useSetupFlowStore((s) => s.moveToPreviousStep);
  const moveToFirstIncomplete = useSetupFlowStore((s) => s.moveToFirstIncomplete);

  const completion = useMemo(
    () =>
      getSetupCompletion({
        rideConfig: { bottles, durationMinutes, carbTargetPerHour, condition, intensity },
        fuelSelections: { drinkMixes, solids },
      }),
    [bottles, durationMinutes, carbTargetPerHour, condition, intensity, drinkMixes, solids]
  );

  const currentStepMeta = STEP_META[currentStep];
  const currentIndex = SETUP_STEPS.indexOf(currentStep);
  const progressPct = ((currentIndex + 1) / SETUP_STEPS.length) * 100;
  const firstIncompleteStep = getFirstIncompleteStep(completion);

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 shadow-[var(--shadow-soft)]">
        <div className="mb-3 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
              Guided Setup
            </h2>
            <p className="text-sm text-[var(--text-primary)]">
              Step {currentIndex + 1} of {SETUP_STEPS.length}: {currentStepMeta.label}
            </p>
          </div>
          <span className="rounded-full border border-[var(--line)] bg-[var(--surface-muted)] px-3 py-1 text-xs font-semibold text-[var(--text-primary)]">
            {Math.round(progressPct)}%
          </span>
        </div>

        <div className="mb-4 h-2 overflow-hidden rounded-full bg-[var(--surface-muted)]">
          <div
            className="h-full bg-[var(--accent)] transition-[width] duration-[var(--motion-medium)]"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {SETUP_STEPS.map((step) => {
            const meta = STEP_META[step];
            const Icon = meta.icon;
            const isActive = step === currentStep;
            const done = completion[step];

            return (
              <button
                key={step}
                type="button"
                onClick={() => setStep(step)}
                className={`rounded-xl border px-3 py-2 text-left transition-colors ${
                  isActive
                    ? 'border-[var(--accent)] bg-[var(--accent-soft)]'
                    : 'border-[var(--line)] bg-[var(--surface-muted)] hover:border-[var(--line-strong)]'
                }`}
                aria-current={isActive ? 'step' : undefined}
              >
                <div className="mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-sm font-semibold text-[var(--text-primary)]">
                    <Icon className="h-4 w-4" />
                    {meta.label}
                  </span>
                  {done && <Check className="h-3.5 w-3.5 text-[var(--success)]" aria-hidden="true" />}
                </div>
                <p className="text-[11px] text-[var(--text-muted)]">{meta.hint}</p>
              </button>
            );
          })}
        </div>
      </section>

      {currentStep === 'ride' && (
        <>
          <WorkoutInput />
          <RideSetup />
        </>
      )}

      {currentStep === 'hydration' && <BottleSelector />}
      {currentStep === 'fuel' && <FuelStrategy />}

      {currentStep === 'review' && (
        <section className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 shadow-[var(--shadow-soft)]">
          <h3 className="mb-2 text-base font-semibold text-[var(--text-primary)]">Review Checklist</h3>
          <div className="space-y-2 text-sm">
            {SETUP_STEPS.filter((step) => step !== 'review').map((step) => (
              <div key={step} className="flex items-center justify-between rounded-lg bg-[var(--surface-muted)] px-3 py-2">
                <span className="text-[var(--text-primary)]">{STEP_META[step].label}</span>
                <span className={completion[step] ? 'text-[var(--success)]' : 'text-[var(--warning)]'}>
                  {completion[step] ? 'Ready' : 'Needs input'}
                </span>
              </div>
            ))}
          </div>
          {!completion.review && (
            <button
              type="button"
              onClick={() => moveToFirstIncomplete(completion)}
              className="mt-3 rounded-lg border border-[var(--line)] bg-[var(--surface-muted)] px-3 py-1.5 text-sm font-medium text-[var(--text-primary)] hover:border-[var(--line-strong)]"
            >
              Go to first incomplete step ({STEP_META[firstIncompleteStep].label})
            </button>
          )}
        </section>
      )}

      <div className="flex items-center justify-between rounded-xl border border-[var(--line)] bg-[var(--surface)] p-3">
        <button
          type="button"
          onClick={moveToPreviousStep}
          disabled={currentStep === 'ride'}
          className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm text-[var(--text-primary)] hover:bg-[var(--surface-muted)] disabled:opacity-40 disabled:hover:bg-transparent"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </button>
        <button
          type="button"
          onClick={() => moveToNextStep(completion)}
          disabled={currentStep === 'review' || !completion[currentStep]}
          className="inline-flex items-center gap-1 rounded-lg bg-[var(--accent)] px-3 py-1.5 text-sm font-semibold text-[var(--accent-contrast)] hover:bg-[var(--accent-strong)] disabled:opacity-40"
        >
          {currentStep === 'fuel' ? 'Review' : 'Next'}
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
