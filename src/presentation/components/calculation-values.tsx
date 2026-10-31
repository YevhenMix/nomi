import { useTranslation } from 'react-i18next';
import {
  findChangedValues,
  type Calculation,
  type CalculationValueName,
} from '../../domain/calculation';
import { HOURS_DECIMALS, hoursToHundredths } from '../../domain/hours';
import { MONEY_DECIMALS } from '../../domain/money';
import { PERCENT_DECIMALS, TAX_RATE_NAMES } from '../../domain/rates';
import { formatScaled } from '../format';
import { useSettings } from '../hooks/use-settings';
import { Card } from './card';
import './calculation-values.css';

interface ValueRowProps {
  label: string;
  value: string;
  /** The value in the current Settings, when it is different. */
  currentValue?: string;
}

function ValueRow({ label, value, currentValue }: ValueRowProps) {
  const { t } = useTranslation();

  return (
    <div className="value-row" data-changed={currentValue ? true : undefined}>
      <dt className="value-row__label">{label}</dt>
      <dd className="value-row__values">
        <span className="value-row__value">{value}</span>
        {currentValue && (
          <span className="value-row__current">
            {t('history.values.current', { value: currentValue })}
          </span>
        )}
      </dd>
    </div>
  );
}

interface CalculationValuesProps {
  calculation: Calculation;
}

/** The values a saved calculation was made with, compared with the current Settings. */
export function CalculationValues({ calculation }: CalculationValuesProps) {
  const { t, i18n } = useTranslation();
  const settings = useSettings();
  const locale = i18n.language;
  const changed = findChangedValues(calculation, settings);

  const money = (grosze: number) =>
    `${formatScaled(grosze, {
      locale,
      decimals: MONEY_DECIMALS,
      minFractionDigits: MONEY_DECIMALS,
    })} zł`;
  const percent = (rate: number) =>
    `${formatScaled(rate, { locale, decimals: PERCENT_DECIMALS })}%`;

  const currentIfChanged = (name: CalculationValueName, current: string) =>
    changed.has(name) ? current : undefined;

  return (
    <Card flat title={t('history.values.title')}>
      <p className="calculation-values__status" data-changed={changed.size > 0 ? true : undefined}>
        {changed.size > 0 ? t('history.values.changed') : t('history.values.same')}
      </p>
      <dl className="calculation-values__list">
        <ValueRow
          label={t('calculate.hoursCount')}
          value={`${formatScaled(hoursToHundredths(calculation.hours), {
            locale,
            decimals: HOURS_DECIMALS,
          })} ${t('calculate.hoursUnit')}`}
        />
        <ValueRow
          label={t('settings.fields.hourlyRate.label')}
          value={money(calculation.hourlyRate)}
          currentValue={currentIfChanged('hourlyRate', money(settings.hourlyRate))}
        />
        {TAX_RATE_NAMES.map((name) => {
          const format = name === 'pit2Relief' ? money : percent;
          return (
            <ValueRow
              key={name}
              label={t(`settings.fields.${name}.label`)}
              value={format(calculation.rates[name])}
              currentValue={currentIfChanged(name, format(settings.rates[name]))}
            />
          );
        })}
      </dl>
    </Card>
  );
}
