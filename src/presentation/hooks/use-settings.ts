import { createContext, useContext } from 'react';
import type { Settings } from '../../domain/settings';

export const SettingsContext = createContext<Settings | null>(null);

/** Current settings. They stay up to date with the database and are always loaded here. */
export function useSettings(): Settings {
  const settings = useContext(SettingsContext);
  if (!settings) throw new Error('useSettings must be used inside SettingsProvider');
  return settings;
}
