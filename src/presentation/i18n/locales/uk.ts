// Source language. Other locales are typed against this shape, so a missing key fails the build.
export const uk = {
  tabs: {
    label: 'Головна навігація',
    calculate: 'Розрахунок',
    history: 'Історія',
    settings: 'Налаштування',
  },
  calculate: {
    title: 'Розрахунок зарплати',
    subtitle: 'Введіть години, щоб побачити результат',
  },
  history: {
    title: 'Історія',
  },
  settings: {
    title: 'Налаштування',
    subtitle: 'Інтерфейс і значення для формул',
    language: 'Мова',
    languageHint: 'Українська · за замовчуванням',
    theme: 'Тема',
    themeLight: 'Світла',
    themeDark: 'Темна',
    sections: {
      interface: 'Інтерфейс',
      payment: 'Оплата',
      zus: 'ZUS — внески працівника',
      health: 'Здоров’я',
      pit: 'Податок PIT',
    },
    fields: {
      hourlyRate: { label: 'Погодинна ставка', description: 'Brutto за 1 годину' },
      emerytalna: { label: 'Emerytalna', description: 'Пенсійний внесок' },
      rentowa: { label: 'Rentowa', description: 'Внесок на випадок непрацездатності' },
      chorobowa: { label: 'Chorobowa', description: 'Лікарняний внесок' },
      zdrowotna: { label: 'Zdrowotna', description: 'Внесок на медичне страхування' },
      kup: { label: 'KUP', description: 'Витрати на отримання доходу' },
      pit: { label: 'Ставка PIT', description: 'Податок на доходи' },
      pit2Relief: { label: 'PIT-2', description: 'Щомісячна податкова пільга' },
    },
    invalidNumber: 'Введіть невід’ємне число, максимум 2 знаки після коми',
    reset: 'Скинути до стандартних значень',
    resetConfirm: 'Скинути ставки до стандартних значень? Мова, тема та історія не зміняться.',
  },
};

export type Translation = typeof uk;
