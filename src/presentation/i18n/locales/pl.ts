import type { Translation } from './uk';

export const pl: Translation = {
  tabs: {
    label: 'Główna nawigacja',
    calculate: 'Obliczenia',
    history: 'Historia',
    settings: 'Ustawienia',
  },
  calculate: {
    title: 'Obliczanie wynagrodzenia',
    subtitle: 'Wpisz liczbę godzin, aby zobaczyć wynik',
  },
  history: {
    title: 'Historia',
  },
  settings: {
    title: 'Ustawienia',
    subtitle: 'Interfejs i wartości do formuł',
    language: 'Język',
    languageHint: 'Polski',
    theme: 'Motyw',
    themeLight: 'Jasny',
    themeDark: 'Ciemny',
    sections: {
      interface: 'Interfejs',
      payment: 'Wynagrodzenie',
      zus: 'ZUS — składki pracownika',
      health: 'Zdrowie',
      pit: 'Podatek PIT',
    },
    fields: {
      hourlyRate: { label: 'Stawka godzinowa', description: 'Brutto za 1 godzinę' },
      emerytalna: { label: 'Emerytalna', description: 'Składka emerytalna' },
      rentowa: { label: 'Rentowa', description: 'Składka na wypadek niezdolności do pracy' },
      chorobowa: { label: 'Chorobowa', description: 'Składka chorobowa' },
      zdrowotna: { label: 'Zdrowotna', description: 'Składka na ubezpieczenie zdrowotne' },
      kup: { label: 'KUP', description: 'Koszty uzyskania przychodu' },
      pit: { label: 'Stawka PIT', description: 'Podatek dochodowy' },
      pit2Relief: { label: 'PIT-2', description: 'Miesięczna ulga podatkowa' },
    },
    invalidNumber: 'Wpisz nieujemną liczbę z maksymalnie 2 miejscami po przecinku',
    reset: 'Przywróć wartości domyślne',
    resetConfirm: 'Przywrócić domyślne stawki? Język, motyw i historia się nie zmienią.',
  },
};
