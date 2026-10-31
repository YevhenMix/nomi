import { useTranslation } from 'react-i18next';

export function CalculateScreen() {
  const { t } = useTranslation();

  return (
    <>
      <h1 className="screen-title">{t('calculate.title')}</h1>
      <p className="screen-subtitle">{t('calculate.subtitle')}</p>
    </>
  );
}
