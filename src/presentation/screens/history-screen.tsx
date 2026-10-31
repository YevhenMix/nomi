import { useCallback, useRef, useState, type ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { BackupError } from '../../application/ports/backup-serializer';
import { Button } from '../components/button';
import { HistoryRow } from '../components/history-row';
import { ExportIcon, ImportIcon } from '../components/icons';
import { Toast } from '../components/toast';
import { downloadTextFile } from '../download-file';
import { useHistory } from '../hooks/use-history';
import { useServices } from '../hooks/use-services';
import './history-screen.css';

type ToastKey =
  | 'exported'
  | 'exportFailed'
  | 'imported'
  | 'importedWithSettings'
  | 'importNothingNew'
  | 'importInvalidFile'
  | 'importUnsupportedVersion'
  | 'importFailed'
  | 'deleted'
  | 'deleteFailed';

/** Translated when shown, because importing a backup can change the language. */
interface ToastMessage {
  key: ToastKey;
  imported?: number;
}

export function HistoryScreen() {
  const { t } = useTranslation();
  const { deleteCalculation, exportHistory, importHistory } = useServices();
  const calculations = useHistory();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const dismissToast = useCallback(() => setToast(null), []);

  async function handleExport() {
    try {
      const { fileName, content } = await exportHistory();
      downloadTextFile(fileName, content, 'application/json');
      setToast({ key: 'exported' });
    } catch {
      setToast({ key: 'exportFailed' });
    }
  }

  async function handleFileChosen(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    // Without this, choosing the same file again wouldn't fire a change event.
    event.target.value = '';
    if (!file) return;

    try {
      const { importedCount, settingsRestored } = await importHistory(await file.text());
      if (settingsRestored) {
        setToast({ key: 'importedWithSettings', imported: importedCount });
      } else if (importedCount > 0) {
        setToast({ key: 'imported', imported: importedCount });
      } else {
        setToast({ key: 'importNothingNew' });
      }
    } catch (error) {
      if (error instanceof BackupError) {
        setToast({
          key:
            error.reason === 'unsupported-version'
              ? 'importUnsupportedVersion'
              : 'importInvalidFile',
        });
      } else {
        setToast({ key: 'importFailed' });
      }
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm(t('history.deleteConfirm'))) return;
    try {
      await deleteCalculation(id);
      setToast({ key: 'deleted' });
    } catch {
      setToast({ key: 'deleteFailed' });
    }
  }

  return (
    <>
      <h1 className="screen-title">{t('history.title')}</h1>
      {calculations && (
        <p className="screen-subtitle">{t('history.subtitle', { count: calculations.length })}</p>
      )}

      <div className="history-actions">
        <Button onClick={() => fileInputRef.current?.click()}>
          <ImportIcon />
          {t('history.import')}
        </Button>
        <Button onClick={() => void handleExport()}>
          <ExportIcon />
          {t('history.export')}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          hidden
          aria-label={t('history.import')}
          onChange={(event) => void handleFileChosen(event)}
        />
      </div>

      {calculations?.length === 0 && (
        <div className="history-empty">
          <p className="history-empty__title">{t('history.empty')}</p>
          <p className="history-empty__hint">{t('history.emptyHint')}</p>
        </div>
      )}

      {calculations && calculations.length > 0 && (
        <ul className="history-list">
          {calculations.map((calculation) => (
            <HistoryRow
              key={calculation.id}
              calculation={calculation}
              onDelete={(id) => void handleDelete(id)}
            />
          ))}
        </ul>
      )}

      {toast && (
        <Toast
          message={t(`history.${toast.key}`, { imported: toast.imported })}
          onDismiss={dismissToast}
        />
      )}
    </>
  );
}
