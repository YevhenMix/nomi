import type { Grosze } from './money';

/** Percentage stored as an integer number of basis points: 9.76% → 976. */
export type BasisPoints = number;

export const PERCENT_DECIMALS = 2;

/** All parameters of the salary formula. */
export interface TaxRates {
  emerytalna: BasisPoints;
  rentowa: BasisPoints;
  chorobowa: BasisPoints;
  zdrowotna: BasisPoints;
  kup: BasisPoints;
  pit: BasisPoints;
  pit2Relief: Grosze;
}

export const DEFAULT_TAX_RATES: TaxRates = {
  emerytalna: 976,
  rentowa: 150,
  chorobowa: 245,
  zdrowotna: 900,
  kup: 2000,
  pit: 1200,
  pit2Relief: 30000,
};
