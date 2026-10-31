import { createAppServices, type AppServices } from './application/app-services';
import { AppDatabase } from './infrastructure/db/database';
import { DexieSettingsRepository } from './infrastructure/db/dexie-settings-repository';

export function createServices(): AppServices {
  const db = new AppDatabase();
  return createAppServices({ settingsRepository: new DexieSettingsRepository(db) });
}
