import type { Grosze } from './money';
import { DEFAULT_TAX_RATES, type TaxRates } from './rates';

export const LANGUAGES = ['uk', 'en', 'pl', 'ru'] as const;
export type Language = (typeof LANGUAGES)[number];

/** 'system' follows the device theme until the user picks one explicitly. */
export const THEME_PREFERENCES = ['system', 'light', 'dark'] as const;
export type ThemePreference = (typeof THEME_PREFERENCES)[number];

export interface Settings {
  language: Language;
  theme: ThemePreference;
  hourlyRate: Grosze;
  rates: TaxRates;
}

export type SettingsPatch = Partial<Omit<Settings, 'rates'>> & { rates?: Partial<TaxRates> };

export const DEFAULT_SETTINGS: Settings = {
  language: 'uk',
  theme: 'system',
  hourlyRate: 3140,
  rates: DEFAULT_TAX_RATES,
};

export class InvalidSettingsError extends Error {
  constructor() {
    super('Settings values must be non-negative whole minor units');
    this.name = 'InvalidSettingsError';
  }
}

export function applySettingsPatch(current: Settings, patch: SettingsPatch): Settings {
  return { ...current, ...patch, rates: { ...current.rates, ...patch.rates } };
}

/** Restores the pay and tax values. Language and theme are preferences, so they are kept. */
export function resetSettingsValues(current: Settings): Settings {
  return { ...DEFAULT_SETTINGS, language: current.language, theme: current.theme };
}

function isMinorUnits(value: number): boolean {
  return Number.isSafeInteger(value) && value >= 0;
}

export function isValidSettings(settings: Settings): boolean {
  return (
    LANGUAGES.includes(settings.language) &&
    THEME_PREFERENCES.includes(settings.theme) &&
    isMinorUnits(settings.hourlyRate) &&
    Object.values(settings.rates).every(isMinorUnits)
  );
}
