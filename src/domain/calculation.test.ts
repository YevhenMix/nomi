import { describe, expect, it } from 'vitest';
import { createCalculation, toPeriod } from './calculation';
import { DEFAULT_TAX_RATES } from './rates';
import { calculateSalary } from './salary-calculator';

describe('toPeriod', () => {
  it.each([
    [new Date(2026, 9, 31, 23, 59), '2026-10'],
    [new Date(2026, 0, 1, 0, 0), '2026-01'],
    [new Date(2026, 11, 31), '2026-12'],
  ])('%s → %s', (date, period) => {
    expect(toPeriod(date)).toBe(period);
  });
});

describe('createCalculation', () => {
  it('snapshots the inputs and the breakdown', () => {
    const breakdown = calculateSalary(192.3, 3140, DEFAULT_TAX_RATES)!;
    const now = new Date(2026, 9, 31, 12);

    expect(createCalculation('abc', now, breakdown)).toEqual({
      id: 'abc',
      createdAt: now.toISOString(),
      period: '2026-10',
      hours: 192.3,
      hourlyRate: 3140,
      rates: DEFAULT_TAX_RATES,
      breakdown,
    });
  });
});
