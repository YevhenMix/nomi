import type { Calculation } from '../../domain/calculation';

export interface CalculationRepository {
  add(calculation: Calculation): Promise<void>;
}
