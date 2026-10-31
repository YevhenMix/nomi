import { useLayoutEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { Settings } from '../../domain/settings';
import { useSystemTheme } from './use-system-theme';

/** Applies the language and theme from settings to i18n and the document. */
export function useApplyAppearance(settings: Settings | undefined): void {
  const { i18n } = useTranslation();
  const systemTheme = useSystemTheme();
  const language = settings?.language;
  const theme = settings?.theme;

  useLayoutEffect(() => {
    if (!language) return;
    document.documentElement.lang = language;
    void i18n.changeLanguage(language);
  }, [i18n, language]);

  useLayoutEffect(() => {
    if (!theme) return;
    const root = document.documentElement;
    if (theme === 'system') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', theme);

    // Keep the Android status bar in step with the theme the user chose.
    const background = getComputedStyle(root).getPropertyValue('--color-background').trim();
    if (background) {
      document
        .querySelectorAll('meta[name="theme-color"]')
        .forEach((meta) => meta.setAttribute('content', background));
    }
  }, [theme, systemTheme]);
}
