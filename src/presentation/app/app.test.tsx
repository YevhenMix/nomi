import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { renderWithServices } from '../test-utils';
import { App } from './app';

describe('App', () => {
  it('opens on the calculation tab', async () => {
    renderWithServices(<App />);

    expect(await screen.findByRole('heading', { name: 'Розрахунок зарплати' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Розрахунок' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('switches screens from the tab bar', async () => {
    renderWithServices(<App />);

    await userEvent.click(await screen.findByRole('button', { name: 'Налаштування' }));

    expect(screen.getByRole('heading', { name: 'Налаштування', level: 1 })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Розрахунок зарплати' })).not.toBeInTheDocument();
  });

  it('saves an edit that is still pending when the user leaves the screen', async () => {
    const { services } = renderWithServices(<App />);
    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: 'Налаштування' }));

    await user.clear(screen.getByLabelText('Погодинна ставка'));
    await user.type(screen.getByLabelText('Погодинна ставка'), '40');
    await user.click(screen.getByRole('button', { name: 'Історія' }));

    await expect.poll(async () => (await services.getSettings()).hourlyRate).toBe(4000);
  });
});
