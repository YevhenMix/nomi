import { describe, expect, it } from 'vitest';
import { randomIdGenerator } from './random-id-generator';

describe('randomIdGenerator', () => {
  it('generates distinct 128-bit hex ids', () => {
    const first = randomIdGenerator.generate();

    expect(first).toMatch(/^[0-9a-f]{32}$/);
    expect(randomIdGenerator.generate()).not.toBe(first);
  });
});
