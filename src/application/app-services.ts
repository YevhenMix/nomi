import type { Calculation } from '../domain/calculation';
import type { SalaryBreakdown } from '../domain/salary-calculator';
import type { Settings, SettingsPatch } from '../domain/settings';
import type { BackupSerializer } from './ports/backup-serializer';
import type { CalculationRepository } from './ports/calculation-repository';
import type { Clock } from './ports/clock';
import type { IdGenerator } from './ports/id-generator';
import type { SettingsRepository } from './ports/settings-repository';
import { calculateSalary } from './use-cases/calculate-salary';
import { deleteCalculation } from './use-cases/delete-calculation';
import { exportHistory, type ExportedFile } from './use-cases/export-history';
import { getSettings } from './use-cases/get-settings';
import { importHistory, type ImportResult } from './use-cases/import-history';
import { listHistory } from './use-cases/list-history';
import { resetSettings } from './use-cases/reset-settings';
import { saveCalculation } from './use-cases/save-calculation';
import { updateSettings } from './use-cases/update-settings';

/** The use cases available to the presentation layer, already bound to their ports. */
export interface AppServices {
  getSettings: () => Promise<Settings>;
  updateSettings: (patch: SettingsPatch) => Promise<Settings>;
  resetSettings: () => Promise<Settings>;
  calculateSalary: (hours: number, settings: Settings) => SalaryBreakdown | null;
  saveCalculation: (breakdown: SalaryBreakdown) => Promise<Calculation>;
  listHistory: () => Promise<Calculation[]>;
  deleteCalculation: (id: string) => Promise<void>;
  exportHistory: () => Promise<ExportedFile>;
  importHistory: (fileText: string) => Promise<ImportResult>;
}

export interface AppPorts {
  settingsRepository: SettingsRepository;
  calculationRepository: CalculationRepository;
  clock: Clock;
  idGenerator: IdGenerator;
  backupSerializer: BackupSerializer;
}

export function createAppServices(ports: AppPorts): AppServices {
  const { settingsRepository, calculationRepository } = ports;
  return {
    getSettings: () => getSettings(settingsRepository),
    updateSettings: (patch) => updateSettings(settingsRepository, patch),
    resetSettings: () => resetSettings(settingsRepository),
    calculateSalary,
    saveCalculation: (breakdown) => saveCalculation(ports, breakdown),
    listHistory: () => listHistory(calculationRepository),
    deleteCalculation: (id) => deleteCalculation(calculationRepository, id),
    exportHistory: () => exportHistory(ports),
    importHistory: (fileText) => importHistory(ports, fileText),
  };
}
