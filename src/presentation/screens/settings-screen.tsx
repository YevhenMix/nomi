import { useTranslation } from 'react-i18next';
import { MONEY_DECIMALS } from '../../domain/money';
import { PERCENT_DECIMALS } from '../../domain/rates';
import type { Language } from '../../domain/settings';
import { Card } from '../components/card';
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

const ICON_PROPS = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
} as const;

const SUN_ICON = (
  <svg {...ICON_PROPS}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" />
  </svg>
);

const MOON_ICON = (
  <svg {...ICON_PROPS}>
    <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z" />
  </svg>
);

type PercentRate = 'emerytalna' | 'rentowa' | 'chorobowa' | 'zdrowotna' | 'kup' | 'pit';

export function SettingsScreen() {
  const { t } = useTranslation();
  const { updateSettings, resetSettings } = useServices();
  const settings = useSettings();
  const systemTheme = useSystemTheme();

  const themeOptions: readonly SegmentedOption<ResolvedTheme>[] = [
    { value: 'light', label: t('settings.themeLight'), icon: SUN_ICON },
    { value: 'dark', label: t('settings.themeDark'), icon: MOON_ICON },
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

        <button type="button" className="settings__reset" onClick={handleReset}>
          {t('settings.reset')}
        </button>
      </div>
    </>
  );
}
