import type { Grosze } from './money';
import type { TaxRates } from './rates';
import type { SalaryBreakdown } from './salary-calculator';

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
