import type { Grosze } from './money';
import { TAX_RATE_NAMES, type TaxRates } from './rates';
import type { SalaryBreakdown } from './salary-calculator';
import type { Settings } from './settings';

/** A saved history record: an immutable snapshot that later Settings changes never rewrite. */
export interface Calculation {
  id: string;
  /** ISO 8601 timestamp. */
  createdAt: string;
  /** Month the salary is for, as YYYY-MM. */
  period: string;
  hours: number;
  hourlyRate: Grosze;
  rates: TaxRates;
  breakdown: SalaryBreakdown;
}

/** The local calendar month of a date, as YYYY-MM. */
export function toPeriod(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${date.getFullYear()}-${month}`;
}

export function createCalculation(id: string, now: Date, breakdown: SalaryBreakdown): Calculation {
  return {
    id,
    createdAt: now.toISOString(),
    period: toPeriod(now),
    hours: breakdown.hours,
    hourlyRate: breakdown.hourlyRate,
    rates: breakdown.rates,
    breakdown,
  };
}

/** Newest salary month first; within a month, the most recently saved first. */
export function sortForHistory(calculations: readonly Calculation[]): Calculation[] {
  return [...calculations].sort(
    (a, b) => b.period.localeCompare(a.period) || b.createdAt.localeCompare(a.createdAt),
  );
}

export type CalculationValueName = 'hourlyRate' | keyof TaxRates;

/** Which of the values a calculation used are different in the current Settings. */
export function findChangedValues(
  calculation: Calculation,
  settings: Settings,
): Set<CalculationValueName> {
  const changed = new Set<CalculationValueName>();
  if (calculation.hourlyRate !== settings.hourlyRate) changed.add('hourlyRate');
  for (const name of TAX_RATE_NAMES) {
    if (calculation.rates[name] !== settings.rates[name]) changed.add(name);
  }
  return changed;
}
