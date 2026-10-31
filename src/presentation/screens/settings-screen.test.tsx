import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_SETTINGS } from '../../domain/settings';
import { renderWithServices } from '../test-utils';
import { SettingsScreen } from './settings-screen';

async function renderScreen() {
  const result = renderWithServices(<SettingsScreen />);
  await screen.findByRole('heading', { name: 'Налаштування' });
  return result;
}

async function replaceText(label: string, text: string) {
  const user = userEvent.setup();
  const input = screen.getByLabelText(label);
  await user.clear(input);
  if (text) await user.type(input, text);
  return { user, input };
}

describe('SettingsScreen', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows the default values formatted for the locale', async () => {
    await renderScreen();

    expect(screen.getByLabelText('Погодинна ставка')).toHaveValue('31,40');
    expect(screen.getByLabelText('Emerytalna')).toHaveValue('9,76');
    expect(screen.getByLabelText('Rentowa')).toHaveValue('1,5');
    expect(screen.getByLabelText('Chorobowa')).toHaveValue('2,45');
    expect(screen.getByLabelText('Zdrowotna')).toHaveValue('9');
    expect(screen.getByLabelText('KUP')).toHaveValue('20');
    expect(screen.getByLabelText('Ставка PIT')).toHaveValue('12');
    expect(screen.getByLabelText('PIT-2')).toHaveValue('300,00');
  });

  it.each([
    ['Погодинна ставка', '42,50', (s: typeof DEFAULT_SETTINGS) => s.hourlyRate, 4250],
    ['Погодинна ставка', '42.5', (s: typeof DEFAULT_SETTINGS) => s.hourlyRate, 4250],
    ['Emerytalna', '10,1', (s: typeof DEFAULT_SETTINGS) => s.rates.emerytalna, 1010],
    ['Rentowa', '2', (s: typeof DEFAULT_SETTINGS) => s.rates.rentowa, 200],
    ['Chorobowa', '0', (s: typeof DEFAULT_SETTINGS) => s.rates.chorobowa, 0],
    ['Zdrowotna', '4,9', (s: typeof DEFAULT_SETTINGS) => s.rates.zdrowotna, 490],
    ['KUP', '50', (s: typeof DEFAULT_SETTINGS) => s.rates.kup, 5000],
    ['Ставка PIT', '32', (s: typeof DEFAULT_SETTINGS) => s.rates.pit, 3200],
    ['Погодинна ставка', '100000000', (s: typeof DEFAULT_SETTINGS) => s.hourlyRate, 100_000_000_00],
    ['Emerytalna', '150,5', (s: typeof DEFAULT_SETTINGS) => s.rates.emerytalna, 15050],
    ['PIT-2', '150,75', (s: typeof DEFAULT_SETTINGS) => s.rates.pit2Relief, 15075],
  ])('saves %s = %s after a pause in typing', async (label, text, select, expected) => {
    const { services } = await renderScreen();

    await replaceText(label, text);

    await expect.poll(async () => select(await services.getSettings())).toBe(expected);
  });

  it('normalises the display on blur', async () => {
    await renderScreen();

    const { user, input } = await replaceText('Погодинна ставка', '42.5');
    await user.tab();

    await waitFor(() => expect(input).toHaveValue('42,50'));
  });

  it.each([
    ['negative', 'Emerytalna', '-1'],
    ['not a number', 'Emerytalna', 'abc'],
    ['too many decimals', 'Emerytalna', '1,234'],
    ['empty', 'Emerytalna', ''],
    ['beyond safe precision', 'Погодинна ставка', '999999999999999999'],
  ])('shows an error and saves nothing when %s', async (_name, label, text) => {
    const { services } = await renderScreen();

    const { user, input } = await replaceText(label, text);

    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('alert')).toBeVisible();

    const before = input.getAttribute('value');
    expect(before).toBe(text);

    // Blur restores the saved value and clears the error.
    await user.tab();
    await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument());
    expect(await services.getSettings()).toEqual(DEFAULT_SETTINGS);
  });

  it('switches language, translating the screen and formatting numbers', async () => {
    const { services } = await renderScreen();
    const user = userEvent.setup();

    await user.click(screen.getByRole('radio', { name: 'EN' }));

    expect(await screen.findByRole('heading', { name: 'Settings' })).toBeInTheDocument();
    expect(screen.getByLabelText('Hourly rate')).toHaveValue('31.40');
    // Polish tax terms stay in Polish in every locale.
    expect(screen.getByLabelText('Emerytalna')).toHaveValue('9.76');
    expect(document.documentElement.lang).toBe('en');
    expect((await services.getSettings()).language).toBe('en');
  });

  it('follows the system theme until the user chooses one', async () => {
    const { services } = await renderScreen();
    const user = userEvent.setup();

    const theme = screen.getByRole('radiogroup', { name: 'Тема' });
    expect(within(theme).getByRole('radio', { name: 'Світла' })).toBeChecked();
    expect(document.documentElement).not.toHaveAttribute('data-theme');

    await user.click(within(theme).getByRole('radio', { name: 'Темна' }));

    await waitFor(() => expect(document.documentElement).toHaveAttribute('data-theme', 'dark'));
    expect(within(theme).getByRole('radio', { name: 'Темна' })).toBeChecked();
    expect((await services.getSettings()).theme).toBe('dark');
  });

  it('resets values after confirmation, keeping language and theme', async () => {
    const { services } = await renderScreen();
    await services.updateSettings({ hourlyRate: 5000, theme: 'dark', rates: { pit: 3200 } });
    await waitFor(() => expect(screen.getByLabelText('Погодинна ставка')).toHaveValue('50,00'));
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true);

    await userEvent.click(screen.getByRole('button', { name: 'Скинути до стандартних значень' }));

    expect(confirm).toHaveBeenCalledOnce();
    await waitFor(() => expect(screen.getByLabelText('Погодинна ставка')).toHaveValue('31,40'));
    expect(await services.getSettings()).toEqual({ ...DEFAULT_SETTINGS, theme: 'dark' });
  });

  it('does not reset when the confirmation is declined', async () => {
    const { services } = await renderScreen();
    await services.updateSettings({ hourlyRate: 5000 });
    vi.spyOn(window, 'confirm').mockReturnValue(false);

    await userEvent.click(screen.getByRole('button', { name: 'Скинути до стандартних значень' }));

    expect((await services.getSettings()).hourlyRate).toBe(5000);
  });

  it('restores saved settings on the next launch', async () => {
    const { services, unmount } = await renderScreen();
    await services.updateSettings({ hourlyRate: 5000, language: 'pl' });
    unmount();

    expect(await services.getSettings()).toMatchObject({ hourlyRate: 5000, language: 'pl' });
  });
});
