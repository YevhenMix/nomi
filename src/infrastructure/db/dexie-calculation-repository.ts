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
}
