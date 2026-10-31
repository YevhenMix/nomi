import { describe, expect, it } from 'vitest';
import { detectAxis, pageStepOnRelease, trackPosition } from './use-page-swipe';

describe('detectAxis', () => {
  it.each([
    ['too small to tell', 5, 5, null],
    ['no movement', 0, 0, null],
    ['sideways', 12, 0, 'horizontal'],
    ['sideways, to the left', -12, 3, 'horizontal'],
    ['mostly sideways', 24, 20, 'horizontal'],
    ['down', 0, 12, 'vertical'],
    ['up', 3, -12, 'vertical'],
    ['a true diagonal', 20, 20, 'vertical'],
  ] as const)('%s', (_name, deltaX, deltaY, expected) => {
    expect(detectAxis(deltaX, deltaY)).toBe(expected);
  });
});

describe('pageStepOnRelease', () => {
  const pageWidth = 400;

  it.each([
    ['a slow drag past 30% to the left', -120, 2000, 1],
    ['a slow drag past 30% to the right', 120, 2000, -1],
    ['a slow drag short of 30%', -119, 2000, 0],
    ['a quick flick to the left', -40, 100, 1],
    ['a quick flick to the right', 40, 100, -1],
    ['a quick movement too short to be a flick', -29, 10, 0],
    ['a medium distance at a moderate speed', -80, 1000, 0],
  ] as const)('%s', (_name, deltaX, durationMs, expected) => {
    expect(pageStepOnRelease({ deltaX, durationMs, pageWidth })).toBe(expected);
  });
});

describe('trackPosition', () => {
  const width = 400;
  const pages = 3;

  it('follows the finger exactly between the first and last page', () => {
    expect(trackPosition(-100, width, pages)).toBe(-100);
    expect(trackPosition(0, width, pages)).toBe(0);
    expect(trackPosition(-800, width, pages)).toBe(-800);
  });

  it('resists past the first page', () => {
    expect(trackPosition(100, width, pages)).toBe(25);
  });

  it('resists past the last page', () => {
    expect(trackPosition(-900, width, pages)).toBe(-825);
  });
});
