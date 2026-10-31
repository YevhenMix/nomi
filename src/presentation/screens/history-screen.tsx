import { useTranslation } from 'react-i18next';

export function HistoryScreen() {
  const { t } = useTranslation();

  return <h1 className="screen-title">{t('history.title')}</h1>;
}
