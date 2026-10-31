import { beforeEach, describe, expect, it } from 'vitest';
import { createCalculation, type Calculation } from '../../domain/calculation';
import { calculateSalary } from '../../domain/salary-calculator';
import { DEFAULT_SETTINGS, type Settings } from '../../domain/settings';
import { jsonBackupSerializer } from '../../infrastructure/backup/json-backup-serializer';
import { BackupError } from '../ports/backup-serializer';
import type { CalculationRepository } from '../ports/calculation-repository';
import type { SettingsRepository } from '../ports/settings-repository';
import { deleteCalculation } from './delete-calculation';
import { exportHistory } from './export-history';
import { importHistory } from './import-history';
import { listHistory } from './list-history';

class InMemoryCalculations implements CalculationRepository {
  stored: Calculation[] = [];

  async add(calculation: Calculation) {
    this.stored.push(calculation);
  }

  async list() {
    return this.stored;
  }

  async delete(id: string) {
    this.stored = this.stored.filter((c) => c.id !== id);
  }

  async addMissing(calculations: readonly Calculation[]) {
    const missing = calculations.filter((c) => !this.stored.some((s) => s.id === c.id));
    this.stored.push(...missing);
    return missing.length;
  }
}

class InMemorySettings implements SettingsRepository {
  stored: Settings | null = null;

  async load() {
    return this.stored ?? DEFAULT_SETTINGS;
  }

  async saveIfMissing(settings: Settings) {
    if (this.stored) return false;
    this.stored = settings;
    return true;
  }

  async update(change: (current: Settings) => Settings) {
    this.stored = change(this.stored ?? DEFAULT_SETTINGS);
    return this.stored;
  }
}

const makeCalculation = (id: string, date: Date) =>
  createCalculation(id, date, calculateSalary(192.3, 3140, DEFAULT_SETTINGS.rates)!);

describe('history use cases', () => {
  const now = new Date(2026, 9, 5, 12);
  let calculationRepository: InMemoryCalculations;
  let settingsRepository: InMemorySettings;
  let ports: {
    calculationRepository: InMemoryCalculations;
    settingsRepository: InMemorySettings;
    backupSerializer: typeof jsonBackupSerializer;
    clock: { now: () => Date };
  };

  beforeEach(() => {
    calculationRepository = new InMemoryCalculations();
    settingsRepository = new InMemorySettings();
    ports = {
      calculationRepository,
      settingsRepository,
      backupSerializer: jsonBackupSerializer,
      clock: { now: () => now },
    };
  });

  it('listHistory returns the newest month first', async () => {
    calculationRepository.stored = [
      makeCalculation('jul', new Date(2026, 6, 31)),
      makeCalculation('oct', new Date(2026, 9, 31)),
    ];

    expect((await listHistory(calculationRepository)).map((c) => c.id)).toEqual(['oct', 'jul']);
  });

  it('deleteCalculation removes only that record', async () => {
    calculationRepository.stored = [makeCalculation('a', now), makeCalculation('b', now)];

    await deleteCalculation(calculationRepository, 'a');

    expect(calculationRepository.stored.map((c) => c.id)).toEqual(['b']);
  });

  it('exportHistory names the file by local date and includes everything', async () => {
    calculationRepository.stored = [makeCalculation('a', now)];
    settingsRepository.stored = { ...DEFAULT_SETTINGS, hourlyRate: 5000 };

    const { fileName, content } = await exportHistory(ports);

    expect(fileName).toBe('moya-zarplata-2026-10-05.json');
    expect(jsonBackupSerializer.parse(content)).toEqual({
      exportedAt: now.toISOString(),
      settings: settingsRepository.stored,
      calculations: calculationRepository.stored,
    });
  });

  describe('importHistory', () => {
    const fileWith = (calculations: Calculation[], settings = DEFAULT_SETTINGS) =>
      jsonBackupSerializer.serialize({
        exportedAt: now.toISOString(),
        settings,
        calculations,
      });

    it('merges by id and reports how many are new', async () => {
      const existing = makeCalculation('a', now);
      calculationRepository.stored = [existing];

      const result = await importHistory(
        ports,
        fileWith([existing, makeCalculation('b', now), makeCalculation('c', now)]),
      );

      expect(result.importedCount).toBe(2);
      expect(calculationRepository.stored.map((c) => c.id)).toEqual(['a', 'b', 'c']);
    });

    it('is safe to import the same file twice', async () => {
      const file = fileWith([makeCalculation('a', now)]);

      await importHistory(ports, file);
      const second = await importHistory(ports, file);

      expect(second.importedCount).toBe(0);
      expect(calculationRepository.stored).toHaveLength(1);
    });

    it('restores settings on a device with none saved', async () => {
      const result = await importHistory(
        ports,
        fileWith([], { ...DEFAULT_SETTINGS, hourlyRate: 5000 }),
      );

      expect(result.settingsRestored).toBe(true);
      expect(settingsRepository.stored?.hourlyRate).toBe(5000);
    });

    it('never overwrites settings already in use', async () => {
      settingsRepository.stored = { ...DEFAULT_SETTINGS, hourlyRate: 4000 };

      const result = await importHistory(
        ports,
        fileWith([], { ...DEFAULT_SETTINGS, hourlyRate: 5000 }),
      );

      expect(result.settingsRestored).toBe(false);
      expect(settingsRepository.stored.hourlyRate).toBe(4000);
    });

    it('changes nothing when the file is invalid', async () => {
      const good = makeCalculation('good', now);
      const file = JSON.parse(fileWith([good])) as { calculations: unknown[] };
      file.calculations.push({ id: 'bad' });

      await expect(importHistory(ports, JSON.stringify(file))).rejects.toBeInstanceOf(BackupError);

      expect(calculationRepository.stored).toEqual([]);
      expect(settingsRepository.stored).toBeNull();
    });
  });
});
