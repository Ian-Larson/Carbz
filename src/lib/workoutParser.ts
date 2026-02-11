import type { Condition, Intensity } from '../types';
import { ALL_DURATION_OPTIONS } from '../types/constants';

export type ParseConfidence = 'high' | 'medium' | 'low';

export interface ParsedExtraction {
  field: 'duration' | 'intensity' | 'condition';
  raw: string;
  normalized: string;
}

export interface ParsedWorkout {
  durationMinutes: number | null;
  intensity: Intensity | null;
  condition: Condition | null;
  detections: string[];
  confidence: ParseConfidence;
  extractions: ParsedExtraction[];
}

function snapDuration(minutes: number): number {
  return ALL_DURATION_OPTIONS.reduce((best, option) =>
    Math.abs(option - minutes) < Math.abs(best - minutes) ? option : best
  );
}

function toConfidence(score: number): ParseConfidence {
  if (score >= 4) return 'high';
  if (score >= 2) return 'medium';
  return 'low';
}

export function parseWorkout(text: string): ParsedWorkout {
  const lower = text.toLowerCase().trim();
  const detections: string[] = [];
  const extractions: ParsedExtraction[] = [];
  let score = 0;

  let durationMinutes: number | null = null;

  const hrMinMatch = lower.match(
    /(\d+(?:\.\d+)?)\s*(?:h|hr|hrs|hour|hours)\b(?:\s*(\d{1,2})\s*(?:m|min|mins|minute|minutes)\b)?/
  );
  if (hrMinMatch) {
    const hours = parseFloat(hrMinMatch[1]);
    const mins = hrMinMatch[2] ? parseInt(hrMinMatch[2], 10) : 0;
    durationMinutes = snapDuration(Math.round(hours * 60 + mins));
    const normalized = `${durationMinutes}min`;
    detections.push(normalized);
    extractions.push({
      field: 'duration',
      raw: hrMinMatch[0],
      normalized,
    });
    score += 2;
  }

  if (durationMinutes === null) {
    const colonMatch = lower.match(/(\d{1,2}):(\d{2})/);
    if (colonMatch) {
      durationMinutes = snapDuration(parseInt(colonMatch[1], 10) * 60 + parseInt(colonMatch[2], 10));
      const normalized = `${durationMinutes}min`;
      detections.push(normalized);
      extractions.push({
        field: 'duration',
        raw: colonMatch[0],
        normalized,
      });
      score += 2;
    }
  }

  if (durationMinutes === null) {
    const minMatch = lower.match(/(\d+)\s*(?:m|min|mins|minute|minutes)\b/);
    if (minMatch) {
      durationMinutes = snapDuration(parseInt(minMatch[1], 10));
      const normalized = `${durationMinutes}min`;
      detections.push(normalized);
      extractions.push({
        field: 'duration',
        raw: minMatch[0],
        normalized,
      });
      score += 1;
    }
  }

  let intensity: Intensity | null = null;
  const intensityMatchers: Array<{ value: Intensity; pattern: RegExp }> = [
    {
      value: 'race',
      pattern: /\b(race|crit|criterium|time trial|tt|sprint|vo2|z5|zone 5|all[- ]out|a[- ]race|race pace)\b/,
    },
    {
      value: 'hard',
      pattern: /\b(tempo|sweet\s*spot|threshold|z4|zone 4|z3[-/]z4|hard|intervals?|ftp|over[-/]unders?)\b/,
    },
    {
      value: 'easy',
      pattern: /\b(recovery|easy|z1|zone 1|rest day|spin|active recovery|coffee ride)\b/,
    },
    {
      value: 'moderate',
      pattern: /\b(endurance|z2|z3|zone 2|zone 3|z2[-/]z3|moderate|steady|base|group ride|long ride|century)\b/,
    },
  ];

  for (const matcher of intensityMatchers) {
    const match = lower.match(matcher.pattern);
    if (!match) continue;
    intensity = matcher.value;
    const normalized = `${matcher.value} intensity`;
    detections.push(normalized);
    extractions.push({
      field: 'intensity',
      raw: match[0],
      normalized,
    });
    score += 1;
    break;
  }

  let condition: Condition | null = null;
  const conditionMatchers: Array<{ value: Condition; pattern: RegExp }> = [
    { value: 'hot', pattern: /\b(hot|scorching|90\+|95|100(?:°|deg|f)?)\b/ },
    { value: 'warm', pattern: /\b(warm|sunny|summer|80s?|85(?:°|deg|f)?)\b/ },
    { value: 'cool', pattern: /\b(cool|cold|chilly|50s?|winter|fall)\b/ },
    { value: 'mild', pattern: /\b(mild|nice|spring|70s?|temperate)\b/ },
  ];

  for (const matcher of conditionMatchers) {
    const match = lower.match(matcher.pattern);
    if (!match) continue;
    condition = matcher.value;
    const normalized = `${matcher.value} conditions`;
    detections.push(normalized);
    extractions.push({
      field: 'condition',
      raw: match[0],
      normalized,
    });
    score += 1;
    break;
  }

  return {
    durationMinutes,
    intensity,
    condition,
    detections,
    confidence: toConfidence(score),
    extractions,
  };
}
