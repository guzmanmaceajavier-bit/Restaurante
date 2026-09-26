import { authStorage } from '../services/storage/authStorage';
import { orderStorage } from '../services/storage/orderStorage';
import { reservationStorage } from '../services/storage/reservationStorage';
import { reviewStorage } from '../services/storage/reviewStorage';

/**
 * Fachada de compatibilidad. La lógica vive en services/storage/*.
 * Los componentes que aún usan `storage` no cambian; la migración
 * a features/*.service es progresiva (ver docs/architecture/data-layer.md).
 */
export const storage = {
  getReservas: <T = unknown>(): T[] => reservationStorage.getAll<T>(),
  setReservas: <T>(data: T[]): void => reservationStorage.saveAll(data),
  getOrdenes: <T = unknown>(): T[] => orderStorage.getAll<T>(),
  setOrdenes: <T>(data: T[]): void => orderStorage.saveAll(data),
  isAdmin: (): boolean => authStorage.isAdmin(),
  setAdmin: (value: boolean, name?: string): void => authStorage.setAdmin(value, name),
  getAdminName: (): string | null => authStorage.getAdminName(),
  clearAdmin: (): void => authStorage.clearAdmin(),
  getResenas: <T = unknown>(): T[] => reviewStorage.getAll<T>(),
  setResenas: <T>(data: T[]): void => reviewStorage.saveAll(data),
};
