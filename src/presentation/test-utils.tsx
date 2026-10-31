import { render } from '@testing-library/react';
import { StrictMode, type ReactNode } from 'react';
import { createAppServices } from '../application/app-services';
import { AppDatabase } from '../infrastructure/db/database';
import { DexieCalculationRepository } from '../infrastructure/db/dexie-calculation-repository';
import { DexieSettingsRepository } from '../infrastructure/db/dexie-settings-repository';
import { randomIdGenerator } from '../infrastructure/random-id-generator';
import { systemClock } from '../infrastructure/system-clock';
import { SettingsProvider } from './app/settings-provider';
import { ServicesContext } from './hooks/use-services';

/** Renders UI with real use cases on a fresh in-memory database. */
export function renderWithServices(ui: ReactNode) {
  const db = new AppDatabase(`test-${crypto.randomUUID()}`);
  const services = createAppServices({
    settingsRepository: new DexieSettingsRepository(db),
    calculationRepository: new DexieCalculationRepository(db),
    clock: systemClock,
    idGenerator: randomIdGenerator,
  });
  const view = render(
    // StrictMode, as in main.tsx: it runs effects twice in development.
    <StrictMode>
      <ServicesContext value={services}>
        <SettingsProvider>{ui}</SettingsProvider>
      </ServicesContext>
    </StrictMode>,
  );
  return { ...view, services, db };
}
