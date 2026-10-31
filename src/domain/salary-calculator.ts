/**
 * The salary formula. Every calculation in the app happens here, and nowhere else.
 *
 * Money is whole grosze and percentages are whole basis points, so there is no float arithmetic.
 * Each line is rounded half-up when it is computed, and later lines use that rounded value.
 *
 *  1   Brutto               hours × hourly rate
 *  2   Emerytalna           Brutto × rate
 *  3   Rentowa              Brutto × rate
 *  4   Chorobowa            Brutto × rate
 *  Σ   ZUS total            2 + 3 + 4
 *  5   Health base          Brutto − ZUS total
 *  6   Zdrowotna            Health base × rate
 *  7   KUP                  Health base × rate
 *  8   Tax base             Health base − KUP, rounded to full złoty
 *  9   PIT                  Tax base × rate, rounded to full złoty
 *  10  PIT-2 relief         fixed monthly amount
 *  11  PIT with PIT-2       max(0, PIT − PIT-2 relief)
 *  12  Netto without PIT-2  Brutto − ZUS total − Zdrowotna − PIT
 *  13  Netto with PIT-2     Brutto − ZUS total − Zdrowotna − PIT with PIT-2
 *
 * The formula is applied as written, even to unusual rates: rates above 100% can make
 * later lines, including netto, negative.
 */
import { hoursToHundredths, isValidHours } from './hours';
import { GROSZE_PER_ZLOTY, multiplyDivideHalfUp, roundToFullZloty, type Grosze } from './money';
import { BASIS_POINTS_PER_WHOLE, type BasisPoints, type TaxRates } from './rates';

const HUNDREDTHS_PER_HOUR = 100;

export interface SalaryBreakdown {
  // Inputs used
  hours: number;
  hourlyRate: Grosze;
  rates: TaxRates;
  // Lines
  brutto: Grosze;
  emerytalna: Grosze;
  rentowa: Grosze;
  chorobowa: Grosze;
  zusTotal: Grosze;
  healthBase: Grosze;
  zdrowotna: Grosze;
  kup: Grosze;
  taxBase: Grosze;
  pit: Grosze;
  pit2Relief: Grosze;
  pitWithPit2: Grosze;
  nettoWithoutPit2: Grosze;
  nettoWithPit2: Grosze;
}

function percentOf(amount: Grosze, rate: BasisPoints): Grosze {
  return multiplyDivideHalfUp(amount, rate, BASIS_POINTS_PER_WHOLE);
}

/** Rounds once, on the exact result. Rounding to grosze first could change the złoty. */
function percentOfRoundedToFullZloty(amount: Grosze, rate: BasisPoints): Grosze {
  return (
    multiplyDivideHalfUp(amount, rate, BASIS_POINTS_PER_WHOLE * GROSZE_PER_ZLOTY) * GROSZE_PER_ZLOTY
  );
}

/**
 * Returns every line of the calculation, or null when it can't be computed exactly: invalid
 * inputs, or amounts too large to represent without losing precision.
 */
export function calculateSalary(
  hours: number,
  hourlyRate: Grosze,
  rates: TaxRates,
): SalaryBreakdown | null {
  const inputsAreValid =
    isValidHours(hours) && [hourlyRate, ...Object.values(rates)].every(isWholeNonNegative);
  if (!inputsAreValid) return null;

  const brutto = multiplyDivideHalfUp(hoursToHundredths(hours), hourlyRate, HUNDREDTHS_PER_HOUR);

  const emerytalna = percentOf(brutto, rates.emerytalna);
  const rentowa = percentOf(brutto, rates.rentowa);
  const chorobowa = percentOf(brutto, rates.chorobowa);
  const zusTotal = emerytalna + rentowa + chorobowa;

  const healthBase = brutto - zusTotal;
  const zdrowotna = percentOf(healthBase, rates.zdrowotna);

  const kup = percentOf(healthBase, rates.kup);
  const taxBase = roundToFullZloty(healthBase - kup);
  const pit = percentOfRoundedToFullZloty(taxBase, rates.pit);
  const pit2Relief = rates.pit2Relief;
  const pitWithPit2 = Math.max(0, pit - pit2Relief);

  const nettoWithoutPit2 = brutto - zusTotal - zdrowotna - pit;
  const nettoWithPit2 = brutto - zusTotal - zdrowotna - pitWithPit2;

  const lines = {
    brutto,
    emerytalna,
    rentowa,
    chorobowa,
    zusTotal,
    healthBase,
    zdrowotna,
    kup,
    taxBase,
    pit,
    pit2Relief,
    pitWithPit2,
    nettoWithoutPit2,
    nettoWithPit2,
  };
  if (!Object.values(lines).every(Number.isSafeInteger)) return null;

  return { hours, hourlyRate, rates, ...lines };
}

function isWholeNonNegative(value: number): boolean {
  return Number.isSafeInteger(value) && value >= 0;
}
