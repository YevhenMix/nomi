import { createAppServices, type AppServices } from './application/app-services';
import { AppDatabase } from './infrastructure/db/database';
import { DexieCalculationRepository } from './infrastructure/db/dexie-calculation-repository';
import { DexieSettingsRepository } from './infrastructure/db/dexie-settings-repository';
import { randomIdGenerator } from './infrastructure/random-id-generator';
import { systemClock } from './infrastructure/system-clock';

export function createServices(): AppServices {
  const db = new AppDatabase();
  return createAppServices({
    settingsRepository: new DexieSettingsRepository(db),
    calculationRepository: new DexieCalculationRepository(db),
    clock: systemClock,
    idGenerator: randomIdGenerator,
  });
}
