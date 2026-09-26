import { STORAGE_KEYS } from './storageKeys';
import { readJson, writeJson } from './jsonStore';

export interface StoredCustomer {
  id: string;
  nombre: string;
  telefono: string;
  email: string;
  [key: string]: unknown;
}

export const customerStorage = {
  getAll: <T = StoredCustomer>(): T[] => readJson<T[]>(STORAGE_KEYS.CUSTOMERS, []),
  saveAll: <T>(customers: T[]): void => writeJson(STORAGE_KEYS.CUSTOMERS, customers),
  getAdmin: <T = StoredCustomer>(): T[] => readJson<T[]>(STORAGE_KEYS.CUSTOMERS_ADMIN, []),
  saveAdmin: <T>(customers: T[]): void => writeJson(STORAGE_KEYS.CUSTOMERS_ADMIN, customers),
};
