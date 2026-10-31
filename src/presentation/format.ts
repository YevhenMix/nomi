import { MONEY_DECIMALS } from '../domain/money';

interface FormatScaledOptions {
  locale: string;
  /** How many decimal places the integer is scaled by: 3140 with 2 decimals is 31.40. */
  decimals: number;
  /** Decimal places that are always shown: 2 for money (31,40), 0 for percents (1,5). */
  minFractionDigits?: number;
}

/** Grosze as a grouped amount, always with 2 decimals: 454145 → "4 541,45". */
export function formatMoney(grosze: number, locale: string): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: MONEY_DECIMALS,
    maximumFractionDigits: MONEY_DECIMALS,
    // 'always', because Polish otherwise leaves 4-digit amounts ungrouped: 4541,45.
    useGrouping: 'always',
  }).format(grosze / 10 ** MONEY_DECIMALS);
}

/** Formats an integer in minor units for editing and display, without digit grouping. */
export function formatScaled(
  value: number,
  { locale, decimals, minFractionDigits = 0 }: FormatScaledOptions,
): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: minFractionDigits,
    maximumFractionDigits: decimals,
    useGrouping: false,
  }).format(value / 10 ** decimals);
}

/** "31 жовтня 2026", without the "р." / "г." some locales add after the year. */
export function formatDate(iso: string, locale: string): string {
  const parts = new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).formatToParts(new Date(iso));
  const yearIndex = parts.findIndex((part) => part.type === 'year');
  return parts
    .slice(0, yearIndex + 1)
    .map((part) => part.value)
    .join('');
}
