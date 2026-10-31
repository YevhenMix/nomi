import { useTranslation } from 'react-i18next';
import { MONEY_DECIMALS } from '../../domain/money';
import { PERCENT_DECIMALS } from '../../domain/rates';
import type { Language } from '../../domain/settings';
import { Button } from '../components/button';
import { Card } from '../components/card';
import { MoonIcon, SunIcon } from '../components/icons';
import { NumberField } from '../components/number-field';
import { SegmentedControl, type SegmentedOption } from '../components/segmented-control';
import { useServices } from '../hooks/use-services';
import { useSettings } from '../hooks/use-settings';
import { useSystemTheme, type ResolvedTheme } from '../hooks/use-system-theme';
import './settings-screen.css';

const LANGUAGE_OPTIONS: readonly SegmentedOption<Language>[] = [
  { value: 'uk', label: 'UA' },
  { value: 'en', label: 'EN' },
  { value: 'pl', label: 'PL' },
  { value: 'ru', label: 'RU' },
];

type PercentRate = 'emerytalna' | 'rentowa' | 'chorobowa' | 'zdrowotna' | 'kup' | 'pit';

export function SettingsScreen() {
  const { t } = useTranslation();
  const { updateSettings, resetSettings } = useServices();
  const settings = useSettings();
  const systemTheme = useSystemTheme();

  const themeOptions: readonly SegmentedOption<ResolvedTheme>[] = [
    { value: 'light', label: t('settings.themeLight'), icon: <SunIcon /> },
    { value: 'dark', label: t('settings.themeDark'), icon: <MoonIcon /> },
  ];

  const renderPercentField = (name: PercentRate) => (
    <NumberField
      key={name}
      label={t(`settings.fields.${name}.label`)}
      description={t(`settings.fields.${name}.description`)}
      unit="%"
      value={settings.rates[name]}
      decimals={PERCENT_DECIMALS}
      onCommit={(value) => updateSettings({ rates: { [name]: value } })}
    />
  );

  function handleReset() {
    if (window.confirm(t('settings.resetConfirm'))) void resetSettings();
  }

  return (
    <>
      <h1 className="screen-title">{t('settings.title')}</h1>
      <p className="screen-subtitle">{t('settings.subtitle')}</p>

      <div className="settings">
        <Card title={t('settings.sections.interface')}>
          <SegmentedControl
            label={t('settings.language')}
            hint={t('settings.languageHint')}
            options={LANGUAGE_OPTIONS}
            value={settings.language}
            onChange={(language) => void updateSettings({ language })}
          />
          <SegmentedControl
            label={t('settings.theme')}
            options={themeOptions}
            value={settings.theme === 'system' ? systemTheme : settings.theme}
            onChange={(theme) => void updateSettings({ theme })}
          />
        </Card>

        <Card title={t('settings.sections.payment')}>
          <NumberField
            label={t('settings.fields.hourlyRate.label')}
            description={t('settings.fields.hourlyRate.description')}
            unit="zł"
            value={settings.hourlyRate}
            decimals={MONEY_DECIMALS}
            minFractionDigits={MONEY_DECIMALS}
            onCommit={(hourlyRate) => updateSettings({ hourlyRate })}
          />
        </Card>

        <Card title={t('settings.sections.zus')}>
          {(['emerytalna', 'rentowa', 'chorobowa'] as const).map(renderPercentField)}
        </Card>

        <Card title={t('settings.sections.health')}>{renderPercentField('zdrowotna')}</Card>

        <Card title={t('settings.sections.pit')}>
          {(['kup', 'pit'] as const).map(renderPercentField)}
          <NumberField
            label={t('settings.fields.pit2Relief.label')}
            description={t('settings.fields.pit2Relief.description')}
            unit="zł"
            value={settings.rates.pit2Relief}
            decimals={MONEY_DECIMALS}
            minFractionDigits={MONEY_DECIMALS}
            onCommit={(pit2Relief) => updateSettings({ rates: { pit2Relief } })}
          />
        </Card>

        <Button className="settings__reset" onClick={handleReset}>
          {t('settings.reset')}
        </Button>
      </div>
    </>
  );
}
