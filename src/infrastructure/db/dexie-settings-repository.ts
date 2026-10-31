import type { SettingsRepository } from '../../application/ports/settings-repository';
import type { Settings } from '../../domain/settings';
import type { AppDatabase } from './database';
import { parseStoredSettings } from './settings-schema';

const SETTINGS_KEY = 'current';

export type SettingsRow = Settings & { key: string };

export class DexieSettingsRepository implements SettingsRepository {
  private readonly db: AppDatabase;

  constructor(db: AppDatabase) {
    this.db = db;
  }

  async load(): Promise<Settings> {
    return parseStoredSettings(await this.db.settings.get(SETTINGS_KEY));
  }

  update(change: (current: Settings) => Settings): Promise<Settings> {
    return this.db.transaction('rw', this.db.settings, async () => {
      const current = parseStoredSettings(await this.db.settings.get(SETTINGS_KEY));
      const next = change(current);
      await this.db.settings.put({ ...next, key: SETTINGS_KEY });
      return next;
    });
  }
}
