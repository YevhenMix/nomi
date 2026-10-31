import type { Settings } from '../../domain/settings';

export interface SettingsRepository {
  /** Returns the stored settings, falling back to defaults for missing or invalid data. */
  load(): Promise<Settings>;
  /** Stores the settings only if none were ever saved. Returns whether they were stored. */
  saveIfMissing(settings: Settings): Promise<boolean>;
  /** Atomically replaces the settings with the result of `change`. If it throws, nothing is saved. */
  update(change: (current: Settings) => Settings): Promise<Settings>;
}
