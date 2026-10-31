import '@fontsource-variable/inter/wght.css';
import './presentation/theme/theme.css';
import './presentation/i18n/i18n';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createServices } from './composition-root';
import { requestPersistentStorage } from './infrastructure/db/persistent-storage';
import { App } from './presentation/app/app';
import { SettingsProvider } from './presentation/app/settings-provider';
import { ServicesContext } from './presentation/hooks/use-services';

const root = document.getElementById('root');
if (!root) throw new Error('Root element #root not found');

void requestPersistentStorage();

createRoot(root).render(
  <StrictMode>
    <ServicesContext value={createServices()}>
      <SettingsProvider>
        <App />
      </SettingsProvider>
    </ServicesContext>
  </StrictMode>,
);
