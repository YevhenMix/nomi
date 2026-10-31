const DECIMAL_PATTERN = /^(\d*)(?:[.,](\d*))?$/;

/**
 * Parses user-typed decimal text into an integer scaled by 10^decimals, without using floats:
 * ("31,40", 2) → 3140. Accepts "," or "." as the separator and ignores spaces.
 * Returns null when the text is not a non-negative number with at most `decimals` decimal places.
 */
export function parseScaledDecimal(text: string, decimals: number): number | null {
  const match = DECIMAL_PATTERN.exec(text.replace(/\s/g, ''));
  if (!match) return null;

  const whole = match[1] ?? '';
  const fraction = (match[2] ?? '').replace(/0+$/, '');
  const hasDigits = whole !== '' || (match[2] ?? '') !== '';
  if (!hasDigits || fraction.length > decimals) return null;

  const scaled = Number(whole + fraction.padEnd(decimals, '0'));
  return Number.isSafeInteger(scaled) ? scaled : null;
}
