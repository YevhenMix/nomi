import type { CalculationRepository } from '../../application/ports/calculation-repository';
import type { Calculation } from '../../domain/calculation';
import type { AppDatabase } from './database';

export class DexieCalculationRepository implements CalculationRepository {
  private readonly db: AppDatabase;

  constructor(db: AppDatabase) {
    this.db = db;
  }

  async add(calculation: Calculation): Promise<void> {
    await this.db.calculations.add(calculation);
  }

  list(): Promise<Calculation[]> {
    return this.db.calculations.toArray();
  }

  delete(id: string): Promise<void> {
    return this.db.calculations.delete(id);
  }

  addMissing(calculations: readonly Calculation[]): Promise<number> {
    return this.db.transaction('rw', this.db.calculations, async () => {
      const unique = calculations.filter(
        (c, index) => calculations.findIndex(({ id }) => id === c.id) === index,
      );
      const stored = await this.db.calculations.bulkGet(unique.map((c) => c.id));
      const missing = unique.filter((_, index) => stored[index] === undefined);
      await this.db.calculations.bulkAdd(missing);
      return missing.length;
    });
  }
}
