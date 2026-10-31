import type { Calculation } from '../../domain/calculation';

export interface CalculationRepository {
  add(calculation: Calculation): Promise<void>;
  list(): Promise<Calculation[]>;
  delete(id: string): Promise<void>;
  /** Atomically adds the calculations whose id isn't stored yet. Returns how many were added. */
  addMissing(calculations: readonly Calculation[]): Promise<number>;
}
