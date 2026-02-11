import { useMemo, useState } from 'react';
import { Check, FileText, Sparkles, Undo2 } from 'lucide-react';
import { parseWorkout, type ParsedWorkout } from '../../lib/workoutParser';
import { useRideConfigStore } from '../../stores/rideConfigStore';
import { Card } from '../shared/Card';

type ParsedField = 'duration' | 'condition' | 'intensity';

export function WorkoutInput() {
  const [text, setText] = useState('');
  const [parsed, setParsed] = useState<ParsedWorkout | null>(null);
  const [applied, setApplied] = useState<Record<ParsedField, boolean>>({
    duration: false,
    condition: false,
    intensity: false,
  });
  const [previousValues, setPreviousValues] = useState<Partial<Record<ParsedField, number | string | null>>>({});

  const durationMinutes = useRideConfigStore((s) => s.durationMinutes);
  const condition = useRideConfigStore((s) => s.condition);
  const intensity = useRideConfigStore((s) => s.intensity);
  const setDuration = useRideConfigStore((s) => s.setDuration);
  const setCondition = useRideConfigStore((s) => s.setCondition);
  const setIntensity = useRideConfigStore((s) => s.setIntensity);

  const confidenceTone = useMemo(() => {
    if (!parsed) return 'text-[var(--text-muted)]';
    if (parsed.confidence === 'high') return 'text-[var(--success)]';
    if (parsed.confidence === 'medium') return 'text-[var(--warning)]';
    return 'text-[var(--danger)]';
  }, [parsed]);

  const handleParse = () => {
    if (!text.trim()) return;
    const result = parseWorkout(text);
    setParsed(result);
    setApplied({
      duration: false,
      condition: false,
      intensity: false,
    });
    setPreviousValues({});
  };

  const applyField = (field: ParsedField) => {
    if (!parsed) return;

    setPreviousValues((prev) => {
      const next = { ...prev };
      if (field === 'duration' && next.duration == null) next.duration = durationMinutes;
      if (field === 'condition' && next.condition == null) next.condition = condition;
      if (field === 'intensity' && next.intensity == null) next.intensity = intensity;
      return next;
    });

    if (field === 'duration' && parsed.durationMinutes !== null) {
      setDuration(parsed.durationMinutes);
    }
    if (field === 'condition' && parsed.condition !== null) {
      setCondition(parsed.condition);
    }
    if (field === 'intensity' && parsed.intensity !== null) {
      setIntensity(parsed.intensity);
    }

    setApplied((prev) => ({ ...prev, [field]: true }));
  };

  const applyAll = () => {
    if (!parsed) return;
    if (parsed.durationMinutes !== null) applyField('duration');
    if (parsed.condition !== null) applyField('condition');
    if (parsed.intensity !== null) applyField('intensity');
  };

  const hasApplied = applied.duration || applied.condition || applied.intensity;

  const revertApplied = () => {
    if (previousValues.duration != null) setDuration(Number(previousValues.duration));
    if (previousValues.condition != null) setCondition(previousValues.condition as typeof condition);
    if (previousValues.intensity != null) setIntensity(previousValues.intensity as typeof intensity);
    setApplied({
      duration: false,
      condition: false,
      intensity: false,
    });
    setPreviousValues({});
  };

  return (
    <Card title="Quick Setup" icon="📋">
      <div className="space-y-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder='Paste your workout... e.g. "2hr endurance Z2, warm conditions"'
          className="w-full resize-none rounded-xl border border-[var(--line)] bg-[var(--surface-muted)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-soft)]"
          rows={3}
        />
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleParse}
            disabled={!text.trim()}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--accent)] px-3 py-1.5 text-sm font-semibold text-[var(--accent-contrast)] transition-colors hover:bg-[var(--accent-strong)] disabled:opacity-50"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Parse Workout
          </button>
          {parsed && parsed.detections.length > 0 && (
            <span className={`text-xs font-semibold uppercase tracking-[0.1em] ${confidenceTone}`}>
              Confidence: {parsed.confidence}
            </span>
          )}
        </div>
      </div>

      {parsed && parsed.detections.length > 0 && (
        <div className="mt-3 space-y-2">
          <div className="flex flex-wrap items-center gap-1.5">
            {parsed.durationMinutes !== null && (
              <FieldChip
                label={`Duration ${parsed.durationMinutes}min`}
                applied={applied.duration}
                onApply={() => applyField('duration')}
              />
            )}
            {parsed.condition !== null && (
              <FieldChip
                label={`Condition ${parsed.condition}`}
                applied={applied.condition}
                onApply={() => applyField('condition')}
              />
            )}
            {parsed.intensity !== null && (
              <FieldChip
                label={`Intensity ${parsed.intensity}`}
                applied={applied.intensity}
                onApply={() => applyField('intensity')}
              />
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={applyAll}
              className="rounded-lg border border-[var(--line)] bg-[var(--surface-muted)] px-2.5 py-1 text-xs font-semibold text-[var(--text-primary)] hover:border-[var(--line-strong)]"
            >
              Apply all
            </button>
            {hasApplied && (
              <button
                type="button"
                onClick={revertApplied}
                className="inline-flex items-center gap-1 rounded-lg border border-[var(--line)] bg-[var(--surface)] px-2.5 py-1 text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--surface-muted)]"
              >
                <Undo2 className="h-3.5 w-3.5" />
                Revert applied
              </button>
            )}
          </div>
        </div>
      )}

      <p className="mt-2 flex items-center gap-1 text-xs text-[var(--text-muted)]">
        <FileText className="h-3 w-3" />
        Manual controls below always remain editable.
      </p>
    </Card>
  );
}

function FieldChip({ label, applied, onApply }: { label: string; applied: boolean; onApply: () => void }) {
  return (
    <button
      type="button"
      onClick={onApply}
      disabled={applied}
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
        applied
          ? 'border-[var(--success)] bg-[var(--success-soft)] text-[var(--success)]'
          : 'border-[var(--line)] bg-[var(--surface)] text-[var(--text-primary)] hover:border-[var(--accent)]'
      }`}
    >
      {applied && <Check className="h-3 w-3" />}
      {label}
      {!applied && <span className="text-[var(--text-muted)]">Apply</span>}
    </button>
  );
}
