import { useState } from 'react'
import { Bike, Calculator, BookOpen } from 'lucide-react'
import { CalculatorTab } from './components/calculator/CalculatorTab'
import { LibraryTab } from './components/library/LibraryTab'

type Tab = 'calculator' | 'library'

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('calculator')

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-md">
        {/* Header */}
        <div className="bg-white pt-8 pb-4 text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary-100">
            <Bike className="h-6 w-6 text-primary-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Fuel Calculator</h1>
          <p className="text-sm text-gray-500">Dial in your on-bike nutrition</p>
        </div>

        {/* Tab Bar */}
        <div className="sticky top-0 z-10 bg-white px-4 pb-2">
          <div className="flex rounded-lg bg-gray-100 p-1">
            <button
              onClick={() => setActiveTab('calculator')}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-2 text-sm font-medium transition-colors ${
                activeTab === 'calculator'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Calculator className="h-4 w-4" />
              Calculator
            </button>
            <button
              onClick={() => setActiveTab('library')}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-2 text-sm font-medium transition-colors ${
                activeTab === 'library'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <BookOpen className="h-4 w-4" />
              My Library
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="px-4 pb-8">
          {activeTab === 'calculator' ? <CalculatorTab /> : <LibraryTab />}
        </div>
      </div>
    </div>
  )
}
