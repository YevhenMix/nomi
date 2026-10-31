import { createCalculation, type Calculation } from '../../domain/calculation';
import type { SalaryBreakdown } from '../../domain/salary-calculator';
import type { CalculationRepository } from '../ports/calculation-repository';
import type { Clock } from '../ports/clock';
import type { IdGenerator } from '../ports/id-generator';

interface SaveCalculationPorts {
  calculationRepository: Pick<CalculationRepository, 'add'>;
  clock: Clock;
  idGenerator: IdGenerator;
}

export async function saveCalculation(
  { calculationRepository, clock, idGenerator }: SaveCalculationPorts,
  breakdown: SalaryBreakdown,
): Promise<Calculation> {
  const calculation = createCalculation(idGenerator.generate(), clock.now(), breakdown);
  await calculationRepository.add(calculation);
  return calculation;
}
