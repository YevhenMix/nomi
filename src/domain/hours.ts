export const HOURS_DECIMALS = 2;
const HUNDREDTHS_PER_HOUR = 10 ** HOURS_DECIMALS;

/** 192.3 → 19230. Calculations use whole hundredths of an hour, never fractional hours. */
export function hoursToHundredths(hours: number): number {
  return Math.round(hours * HUNDREDTHS_PER_HOUR);
}

export function hundredthsToHours(hundredths: number): number {
  return hundredths / HUNDREDTHS_PER_HOUR;
}

/** Non-negative, with at most 2 decimal places. */
export function isValidHours(hours: number): boolean {
  return (
    Number.isFinite(hours) &&
    hours >= 0 &&
    Number.isSafeInteger(hoursToHundredths(hours)) &&
    hundredthsToHours(hoursToHundredths(hours)) === hours
  );
}
