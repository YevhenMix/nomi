import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createCalculation, type Calculation } from '../../domain/calculation';
import { calculateSalary } from '../../domain/salary-calculator';
import { DEFAULT_SETTINGS, type Settings } from '../../domain/settings';
import { jsonBackupSerializer } from '../../infrastructure/backup/json-backup-serializer';
import { renderWithServices } from '../test-utils';
import { HistoryScreen } from './history-screen';

function record(id: string, date: Date, hours: number, settings: Settings = DEFAULT_SETTINGS) {
  return createCalculation(id, date, calculateSalary(hours, settings.hourlyRate, settings.rates)!);
}

const OCT = record('oct', new Date(2026, 9, 31, 12), 192.3);
const SEP = record('sep', new Date(2026, 8, 30, 12), 168);
const OLD_SETTINGS: Settings = {
  ...DEFAULT_SETTINGS,
  hourlyRate: 3050,
  rates: { ...DEFAULT_SETTINGS.rates, pit: 1700 },
};
const AUG = record('aug', new Date(2026, 7, 31, 12), 176, OLD_SETTINGS);

async function renderScreen(records: Calculation[] = []) {
  const result = renderWithServices(<HistoryScreen />);
  await result.db.calculations.bulkAdd(records);
  await screen.findByRole('heading', { name: 'Історія' });
  await screen.findByText(new RegExp(`^${records.length} розрахун`));
  return { ...result, user: userEvent.setup() };
}

const rowButton = (name: RegExp) => screen.getByRole('button', { name });
const fileInput = () => screen.getByLabelText('Імпорт JSON', { selector: 'input' });
const jsonFile = (content: string) =>
  new File([content], 'backup.json', { type: 'application/json' });
const backup = (calculations: Calculation[], settings = DEFAULT_SETTINGS) =>
  jsonBackupSerializer.serialize({
    exportedAt: '2026-10-31T12:00:00.000Z',
    settings,
    calculations,
  });

function valueRow(container: HTMLElement, label: string): HTMLElement {
  const rows = [...container.querySelectorAll<HTMLElement>('.value-row')];
  const row = rows.find((candidate) => candidate.querySelector('dt')?.textContent === label);
  if (!row) throw new Error(`No value row for ${label}`);
  return row;
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('HistoryScreen', () => {
  describe('list', () => {
    it('shows an empty state', async () => {
      await renderScreen();

      expect(screen.getByText('0 розрахунків · зберігаються на цьому пристрої')).toBeVisible();
      expect(screen.getByText('Збережених розрахунків ще немає')).toBeVisible();
      expect(screen.queryByRole('list')).not.toBeInTheDocument();
    });

    it.each([
      [1, '1 розрахунок · зберігається на цьому пристрої'],
      [3, '3 розрахунки · зберігаються на цьому пристрої'],
    ])('uses the right plural for %i', async (count, text) => {
      const records = [OCT, SEP, AUG].slice(0, count);
      await renderScreen(records);

      expect(screen.getByText(text)).toBeVisible();
    });

    it('shows newest first, with the summary from the design', async () => {
      await renderScreen([AUG, OCT, SEP]);

      const rows = screen.getAllByRole('listitem');
      expect(rows.map((row) => within(row).getAllByText(/2026/)[0]?.textContent)).toEqual([
        '31 жовтня 2026',
        '30 вересня 2026',
        '31 серпня 2026',
      ]);
      const first = within(rows[0]!);
      expect(first.getByText('192,3 год · 31,40 zł/год')).toBeVisible();
      expect(first.getByText(/4\s541,45 zł/)).toBeVisible();
      expect(first.getByText(/brutto 6\s038,22/)).toBeVisible();
    });

    it('has no badge on a record with different values', async () => {
      await renderScreen([AUG]);

      expect(screen.queryByText(/інші ставки/i)).not.toBeInTheDocument();
    });

    it('updates when a record is saved elsewhere', async () => {
      const { db } = await renderScreen([OCT]);

      await db.calculations.add(SEP);

      expect(await screen.findByText(/^2 розрахунки/)).toBeVisible();
    });
  });

  describe('opening a record', () => {
    it('expands in place without a modal, and collapses again', async () => {
      const { user } = await renderScreen([OCT]);
      const summary = rowButton(/31 жовтня 2026/);
      expect(summary).toHaveAttribute('aria-expanded', 'false');
      expect(screen.queryByText('Значення розрахунку')).not.toBeInTheDocument();

      await user.click(summary);

      expect(summary).toHaveAttribute('aria-expanded', 'true');
      expect(screen.getByText('Значення розрахунку')).toBeVisible();
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(document.getElementById(summary.getAttribute('aria-controls')!)).toBeVisible();

      await user.click(summary);

      expect(screen.queryByText('Значення розрахунку')).not.toBeInTheDocument();
    });

    it('keeps everything inside that one row', async () => {
      const { user } = await renderScreen([OCT, SEP]);

      await user.click(rowButton(/31 жовтня 2026/));

      const [first, second] = screen.getAllByRole('listitem');
      const open = within(first!);
      expect(open.getByText('Значення розрахунку')).toBeVisible();
      expect(open.getByRole('heading', { name: 'Податок PIT' })).toBeVisible();
      expect(open.getByRole('button', { name: 'Видалити запис' })).toBeVisible();
      expect(within(second!).queryByText('Значення розрахунку')).not.toBeInTheDocument();
    });

    it('lists every value used, and all lines of the snapshot', async () => {
      const { user } = await renderScreen([OCT]);

      await user.click(rowButton(/31 жовтня 2026/));

      const row = screen.getByRole('listitem');
      const values: [string, string][] = [
        ['Кількість годин', '192,3 год'],
        ['Погодинна ставка', '31,40 zł'],
        ['Rentowa', '1,5%'],
        ['Chorobowa', '2,45%'],
        ['Ставка PIT', '12%'],
        ['PIT-2', '300,00 zł'],
      ];
      for (const [label, value] of values) {
        expect(valueRow(row, label)).toHaveTextContent(value);
      }
      expect(row.querySelectorAll('.value-row')).toHaveLength(9);
      expect(row.querySelectorAll('.details-row')).toHaveLength(14);
    });

    it('says when the values match the current settings', async () => {
      const { user } = await renderScreen([OCT]);

      await user.click(rowButton(/31 жовтня 2026/));

      expect(screen.getByText('Збігаються з поточними налаштуваннями')).toBeVisible();
      expect(document.querySelector('.value-row[data-changed]')).toBeNull();
      expect(screen.queryByText(/^Зараз:/)).not.toBeInTheDocument();
    });

    it('highlights only the values that differ, with the current value', async () => {
      const { user } = await renderScreen([AUG]);

      await user.click(rowButton(/31 серпня 2026/));

      const row = screen.getByRole('listitem');
      expect(
        screen.getByText('Виділені значення відрізняються від поточних налаштувань'),
      ).toBeVisible();
      const rate = valueRow(row, 'Погодинна ставка');
      expect(rate).toHaveAttribute('data-changed');
      expect(rate).toHaveTextContent('30,50 zł');
      expect(rate).toHaveTextContent('Зараз: 31,40 zł');
      const pit = valueRow(row, 'Ставка PIT');
      expect(pit).toHaveAttribute('data-changed');
      expect(pit).toHaveTextContent('17%');
      expect(pit).toHaveTextContent('Зараз: 12%');
      expect(row.querySelectorAll('.value-row[data-changed]')).toHaveLength(2);
      expect(valueRow(row, 'Кількість годин')).not.toHaveAttribute('data-changed');
    });

    it('compares live with Settings, but never changes the snapshot', async () => {
      const { user, services, db } = await renderScreen([OCT]);
      await user.click(rowButton(/31 жовтня 2026/));

      await services.updateSettings({ hourlyRate: 4000 });

      const row = screen.getByRole('listitem');
      await waitFor(() =>
        expect(valueRow(row, 'Погодинна ставка')).toHaveTextContent('Зараз: 40,00 zł'),
      );
      expect(valueRow(row, 'Погодинна ставка')).toHaveTextContent('31,40 zł');
      expect((await db.calculations.get('oct'))?.hourlyRate).toBe(3140);
    });
  });

  describe('deleting', () => {
    it('removes the record after confirmation', async () => {
      const { user, db } = await renderScreen([OCT, SEP]);
      vi.spyOn(window, 'confirm').mockReturnValue(true);
      await user.click(rowButton(/31 жовтня 2026/));

      await user.click(screen.getByRole('button', { name: 'Видалити запис' }));

      expect(await screen.findByRole('status')).toHaveTextContent('Запис видалено');
      await waitFor(() => expect(screen.getAllByRole('listitem')).toHaveLength(1));
      expect((await db.calculations.toArray()).map((c) => c.id)).toEqual(['sep']);
    });

    it('keeps the record when the confirmation is declined', async () => {
      const { user, db } = await renderScreen([OCT]);
      vi.spyOn(window, 'confirm').mockReturnValue(false);
      await user.click(rowButton(/31 жовтня 2026/));

      await user.click(screen.getByRole('button', { name: 'Видалити запис' }));

      expect(await db.calculations.count()).toBe(1);
      expect(screen.getByRole('listitem')).toBeVisible();
    });
  });

  describe('export', () => {
    it('downloads a dated backup that can be imported again', async () => {
      const blobs: Blob[] = [];
      const fileNames: string[] = [];
      URL.createObjectURL = (blob) => {
        blobs.push(blob as Blob);
        return 'blob:test';
      };
      URL.revokeObjectURL = () => undefined;
      vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (
        this: HTMLAnchorElement,
      ) {
        fileNames.push(this.download);
      });
      const { user } = await renderScreen([OCT, SEP]);

      await user.click(screen.getByRole('button', { name: 'Експорт JSON' }));

      expect(await screen.findByRole('status')).toHaveTextContent('збережено');
      expect(fileNames[0]).toMatch(/^moya-zarplata-\d{4}-\d{2}-\d{2}\.json$/);
      const contents = jsonBackupSerializer.parse(await blobs[0]!.text());
      expect(contents.calculations.map((c) => c.id).sort()).toEqual(['oct', 'sep']);
      expect(contents.settings).toEqual(DEFAULT_SETTINGS);
    });

    it('reports a failure', async () => {
      URL.createObjectURL = () => {
        throw new Error('no space');
      };
      const { user } = await renderScreen();

      await user.click(screen.getByRole('button', { name: 'Експорт JSON' }));

      expect(await screen.findByRole('status')).toHaveTextContent('Не вдалося експортувати');
    });
  });

  describe('import', () => {
    it('adds new records, skips existing ones, and reports the count', async () => {
      const { user, services } = await renderScreen([OCT]);
      await services.updateSettings({ theme: 'light' });

      await user.upload(fileInput(), jsonFile(backup([OCT, SEP, AUG])));

      expect(await screen.findByRole('status')).toHaveTextContent('Імпортовано записів: 2');
      await waitFor(() => expect(screen.getAllByRole('listitem')).toHaveLength(3));
    });

    it('restores settings on a device with none saved', async () => {
      const { user, services } = await renderScreen();

      await user.upload(
        fileInput(),
        jsonFile(backup([SEP], { ...DEFAULT_SETTINGS, hourlyRate: 5000 })),
      );

      expect(await screen.findByRole('status')).toHaveTextContent(
        'Імпортовано записів: 1. Налаштування відновлено',
      );
      expect((await services.getSettings()).hourlyRate).toBe(5000);
    });

    it('shows the result in the language restored from the file', async () => {
      const { user } = await renderScreen();

      await user.upload(
        fileInput(),
        jsonFile(backup([SEP], { ...DEFAULT_SETTINGS, language: 'en' })),
      );

      expect(await screen.findByRole('heading', { name: 'History' })).toBeVisible();
      expect(screen.getByRole('status')).toHaveTextContent(
        'Records imported: 1. Settings restored',
      );
    });

    it('does not overwrite settings already in use', async () => {
      const { user, services } = await renderScreen();
      await services.updateSettings({ hourlyRate: 4000 });

      await user.upload(
        fileInput(),
        jsonFile(backup([SEP], { ...DEFAULT_SETTINGS, hourlyRate: 5000 })),
      );

      expect(await screen.findByRole('status')).toHaveTextContent('Імпортовано записів: 1');
      expect((await services.getSettings()).hourlyRate).toBe(4000);
    });

    it('says when there is nothing new', async () => {
      const { user, services } = await renderScreen([OCT]);
      await services.updateSettings({ theme: 'light' });

      await user.upload(fileInput(), jsonFile(backup([OCT])));

      expect(await screen.findByRole('status')).toHaveTextContent('Нових записів у файлі немає');
    });

    it('rejects an invalid file and imports nothing, even valid records in it', async () => {
      const { user, db } = await renderScreen();
      const file = JSON.parse(backup([SEP])) as { calculations: unknown[] };
      file.calculations.push({ id: 'broken' });

      await user.upload(fileInput(), jsonFile(JSON.stringify(file)));

      expect(await screen.findByRole('status')).toHaveTextContent(
        'не є коректною резервною копією',
      );
      expect(await db.calculations.count()).toBe(0);
      expect(await db.settings.count()).toBe(0);
    });

    it('rejects a non-JSON file', async () => {
      const { user } = await renderScreen();

      await user.upload(fileInput(), jsonFile('not json'));

      expect(await screen.findByRole('status')).toHaveTextContent(
        'не є коректною резервною копією',
      );
    });

    it('rejects an unknown schema version with its own message', async () => {
      const { user, db } = await renderScreen();
      const file = JSON.stringify({ ...(JSON.parse(backup([SEP])) as object), schemaVersion: 2 });

      await user.upload(fileInput(), jsonFile(file));

      expect(await screen.findByRole('status')).toHaveTextContent('версія файлу не підтримується');
      expect(await db.calculations.count()).toBe(0);
    });

    it('accepts the same file chosen twice in a row', async () => {
      const { user, services } = await renderScreen();
      await services.updateSettings({ theme: 'light' });
      const file = jsonFile(backup([SEP]));

      await user.upload(fileInput(), file);
      expect(await screen.findByRole('status')).toHaveTextContent('Імпортовано записів: 1');

      await user.upload(fileInput(), file);
      expect(await screen.findByText('Нових записів у файлі немає')).toBeVisible();
    });
  });

  it('formats for the active language, keeping Polish terms', async () => {
    const { user, services } = await renderScreen([OCT]);
    await services.updateSettings({ language: 'en' });

    await screen.findByText('1 calculation · stored on this device');
    await user.click(rowButton(/October 31, 2026/));

    expect(screen.getByText('Values used')).toBeVisible();
    expect(screen.getByText('192.3 h · 31.40 zł/h')).toBeVisible();
    expect(screen.getAllByText('Emerytalna').length).toBeGreaterThan(0);
  });
});
