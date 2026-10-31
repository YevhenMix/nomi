import type { Settings } from '../../domain/settings';

export interface SettingsRepository {
  /** Returns the stored settings, falling back to defaults for missing or invalid data. */
  load(): Promise<Settings>;
  /** Atomically replaces the settings with the result of `change`. If it throws, nothing is saved. */
  update(change: (current: Settings) => Settings): Promise<Settings>;
}
