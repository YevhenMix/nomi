import type { Translation } from './uk';

export const en: Translation = {
  tabs: {
    label: 'Main navigation',
    calculate: 'Calculation',
    history: 'History',
    settings: 'Settings',
  },
  calculate: {
    title: 'Salary calculation',
    subtitle: 'Enter your hours to see the result',
  },
  history: {
    title: 'History',
  },
  settings: {
    title: 'Settings',
    subtitle: 'Interface and formula values',
    language: 'Language',
    languageHint: 'English',
    theme: 'Theme',
    themeLight: 'Light',
    themeDark: 'Dark',
    sections: {
      interface: 'Interface',
      payment: 'Payment',
      zus: 'ZUS — employee contributions',
      health: 'Health',
      pit: 'PIT tax',
    },
    fields: {
      hourlyRate: { label: 'Hourly rate', description: 'Brutto per hour' },
      emerytalna: { label: 'Emerytalna', description: 'Pension contribution' },
      rentowa: { label: 'Rentowa', description: 'Disability contribution' },
      chorobowa: { label: 'Chorobowa', description: 'Sickness contribution' },
      zdrowotna: { label: 'Zdrowotna', description: 'Health insurance contribution' },
      kup: { label: 'KUP', description: 'Costs of earning income' },
      pit: { label: 'PIT rate', description: 'Income tax' },
      pit2Relief: { label: 'PIT-2', description: 'Monthly tax relief' },
    },
    invalidNumber: 'Enter a non-negative number with up to 2 decimal places',
    reset: 'Reset to defaults',
    resetConfirm:
      'Reset rates to their default values? Language, theme and history will not change.',
  },
};
