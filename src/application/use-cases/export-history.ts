import type { BackupSerializer } from '../ports/backup-serializer';
import type { CalculationRepository } from '../ports/calculation-repository';
import type { Clock } from '../ports/clock';
import type { SettingsRepository } from '../ports/settings-repository';

interface ExportHistoryPorts {
  calculationRepository: CalculationRepository;
  settingsRepository: SettingsRepository;
  clock: Clock;
  backupSerializer: BackupSerializer;
}

export interface ExportedFile {
  fileName: string;
  content: string;
}

function toLocalDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

export async function exportHistory({
  calculationRepository,
  settingsRepository,
  clock,
  backupSerializer,
}: ExportHistoryPorts): Promise<ExportedFile> {
  const now = clock.now();
  return {
    fileName: `moya-zarplata-${toLocalDate(now)}.json`,
    content: backupSerializer.serialize({
      exportedAt: now.toISOString(),
      settings: await settingsRepository.load(),
      calculations: await calculationRepository.list(),
    }),
  };
}
