import { resetSettingsValues, type Settings } from '../../domain/settings';
import type { SettingsRepository } from '../ports/settings-repository';

export function resetSettings(repository: SettingsRepository): Promise<Settings> {
  return repository.update(resetSettingsValues);
}
