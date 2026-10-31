import type { Grosze } from './money';

/** Percentage stored as an integer number of basis points: 9.76% → 976. */
export type BasisPoints = number;

export const PERCENT_DECIMALS = 2;
/** 100% in basis points. */
export const BASIS_POINTS_PER_WHOLE = 10_000;

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

export const TAX_RATE_NAMES = [
  'emerytalna',
  'rentowa',
  'chorobowa',
  'zdrowotna',
  'kup',
  'pit',
  'pit2Relief',
] as const satisfies readonly (keyof TaxRates)[];

export const DEFAULT_TAX_RATES: TaxRates = {
  emerytalna: 976,
  rentowa: 150,
  chorobowa: 245,
  zdrowotna: 900,
  kup: 2000,
  pit: 1200,
  pit2Relief: 30000,
};
