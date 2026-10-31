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

  const makeCalculation = (id: string, hours = 192.3) =>
    createCalculation(id, new Date(2026, 9, 31), calculateSalary(hours, 3140, DEFAULT_TAX_RATES)!);

  it('lists and deletes calculations', async () => {
    const repository = new DexieCalculationRepository(db);
    await repository.add(makeCalculation('a'));
    await repository.add(makeCalculation('b'));

    await repository.delete('a');

    expect((await repository.list()).map((c) => c.id)).toEqual(['b']);
  });

  it('addMissing adds only new ids and never overwrites a stored record', async () => {
    const repository = new DexieCalculationRepository(db);
    await repository.add(makeCalculation('a', 100));

    const added = await repository.addMissing([
      makeCalculation('a', 999),
      makeCalculation('b'),
      makeCalculation('c'),
      makeCalculation('c', 999),
    ]);

    expect(added).toBe(2);
    expect((await db.calculations.get('a'))?.hours).toBe(100);
    expect((await db.calculations.get('c'))?.hours).toBe(192.3);
  });

  it('addMissing with nothing new adds nothing', async () => {
    const repository = new DexieCalculationRepository(db);
    await repository.add(makeCalculation('a'));

    expect(await repository.addMissing([makeCalculation('a')])).toBe(0);
    expect(await repository.addMissing([])).toBe(0);
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
