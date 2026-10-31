import { describe, expect, it } from 'vitest';
import { multiplyDivideHalfUp, roundToFullZloty } from './money';

describe('multiplyDivideHalfUp', () => {
  it.each([
    [10, 3, 10, 3],
    [1004, 1, 10, 100],
    [1005, 1, 10, 101],
    [1006, 1, 10, 101],
    [0, 976, 10_000, 0],
  ])('%i × %i ÷ %i = %i', (a, b, divisor, expected) => {
    expect(multiplyDivideHalfUp(a, b, divisor)).toBe(expected);
  });

  it('rounds negative halves upwards', () => {
    expect(multiplyDivideHalfUp(-1005, 1, 10)).toBe(-100);
    expect(multiplyDivideHalfUp(-1006, 1, 10)).toBe(-101);
    expect(multiplyDivideHalfUp(-1000, 1, 10)).toBe(-100);
  });

  it('stays exact when the intermediate product is beyond float precision', () => {
    expect(multiplyDivideHalfUp(9_007_199_254_740_991, 3, 3)).toBe(9_007_199_254_740_991);
  });
});

describe('roundToFullZloty', () => {
  it.each([
    [416830, 416800],
    [416849, 416800],
    [416850, 416900],
    [0, 0],
    [49, 0],
    [50, 100],
  ])('%i → %i', (amount, expected) => {
    expect(roundToFullZloty(amount)).toBe(expected);
  });
});
