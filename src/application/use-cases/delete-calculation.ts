import type { CalculationRepository } from '../ports/calculation-repository';

export function deleteCalculation(repository: CalculationRepository, id: string): Promise<void> {
  return repository.delete(id);
}
