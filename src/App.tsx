import { useState } from 'react'
import { Bike, BookOpen, Settings, ChevronDown } from 'lucide-react'
import { RideSetupPanel } from './components/calculator/RideSetupPanel'
import { FuelPlanPanel } from './components/fuelplan/FuelPlanPanel'
import { LibraryPanel } from './components/library/LibraryPanel'
import { SettingsModal } from './components/library/SettingsModal'
import { usePresetStore } from './stores/presetStore'
import { useRideConfigStore } from './stores/rideConfigStore'
import { useFuelSelectionsStore } from './stores/fuelSelectionsStore'
import { formatDuration } from './lib/formatters'

export default function App() {
  const [libraryOpen, setLibraryOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [presetsOpen, setPresetsOpen] = useState(false)

  const presets = usePresetStore((s) => s.presets)
  const loadRideConfig = useRideConfigStore((s) => s.loadFromPreset)
  const loadFuelSelections = useFuelSelectionsStore((s) => s.loadFromPreset)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-gray-100 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-100">
              <Bike className="h-4 w-4 text-primary-600" />
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-900 leading-tight">Fuel Calculator</h1>
              <p className="text-xs text-gray-400 hidden sm:block">Dial in your on-bike nutrition</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {/* Presets dropdown */}
            <div className="relative">
              <button
                onClick={() => setPresetsOpen(!presetsOpen)}
                className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm text-gray-600 transition-colors hover:bg-gray-100"
              >
                Presets
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
              {presetsOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setPresetsOpen(false)} />
                  <div className="absolute right-0 z-50 mt-1 w-64 rounded-xl border border-gray-100 bg-white py-1 shadow-lg">
                    {presets.length === 0 ? (
                      <p className="px-3 py-2 text-sm text-gray-400">No saved presets</p>
                    ) : (
                      presets.map((preset) => (
                        <button
                          key={preset.id}
                          onClick={() => {
                            loadRideConfig(preset.rideConfig)
                            loadFuelSelections(preset.fuelSelections)
                            setPresetsOpen(false)
                          }}
                          className="w-full px-3 py-2 text-left transition-colors hover:bg-gray-50"
                        >
                          <div className="text-sm font-medium text-gray-900">{preset.name}</div>
                          <div className="text-xs text-gray-400">
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
              onClick={() => setLibraryOpen(true)}
              className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm text-gray-600 transition-colors hover:bg-gray-100"
            >
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Library</span>
            </button>
            <button
              onClick={() => setSettingsOpen(true)}
              className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-sm text-gray-600 transition-colors hover:bg-gray-100"
            >
              <Settings className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content: Two-panel on desktop, stacked on mobile */}
      <main className="mx-auto max-w-6xl px-4 py-4 md:px-6 md:py-6">
        <div className="flex flex-col gap-6 md:grid md:grid-cols-2 lg:gap-8">
          {/* Left panel: Ride Setup */}
          <div className="space-y-4">
            <RideSetupPanel />
          </div>

          {/* Right panel: Fuel Plan (sticky on desktop) */}
          <div className="md:sticky md:top-20 md:max-h-[calc(100vh-6rem)] md:overflow-y-auto md:rounded-xl">
            <FuelPlanPanel />
          </div>
        </div>
      </main>

      {/* Library slide-over */}
      <LibraryPanel open={libraryOpen} onClose={() => setLibraryOpen(false)} />

      {/* Settings modal */}
      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  )
}
