import type { IProduct } from '../../features/products/types';
import { STORAGE_KEYS } from './storageKeys';
import { readJson, writeJson } from './jsonStore';

export const productStorage = {
  getAll: (): IProduct[] => readJson<IProduct[]>(STORAGE_KEYS.PRODUCTS, []),
  saveAll: (items: IProduct[]): void => writeJson(STORAGE_KEYS.PRODUCTS, items),
  getCategories: (): string[] => readJson<string[]>(STORAGE_KEYS.CATEGORIES, []),
  saveCategories: (categories: string[]): void => writeJson(STORAGE_KEYS.CATEGORIES, categories),
};
