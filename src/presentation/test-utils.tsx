import { render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { createAppServices } from '../application/app-services';
import { AppDatabase } from '../infrastructure/db/database';
import { DexieSettingsRepository } from '../infrastructure/db/dexie-settings-repository';
import { SettingsProvider } from './app/settings-provider';
import { ServicesContext } from './hooks/use-services';

/** Renders UI with real use cases on a fresh in-memory database. */
export function renderWithServices(ui: ReactNode) {
  const db = new AppDatabase(`test-${crypto.randomUUID()}`);
  const services = createAppServices({ settingsRepository: new DexieSettingsRepository(db) });
  const view = render(
    <ServicesContext value={services}>
      <SettingsProvider>{ui}</SettingsProvider>
    </ServicesContext>,
  );
  return { ...view, services };
}
