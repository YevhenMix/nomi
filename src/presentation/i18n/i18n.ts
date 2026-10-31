import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { en } from './locales/en';
import { pl } from './locales/pl';
import { ru } from './locales/ru';
import { uk } from './locales/uk';

void i18n.use(initReactI18next).init({
  lng: 'uk',
  fallbackLng: 'uk',
  resources: {
    uk: { translation: uk },
    en: { translation: en },
    pl: { translation: pl },
    ru: { translation: ru },
  },
  interpolation: { escapeValue: false },
});

export { i18n };
