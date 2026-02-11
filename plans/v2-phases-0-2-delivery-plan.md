# Carbz Phases 0-2 Delivery Plan (Issue-Ready for Codex/Claude)

## Summary
This plan converts Phases 0, 1, and 2 into dependency-ordered implementation issues with strict quality gates. It is optimized for agent execution, with each issue containing scope, file targets, acceptance criteria, and test requirements so implementers do not need to make product or architecture decisions.

## Locked Defaults (Chosen)
1. Planning artifact: Issue-ready backlog.
2. Execution model: Sequential by dependency, with limited parallelism only inside each phase where noted.
3. Quality gates: Strict (`lint`, `build`, `test` all passing before issue close).
4. Visual direction: Athlete minimal (high contrast, low clutter, utility-first readability).
5. UX direction for Phase 2: Guided setup flow with progressive disclosure.

## Public Interface/Type Changes (Mandatory)
1. Update `BottlePrep` in `/Users/ian/Desktop/Carbz/Carbz/src/types/index.ts` to include `quantity: number` (number of physical bottles represented by a prep row).
2. Extend `Warning["type"]` in `/Users/ian/Desktop/Carbz/Carbz/src/types/index.ts` with `'sodium'`.
3. Change `generateWarnings(...)` signature in `/Users/ian/Desktop/Carbz/Carbz/src/lib/calculations.ts` to receive `rideConfig` directly, removing inferred duration math.
4. Expand `ParsedWorkout` in `/Users/ian/Desktop/Carbz/Carbz/src/lib/workoutParser.ts` with `confidence: 'high' | 'medium' | 'low'` and normalized extraction metadata used by guided UX.

## Quality Gates (Applied to Every Issue)
1. `npm ci` succeeds in `/Users/ian/Desktop/Carbz/Carbz`.
2. `npm run lint` passes.
3. `npm run build` passes.
4. `npm run test` passes.
5. No regressions in saved preset load behavior.

## Issue Backlog

### Phase 0: Logic Correctness + Test Foundation

1. **P0-00: Baseline test harness and scripts**
Scope: establish enforceable quality pipeline before functional fixes.
Files: `/Users/ian/Desktop/Carbz/Carbz/package.json`, `/Users/ian/Desktop/Carbz/Carbz/vite.config.ts`, `/Users/ian/Desktop/Carbz/Carbz/src/**/*.test.ts`.
Deliverables: add `test` and `test:watch` scripts; configure Vitest for TS React modules; add initial smoke tests for calculator pipeline.
Acceptance: `npm run test` works locally and in CI; one failing sample test can be added then removed during setup validation.

2. **P0-01: Fix bottle-count math across suggestion + totals**
Scope: correct undercount when `BottleSlot.count > 1`.
Files: `/Users/ian/Desktop/Carbz/Carbz/src/lib/suggestions.ts`, `/Users/ian/Desktop/Carbz/Carbz/src/lib/calculations.ts`, `/Users/ian/Desktop/Carbz/Carbz/src/types/index.ts`, `/Users/ian/Desktop/Carbz/Carbz/src/components/fuelplan/FuelPlan.tsx`.
Implementation decisions:
- Keep one drink selection per bottle slot index.
- Multiply prep/totals by slot `count`.
- Surface `quantity` in bottle prep UI (`x2`, `x3`).
- Keep concentration calculation per physical bottle (not multiplied).
Acceptance: total carbs/fluid/sodium/caffeine match expected values for count=1,2,3; bottle prep text is unambiguous for repeated bottles.

3. **P0-02: Warning engine correctness rewrite**
Scope: remove heuristic duration inference and produce deterministic warning thresholds.
Files: `/Users/ian/Desktop/Carbz/Carbz/src/lib/calculations.ts`, `/Users/ian/Desktop/Carbz/Carbz/src/types/index.ts`.
Implementation decisions:
- `rideHours = rideConfig.durationMinutes / 60`.
- Sodium target = `SWEAT_RATE_SODIUM[sweatRate].mgPerHour * rideHours`.
- Use warning type `'sodium'` for sodium-specific messages.
- Preserve current fluid/carb thresholds (90% floor) unless tests justify adjustment.
Acceptance: sodium warnings no longer depend on carb target; warning messages include clear corrective action text.

4. **P0-03: Deterministic regression tests (logic)**
Scope: lock core computational behavior with scenario tests.
Files: `/Users/ian/Desktop/Carbz/Carbz/src/lib/calculations.test.ts`, `/Users/ian/Desktop/Carbz/Carbz/src/lib/suggestions.test.ts`, `/Users/ian/Desktop/Carbz/Carbz/src/lib/workoutParser.test.ts`.
Required scenarios:
- Multi-bottle same slot count.
- Long hot ride with fluid deficit warning.
- Carb shortfall and carb excess cases.
- High caffeine with body-weight ceiling.
- Sodium low/high based on sweat rate.
- Parser extraction for `2hr`, `1:30`, `90min`, mixed-intensity text.
Acceptance: tests cover success + edge + failure mode paths; minimum 85% statement coverage in these three modules.

### Phase 1: Visual System Overhaul (Athlete Minimal)

5. **P1-00: Design token foundation**
Scope: replace ad-hoc color/spacing usage with semantic tokens.
Files: `/Users/ian/Desktop/Carbz/Carbz/src/index.css`.
Implementation decisions:
- Add semantic color tokens (`--surface`, `--surface-muted`, `--text-primary`, `--accent`, `--danger`, `--warning`, `--success`).
- Add spacing/radius/elevation/motion tokens.
- Keep Tailwind v4 theme variables, but map UI to semantic variables.
Acceptance: no component references raw gray/primary palettes directly for primary surfaces and text.

6. **P1-01: Shared primitive styling unification**
Scope: normalize card/button/chip/field appearance and states.
Files: `/Users/ian/Desktop/Carbz/Carbz/src/components/shared/Card.tsx`, `/Users/ian/Desktop/Carbz/Carbz/src/components/shared/ChipSelector.tsx`, `/Users/ian/Desktop/Carbz/Carbz/src/components/shared/ProgressBar.tsx`, `/Users/ian/Desktop/Carbz/Carbz/src/components/shared/Modal.tsx`, `/Users/ian/Desktop/Carbz/Carbz/src/components/shared/SlideOver.tsx`.
Implementation decisions:
- Add consistent focus-visible ring.
- Add disabled and hover contrast guarantees.
- Add reduced-motion support for animated elements.
Acceptance: keyboard navigation clearly visible on all controls; dialog/slideover styles match app shell system.

7. **P1-02: App shell and panel visual refresh**
Scope: upgrade visual hierarchy and spacing without changing core information architecture.
Files: `/Users/ian/Desktop/Carbz/Carbz/src/App.tsx`, `/Users/ian/Desktop/Carbz/Carbz/src/components/calculator/RideSetupPanel.tsx`, `/Users/ian/Desktop/Carbz/Carbz/src/components/fuelplan/FuelPlanPanel.tsx`.
Implementation decisions:
- Header gets stronger identity and cleaner action grouping.
- Panel spacing and sticky behavior tuned for desktop readability.
- Mobile remains stacked with improved rhythm.
Acceptance: no horizontal overflow on 320px width; right panel remains usable on 768px+ with sticky behavior.

8. **P1-03: Accessibility pass (AA minimum)**
Scope: accessibility hardening for redesigned visuals.
Files: all touched Phase 1 components.
Implementation decisions:
- Add ARIA labels for icon-only buttons.
- Add `role="dialog"` and escape/backdrop close behavior consistency.
- Verify color contrast >= WCAG AA for text and interactive controls.
Acceptance: zero critical accessibility regressions from baseline; keyboard-only flow completes key tasks.

### Phase 2: UX Flow Restructure (Guided Setup)

9. **P2-00: Guided setup flow state model**
Scope: introduce explicit setup steps with completion rules.
Files: `/Users/ian/Desktop/Carbz/Carbz/src/stores/setupFlowStore.ts` (new), `/Users/ian/Desktop/Carbz/Carbz/src/components/calculator/RideSetupPanel.tsx`, `/Users/ian/Desktop/Carbz/Carbz/src/components/calculator/RideSetup.tsx`, `/Users/ian/Desktop/Carbz/Carbz/src/components/calculator/BottleSelector.tsx`, `/Users/ian/Desktop/Carbz/Carbz/src/components/calculator/FuelStrategy.tsx`.
Implementation decisions:
- Steps: `Ride`, `Hydration`, `Fuel`, `Review`.
- Completion predicates are pure and deterministic from store state.
- Preserve compatibility with existing persisted stores.
Acceptance: users can complete guided flow without opening advanced controls; no data loss across reload.

10. **P2-01: Workout parsing confidence + apply UX**
Scope: convert parser output into actionable guided setup helper.
Files: `/Users/ian/Desktop/Carbz/Carbz/src/lib/workoutParser.ts`, `/Users/ian/Desktop/Carbz/Carbz/src/components/calculator/WorkoutInput.tsx`, `/Users/ian/Desktop/Carbz/Carbz/src/types/index.ts` (if needed for shared parser types).
Implementation decisions:
- Add confidence scoring based on number/quality of extracted signals.
- Show extracted chips with "applied" status.
- Keep manual override as first-class and reversible.
Acceptance: parser never silently overwrites unrelated fields; confidence displayed for every parse attempt with at least one detection.

11. **P2-02: Progressive disclosure in strategy + setup**
Scope: reduce cognitive load by showing only next-relevant controls.
Files: `/Users/ian/Desktop/Carbz/Carbz/src/components/calculator/FuelStrategy.tsx`, `/Users/ian/Desktop/Carbz/Carbz/src/components/calculator/RideSetup.tsx`, `/Users/ian/Desktop/Carbz/Carbz/src/components/calculator/BottleSelector.tsx`.
Implementation decisions:
- Auto mode defaults to collapsed details.
- Manual mode reveals product selectors and constraints.
- Advanced options hidden behind explicit toggles.
Acceptance: first-time user can generate a valid plan in under 60 seconds from blank state.

12. **P2-03: Actionable warning/empty states in fuel plan**
Scope: warnings become corrective actions, not passive text.
Files: `/Users/ian/Desktop/Carbz/Carbz/src/components/fuelplan/FuelPlan.tsx`, `/Users/ian/Desktop/Carbz/Carbz/src/lib/calculations.ts`.
Implementation decisions:
- Map warning types to CTAs (`Add bottle`, `Lower concentration`, `Increase carbs`, `Adjust sodium`).
- Keep logic in pure functions; UI maps warning-to-action dispatch.
Acceptance: each warning category has a one-click remediation path; empty state links directly to first incomplete setup step.

## Test Matrix (Must Be Implemented)

1. Unit tests for all calculators with deterministic fixtures for duration, bottle count, and nutrition values.
2. Parser tests for ambiguous language and mixed tokens (`"2hr Z2 warm"`, `"90min threshold cool"`, `"1:30 group ride"`).
3. Integration tests for guided flow progression from empty state to valid plan.
4. Regression tests for presets save/load after guided flow changes.
5. Accessibility checks for keyboard traversal in modal/slideover and guided step controls.

## Dependency Order and Parallelism

1. Execute P0-00 first.
2. Execute P0-01 and P0-02 sequentially.
3. Execute P0-03 after logic changes land.
4. Execute P1-00 before any Phase 1 visual refactors.
5. Execute P1-01 and P1-02 sequentially; P1-03 last in Phase 1.
6. Execute P2-00 before P2-01/P2-02.
7. Execute P2-03 after P2-00 and P2-02.

## Assumptions

1. Agents will install dependencies (`npm ci`) before running checks.
2. No backend/API changes are required; scope remains frontend-only React/Zustand.
3. Existing persisted store keys remain stable unless migration is explicitly added.
4. CI wiring is out of scope unless failing checks block issue closure.
