import { describe, expect, it } from 'vitest';
import { DEFAULT_TAX_RATES, type TaxRates } from './rates';
import { calculateSalary, type SalaryBreakdown } from './salary-calculator';

const RATE = 3140;

function calculate(hours: number, hourlyRate = RATE, rates: TaxRates = DEFAULT_TAX_RATES) {
  const result = calculateSalary(hours, hourlyRate, rates);
  if (!result) throw new Error('Expected a breakdown');
  return result;
}

const ZERO_RATES: TaxRates = {
  emerytalna: 0,
  rentowa: 0,
  chorobowa: 0,
  zdrowotna: 0,
  kup: 0,
  pit: 0,
  pit2Relief: 0,
};

describe('calculateSalary', () => {
  it('matches the golden case: 192.3 h × 31.40 zł', () => {
    expect(calculate(192.3)).toEqual<SalaryBreakdown>({
      hours: 192.3,
      hourlyRate: 3140,
      rates: DEFAULT_TAX_RATES,
      brutto: 603822,
      emerytalna: 58933,
      rentowa: 9057,
      chorobowa: 14794,
      zusTotal: 82784,
      healthBase: 521038,
      zdrowotna: 46893,
      kup: 104208,
      taxBase: 416800,
      pit: 50000,
      pit2Relief: 30000,
      pitWithPit2: 20000,
      nettoWithoutPit2: 424145,
      nettoWithPit2: 454145,
    });
  });

  it.each([
    [168, 3140, 527520, 400529],
    [176, 3050, 536800, 407016],
  ])('matches the design history: %d h × %i gr', (hours, rate, brutto, netto) => {
    const result = calculate(hours, rate);

    expect(result.brutto).toBe(brutto);
    expect(result.nettoWithPit2).toBe(netto);
  });

  it('gives all zeros for 0 hours, with no negative tax', () => {
    expect(calculate(0)).toMatchObject({
      brutto: 0,
      zusTotal: 0,
      healthBase: 0,
      zdrowotna: 0,
      kup: 0,
      taxBase: 0,
      pit: 0,
      pit2Relief: 30000,
      pitWithPit2: 0,
      nettoWithoutPit2: 0,
      nettoWithPit2: 0,
    });
  });

  it('never makes tax negative when PIT is smaller than the PIT-2 relief', () => {
    const result = calculate(40);

    expect(result.pit).toBeLessThan(result.pit2Relief);
    expect(result.pitWithPit2).toBe(0);
    expect(result.nettoWithPit2).toBe(result.brutto - result.zusTotal - result.zdrowotna);
    expect(result.nettoWithoutPit2).toBe(result.nettoWithPit2 - result.pit);
  });

  it('applies custom rates', () => {
    const result = calculate(100, 5000, {
      emerytalna: 1000,
      rentowa: 200,
      chorobowa: 300,
      zdrowotna: 500,
      kup: 5000,
      pit: 3200,
      pit2Relief: 10000,
    });

    expect(result).toMatchObject({
      brutto: 500000,
      emerytalna: 50000,
      rentowa: 10000,
      chorobowa: 15000,
      zusTotal: 75000,
      healthBase: 425000,
      zdrowotna: 21250,
      kup: 212500,
      taxBase: 212500,
      pit: 68000,
      pitWithPit2: 58000,
      nettoWithoutPit2: 335750,
      nettoWithPit2: 345750,
    });
  });

  describe('rounding', () => {
    it('rounds x.xx5 up, on brutto', () => {
      // 0.5 h × 0.01 zł = 0.005 zł
      expect(calculate(0.5, 1, ZERO_RATES).brutto).toBe(1);
      // 0.49 h × 0.01 zł = 0.0049 zł
      expect(calculate(0.49, 1, ZERO_RATES).brutto).toBe(0);
    });

    it('rounds x.xx5 up, on percentages', () => {
      // 33.00 zł × 1.5% = 0.495 zł
      expect(calculate(1, 3300, { ...ZERO_RATES, rentowa: 150 }).rentowa).toBe(50);
    });

    it('is not fooled by float representation', () => {
      // As floats, 1.15 × 100 = 114.99999999999999 and 1.1 × 3.3 = 3.6300000000000003.
      expect(calculate(1.15, 100, ZERO_RATES).brutto).toBe(115);
      expect(calculate(1.1, 330, ZERO_RATES).brutto).toBe(363);
    });

    it('later lines use the rounded earlier lines', () => {
      const result = calculate(192.3);

      expect(result.zusTotal).toBe(result.emerytalna + result.rentowa + result.chorobowa);
      expect(result.healthBase).toBe(result.brutto - result.zusTotal);
    });

    it('rounds the tax base to full złoty, half up', () => {
      const rates = { ...ZERO_RATES };
      expect(calculate(1, 10049, rates).taxBase).toBe(10000);
      expect(calculate(1, 10050, rates).taxBase).toBe(10100);
    });

    it('rounds PIT to full złoty, half up', () => {
      // 100 zł × 12.49% = 12.49 zł → 12 zł, and 100 zł × 12.5% = 12.50 zł → 13 zł
      expect(calculate(1, 10000, { ...ZERO_RATES, pit: 1249 }).pit).toBe(1200);
      expect(calculate(1, 10000, { ...ZERO_RATES, pit: 1250 }).pit).toBe(1300);
    });

    it('rounds PIT once, on the exact amount', () => {
      // 101 zł × 12.48% = 12.6048 zł → 13 zł; 3 zł × 16.5% = 0.495 zł → 0 zł, not 0.50 → 1 zł
      expect(calculate(1, 10100, { ...ZERO_RATES, pit: 1248 }).pit).toBe(1300);
      expect(calculate(1, 300, { ...ZERO_RATES, pit: 1650 }).pit).toBe(0);
    });
  });

  describe('unusual values', () => {
    it('applies the formula as written when rates exceed 100%', () => {
      const result = calculate(10, 10000, { ...DEFAULT_TAX_RATES, emerytalna: 15000 });

      expect(result.healthBase).toBeLessThan(0);
      expect(result.zdrowotna).toBeLessThan(0);
      expect(result.pit).toBeLessThan(0);
      expect(result.pitWithPit2).toBe(0);
      expect(result.nettoWithPit2).toBeLessThan(0);
    });

    it('stays exact for large values', () => {
      expect(calculate(10000.55, 100000055, ZERO_RATES).brutto).toBe(1_000_055_550_030);
    });

    it('returns null when amounts are too large to be exact', () => {
      expect(calculateSalary(1_000_000, Number.MAX_SAFE_INTEGER, DEFAULT_TAX_RATES)).toBeNull();
    });

    it.each<[string, number, number, TaxRates]>([
      ['negative hours', -1, RATE, DEFAULT_TAX_RATES],
      ['hours with 3 decimals', 1.234, RATE, DEFAULT_TAX_RATES],
      ['NaN hours', Number.NaN, RATE, DEFAULT_TAX_RATES],
      ['negative hourly rate', 1, -1, DEFAULT_TAX_RATES],
      ['fractional hourly rate', 1, 31.4, DEFAULT_TAX_RATES],
      ['negative tax rate', 1, RATE, { ...DEFAULT_TAX_RATES, pit: -1 }],
      ['fractional tax rate', 1, RATE, { ...DEFAULT_TAX_RATES, pit: 12.5 }],
    ])('returns null for %s', (_name, hours, rate, rates) => {
      expect(calculateSalary(hours, rate, rates)).toBeNull();
    });
  });
});
