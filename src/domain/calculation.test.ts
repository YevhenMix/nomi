import { describe, expect, it } from 'vitest';
import {
  createCalculation,
  findChangedValues,
  sortForHistory,
  toPeriod,
  type Calculation,
} from './calculation';
import { DEFAULT_TAX_RATES, TAX_RATE_NAMES } from './rates';
import { calculateSalary } from './salary-calculator';
import { DEFAULT_SETTINGS } from './settings';

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

describe('sortForHistory', () => {
  const record = (id: string, period: string, createdAt: string) =>
    ({ id, period, createdAt }) as Calculation;

  it('sorts by period, newest first, then by most recently saved', () => {
    const input = [
      record('jul', '2026-07', '2026-07-31T10:00:00.000Z'),
      record('oct-early', '2026-10', '2026-10-01T10:00:00.000Z'),
      record('dec-2025', '2025-12', '2025-12-31T10:00:00.000Z'),
      record('oct-late', '2026-10', '2026-10-31T10:00:00.000Z'),
    ];

    expect(sortForHistory(input).map((c) => c.id)).toEqual([
      'oct-late',
      'oct-early',
      'jul',
      'dec-2025',
    ]);
  });

  it('does not change its input', () => {
    const input = [
      record('a', '2026-01', '2026-01-01T00:00:00.000Z'),
      record('b', '2026-02', '2026-02-01T00:00:00.000Z'),
    ];

    sortForHistory(input);

    expect(input.map((c) => c.id)).toEqual(['a', 'b']);
  });
});

describe('findChangedValues', () => {
  const calculation = createCalculation(
    'a',
    new Date(2026, 9, 31),
    calculateSalary(192.3, 3140, DEFAULT_TAX_RATES)!,
  );

  it('finds nothing when Settings still match', () => {
    expect(findChangedValues(calculation, DEFAULT_SETTINGS).size).toBe(0);
  });

  it('ignores language and theme', () => {
    const settings = { ...DEFAULT_SETTINGS, language: 'pl', theme: 'dark' } as const;

    expect(findChangedValues(calculation, settings).size).toBe(0);
  });

  it('finds a changed hourly rate', () => {
    const settings = { ...DEFAULT_SETTINGS, hourlyRate: 4000 };

    expect([...findChangedValues(calculation, settings)]).toEqual(['hourlyRate']);
  });

  it.each(TAX_RATE_NAMES)('finds a changed %s', (name) => {
    const settings = {
      ...DEFAULT_SETTINGS,
      rates: { ...DEFAULT_TAX_RATES, [name]: DEFAULT_TAX_RATES[name] + 1 },
    };

    expect([...findChangedValues(calculation, settings)]).toEqual([name]);
  });
});
