import type { ReservaData } from '../../features/reservations/types';
import { STORAGE_KEYS } from './storageKeys';
import { readJson, writeJson } from './jsonStore';

export const reservationStorage = {
  getAll: <T = ReservaData>(): T[] => readJson<T[]>(STORAGE_KEYS.RESERVATIONS, []),
  saveAll: <T>(reservations: T[]): void => writeJson(STORAGE_KEYS.RESERVATIONS, reservations),
};
