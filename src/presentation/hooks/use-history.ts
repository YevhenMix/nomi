import { useLiveQuery } from 'dexie-react-hooks';
import type { Calculation } from '../../domain/calculation';
import { useServices } from './use-services';

/** Saved calculations, newest first, kept live. Undefined while they first load. */
export function useHistory(): Calculation[] | undefined {
  const { listHistory } = useServices();
  return useLiveQuery(() => listHistory(), [listHistory]);
}
