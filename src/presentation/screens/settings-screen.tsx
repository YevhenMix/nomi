import { useTranslation } from 'react-i18next';

export function SettingsScreen() {
  const { t } = useTranslation();

  return (
    <>
      <h1 className="screen-title">{t('settings.title')}</h1>
      <p className="screen-subtitle">{t('settings.subtitle')}</p>
    </>
  );
}
