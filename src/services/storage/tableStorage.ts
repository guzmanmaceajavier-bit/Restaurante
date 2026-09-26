import { STORAGE_KEYS } from './storageKeys';
import { readJson, writeJson } from './jsonStore';

export interface StoredTable {
  id: string;
  estado: string;
  [key: string]: unknown;
}

export const tableStorage = {
  getAll: <T = StoredTable>(): T[] => readJson<T[]>(STORAGE_KEYS.TABLES, []),
  saveAll: <T>(tables: T[]): void => writeJson(STORAGE_KEYS.TABLES, tables),
};
