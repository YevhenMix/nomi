import { useTranslation } from 'react-i18next';
import { hoursToHundredths, HOURS_DECIMALS } from '../../domain/hours';
import { MONEY_DECIMALS } from '../../domain/money';
import { PERCENT_DECIMALS, type BasisPoints } from '../../domain/rates';
import type { SalaryBreakdown } from '../../domain/salary-calculator';
import { formatMoney, formatScaled } from '../format';
import { Card } from './card';
import './salary-details.css';

interface DetailsRowProps {
  step: string;
  label: string;
  formula: string;
  amount: string;
  emphasised?: boolean;
}

function DetailsRow({ step, label, formula, amount, emphasised }: DetailsRowProps) {
  return (
    <div className="details-row" data-emphasised={emphasised || undefined}>
      <span className="details-row__step" aria-hidden="true">
        {step}
      </span>
      <div className="details-row__text">
        <div className="details-row__label">{label}</div>
        <div className="details-row__formula">{formula}</div>
      </div>
      <div className="details-row__amount">{amount}</div>
    </div>
  );
}

interface SalaryDetailsProps {
  breakdown: SalaryBreakdown;
  /** Renders the groups without their own cards, for use inside another card. */
  flat?: boolean;
}

/** Renders the lines of a breakdown as they are. All the numbers come from the calculator. */
export function SalaryDetails({ breakdown, flat }: SalaryDetailsProps) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language;
  const { rates } = breakdown;

  const money = (grosze: number) => formatMoney(grosze, locale);
  const percent = (rate: BasisPoints) => formatScaled(rate, { locale, decimals: PERCENT_DECIMALS });
  const inputs = t('details.inputs', {
    hours: formatScaled(hoursToHundredths(breakdown.hours), { locale, decimals: HOURS_DECIMALS }),
    unit: t('calculate.hoursUnit'),
    rate: formatScaled(breakdown.hourlyRate, {
      locale,
      decimals: MONEY_DECIMALS,
      minFractionDigits: MONEY_DECIMALS,
    }),
  });
  const line = 'details.lines';

  return (
    <>
      <Card flat={flat} title="Brutto">
        <DetailsRow step="1" label="Brutto" formula={inputs} amount={money(breakdown.brutto)} />
      </Card>

      <Card flat={flat} title={t('details.sections.zus')}>
        <DetailsRow
          step="2"
          label="Emerytalna"
          formula={t(`${line}.percentOfBrutto`, { percent: percent(rates.emerytalna) })}
          amount={money(breakdown.emerytalna)}
        />
        <DetailsRow
          step="3"
          label="Rentowa"
          formula={t(`${line}.percentOfBrutto`, { percent: percent(rates.rentowa) })}
          amount={money(breakdown.rentowa)}
        />
        <DetailsRow
          step="4"
          label="Chorobowa"
          formula={t(`${line}.percentOfBrutto`, { percent: percent(rates.chorobowa) })}
          amount={money(breakdown.chorobowa)}
        />
        <DetailsRow
          step="Σ"
          label={t(`${line}.zusTotal.label`)}
          formula={t(`${line}.zusTotal.formula`)}
          amount={money(breakdown.zusTotal)}
        />
      </Card>

      <Card flat={flat} title={t('details.sections.health')}>
        <DetailsRow
          step="5"
          label={t(`${line}.healthBase.label`)}
          formula={t(`${line}.healthBase.formula`)}
          amount={money(breakdown.healthBase)}
        />
        <DetailsRow
          step="6"
          label="Zdrowotna"
          formula={t(`${line}.zdrowotnaFormula`, { percent: percent(rates.zdrowotna) })}
          amount={money(breakdown.zdrowotna)}
        />
      </Card>

      <Card flat={flat} title={t('details.sections.pit')}>
        <DetailsRow
          step="7"
          label="KUP"
          formula={t(`${line}.kupFormula`, { percent: percent(rates.kup) })}
          amount={money(breakdown.kup)}
        />
        <DetailsRow
          step="8"
          label={t(`${line}.taxBase.label`)}
          formula={t(`${line}.taxBase.formula`)}
          amount={money(breakdown.taxBase)}
        />
        <DetailsRow
          step="9"
          label="PIT"
          formula={t(`${line}.pitFormula`, { percent: percent(rates.pit) })}
          amount={money(breakdown.pit)}
        />
        <DetailsRow
          step="10"
          label={t(`${line}.pit2Relief.label`)}
          formula={t(`${line}.pit2Relief.formula`)}
          amount={money(breakdown.pit2Relief)}
        />
        <DetailsRow
          step="11"
          label={t(`${line}.pitWithPit2.label`)}
          formula={t(`${line}.pitWithPit2.formula`)}
          amount={money(breakdown.pitWithPit2)}
        />
      </Card>

      <Card flat={flat} title="Netto">
        <DetailsRow
          step="12"
          label={t(`${line}.nettoWithoutPit2.label`)}
          formula={t(`${line}.nettoWithoutPit2.formula`)}
          amount={money(breakdown.nettoWithoutPit2)}
        />
        <DetailsRow
          step="13"
          label={t(`${line}.nettoWithPit2.label`)}
          formula={t(`${line}.nettoWithPit2.formula`)}
          amount={money(breakdown.nettoWithPit2)}
          emphasised
        />
      </Card>
    </>
  );
}
