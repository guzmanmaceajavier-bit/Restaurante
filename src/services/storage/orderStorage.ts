import type { Order } from '../../features/orders/types';
import { STORAGE_KEYS } from './storageKeys';
import { readJson, writeJson } from './jsonStore';

export const orderStorage = {
  getAll: <T = Order>(): T[] => readJson<T[]>(STORAGE_KEYS.ORDERS, []),
  saveAll: <T>(orders: T[]): void => writeJson(STORAGE_KEYS.ORDERS, orders),
};
