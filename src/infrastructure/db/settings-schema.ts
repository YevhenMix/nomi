import * as z from 'zod/mini';
import { DEFAULT_TAX_RATES } from '../../domain/rates';
import {
  DEFAULT_SETTINGS,
  LANGUAGES,
  THEME_PREFERENCES,
  type Settings,
} from '../../domain/settings';

function minorUnits(fallback: number) {
  return z.catch(z.int().check(z.minimum(0)), fallback);
}

// Each field falls back on its own, so one corrupt value doesn't wipe the user's other settings.
const settingsSchema = z.catch(
  z.object({
    language: z.catch(z.enum(LANGUAGES), DEFAULT_SETTINGS.language),
    theme: z.catch(z.enum(THEME_PREFERENCES), DEFAULT_SETTINGS.theme),
    hourlyRate: minorUnits(DEFAULT_SETTINGS.hourlyRate),
    rates: z.catch(
      z.object({
        emerytalna: minorUnits(DEFAULT_TAX_RATES.emerytalna),
        rentowa: minorUnits(DEFAULT_TAX_RATES.rentowa),
        chorobowa: minorUnits(DEFAULT_TAX_RATES.chorobowa),
        zdrowotna: minorUnits(DEFAULT_TAX_RATES.zdrowotna),
        kup: minorUnits(DEFAULT_TAX_RATES.kup),
        pit: minorUnits(DEFAULT_TAX_RATES.pit),
        pit2Relief: minorUnits(DEFAULT_TAX_RATES.pit2Relief),
      }),
      DEFAULT_TAX_RATES,
    ),
  }),
  DEFAULT_SETTINGS,
);

export function parseStoredSettings(stored: unknown): Settings {
  return settingsSchema.parse(stored);
}
