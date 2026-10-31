import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { App } from './app';

describe('App', () => {
  it('opens on the calculation tab', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: 'Розрахунок зарплати' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Розрахунок' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('switches screens from the tab bar', async () => {
    render(<App />);

    await userEvent.click(screen.getByRole('button', { name: 'Налаштування' }));

    expect(screen.getByRole('heading', { name: 'Налаштування' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Розрахунок зарплати' })).not.toBeInTheDocument();
  });
});
