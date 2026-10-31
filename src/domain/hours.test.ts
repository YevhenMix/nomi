import { describe, expect, it } from 'vitest';
import { hoursToHundredths, hundredthsToHours, isValidHours } from './hours';

describe('hours conversion', () => {
  it.each([
    [192.3, 19230],
    [0, 0],
    [1.1, 110],
    [1.15, 115],
    [4.35, 435],
  ])('round-trips %d hours', (hours, hundredths) => {
    expect(hoursToHundredths(hours)).toBe(hundredths);
    expect(hundredthsToHours(hundredths)).toBe(hours);
  });
});

describe('isValidHours', () => {
  it.each([0, 0.01, 192.3, 1000])('accepts %d', (hours) => {
    expect(isValidHours(hours)).toBe(true);
  });

  it.each([-1, 1.234, Number.NaN, Number.POSITIVE_INFINITY, Number.MAX_SAFE_INTEGER])(
    'rejects %d',
    (hours) => {
      expect(isValidHours(hours)).toBe(false);
    },
  );
});
