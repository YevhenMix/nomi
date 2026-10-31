import { beforeEach, describe, expect, it } from 'vitest';
import { DEFAULT_SETTINGS, InvalidSettingsError, type Settings } from '../../domain/settings';
import type { SettingsRepository } from '../ports/settings-repository';
import { getSettings } from './get-settings';
import { resetSettings } from './reset-settings';
import { updateSettings } from './update-settings';

class InMemorySettingsRepository implements SettingsRepository {
  stored: Settings = DEFAULT_SETTINGS;

  async load() {
    return this.stored;
  }

  async saveIfMissing() {
    return false;
  }

  async update(change: (current: Settings) => Settings) {
    this.stored = change(this.stored);
    return this.stored;
  }
}

describe('settings use cases', () => {
  let repository: InMemorySettingsRepository;

  beforeEach(() => {
    repository = new InMemorySettingsRepository();
  });

  it('getSettings returns what the repository holds', async () => {
    repository.stored = { ...DEFAULT_SETTINGS, hourlyRate: 5000 };

    expect((await getSettings(repository)).hourlyRate).toBe(5000);
  });

  it('updateSettings saves a valid patch', async () => {
    await updateSettings(repository, { hourlyRate: 4000, rates: { pit: 1700 } });

    expect(repository.stored.hourlyRate).toBe(4000);
    expect(repository.stored.rates.pit).toBe(1700);
    expect(repository.stored.rates.kup).toBe(DEFAULT_SETTINGS.rates.kup);
  });

  it('updateSettings rejects an invalid patch and saves nothing', async () => {
    await expect(updateSettings(repository, { rates: { pit: -1 } })).rejects.toBeInstanceOf(
      InvalidSettingsError,
    );

    expect(repository.stored).toEqual(DEFAULT_SETTINGS);
  });

  it('resetSettings restores values and keeps preferences', async () => {
    repository.stored = { ...DEFAULT_SETTINGS, language: 'en', theme: 'dark', hourlyRate: 1 };

    await resetSettings(repository);

    expect(repository.stored).toEqual({ ...DEFAULT_SETTINGS, language: 'en', theme: 'dark' });
  });
});
