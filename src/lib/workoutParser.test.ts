import { describe, expect, it } from 'vitest';
import { parseWorkout } from './workoutParser';

describe('parseWorkout', () => {
  it('parses 2hr format with high confidence when multiple signals are present', () => {
    const parsed = parseWorkout('2hr endurance Z2 warm conditions');

    expect(parsed.durationMinutes).toBe(120);
    expect(parsed.intensity).toBe('moderate');
    expect(parsed.condition).toBe('warm');
    expect(parsed.confidence).toBe('high');
    expect(parsed.extractions.length).toBeGreaterThanOrEqual(3);
  });

  it('parses 1:30 time format', () => {
    const parsed = parseWorkout('1:30 group ride');

    expect(parsed.durationMinutes).toBe(90);
    expect(parsed.intensity).toBe('moderate');
  });

  it('parses 90min format', () => {
    const parsed = parseWorkout('90min recovery spin');

    expect(parsed.durationMinutes).toBe(90);
    expect(parsed.intensity).toBe('easy');
  });

  it('handles mixed-intensity language by prioritizing the harder signal', () => {
    const parsed = parseWorkout('2hr Z2 warm threshold finish');

    expect(parsed.durationMinutes).toBe(120);
    expect(parsed.intensity).toBe('hard');
    expect(parsed.condition).toBe('warm');
  });

  it('returns low confidence for weakly structured text with a single detection', () => {
    const parsed = parseWorkout('easy spin with friends');

    expect(parsed.intensity).toBe('easy');
    expect(parsed.confidence).toBe('low');
  });
});
