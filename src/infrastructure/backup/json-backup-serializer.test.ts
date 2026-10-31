import { describe, expect, it } from 'vitest';
import { BackupError, type BackupContents } from '../../application/ports/backup-serializer';
import { createCalculation } from '../../domain/calculation';
import { DEFAULT_TAX_RATES } from '../../domain/rates';
import { calculateSalary } from '../../domain/salary-calculator';
import { DEFAULT_SETTINGS } from '../../domain/settings';
import { jsonBackupSerializer } from './json-backup-serializer';

const calculation = createCalculation(
  'a',
  new Date('2026-10-31T12:00:00.000Z'),
  calculateSalary(192.3, 3140, DEFAULT_TAX_RATES)!,
);
const contents: BackupContents = {
  exportedAt: '2026-10-31T12:00:00.000Z',
  settings: DEFAULT_SETTINGS,
  calculations: [calculation],
};

function fileJson(): Record<string, unknown> {
  return JSON.parse(jsonBackupSerializer.serialize(contents)) as Record<string, unknown>;
}

function reasonFor(text: string): string {
  try {
    jsonBackupSerializer.parse(text);
  } catch (error) {
    if (error instanceof BackupError) return error.reason;
    throw error;
  }
  throw new Error('Expected the file to be rejected');
}

describe('jsonBackupSerializer', () => {
  it('writes the documented format', () => {
    expect(fileJson()).toEqual({
      app: 'moya-zarplata',
      schemaVersion: 1,
      exportedAt: contents.exportedAt,
      settings: DEFAULT_SETTINGS,
      calculations: [calculation],
    });
  });

  it('round-trips', () => {
    expect(jsonBackupSerializer.parse(jsonBackupSerializer.serialize(contents))).toEqual(contents);
  });

  it('accepts negative lines, which rates above 100% can produce', () => {
    const rates = { ...DEFAULT_TAX_RATES, emerytalna: 15_000 };
    const unusual = createCalculation('b', new Date(), calculateSalary(10, 10000, rates)!);
    const text = jsonBackupSerializer.serialize({ ...contents, calculations: [unusual] });

    expect(jsonBackupSerializer.parse(text).calculations[0]).toEqual(unusual);
  });

  it.each([
    ['not JSON', 'not json at all'],
    ['empty', ''],
    ['a JSON array', '[]'],
    ['null', 'null'],
    ['another app', JSON.stringify({ ...fileJson(), app: 'something-else' })],
    ['no app', JSON.stringify({ schemaVersion: 1 })],
    ['a non-numeric version', JSON.stringify({ ...fileJson(), schemaVersion: '1' })],
  ])('rejects %s as an invalid file', (_name, text) => {
    expect(reasonFor(text)).toBe('invalid-file');
  });

  it.each([2, 0, 1.5])('rejects schema version %d as unsupported', (schemaVersion) => {
    expect(reasonFor(JSON.stringify({ ...fileJson(), schemaVersion }))).toBe('unsupported-version');
  });

  it('rejects a newer version even when its data looks different', () => {
    const text = JSON.stringify({ app: 'moya-zarplata', schemaVersion: 2, future: true });

    expect(reasonFor(text)).toBe('unsupported-version');
  });

  const withCalculation = (patch: Record<string, unknown>) =>
    JSON.stringify({ ...fileJson(), calculations: [calculation, { ...calculation, ...patch }] });

  it.each<[string, string]>([
    ['missing settings', JSON.stringify({ ...fileJson(), settings: undefined })],
    ['invalid settings', JSON.stringify({ ...fileJson(), settings: { language: 'de' } })],
    ['missing calculations', JSON.stringify({ ...fileJson(), calculations: undefined })],
    ['a bad exportedAt', JSON.stringify({ ...fileJson(), exportedAt: 'yesterday' })],
    ['a record without id', withCalculation({ id: '' })],
    ['a bad createdAt', withCalculation({ createdAt: 'nope' })],
    ['a bad period', withCalculation({ period: '2026-13' })],
    ['hours with 3 decimals', withCalculation({ hours: 1.234 })],
    ['a fractional rate', withCalculation({ hourlyRate: 31.4 })],
    ['a record without a breakdown', withCalculation({ breakdown: undefined })],
    [
      'a breakdown with a fractional amount',
      withCalculation({ breakdown: { ...calculation.breakdown, brutto: 1.5 } }),
    ],
    ['negative tax rates', withCalculation({ rates: { ...DEFAULT_TAX_RATES, pit: -1 } })],
  ])('rejects the whole file for %s', (_name, text) => {
    expect(reasonFor(text)).toBe('invalid-file');
  });
});
