import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { App } from '../app/app';
import { renderWithServices } from '../test-utils';

const hoursInput = () => screen.getByLabelText('Кількість годин');
const saveButton = () => screen.getByRole('button', { name: 'Зберегти' });
const detailsButton = () => screen.getByRole('button', { name: 'Деталі' });

async function renderApp() {
  const result = renderWithServices(<App />);
  await screen.findByRole('heading', { name: 'Розрахунок зарплати' });
  return { ...result, user: userEvent.setup() };
}

/** Normalises the non-breaking spaces Intl uses for grouping. */
function text(element: Element): string {
  return (element.textContent ?? '').replace(/\s+/g, ' ').trim();
}

describe('CalculateScreen', () => {
  it('starts with empty hours, no result, and actions disabled', async () => {
    await renderApp();

    expect(hoursInput()).toHaveValue('');
    expect(screen.getAllByText('—')).toHaveLength(3);
    expect(saveButton()).toBeDisabled();
    expect(detailsButton()).toBeDisabled();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('shows the hourly rate from Settings', async () => {
    await renderApp();

    expect(screen.getByText('31,40 zł / год')).toBeInTheDocument();
  });

  it('calculates the golden case live while typing', async () => {
    const { user } = await renderApp();

    await user.type(hoursInput(), '192,3');

    expect(text(screen.getByText(/4\s541,45/))).toBe('4 541,45 zł');
    expect(text(screen.getByText(/6\s038,22/))).toBe('6 038,22 zł');
    expect(text(screen.getByText(/4\s241,45/))).toBe('4 241,45 zł');
    expect(saveButton()).toBeEnabled();
  });

  it.each(['192.3', '192,30'])('accepts %s', async (hours) => {
    const { user } = await renderApp();

    await user.type(hoursInput(), hours);

    expect(screen.getByText(/4\s541,45/)).toBeInTheDocument();
  });

  it.each(['abc', '1,234', '-5'])('shows an error for %s and blocks actions', async (hours) => {
    const { user } = await renderApp();

    await user.type(hoursInput(), hours);

    expect(screen.getByRole('alert')).toBeVisible();
    expect(hoursInput()).toHaveAttribute('aria-invalid', 'true');
    expect(saveButton()).toBeDisabled();
    expect(detailsButton()).toBeDisabled();
  });

  it('reports amounts that are too large to calculate exactly', async () => {
    const { user, services } = await renderApp();
    await services.updateSettings({ hourlyRate: Number.MAX_SAFE_INTEGER });
    await waitFor(() => expect(screen.queryByText('31,40 zł / год')).not.toBeInTheDocument());

    await user.type(hoursInput(), '1000000');

    expect(screen.getByRole('alert')).toHaveTextContent('Завелике число');
    expect(saveButton()).toBeDisabled();
  });

  it('allows details but not saving for 0 hours', async () => {
    const { user } = await renderApp();

    await user.type(hoursInput(), '0');

    expect(saveButton()).toBeDisabled();
    expect(detailsButton()).toBeEnabled();
  });

  it('recalculates when Settings change', async () => {
    const { user, services } = await renderApp();
    await user.type(hoursInput(), '100');

    await services.updateSettings({
      hourlyRate: 5000,
      rates: {
        emerytalna: 0,
        rentowa: 0,
        chorobowa: 0,
        zdrowotna: 0,
        kup: 0,
        pit: 0,
        pit2Relief: 0,
      },
    });

    await waitFor(() => expect(screen.getAllByText(/5\s000,00/)).toHaveLength(3));
  });

  it('keeps the hours after changing the rate in Settings', async () => {
    const { user } = await renderApp();
    await user.type(hoursInput(), '192,3');

    await user.click(screen.getByRole('button', { name: 'Змінити' }));
    expect(screen.getByRole('heading', { name: 'Налаштування', level: 1 })).toBeInTheDocument();
    await user.clear(screen.getByLabelText('Погодинна ставка'));
    await user.type(screen.getByLabelText('Погодинна ставка'), '40');
    await user.click(screen.getByRole('button', { name: 'Розрахунок' }));

    expect(hoursInput()).toHaveValue('192,3');
    await waitFor(() => expect(screen.getByText('40,00 zł / год')).toBeInTheDocument());
  });

  describe('saving', () => {
    it('stores a snapshot and shows a confirmation', async () => {
      const { user, db } = await renderApp();
      await user.type(hoursInput(), '192,3');

      await user.click(saveButton());

      expect(await screen.findByRole('status')).toHaveTextContent('Збережено в історії');
      const [saved] = await db.calculations.toArray();
      expect(saved).toMatchObject({
        hours: 192.3,
        hourlyRate: 3140,
        breakdown: { brutto: 603822, nettoWithPit2: 454145 },
      });
      expect(saved?.id).toBeTruthy();
      expect(saved?.period).toMatch(/^\d{4}-\d{2}$/);
    });

    it('does not rewrite saved records when Settings change', async () => {
      const { user, db, services } = await renderApp();
      await user.type(hoursInput(), '192,3');
      await user.click(saveButton());
      await screen.findByRole('status');

      await services.updateSettings({ hourlyRate: 9999, rates: { pit: 3200 } });

      const [saved] = await db.calculations.toArray();
      expect(saved?.hourlyRate).toBe(3140);
      expect(saved?.rates.pit).toBe(1200);
    });

    it('does not save the same result twice, but allows it after a change', async () => {
      const { user, db } = await renderApp();
      await user.type(hoursInput(), '192,3');

      await user.click(saveButton());
      await screen.findByRole('status');
      expect(screen.getByRole('button', { name: 'Збережено' })).toBeDisabled();

      await user.type(hoursInput(), '5');
      await user.click(saveButton());

      await waitFor(async () => expect(await db.calculations.count()).toBe(2));
    });

    it('tells the user when saving fails, and allows a retry', async () => {
      const { user, services } = await renderApp();
      vi.spyOn(services, 'saveCalculation').mockRejectedValueOnce(new Error('disk full'));
      await user.type(hoursInput(), '192,3');

      await user.click(saveButton());

      expect(await screen.findByRole('status')).toHaveTextContent('Не вдалося зберегти');
      expect(saveButton()).toBeEnabled();
    });
  });

  describe('details', () => {
    const collapseButton = () => screen.getByRole('button', { name: 'Згорнути' });
    const detailsBlock = () => screen.getByRole('region', { name: 'Деталі розрахунку' });
    const queryDetailsBlock = () => screen.queryByRole('region', { name: 'Деталі розрахунку' });

    function amountOf(label: string): string {
      const row = within(detailsBlock()).getByText(label).closest('.details-row');
      if (!row) throw new Error(`No row for ${label}`);
      return text(row.querySelector('.details-row__amount')!);
    }

    it('is collapsed until asked for, and opens without a modal', async () => {
      const { user } = await renderApp();
      await user.type(hoursInput(), '192,3');

      expect(queryDetailsBlock()).not.toBeInTheDocument();
      expect(detailsButton()).toHaveAttribute('aria-expanded', 'false');

      await user.click(detailsButton());

      expect(detailsBlock()).toBeVisible();
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      // The rest of the screen stays usable.
      expect(hoursInput()).toBeEnabled();
      expect(saveButton()).toBeEnabled();
    });

    it('turns the button into collapse, and back', async () => {
      const { user } = await renderApp();
      await user.type(hoursInput(), '192,3');

      await user.click(detailsButton());

      expect(collapseButton()).toHaveAttribute('aria-expanded', 'true');
      expect(collapseButton()).toHaveAttribute('aria-controls', detailsBlock().id);
      expect(screen.queryByRole('button', { name: 'Деталі' })).not.toBeInTheDocument();

      await user.click(collapseButton());

      expect(queryDetailsBlock()).not.toBeInTheDocument();
      expect(detailsButton()).toHaveAttribute('aria-expanded', 'false');
    });

    it('shows every line of the golden case, in its group', async () => {
      const { user } = await renderApp();
      await user.type(hoursInput(), '192,3');

      await user.click(detailsButton());

      const expected: [string, string][] = [
        ['Emerytalna', '589,33'],
        ['Rentowa', '90,57'],
        ['Chorobowa', '147,94'],
        ['Разом ZUS', '827,84'],
        ['База для zdrowotnej', '5 210,38'],
        ['Zdrowotna', '468,93'],
        ['KUP', '1 042,08'],
        ['Податкова база', '4 168,00'],
        ['PIT', '500,00'],
        ['Ulga PIT-2', '300,00'],
        ['PIT з PIT-2', '200,00'],
        ['Netto без PIT-2', '4 241,45'],
        ['Netto з PIT-2', '4 541,45'],
      ];
      for (const [label, amount] of expected) expect(amountOf(label)).toBe(amount);
      const block = within(detailsBlock());
      expect(block.getByText('192,3 год × 31,40 zł')).toBeInTheDocument();
      expect(block.getByText('Brutto × 9,76%')).toBeInTheDocument();
      for (const group of [
        'Brutto',
        'ZUS — соціальні внески',
        'Здоров’я',
        'Податок PIT',
        'Netto',
      ]) {
        expect(block.getByRole('heading', { name: group })).toBeInTheDocument();
      }
    });

    it('updates live while the hours change', async () => {
      const { user } = await renderApp();
      await user.type(hoursInput(), '192,3');
      await user.click(detailsButton());

      await user.clear(hoursInput());
      await user.type(hoursInput(), '168');

      expect(amountOf('Netto з PIT-2')).toBe('4 005,29');
    });

    it('hides while there is no result, and returns when there is one', async () => {
      const { user } = await renderApp();
      await user.type(hoursInput(), '192,3');
      await user.click(detailsButton());

      await user.clear(hoursInput());

      expect(queryDetailsBlock()).not.toBeInTheDocument();
      expect(detailsButton()).toBeDisabled();

      await user.type(hoursInput(), '168');

      expect(detailsBlock()).toBeVisible();
    });

    it('scrolls the block into view only when opening', async () => {
      const scrollIntoView = vi.spyOn(Element.prototype, 'scrollIntoView');
      const { user } = await renderApp();
      await user.type(hoursInput(), '192,3');
      await user.click(detailsButton());
      scrollIntoView.mockClear();

      await user.type(hoursInput(), '5');
      expect(scrollIntoView).not.toHaveBeenCalled();

      await user.click(collapseButton());
      expect(scrollIntoView).not.toHaveBeenCalled();

      await user.click(detailsButton());
      expect(scrollIntoView).toHaveBeenCalled();
      scrollIntoView.mockRestore();
    });
  });

  it('formats money for the active language', async () => {
    const { user, services } = await renderApp();
    await user.type(hoursInput(), '192,3');

    await services.updateSettings({ language: 'en' });

    expect(await screen.findByText(/4,541\.45/)).toBeInTheDocument();
    expect(screen.getByText('31.40 zł / h')).toBeInTheDocument();
  });

  it('groups 4-digit Polish amounts like the other languages', async () => {
    const { user, services } = await renderApp();
    await user.type(hoursInput(), '192,3');

    await services.updateSettings({ language: 'pl' });

    expect(await screen.findByText('31,40 zł / godz.')).toBeInTheDocument();
    expect(screen.getByText(/4\s541,45/)).toBeInTheDocument();
  });
});
