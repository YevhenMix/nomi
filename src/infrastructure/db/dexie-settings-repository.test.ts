import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { DEFAULT_SETTINGS, type Settings } from '../../domain/settings';
import { AppDatabase } from './database';
import { DexieSettingsRepository } from './dexie-settings-repository';

describe('DexieSettingsRepository', () => {
  let db: AppDatabase;
  let repository: DexieSettingsRepository;

  beforeEach(() => {
    db = new AppDatabase(`test-${crypto.randomUUID()}`);
    repository = new DexieSettingsRepository(db);
  });

  afterEach(async () => {
    await db.delete();
  });

  it('returns defaults when nothing is stored, without writing', async () => {
    expect(await repository.load()).toEqual(DEFAULT_SETTINGS);
    expect(await db.settings.count()).toBe(0);
  });

  it('persists updates in a single row', async () => {
    await repository.update((current) => ({ ...current, hourlyRate: 5000 }));
    await repository.update((current) => ({ ...current, theme: 'dark' }));

    expect(await repository.load()).toEqual({
      ...DEFAULT_SETTINGS,
      hourlyRate: 5000,
      theme: 'dark',
    });
    expect(await db.settings.count()).toBe(1);
  });

  it('does not lose concurrent updates', async () => {
    await Promise.all([
      repository.update((current) => ({ ...current, hourlyRate: 5000 })),
      repository.update((current) => ({ ...current, language: 'pl' })),
      repository.update((current) => ({ ...current, theme: 'dark' })),
    ]);

    expect(await repository.load()).toMatchObject({
      hourlyRate: 5000,
      language: 'pl',
      theme: 'dark',
    });
  });

  it('saves nothing when the change throws', async () => {
    await repository.update((current) => ({ ...current, hourlyRate: 5000 }));

    await expect(
      repository.update((): Settings => {
        throw new Error('rejected');
      }),
    ).rejects.toThrow('rejected');

    expect((await repository.load()).hourlyRate).toBe(5000);
  });

  it('recovers from a corrupt stored row', async () => {
    await db.settings.put({ key: 'current', hourlyRate: 'oops' } as never);

    expect(await repository.load()).toEqual(DEFAULT_SETTINGS);
  });
});
