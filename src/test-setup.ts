import 'fake-indexeddb/auto';
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';
import { i18n } from './presentation/i18n/i18n';

// jsdom has no matchMedia. Tests run as if the device prefers light.
window.matchMedia = (query: string) =>
  ({
    matches: false,
    media: query,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
  }) as unknown as MediaQueryList;

// jsdom has no layout, so nothing to scroll.
Element.prototype.scrollIntoView = () => undefined;

afterEach(async () => {
  cleanup();
  await i18n.changeLanguage('uk');
  document.documentElement.removeAttribute('data-theme');
  document.documentElement.lang = 'uk';
});
