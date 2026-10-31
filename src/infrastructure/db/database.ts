import Dexie, { type Table } from 'dexie';
import type { Calculation } from '../../domain/calculation';
import type { SettingsRow } from './dexie-settings-repository';

const DATABASE_NAME = 'moya-zarplata';

export class AppDatabase extends Dexie {
  calculations!: Table<Calculation, string>;
  settings!: Table<SettingsRow, string>;

  constructor(name: string = DATABASE_NAME) {
    super(name);
    // Every schema change needs a new version with an explicit migration. Never drop user data.
    this.version(1).stores({
      calculations: 'id, period, createdAt',
      settings: 'key',
    });
  }
}
