import { useLiveQuery } from 'dexie-react-hooks';
import type { ReactNode } from 'react';
import { useApplyAppearance } from '../hooks/use-apply-appearance';
import { useServices } from '../hooks/use-services';
import { SettingsContext } from '../hooks/use-settings';

/** Loads settings once, keeps them live, and holds rendering until they are available. */
export function SettingsProvider({ children }: { children: ReactNode }) {
  const { getSettings } = useServices();
  const settings = useLiveQuery(() => getSettings(), [getSettings]);
  useApplyAppearance(settings);

  if (!settings) return null;
  return <SettingsContext value={settings}>{children}</SettingsContext>;
}
