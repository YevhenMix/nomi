import { describe, expect, it } from 'vitest';
import { adjacentTab } from './tabs';

describe('adjacentTab', () => {
  it.each([
    ['calculate', 'next', 'history'],
    ['history', 'next', 'settings'],
    ['settings', 'next', null],
    ['settings', 'previous', 'history'],
    ['history', 'previous', 'calculate'],
    ['calculate', 'previous', null],
  ] as const)('%s, %s → %s', (tab, direction, expected) => {
    expect(adjacentTab(tab, direction)).toBe(expected);
  });
});
