import { STORAGE_KEYS } from './storageKeys';
import { readJson, writeJson } from './jsonStore';

export interface ActivityEntry {
  id: string;
  accion: string;
  detalle: string;
  fecha: string;
  usuario: string;
}

const MAX_ENTRIES = 120;

export const activityStorage = {
  getLog: <T = ActivityEntry>(): T[] => readJson<T[]>(STORAGE_KEYS.ACTIVITY_LOG, []),
  clear: (): void => writeJson(STORAGE_KEYS.ACTIVITY_LOG, []),
  push: (accion: string, detalle: string): void => {
    const log = readJson<ActivityEntry[]>(STORAGE_KEYS.ACTIVITY_LOG, []);
    log.unshift({ id: `act_${Date.now()}`, accion, detalle, fecha: new Date().toISOString(), usuario: 'Admin' });
    writeJson(STORAGE_KEYS.ACTIVITY_LOG, log.slice(0, MAX_ENTRIES));
  },
  seed: (entries: ActivityEntry[]): void => writeJson(STORAGE_KEYS.ACTIVITY_LOG, entries),
};
