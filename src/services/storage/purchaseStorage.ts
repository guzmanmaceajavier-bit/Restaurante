import { STORAGE_KEYS } from './storageKeys';
import { readJson, writeJson } from './jsonStore';

export interface StoredPurchase {
  id: string;
  [key: string]: unknown;
}

export interface StoredSupplier {
  id?: string;
  nombre: string;
  [key: string]: unknown;
}

export const purchaseStorage = {
  getPurchases: <T = StoredPurchase>(): T[] => readJson<T[]>(STORAGE_KEYS.PURCHASES, []),
  savePurchases: <T>(purchases: T[]): void => writeJson(STORAGE_KEYS.PURCHASES, purchases),
  getSuppliers: <T = StoredSupplier>(): T[] => readJson<T[]>(STORAGE_KEYS.SUPPLIERS, []),
  saveSuppliers: <T>(suppliers: T[]): void => writeJson(STORAGE_KEYS.SUPPLIERS, suppliers),
};
