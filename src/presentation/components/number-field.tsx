import { useEffect, useId, useRef, useState, type ChangeEvent, type KeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { parseScaledDecimal } from '../../domain/decimal';
import { formatScaled } from '../format';
import './number-field.css';

const COMMIT_DELAY_MS = 300;

interface NumberFieldProps {
  label: string;
  description?: string;
  unit: string;
  /** Value as an integer in minor units, scaled by 10^decimals. */
  value: number;
  decimals: number;
  minFractionDigits?: number;
  onCommit: (value: number) => Promise<unknown>;
}

/**
 * A settings row with a decimal input. Saves shortly after typing stops, and immediately on blur
 * or unmount. Invalid text is never saved: it shows an error, and blur restores the saved value.
 */
export function NumberField({
  label,
  description,
  unit,
  value,
  decimals,
  minFractionDigits,
  onCommit,
}: NumberFieldProps) {
  const { t, i18n } = useTranslation();
  const id = useId();
  const [draft, setDraft] = useState<string | null>(null);
  const pending = useRef<{ timer: number; commit: () => Promise<unknown> } | null>(null);

  const format = (scaled: number) =>
    formatScaled(scaled, { locale: i18n.language, decimals, minFractionDigits });

  const parsed = draft === null ? value : parseScaledDecimal(draft, decimals);
  const isInvalid = parsed === null;
  const errorId = `${id}-error`;
  const descriptionId = `${id}-description`;

  function flush(): Promise<unknown> {
    if (!pending.current) return Promise.resolve();
    window.clearTimeout(pending.current.timer);
    const { commit } = pending.current;
    pending.current = null;
    return commit();
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const text = event.target.value;
    setDraft(text);
    if (pending.current) window.clearTimeout(pending.current.timer);
    pending.current = null;

    const next = parseScaledDecimal(text, decimals);
    if (next === null) return;

    const commit = () => onCommit(next);
    pending.current = {
      commit,
      timer: window.setTimeout(() => {
        pending.current = null;
        void commit();
      }, COMMIT_DELAY_MS),
    };
  }

  function handleBlur() {
    // Keep the typed text on screen until it is saved, so the old value doesn't flash back.
    void flush().finally(() => setDraft(null));
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') event.currentTarget.blur();
  }

  // Leaving the screen must not lose an edit that is still waiting for its timer.
  useEffect(
    () => () => {
      if (!pending.current) return;
      window.clearTimeout(pending.current.timer);
      void pending.current.commit();
      pending.current = null;
    },
    [],
  );

  return (
    <div className="number-field">
      <div className="number-field__text">
        <label className="number-field__label" htmlFor={id}>
          {label}
        </label>
        {description && (
          <div id={descriptionId} className="number-field__description">
            {description}
          </div>
        )}
        {isInvalid && (
          <div id={errorId} className="number-field__error" role="alert">
            {t('validation.invalidNumber')}
          </div>
        )}
      </div>
      <div className="number-field__box" data-invalid={isInvalid || undefined}>
        <input
          id={id}
          className="number-field__input"
          type="text"
          inputMode="decimal"
          autoComplete="off"
          enterKeyHint="done"
          value={draft ?? format(value)}
          aria-invalid={isInvalid || undefined}
          aria-describedby={isInvalid ? errorId : description ? descriptionId : undefined}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          onFocus={(event) => event.target.select()}
        />
        <span className="number-field__unit" aria-hidden="true">
          {unit}
        </span>
      </div>
    </div>
  );
}
