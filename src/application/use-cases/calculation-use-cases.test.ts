import { describe, expect, it } from 'vitest';
import type { Calculation } from '../../domain/calculation';
import { DEFAULT_SETTINGS } from '../../domain/settings';
import { calculateSalary } from './calculate-salary';
import { saveCalculation } from './save-calculation';

describe('calculateSalary', () => {
  it('uses the hourly rate and tax values from Settings', () => {
    const settings = { ...DEFAULT_SETTINGS, hourlyRate: 5000 };

    expect(calculateSalary(10, settings)).toMatchObject({
      hours: 10,
      hourlyRate: 5000,
      rates: DEFAULT_SETTINGS.rates,
      brutto: 50000,
    });
  });
});

describe('saveCalculation', () => {
  it('stores a snapshot with a new id, the current time and the current month', async () => {
    const added: Calculation[] = [];
    const now = new Date(2026, 9, 31, 12);
    const breakdown = calculateSalary(192.3, DEFAULT_SETTINGS)!;

    const saved = await saveCalculation(
      {
        calculationRepository: {
          add: async (calculation) => {
            added.push(calculation);
          },
        },
        clock: { now: () => now },
        idGenerator: { generate: () => 'id-1' },
      },
      breakdown,
    );

    expect(added).toEqual([saved]);
    expect(saved).toMatchObject({
      id: 'id-1',
      createdAt: now.toISOString(),
      period: '2026-10',
      hours: 192.3,
      hourlyRate: 3140,
      breakdown,
    });
  });
});
