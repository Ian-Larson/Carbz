import { useState } from 'react';
import { FileText, Sparkles } from 'lucide-react';
import { parseWorkout } from '../../lib/workoutParser';
import { useRideConfigStore } from '../../stores/rideConfigStore';
import { Card } from '../shared/Card';

export function WorkoutInput() {
  const [text, setText] = useState('');
  const [detections, setDetections] = useState<string[]>([]);
  const setDuration = useRideConfigStore((s) => s.setDuration);
  const setCondition = useRideConfigStore((s) => s.setCondition);
  const setIntensity = useRideConfigStore((s) => s.setIntensity);

  const handleParse = () => {
    if (!text.trim()) return;
    const result = parseWorkout(text);
    if (result.durationMinutes) setDuration(result.durationMinutes);
    if (result.condition) setCondition(result.condition);
    if (result.intensity) setIntensity(result.intensity);
    setDetections(result.detections);
  };

  return (
    <Card title="Quick Setup" icon="📋">
      <div className="space-y-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder='Paste your workout... e.g. "2hr endurance Z2, warm conditions"'
          className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm placeholder:text-gray-400 focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-400"
          rows={2}
        />
        <div className="flex items-center gap-2">
          <button
            onClick={handleParse}
            disabled={!text.trim()}
            className="flex items-center gap-1.5 rounded-lg bg-primary-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-primary-700 disabled:opacity-40"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Parse Workout
          </button>
          {detections.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {detections.map((d, i) => (
                <span key={i} className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                  {d}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
      <p className="mt-2 text-xs text-gray-400 flex items-center gap-1">
        <FileText className="h-3 w-3" />
        Or configure manually below
      </p>
    </Card>
  );
}
