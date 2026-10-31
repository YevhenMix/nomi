/** Integer number of grosze (1 zł = 100 grosze). Never do arithmetic on floats in złoty. */
export type Grosze = number;

export const MONEY_DECIMALS = 2;
export const GROSZE_PER_ZLOTY = 100;

function floorDivide(dividend: bigint, divisor: bigint): bigint {
  const quotient = dividend / divisor;
  return dividend % divisor !== 0n && dividend < 0n ? quotient - 1n : quotient;
}

/**
 * Exact a × b ÷ divisor, rounded half-up to an integer. BigInt keeps the intermediate product
 * exact, whatever the size of the values. `divisor` must be positive.
 */
export function multiplyDivideHalfUp(a: number, b: number, divisor: number): number {
  const scaledDivisor = BigInt(divisor);
  return Number(floorDivide(2n * BigInt(a) * BigInt(b) + scaledDivisor, 2n * scaledDivisor));
}

/** Rounds half-up to a whole number of złoty, returning grosze: 416830 → 416800. */
export function roundToFullZloty(amount: Grosze): Grosze {
  return multiplyDivideHalfUp(amount, 1, GROSZE_PER_ZLOTY) * GROSZE_PER_ZLOTY;
}
