import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Calculation } from '../../domain/calculation';
import { HOURS_DECIMALS, hoursToHundredths } from '../../domain/hours';
import { MONEY_DECIMALS } from '../../domain/money';
import { formatDate, formatMoney, formatScaled } from '../format';
import { Button } from './button';
import { CalculationValues } from './calculation-values';
import { ChevronDownIcon, TrashIcon } from './icons';
import { SalaryDetails } from './salary-details';
import './history-row.css';

interface HistoryRowProps {
  calculation: Calculation;
  onDelete: (id: string) => void;
}

/** One saved calculation: a summary that expands in place into its full details. */
export function HistoryRow({ calculation, onDelete }: HistoryRowProps) {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const detailsId = useId();
  const locale = i18n.language;
  const { breakdown } = calculation;

  return (
    <li className="history-row">
      <button
        type="button"
        className="history-row__summary"
        aria-expanded={isOpen}
        aria-controls={detailsId}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="history-row__main">
          <span className="history-row__date">{formatDate(calculation.createdAt, locale)}</span>
          <span className="history-row__inputs">
            {t('history.rowInputs', {
              hours: formatScaled(hoursToHundredths(calculation.hours), {
                locale,
                decimals: HOURS_DECIMALS,
              }),
              unit: t('calculate.hoursUnit'),
              rate: formatScaled(calculation.hourlyRate, {
                locale,
                decimals: MONEY_DECIMALS,
                minFractionDigits: MONEY_DECIMALS,
              }),
            })}
          </span>
        </span>
        <span className="history-row__amounts">
          <span className="history-row__netto">
            {formatMoney(breakdown.nettoWithPit2, locale)} zł
          </span>
          <span className="history-row__brutto">
            {t('history.rowBrutto', { amount: formatMoney(breakdown.brutto, locale) })}
          </span>
        </span>
        <span className="history-row__chevron" data-open={isOpen || undefined}>
          <ChevronDownIcon />
        </span>
      </button>

      {isOpen && (
        <div id={detailsId} className="history-row__details">
          <CalculationValues calculation={calculation} />
          <SalaryDetails breakdown={breakdown} flat />
          <Button
            variant="danger"
            className="history-row__delete"
            onClick={() => onDelete(calculation.id)}
          >
            <TrashIcon />
            {t('history.delete')}
          </Button>
        </div>
      )}
    </li>
  );
}
