import '@fontsource-variable/inter/wght.css';
import './presentation/theme/theme.css';
import './presentation/i18n/i18n';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './presentation/app/app';

const root = document.getElementById('root');
if (!root) throw new Error('Root element #root not found');

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
