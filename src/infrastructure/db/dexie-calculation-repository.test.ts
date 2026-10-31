import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createCalculation } from '../../domain/calculation';
import { DEFAULT_TAX_RATES } from '../../domain/rates';
import { calculateSalary } from '../../domain/salary-calculator';
import { AppDatabase } from './database';
import { DexieCalculationRepository } from './dexie-calculation-repository';

describe('DexieCalculationRepository', () => {
  let db: AppDatabase;

  beforeEach(() => {
    db = new AppDatabase(`test-${crypto.randomUUID()}`);
  });

  afterEach(async () => {
    await db.delete();
  });

  it('stores calculations and refuses a duplicate id', async () => {
    const repository = new DexieCalculationRepository(db);
    const breakdown = calculateSalary(192.3, 3140, DEFAULT_TAX_RATES)!;
    const calculation = createCalculation('a', new Date(2026, 9, 31), breakdown);

    await repository.add(calculation);

    expect(await db.calculations.get('a')).toEqual(calculation);
    await expect(repository.add(calculation)).rejects.toThrow();
    expect(await db.calculations.count()).toBe(1);
  });
});
