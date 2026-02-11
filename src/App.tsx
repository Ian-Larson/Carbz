import { useState } from 'react';
import { Bike, BookOpen, ChevronDown, Gauge, Settings } from 'lucide-react';
import { RideSetupPanel } from './components/calculator/RideSetupPanel';
import { FuelPlanPanel } from './components/fuelplan/FuelPlanPanel';
import { LibraryPanel } from './components/library/LibraryPanel';
import { SettingsModal } from './components/library/SettingsModal';
import { usePresetStore } from './stores/presetStore';
import { useRideConfigStore } from './stores/rideConfigStore';
import { useFuelSelectionsStore } from './stores/fuelSelectionsStore';
import { formatDuration } from './lib/formatters';

export default function App() {
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [presetsOpen, setPresetsOpen] = useState(false);

  const presets = usePresetStore((s) => s.presets);
  const loadRideConfig = useRideConfigStore((s) => s.loadFromPreset);
  const loadFuelSelections = useFuelSelectionsStore((s) => s.loadFromPreset);

  return (
    <div className="min-h-screen text-[var(--text-primary)]">
      <header className="sticky top-0 z-30 border-b border-[var(--line)] bg-[var(--surface-glass)] backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-3 py-3 sm:px-5">
          <div className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-[var(--accent)] text-[var(--accent-contrast)]">
              <Bike className="h-4 w-4" />
            </div>
            <div>
              <h1 className="text-xl font-semibold leading-tight">Carbz Fuel Studio</h1>
              <p className="text-xs uppercase tracking-[0.12em] text-[var(--text-muted)]">Athlete minimal planner</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <div className="relative">
              <button
                type="button"
                onClick={() => setPresetsOpen((open) => !open)}
                className="inline-flex items-center gap-1 rounded-lg border border-[var(--line)] bg-[var(--surface)] px-2.5 py-1.5 text-sm font-medium hover:border-[var(--line-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                aria-haspopup="menu"
                aria-expanded={presetsOpen}
              >
                <Gauge className="h-4 w-4" />
                Presets
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
              {presetsOpen && (
                <>
                  <button
                    type="button"
                    onClick={() => setPresetsOpen(false)}
                    className="fixed inset-0 z-40 cursor-default"
                    aria-label="Close preset list"
                  />
                  <div className="absolute right-0 z-50 mt-1.5 w-72 rounded-xl border border-[var(--line)] bg-[var(--surface)] p-1 shadow-[var(--shadow-soft)]">
                    {presets.length === 0 ? (
                      <p className="px-3 py-2 text-sm text-[var(--text-muted)]">No saved presets</p>
                    ) : (
                      presets.map((preset) => (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => {
                            loadRideConfig(preset.rideConfig);
                            loadFuelSelections(preset.fuelSelections);
                            setPresetsOpen(false);
                          }}
                          className="w-full rounded-lg px-3 py-2 text-left hover:bg-[var(--surface-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                        >
                          <div className="text-sm font-semibold text-[var(--text-primary)]">{preset.name}</div>
                          <div className="text-xs text-[var(--text-muted)]">
                            {formatDuration(preset.rideConfig.durationMinutes)} · {preset.rideConfig.carbTargetPerHour}g/hr
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={() => setLibraryOpen(true)}
              className="inline-flex items-center gap-1 rounded-lg border border-[var(--line)] bg-[var(--surface)] px-2.5 py-1.5 text-sm font-medium hover:border-[var(--line-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
            >
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Library</span>
            </button>

            <button
              type="button"
              onClick={() => setSettingsOpen(true)}
              className="inline-flex items-center gap-1 rounded-lg border border-[var(--line)] bg-[var(--surface)] px-2.5 py-1.5 text-sm font-medium hover:border-[var(--line-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
              aria-label="Open settings"
            >
              <Settings className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-3 py-4 sm:px-5 sm:py-5">
        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(320px,420px)] md:items-start">
          <div className="space-y-4">
            <RideSetupPanel />
          </div>
          <div className="md:sticky md:top-[88px]">
            <FuelPlanPanel />
          </div>
        </div>
      </main>

      <LibraryPanel open={libraryOpen} onClose={() => setLibraryOpen(false)} />
      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}
