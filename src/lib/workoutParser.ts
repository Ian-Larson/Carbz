import type { Condition, Intensity } from '../types';
import { ALL_DURATION_OPTIONS } from '../types/constants';

export interface ParsedWorkout {
  durationMinutes: number | null;
  intensity: Intensity | null;
  condition: Condition | null;
  detections: string[];
}

export function parseWorkout(text: string): ParsedWorkout {
  const lower = text.toLowerCase().trim();
  const detections: string[] = [];

  // Parse duration
  let durationMinutes: number | null = null;

  // Match "Xhr", "X hour", "X hours", "Xhr Ymin"
  const hrMinMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:hr|hour)s?\s*(?:(\d+)\s*(?:min|m)\b)?/);
  if (hrMinMatch) {
    const hours = parseFloat(hrMinMatch[1]);
    const mins = hrMinMatch[2] ? parseInt(hrMinMatch[2]) : 0;
    durationMinutes = Math.round(hours * 60 + mins);
    detections.push(`${hours}hr${mins ? ` ${mins}min` : ''}`);
  }

  // Match "X:XX" format (H:MM)
  if (!durationMinutes) {
    const colonMatch = lower.match(/(\d):(\d{2})/);
    if (colonMatch) {
      durationMinutes = parseInt(colonMatch[1]) * 60 + parseInt(colonMatch[2]);
      detections.push(`${colonMatch[1]}:${colonMatch[2]}`);
    }
  }

  // Match "XXmin" or "XX minutes"
  if (!durationMinutes) {
    const minMatch = lower.match(/(\d+)\s*(?:min|minutes)\b/);
    if (minMatch) {
      durationMinutes = parseInt(minMatch[1]);
      detections.push(`${minMatch[1]}min`);
    }
  }

  // Snap to nearest available option
  if (durationMinutes !== null) {
    const closest = ALL_DURATION_OPTIONS.reduce((best, opt) =>
      Math.abs(opt - durationMinutes!) < Math.abs(best - durationMinutes!) ? opt : best
    );
    durationMinutes = closest;
  }

  // Parse intensity
  let intensity: Intensity | null = null;

  const racePatterns = /\b(race|crit|criterium|time trial|tt|sprint|vo2|z5|zone 5|all[- ]out|a[\- ]race|race pace)\b/;
  const hardPatterns = /\b(tempo|sweet\s*spot|threshold|z4|zone 4|z3[\-\/]z4|hard|intervals?|ftp|over[\-\/]unders?)\b/;
  const easyPatterns = /\b(recovery|easy|z1|zone 1|rest day|spin|active recovery|coffee ride)\b/;
  const moderatePatterns = /\b(endurance|z2|z3|zone 2|zone 3|z2[\-\/]z3|moderate|steady|base|group ride|long ride|century)\b/;

  if (racePatterns.test(lower)) {
    intensity = 'race';
    detections.push('race intensity');
  } else if (hardPatterns.test(lower)) {
    intensity = 'hard';
    detections.push('hard intensity');
  } else if (easyPatterns.test(lower)) {
    intensity = 'easy';
    detections.push('easy intensity');
  } else if (moderatePatterns.test(lower)) {
    intensity = 'moderate';
    detections.push('moderate intensity');
  }

  // Parse conditions
  let condition: Condition | null = null;

  if (/\b(hot|scorching|90\+|95|100\u00B0?)\b/.test(lower)) {
    condition = 'hot';
    detections.push('hot conditions');
  } else if (/\b(warm|sunny|summer|80s?|85\u00B0?)\b/.test(lower)) {
    condition = 'warm';
    detections.push('warm conditions');
  } else if (/\b(cool|cold|chilly|50s?|winter|fall)\b/.test(lower)) {
    condition = 'cool';
    detections.push('cool conditions');
  } else if (/\b(mild|nice|spring|70s?|temperate)\b/.test(lower)) {
    condition = 'mild';
    detections.push('mild conditions');
  }

  return { durationMinutes, intensity, condition, detections };
}
