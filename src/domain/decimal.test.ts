import { describe, expect, it } from 'vitest';
import { parseScaledDecimal } from './decimal';

describe('parseScaledDecimal', () => {
  it.each([
    ['31,40', 2, 3140],
    ['31.40', 2, 3140],
    ['31,4', 2, 3140],
    ['31', 2, 3100],
    ['31,', 2, 3100],
    [',5', 2, 50],
    ['0', 2, 0],
    ['192,3', 2, 19230],
    ['9,76', 2, 976],
    ['1 000,50', 2, 100050],
    ['1 000,50', 2, 100050],
    ['31,400', 2, 3140],
    // Values that lose precision as floats: 1.1 * 100 === 110.00000000000001
    ['1,1', 2, 110],
    ['4,35', 2, 435],
    ['7', 0, 7],
  ])('parses %j with %i decimals as %i', (text, decimals, expected) => {
    expect(parseScaledDecimal(text, decimals)).toBe(expected);
  });

  it.each([
    '',
    ' ',
    ',',
    '.',
    '-1',
    '+1',
    'abc',
    '1,2,3',
    '1.2.3',
    '1,234',
    '1e3',
    '99999999999999999',
  ])('rejects %j', (text) => {
    expect(parseScaledDecimal(text, 2)).toBeNull();
  });
});
