import { STORAGE_KEYS } from './storageKeys';
import { readJson, writeJson } from './jsonStore';

export interface StoredReview {
  id: string;
  nombre: string;
  rating: number;
  comentario: string;
  fecha: string;
  estado: string;
  [key: string]: unknown;
}

export const reviewStorage = {
  getAll: <T = StoredReview>(): T[] => readJson<T[]>(STORAGE_KEYS.REVIEWS, []),
  saveAll: <T>(reviews: T[]): void => writeJson(STORAGE_KEYS.REVIEWS, reviews),
  getAdmin: <T = StoredReview>(): T[] => readJson<T[]>(STORAGE_KEYS.REVIEWS_ADMIN, []),
  saveAdmin: <T>(reviews: T[]): void => writeJson(STORAGE_KEYS.REVIEWS_ADMIN, reviews),
};
