import * as z from 'zod/mini';
import {
  BackupError,
  type BackupContents,
  type BackupSerializer,
} from '../../application/ports/backup-serializer';
import { isValidHours } from '../../domain/hours';
import { LANGUAGES, THEME_PREFERENCES } from '../../domain/settings';

const APP_ID = 'moya-zarplata';
const SCHEMA_VERSION = 1;

const nonNegativeInt = z.int().check(z.minimum(0));
const hours = z.number().check(z.refine(isValidHours));

const rates = z.object({
  emerytalna: nonNegativeInt,
  rentowa: nonNegativeInt,
  chorobowa: nonNegativeInt,
  zdrowotna: nonNegativeInt,
  kup: nonNegativeInt,
  pit: nonNegativeInt,
  pit2Relief: nonNegativeInt,
});

const settings = z.object({
  language: z.enum(LANGUAGES),
  theme: z.enum(THEME_PREFERENCES),
  hourlyRate: nonNegativeInt,
  rates,
});

// Lines may be negative: the formula is applied as written, even to rates above 100%.
const breakdown = z.object({
  hours,
  hourlyRate: nonNegativeInt,
  rates,
  brutto: z.int(),
  emerytalna: z.int(),
  rentowa: z.int(),
  chorobowa: z.int(),
  zusTotal: z.int(),
  healthBase: z.int(),
  zdrowotna: z.int(),
  kup: z.int(),
  taxBase: z.int(),
  pit: z.int(),
  pit2Relief: z.int(),
  pitWithPit2: z.int(),
  nettoWithoutPit2: z.int(),
  nettoWithPit2: z.int(),
});

const calculation = z.object({
  id: z.string().check(z.minLength(1)),
  createdAt: z.iso.datetime(),
  period: z.string().check(z.regex(/^\d{4}-(0[1-9]|1[0-2])$/)),
  hours,
  hourlyRate: nonNegativeInt,
  rates,
  breakdown,
});

const backupFile = z.object({
  exportedAt: z.iso.datetime(),
  settings,
  calculations: z.array(calculation),
});

const fileHeader = z.object({
  app: z.literal(APP_ID),
  schemaVersion: z.number(),
});

function parseJson(fileText: string): unknown {
  try {
    return JSON.parse(fileText);
  } catch {
    throw new BackupError('invalid-file');
  }
}

export const jsonBackupSerializer: BackupSerializer = {
  serialize(contents: BackupContents): string {
    return JSON.stringify({ app: APP_ID, schemaVersion: SCHEMA_VERSION, ...contents }, null, 2);
  },

  parse(fileText: string): BackupContents {
    const json = parseJson(fileText);

    const header = z.safeParse(fileHeader, json);
    if (!header.success) throw new BackupError('invalid-file');
    if (header.data.schemaVersion !== SCHEMA_VERSION) throw new BackupError('unsupported-version');

    const file = z.safeParse(backupFile, json);
    if (!file.success) throw new BackupError('invalid-file');
    return file.data;
  },
};
