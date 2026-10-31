interface FormatScaledOptions {
  locale: string;
  /** How many decimal places the integer is scaled by: 3140 with 2 decimals is 31.40. */
  decimals: number;
  /** Decimal places that are always shown: 2 for money (31,40), 0 for percents (1,5). */
  minFractionDigits?: number;
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
