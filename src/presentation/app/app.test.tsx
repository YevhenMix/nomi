import { fireEvent, screen } from '@testing-library/react';
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

  describe('swiping between tabs', () => {
    function swipe(target: Element, fromX: number, toX: number, deltaY = 0) {
      const touch = { clientX: fromX, clientY: 300 };
      fireEvent.touchStart(target, { touches: [touch] });
      fireEvent.touchEnd(target, {
        changedTouches: [{ clientX: toX, clientY: 300 + deltaY }],
      });
    }

    const heading = () => screen.getByRole('heading', { level: 1 }).textContent;
    const main = () => screen.getByRole('main');

    it('moves through the tabs in order, in both directions', async () => {
      renderWithServices(<App />);
      await screen.findByRole('heading', { name: 'Розрахунок зарплати' });

      swipe(main(), 300, 100);
      expect(heading()).toBe('Історія');
      expect(screen.getByRole('button', { name: 'Історія' })).toHaveAttribute(
        'aria-current',
        'page',
      );

      swipe(main(), 300, 100);
      expect(heading()).toBe('Налаштування');

      swipe(main(), 100, 300);
      expect(heading()).toBe('Історія');

      swipe(main(), 100, 300);
      expect(heading()).toBe('Розрахунок зарплати');
    });

    it('stops at both ends instead of wrapping around', async () => {
      renderWithServices(<App />);
      await screen.findByRole('heading', { name: 'Розрахунок зарплати' });

      swipe(main(), 100, 300);
      expect(heading()).toBe('Розрахунок зарплати');

      swipe(main(), 300, 100);
      swipe(main(), 300, 100);
      swipe(main(), 300, 100);
      expect(heading()).toBe('Налаштування');
    });

    it('slides in from the side of the swipe, but not when a tab is tapped', async () => {
      renderWithServices(<App />);
      await screen.findByRole('heading', { name: 'Розрахунок зарплати' });

      swipe(main(), 300, 100);
      expect(main()).toHaveAttribute('data-entered-from', 'right');

      swipe(main(), 100, 300);
      expect(main()).toHaveAttribute('data-entered-from', 'left');

      await userEvent.click(screen.getByRole('button', { name: 'Налаштування' }));
      expect(main()).not.toHaveAttribute('data-entered-from');
    });

    it('ignores vertical scrolling', async () => {
      renderWithServices(<App />);
      await screen.findByRole('heading', { name: 'Розрахунок зарплати' });

      swipe(main(), 300, 200, 400);

      expect(heading()).toBe('Розрахунок зарплати');
    });

    it('leaves gestures inside a text input alone', async () => {
      renderWithServices(<App />);
      const input = await screen.findByLabelText('Кількість годин');

      swipe(input, 300, 100);

      expect(heading()).toBe('Розрахунок зарплати');
    });

    it('ignores a two-finger gesture', async () => {
      renderWithServices(<App />);
      await screen.findByRole('heading', { name: 'Розрахунок зарплати' });
      const finger = { clientX: 300, clientY: 300 };

      fireEvent.touchStart(main(), { touches: [finger, finger] });
      fireEvent.touchEnd(main(), { changedTouches: [{ clientX: 100, clientY: 300 }] });

      expect(heading()).toBe('Розрахунок зарплати');
    });

    it('keeps the hours and saves a pending Settings edit', async () => {
      const { services } = renderWithServices(<App />);
      const user = userEvent.setup();
      await user.type(await screen.findByLabelText('Кількість годин'), '192,3');

      swipe(main(), 300, 100);
      swipe(main(), 300, 100);
      await user.clear(screen.getByLabelText('Погодинна ставка'));
      await user.type(screen.getByLabelText('Погодинна ставка'), '40');
      swipe(main(), 100, 300);
      swipe(main(), 100, 300);

      expect(screen.getByLabelText('Кількість годин')).toHaveValue('192,3');
      await expect.poll(async () => (await services.getSettings()).hourlyRate).toBe(4000);
    });
  });
});
