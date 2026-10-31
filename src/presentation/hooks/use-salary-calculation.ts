import { useMemo } from 'react';
import { parseScaledDecimal } from '../../domain/decimal';
import { HOURS_DECIMALS, hundredthsToHours } from '../../domain/hours';
import type { SalaryBreakdown } from '../../domain/salary-calculator';
import { useServices } from './use-services';
import { useSettings } from './use-settings';

export type SalaryCalculationState =
  | { status: 'empty' }
  | { status: 'invalid' }
  | { status: 'too-large' }
  | { status: 'ready'; breakdown: SalaryBreakdown };

/** Calculates live from the hours text the user has typed, using the current Settings. */
export function useSalaryCalculation(hoursText: string): SalaryCalculationState {
  const { calculateSalary } = useServices();
  const settings = useSettings();

  return useMemo(() => {
    if (hoursText.trim() === '') return { status: 'empty' };

    const hundredths = parseScaledDecimal(hoursText, HOURS_DECIMALS);
    if (hundredths === null) return { status: 'invalid' };

    const breakdown = calculateSalary(hundredthsToHours(hundredths), settings);
    return breakdown ? { status: 'ready', breakdown } : { status: 'too-large' };
  }, [hoursText, settings, calculateSalary]);
}
