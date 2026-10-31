import { sortForHistory, type Calculation } from '../../domain/calculation';
import type { CalculationRepository } from '../ports/calculation-repository';

export async function listHistory(repository: CalculationRepository): Promise<Calculation[]> {
  return sortForHistory(await repository.list());
}
