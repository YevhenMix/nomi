import { describe, expect, it } from 'vitest';
import { DEFAULT_SETTINGS } from '../../domain/settings';
import { parseStoredSettings } from './settings-schema';

describe('parseStoredSettings', () => {
  it('keeps valid data and drops unknown fields', () => {
    const stored = { ...DEFAULT_SETTINGS, key: 'current', hourlyRate: 5000, language: 'pl' };

    expect(parseStoredSettings(stored)).toEqual({
      ...DEFAULT_SETTINGS,
      hourlyRate: 5000,
      language: 'pl',
    });
  });

  it('drops default hours saved by an earlier version', () => {
    expect(parseStoredSettings({ ...DEFAULT_SETTINGS, defaultHours: 192.3 })).toEqual(
      DEFAULT_SETTINGS,
    );
  });

  it('keeps values of any size', () => {
    const stored = {
      ...DEFAULT_SETTINGS,
      hourlyRate: 100_000_000_00,
      rates: { ...DEFAULT_SETTINGS.rates, pit: 15_000 },
    };

    expect(parseStoredSettings(stored)).toEqual(stored);
  });

  it.each([undefined, null, 'garbage', 42, []])('falls back to defaults for %j', (stored) => {
    expect(parseStoredSettings(stored)).toEqual(DEFAULT_SETTINGS);
  });

  it('replaces only the invalid field', () => {
    const stored = {
      ...DEFAULT_SETTINGS,
      hourlyRate: 5000,
      theme: 'blue',
      rates: { ...DEFAULT_SETTINGS.rates, pit: 1700, kup: -5 },
    };

    expect(parseStoredSettings(stored)).toEqual({
      ...DEFAULT_SETTINGS,
      hourlyRate: 5000,
      rates: { ...DEFAULT_SETTINGS.rates, pit: 1700 },
    });
  });

  it('falls back when rates are missing', () => {
    const { language, theme, hourlyRate } = DEFAULT_SETTINGS;

    expect(parseStoredSettings({ language, theme, hourlyRate }).rates).toEqual(
      DEFAULT_SETTINGS.rates,
    );
  });
});
