import { useId, type ReactNode } from 'react';
import './segmented-control.css';

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
  icon?: ReactNode;
}

interface SegmentedControlProps<T extends string> {
  label: string;
  hint?: string;
  options: readonly SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

export function SegmentedControl<T extends string>({
  label,
  hint,
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  const id = useId();

  return (
    <div className="segmented">
      <div id={id} className="segmented__label">
        {label}
      </div>
      <div className="segmented__track" role="radiogroup" aria-labelledby={id}>
        {options.map((option) => (
          <label key={option.value} className="segmented__option">
            <input
              className="segmented__input"
              type="radio"
              name={id}
              value={option.value}
              checked={option.value === value}
              onChange={() => onChange(option.value)}
            />
            <span className="segmented__face">
              {option.icon}
              {option.label}
            </span>
          </label>
        ))}
      </div>
      {hint && <p className="segmented__hint">{hint}</p>}
    </div>
  );
}
