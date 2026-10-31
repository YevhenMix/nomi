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
  },
};

export type Translation = typeof uk;
