import type { Settings, SettingsPatch } from '../domain/settings';
import type { SettingsRepository } from './ports/settings-repository';
import { getSettings } from './use-cases/get-settings';
import { resetSettings } from './use-cases/reset-settings';
import { updateSettings } from './use-cases/update-settings';

/** The use cases available to the presentation layer, already bound to their ports. */
export interface AppServices {
  getSettings: () => Promise<Settings>;
  updateSettings: (patch: SettingsPatch) => Promise<Settings>;
  resetSettings: () => Promise<Settings>;
}

export interface AppPorts {
  settingsRepository: SettingsRepository;
}

export function createAppServices({ settingsRepository }: AppPorts): AppServices {
  return {
    getSettings: () => getSettings(settingsRepository),
    updateSettings: (patch) => updateSettings(settingsRepository, patch),
    resetSettings: () => resetSettings(settingsRepository),
  };
}
