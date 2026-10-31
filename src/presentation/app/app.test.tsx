import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
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
    // jsdom has no layout, so give the track the width of a phone.
    beforeEach(() => {
      vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(400);
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    /** A quick swipe: the time between test events is far shorter than a real finger's. */
    function swipe(target: Element, fromX: number, toX: number, deltaY = 0) {
      const start = { clientX: fromX, clientY: 300 };
      const end = { clientX: toX, clientY: 300 + deltaY };
      fireEvent.touchStart(target, { touches: [start] });
      fireEvent.touchMove(target, { touches: [end] });
      fireEvent.touchEnd(target, { changedTouches: [end] });
    }

    const heading = () => screen.getByRole('heading', { level: 1 }).textContent;
    const main = () => screen.getByRole('main');
    const track = () => main().querySelector<HTMLElement>('.pager')!;

    it('moves through the tabs in order, in both directions', async () => {
      renderWithServices(<App />);
      await screen.findByRole('heading', { name: 'Розрахунок зарплати' });

      swipe(main(), 300, 100);
      expect(heading()).toBe('Історія');
      expect(screen.getByRole('button', { name: 'Історія' })).toHaveAttribute(
        'aria-current',
        'page',
      );
      expect(track().style.transform).toBe('translateX(-100%)');

      swipe(main(), 300, 100);
      expect(heading()).toBe('Налаштування');
      expect(track().style.transform).toBe('translateX(-200%)');

      swipe(main(), 100, 300);
      expect(heading()).toBe('Історія');

      swipe(main(), 100, 300);
      expect(heading()).toBe('Розрахунок зарплати');
      expect(track().style.transform).toBe('translateX(0%)');
    });

    it('moves with the finger during the swipe, and only then changes tab', async () => {
      renderWithServices(<App />);
      await screen.findByRole('heading', { name: 'Розрахунок зарплати' });

      fireEvent.touchStart(main(), { touches: [{ clientX: 300, clientY: 300 }] });
      fireEvent.touchMove(main(), { touches: [{ clientX: 220, clientY: 300 }] });

      expect(track().style.transform).toBe('translateX(-80px)');
      expect(track()).toHaveAttribute('data-dragging');
      expect(heading()).toBe('Розрахунок зарплати');

      fireEvent.touchMove(main(), { touches: [{ clientX: 150, clientY: 300 }] });
      expect(track().style.transform).toBe('translateX(-150px)');

      fireEvent.touchEnd(main(), { changedTouches: [{ clientX: 150, clientY: 300 }] });

      expect(track()).not.toHaveAttribute('data-dragging');
      expect(heading()).toBe('Історія');
    });

    it('springs back when the movement is too small', async () => {
      renderWithServices(<App />);
      await screen.findByRole('heading', { name: 'Розрахунок зарплати' });

      swipe(main(), 300, 280);

      expect(heading()).toBe('Розрахунок зарплати');
      expect(track().style.transform).toBe('translateX(0%)');
      expect(track()).not.toHaveAttribute('data-dragging');
    });

    it('springs back when the browser cancels the touch', async () => {
      renderWithServices(<App />);
      await screen.findByRole('heading', { name: 'Розрахунок зарплати' });

      fireEvent.touchStart(main(), { touches: [{ clientX: 300, clientY: 300 }] });
      fireEvent.touchMove(main(), { touches: [{ clientX: 100, clientY: 300 }] });
      fireEvent.touchCancel(main());

      expect(heading()).toBe('Розрахунок зарплати');
      expect(track().style.transform).toBe('translateX(0%)');
    });

    it('stops at both ends instead of wrapping around', async () => {
      renderWithServices(<App />);
      await screen.findByRole('heading', { name: 'Розрахунок зарплати' });

      swipe(main(), 100, 300);
      expect(heading()).toBe('Розрахунок зарплати');
      expect(track().style.transform).toBe('translateX(0%)');

      swipe(main(), 300, 100);
      swipe(main(), 300, 100);
      swipe(main(), 300, 100);
      expect(heading()).toBe('Налаштування');
      expect(track().style.transform).toBe('translateX(-200%)');
    });

    it('slides for a tapped tab too', async () => {
      renderWithServices(<App />);
      await screen.findByRole('heading', { name: 'Розрахунок зарплати' });

      await userEvent.click(screen.getByRole('button', { name: 'Налаштування' }));

      expect(track().style.transform).toBe('translateX(-200%)');
    });

    it('ignores vertical scrolling', async () => {
      renderWithServices(<App />);
      await screen.findByRole('heading', { name: 'Розрахунок зарплати' });

      swipe(main(), 300, 200, 400);

      expect(heading()).toBe('Розрахунок зарплати');
      expect(track()).not.toHaveAttribute('data-dragging');
      expect(track().style.transform).toBe('translateX(0%)');
    });

    it('leaves gestures inside a text input alone', async () => {
      renderWithServices(<App />);
      const input = await screen.findByLabelText('Кількість годин');

      swipe(input, 300, 100);

      expect(heading()).toBe('Розрахунок зарплати');
      expect(track()).not.toHaveAttribute('data-dragging');
    });

    it('ignores a two-finger gesture', async () => {
      renderWithServices(<App />);
      await screen.findByRole('heading', { name: 'Розрахунок зарплати' });
      const finger = { clientX: 300, clientY: 300 };
      const moved = { clientX: 100, clientY: 300 };

      fireEvent.touchStart(main(), { touches: [finger, finger] });
      fireEvent.touchMove(main(), { touches: [moved, finger] });
      fireEvent.touchEnd(main(), { changedTouches: [moved] });

      expect(heading()).toBe('Розрахунок зарплати');
      expect(track()).not.toHaveAttribute('data-dragging');
    });

    it('hides off-screen pages from keyboard and screen readers', async () => {
      renderWithServices(<App />);
      await screen.findByRole('heading', { name: 'Розрахунок зарплати' });
      const pages = main().querySelectorAll('.pager__page');

      expect(pages).toHaveLength(3);
      expect(pages[0]).not.toHaveAttribute('inert');
      expect(pages[1]).toHaveAttribute('inert');
      expect(pages[2]).toHaveAttribute('aria-hidden', 'true');

      swipe(main(), 300, 100);

      expect(pages[0]).toHaveAttribute('inert');
      expect(pages[1]).not.toHaveAttribute('inert');
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
      await waitFor(() => expect(screen.getByLabelText('Погодинна ставка')).toHaveValue('40,00'));
    });
  });
});
