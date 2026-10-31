import type { Calculation } from '../../domain/calculation';
import type { Settings } from '../../domain/settings';

export interface BackupContents {
  /** ISO 8601 timestamp. */
  exportedAt: string;
  settings: Settings;
  calculations: Calculation[];
}

export type BackupErrorReason = 'invalid-file' | 'unsupported-version';

export class BackupError extends Error {
  readonly reason: BackupErrorReason;

  constructor(reason: BackupErrorReason) {
    super(`Backup file rejected: ${reason}`);
    this.name = 'BackupError';
    this.reason = reason;
  }
}

export interface BackupSerializer {
  serialize(contents: BackupContents): string;
  /** Validates the whole file. Throws BackupError, so nothing is ever partly imported. */
  parse(fileText: string): BackupContents;
}
