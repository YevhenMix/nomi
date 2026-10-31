import type { ButtonHTMLAttributes } from 'react';
import './button.css';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
}

export function Button({ variant = 'secondary', className = '', ...props }: ButtonProps) {
  return (
    <button type="button" className={`button button--${variant} ${className}`.trim()} {...props} />
  );
}
