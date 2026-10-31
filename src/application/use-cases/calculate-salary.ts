import {
  calculateSalary as runFormula,
  type SalaryBreakdown,
} from '../../domain/salary-calculator';
import type { Settings } from '../../domain/settings';

/** Applies the salary formula to the hours worked, using the rate and tax values from Settings. */
export function calculateSalary(hours: number, settings: Settings): SalaryBreakdown | null {
  return runFormula(hours, settings.hourlyRate, settings.rates);
}
