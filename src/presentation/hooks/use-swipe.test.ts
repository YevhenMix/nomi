import { describe, expect, it } from 'vitest';
import { detectSwipe } from './use-swipe';

describe('detectSwipe', () => {
  it.each([
    ['a swipe to the left', -100, 0, 200, 'left'],
    ['a swipe to the right', 100, 0, 200, 'right'],
    ['the minimum distance', -60, 0, 200, 'left'],
    ['a slightly diagonal swipe', 90, 60, 200, 'right'],
    ['the slowest allowed swipe', 100, 0, 800, 'right'],
  ] as const)('recognises %s', (_name, deltaX, deltaY, durationMs, expected) => {
    expect(detectSwipe({ deltaX, deltaY, durationMs })).toBe(expected);
  });

  it.each([
    ['a tap', 0, 0, 100],
    ['a short movement', 59, 0, 200],
    ['vertical scrolling', 10, 300, 200],
    ['a diagonal scroll', 100, 80, 200],
    ['a slow drag', 100, 0, 801],
  ])('ignores %s', (_name, deltaX, deltaY, durationMs) => {
    expect(detectSwipe({ deltaX, deltaY, durationMs })).toBeNull();
  });
});
