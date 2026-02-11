import type { FuelPlanOutput } from '../types';

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}:${m.toString().padStart(2, '0')}`;
}

export function formatScoops(scoops: number): string {
  if (scoops === 0) return '0';
  const whole = Math.floor(scoops);
  const frac = scoops - whole;

  let fracStr = '';
  if (Math.abs(frac - 0.25) < 0.01) fracStr = '\u00BC';
  else if (Math.abs(frac - 0.5) < 0.01) fracStr = '\u00BD';
  else if (Math.abs(frac - 0.75) < 0.01) fracStr = '\u00BE';
  else if (Math.abs(frac - 0.33) < 0.05) fracStr = '\u2153';
  else if (Math.abs(frac - 0.67) < 0.05) fracStr = '\u2154';
  else if (frac > 0.01) fracStr = frac.toFixed(1).slice(1);

  if (whole === 0) return fracStr || '0';
  if (!fracStr) return whole.toString();
  return `${whole}${fracStr}`;
}

export function formatFraction(numerator: number, denominator: number): string {
  if (denominator === 0) return '0';
  const simplified = simplifyFraction(numerator, denominator);
  if (simplified[0] === simplified[1]) return 'all';
  if (simplified[0] === 0) return '0';
  return `${simplified[0]}/${simplified[1]}`;
}

function simplifyFraction(a: number, b: number): [number, number] {
  const g = gcd(Math.round(a), Math.round(b));
  return [Math.round(a / g), Math.round(b / g)];
}

function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a;
}

export function formatPlanAsText(plan: FuelPlanOutput): string {
  const lines: string[] = [];
  lines.push('=== RIDE FUEL PLAN ===');
  lines.push('');

  if (plan.quickSummary) {
    lines.push(plan.quickSummary);
    lines.push('');
  }

  lines.push(`Carbs: ${Math.round(plan.totalCarbs)}g / ${Math.round(plan.targetCarbs)}g target`);
  lines.push(`Fluid: ${Math.round(plan.totalFluidMl)}ml / ${Math.round(plan.targetFluidMl)}ml target`);
  lines.push(`Calories: ${Math.round(plan.totalCalories)} kcal`);
  lines.push(`Sodium: ${Math.round(plan.totalSodiumMg)} mg`);
  if (plan.totalCaffeineMg > 0) {
    lines.push(`Caffeine: ${Math.round(plan.totalCaffeineMg)} mg`);
  }
  if (plan.totalCost !== null) {
    lines.push(`Cost: $${plan.totalCost.toFixed(2)}`);
  }
  lines.push('');

  if (plan.bottlePreps.length > 0) {
    lines.push('--- BOTTLE PREP ---');
    for (const bp of plan.bottlePreps) {
      const quantityLabel = bp.quantity > 1 ? ` x${bp.quantity}` : '';
      if (bp.totalGrams !== null) {
        lines.push(`B${bp.bottleIndex + 1}${quantityLabel}: ${bp.bottleSize}ml — ${bp.totalGrams}g ${bp.mixName} per bottle (${formatScoops(bp.scoops)} scoops, ${Math.round(bp.carbsGrams)}g total carbs, ${bp.concentration.toFixed(1)}% ${bp.concentrationLabel})`);
      } else {
        lines.push(`B${bp.bottleIndex + 1}${quantityLabel}: ${bp.bottleSize}ml — ${formatScoops(bp.scoops)} scoops ${bp.mixName} per bottle (${Math.round(bp.carbsGrams)}g total carbs, ${bp.concentration.toFixed(1)}% ${bp.concentrationLabel})`);
      }
    }
    lines.push('');
  }

  lines.push('--- HOUR BY HOUR ---');
  for (const hour of plan.hourlyPlan) {
    const label = hour.isPartial
      ? `Hour ${hour.hourNumber} (partial, ${hour.durationMinutes}min)`
      : `Hour ${hour.hourNumber}`;
    lines.push(`${label} — ${Math.round(hour.totalCarbs)}g carbs`);
    for (const b of hour.bottles) {
      lines.push(`  Drink ${b.fractionLabel} of B${b.bottleIndex + 1} (${b.bottleSize}ml)`);
    }
    for (const s of hour.solids) {
      lines.push(`  Eat ${s.quantity}x ${s.name} (${Math.round(s.carbsGrams)}g)`);
    }
  }

  lines.push('');
  lines.push('Finish!');
  return lines.join('\n');
}
