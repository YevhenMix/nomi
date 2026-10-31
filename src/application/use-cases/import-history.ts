import type { BackupSerializer } from '../ports/backup-serializer';
import type { CalculationRepository } from '../ports/calculation-repository';
import type { SettingsRepository } from '../ports/settings-repository';

interface ImportHistoryPorts {
  calculationRepository: CalculationRepository;
  settingsRepository: SettingsRepository;
  backupSerializer: BackupSerializer;
}

export interface ImportResult {
  importedCount: number;
  settingsRestored: boolean;
}

/**
 * Merges a backup into this device. Records are matched by id, so importing a file twice is safe.
 * The file's settings only apply on a device with none saved, such as when restoring onto a new
 * phone; they never overwrite settings already in use.
 */
export async function importHistory(
  { calculationRepository, settingsRepository, backupSerializer }: ImportHistoryPorts,
  fileText: string,
): Promise<ImportResult> {
  const { calculations, settings } = backupSerializer.parse(fileText);
  return {
    importedCount: await calculationRepository.addMissing(calculations),
    settingsRestored: await settingsRepository.saveIfMissing(settings),
  };
}
