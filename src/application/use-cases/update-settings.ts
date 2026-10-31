import {
  applySettingsPatch,
  InvalidSettingsError,
  isValidSettings,
  type Settings,
  type SettingsPatch,
} from '../../domain/settings';
import type { SettingsRepository } from '../ports/settings-repository';

export function updateSettings(
  repository: SettingsRepository,
  patch: SettingsPatch,
): Promise<Settings> {
  return repository.update((current) => {
    const next = applySettingsPatch(current, patch);
    if (!isValidSettings(next)) throw new InvalidSettingsError();
    return next;
  });
}
