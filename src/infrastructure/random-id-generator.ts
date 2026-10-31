import type { IdGenerator } from '../application/ports/id-generator';

/**
 * crypto.randomUUID only exists on HTTPS and localhost. getRandomValues also works when the
 * dev server is opened on a phone over plain HTTP (npm run dev -- --host).
 */
export const randomIdGenerator: IdGenerator = {
  generate: () =>
    Array.from(crypto.getRandomValues(new Uint8Array(16)), (byte) =>
      byte.toString(16).padStart(2, '0'),
    ).join(''),
};
