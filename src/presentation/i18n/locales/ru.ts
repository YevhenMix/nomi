import type { Translation } from './uk';

export const ru: Translation = {
  tabs: {
    label: 'Основная навигация',
    calculate: 'Расчёт',
    history: 'История',
    settings: 'Настройки',
  },
  calculate: {
    title: 'Расчёт зарплаты',
    subtitle: 'Введите часы, чтобы увидеть результат',
  },
  history: {
    title: 'История',
  },
  settings: {
    title: 'Настройки',
    subtitle: 'Интерфейс и значения для формул',
    language: 'Язык',
    languageHint: 'Русский',
    theme: 'Тема',
    themeLight: 'Светлая',
    themeDark: 'Тёмная',
    sections: {
      interface: 'Интерфейс',
      payment: 'Оплата',
      zus: 'ZUS — взносы работника',
      health: 'Здоровье',
      pit: 'Налог PIT',
    },
    fields: {
      hourlyRate: { label: 'Почасовая ставка', description: 'Brutto за 1 час' },
      emerytalna: { label: 'Emerytalna', description: 'Пенсионный взнос' },
      rentowa: { label: 'Rentowa', description: 'Взнос на случай нетрудоспособности' },
      chorobowa: { label: 'Chorobowa', description: 'Больничный взнос' },
      zdrowotna: { label: 'Zdrowotna', description: 'Взнос на медицинское страхование' },
      kup: { label: 'KUP', description: 'Расходы на получение дохода' },
      pit: { label: 'Ставка PIT', description: 'Подоходный налог' },
      pit2Relief: { label: 'PIT-2', description: 'Ежемесячная налоговая льгота' },
    },
    invalidNumber: 'Введите неотрицательное число, максимум 2 знака после запятой',
    reset: 'Сбросить до стандартных значений',
    resetConfirm: 'Сбросить ставки до стандартных значений? Язык, тема и история не изменятся.',
  },
};
