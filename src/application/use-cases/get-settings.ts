import type { Settings } from '../../domain/settings';
import type { SettingsRepository } from '../ports/settings-repository';

export function getSettings(repository: SettingsRepository): Promise<Settings> {
  return repository.load();
}
