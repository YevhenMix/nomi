import { describe, expect, it } from 'vitest';
import { DEFAULT_TAX_RATES } from './rates';
import {
  applySettingsPatch,
  DEFAULT_SETTINGS,
  isValidSettings,
  resetSettingsValues,
  type Settings,
} from './settings';

describe('default settings', () => {
  it('match the formula defaults', () => {
    expect(DEFAULT_TAX_RATES).toEqual({
      emerytalna: 976,
      rentowa: 150,
      chorobowa: 245,
      zdrowotna: 900,
      kup: 2000,
      pit: 1200,
      pit2Relief: 30000,
    });
  });

  it('are valid', () => {
    expect(isValidSettings(DEFAULT_SETTINGS)).toBe(true);
  });
});

describe('applySettingsPatch', () => {
  it('merges nested rates and keeps other values', () => {
    const next = applySettingsPatch(DEFAULT_SETTINGS, { hourlyRate: 4000, rates: { pit: 1700 } });

    expect(next).toEqual({
      ...DEFAULT_SETTINGS,
      hourlyRate: 4000,
      rates: { ...DEFAULT_TAX_RATES, pit: 1700 },
    });
  });

  it('does not mutate the current settings', () => {
    applySettingsPatch(DEFAULT_SETTINGS, { rates: { pit: 1700 } });

    expect(DEFAULT_SETTINGS.rates.pit).toBe(1200);
  });
});

describe('resetSettingsValues', () => {
  it('restores pay and tax values but keeps language and theme', () => {
    const customised: Settings = {
      language: 'pl',
      theme: 'dark',
      hourlyRate: 5000,
      rates: { ...DEFAULT_TAX_RATES, pit: 1700, pit2Relief: 0 },
    };

    expect(resetSettingsValues(customised)).toEqual({
      ...DEFAULT_SETTINGS,
      language: 'pl',
      theme: 'dark',
    });
  });
});

describe('isValidSettings', () => {
  const withRates = (rates: Partial<Settings['rates']>): Settings =>
    applySettingsPatch(DEFAULT_SETTINGS, { rates });

  it.each<[string, Settings]>([
    ['zero values', { ...DEFAULT_SETTINGS, hourlyRate: 0 }],
    ['a percent above 100', withRates({ pit: 15_000 })],
    ['a very large rate', { ...DEFAULT_SETTINGS, hourlyRate: 100_000_000_00 }],
    ['a very large relief', withRates({ pit2Relief: 100_000_000_00 })],
  ])('accepts %s', (_name, settings) => {
    expect(isValidSettings(settings)).toBe(true);
  });

  it.each<[string, Settings]>([
    ['negative hourly rate', { ...DEFAULT_SETTINGS, hourlyRate: -1 }],
    ['fractional grosze', { ...DEFAULT_SETTINGS, hourlyRate: 31.4 }],
    ['unsafe integer', { ...DEFAULT_SETTINGS, hourlyRate: Number.MAX_SAFE_INTEGER + 1 }],
    ['negative zdrowotna', withRates({ zdrowotna: -1 })],
    ['fractional pit', withRates({ pit: 12.5 })],
    ['negative PIT-2 relief', withRates({ pit2Relief: -1 })],
    ['unknown language', { ...DEFAULT_SETTINGS, language: 'de' as Settings['language'] }],
    ['unknown theme', { ...DEFAULT_SETTINGS, theme: 'blue' as Settings['theme'] }],
  ])('rejects %s', (_name, settings) => {
    expect(isValidSettings(settings)).toBe(false);
  });
});
