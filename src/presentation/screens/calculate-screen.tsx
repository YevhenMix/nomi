import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MONEY_DECIMALS } from '../../domain/money';
import type { SalaryBreakdown } from '../../domain/salary-calculator';
import { Button } from '../components/button';
import { ArrowDownIcon, ArrowUpIcon, CalculatorIcon, SaveIcon } from '../components/icons';
import { SalaryDetails } from '../components/salary-details';
import { Toast } from '../components/toast';
import { formatMoney, formatScaled } from '../format';
import { useSalaryCalculation } from '../hooks/use-salary-calculation';
import { useServices } from '../hooks/use-services';
import { useSettings } from '../hooks/use-settings';
import './calculate-screen.css';

const NO_AMOUNT = '—';

interface CalculateScreenProps {
  hoursText: string;
  onHoursTextChange: (text: string) => void;
  onChangeRate: () => void;
}

export function CalculateScreen({
  hoursText,
  onHoursTextChange,
  onChangeRate,
}: CalculateScreenProps) {
  const { t, i18n } = useTranslation();
  const { saveCalculation } = useServices();
  const settings = useSettings();
  const calculation = useSalaryCalculation(hoursText);

  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<SalaryBreakdown | null>(null);
  const dismissToast = useCallback(() => setToast(null), []);
  const detailsRef = useRef<HTMLElement>(null);

  // The block opens below the fold, so bring it into view when the user asks for it.
  useEffect(() => {
    if (isDetailsOpen) detailsRef.current?.scrollIntoView({ block: 'start' });
  }, [isDetailsOpen]);

  const locale = i18n.language;
  const breakdown = calculation.status === 'ready' ? calculation.breakdown : null;
  const money = (grosze: number | undefined) =>
    grosze === undefined ? NO_AMOUNT : formatMoney(grosze, locale);
  const errorText =
    calculation.status === 'invalid'
      ? t('validation.invalidNumber')
      : calculation.status === 'too-large'
        ? t('validation.numberTooLarge')
        : null;

  // Stays open while the user edits the hours, updating live. Hidden while there's no result.
  const isDetailsVisible = isDetailsOpen && breakdown !== null;

  // The same result can't be saved twice by accident. Changing the hours or rates allows it again.
  const isSaved = breakdown !== null && breakdown === lastSaved;
  const canSave = breakdown !== null && breakdown.hours > 0 && !isSaved;

  async function handleSave() {
    if (!breakdown) return;
    try {
      await saveCalculation(breakdown);
      setLastSaved(breakdown);
      setToast(t('calculate.savedToast'));
    } catch {
      setToast(t('calculate.saveFailed'));
    }
  }

  return (
    <>
      <header className="app-header">
        <div className="app-header__icon">
          <CalculatorIcon />
        </div>
        <div className="app-header__text">
          <div className="app-header__title">{t('header.title')}</div>
          <div className="app-header__subtitle">{t('header.subtitle')}</div>
        </div>
        <span className="chip">PLN</span>
      </header>

      <h1 className="screen-title">{t('calculate.title')}</h1>
      <p className="screen-subtitle">{t('calculate.subtitle')}</p>

      <section className="hours-card">
        <h2 className="hours-card__title">{t('calculate.workedHours')}</h2>
        <div className="hours-input" data-invalid={errorText ? true : undefined}>
          <label className="hours-input__label" htmlFor="hours">
            {t('calculate.hoursCount')}
          </label>
          <input
            id="hours"
            className="hours-input__field"
            type="text"
            inputMode="decimal"
            autoComplete="off"
            enterKeyHint="done"
            placeholder="0"
            value={hoursText}
            aria-invalid={errorText ? true : undefined}
            aria-describedby={errorText ? 'hours-error' : undefined}
            onChange={(event) => onHoursTextChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') event.currentTarget.blur();
            }}
          />
          <span className="hours-input__unit" aria-hidden="true">
            {t('calculate.hoursUnit')}
          </span>
        </div>
        {errorText && (
          <p id="hours-error" className="hours-card__error" role="alert">
            {errorText}
          </p>
        )}
        <div className="rate-row">
          <span className="rate-row__label">{t('calculate.hourlyRate')}</span>
          <span className="rate-row__value">
            {t('calculate.hourlyRateValue', {
              rate: formatScaled(settings.hourlyRate, {
                locale,
                decimals: MONEY_DECIMALS,
                minFractionDigits: MONEY_DECIMALS,
              }),
              unit: t('calculate.hoursUnit'),
            })}
          </span>
          <button type="button" className="rate-row__change" onClick={onChangeRate}>
            {t('calculate.changeRate')}
          </button>
        </div>
      </section>

      <section className="result-card" aria-live="polite">
        <div className="result-card__heading">
          <h2 className="result-card__title">{t('calculate.nettoWithPit2')}</h2>
          <span className="chip chip--result">{t('calculate.mainResult')}</span>
        </div>
        <p className="result-card__amount">
          {money(breakdown?.nettoWithPit2)}
          {breakdown && <span className="result-card__currency"> zł</span>}
        </p>
        <p className="result-card__note">{t('calculate.takeHome')}</p>
        <dl className="result-card__lines">
          <div>
            <dt>Brutto</dt>
            <dd>
              {money(breakdown?.brutto)}
              {breakdown && ' zł'}
            </dd>
          </div>
          <div>
            <dt>{t('calculate.nettoWithoutPit2')}</dt>
            <dd>
              {money(breakdown?.nettoWithoutPit2)}
              {breakdown && ' zł'}
            </dd>
          </div>
        </dl>
      </section>

      <div className="calculate-actions">
        <Button variant="primary" disabled={!canSave} onClick={() => void handleSave()}>
          <SaveIcon />
          {isSaved ? t('calculate.saved') : t('calculate.save')}
        </Button>
        <Button
          disabled={!breakdown}
          aria-expanded={isDetailsVisible}
          aria-controls="salary-details"
          onClick={() => setIsDetailsOpen(!isDetailsOpen)}
        >
          {isDetailsVisible ? t('calculate.collapseDetails') : t('calculate.details')}
          {isDetailsVisible ? <ArrowUpIcon /> : <ArrowDownIcon />}
        </Button>
      </div>

      {isDetailsVisible && (
        <section
          ref={detailsRef}
          id="salary-details"
          className="calculate-details"
          aria-label={t('details.title')}
        >
          <SalaryDetails breakdown={breakdown} />
        </section>
      )}

      <p className="calculate-footnote">{t('calculate.footnote')}</p>

      {toast && <Toast message={toast} onDismiss={dismissToast} />}
    </>
  );
}
