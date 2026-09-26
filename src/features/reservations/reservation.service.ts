import type { ReservaData } from './types';
import { reservationStorage } from '../../services/storage/reservationStorage';

/** Fachada de reservas. Hoy lee localStorage; mañana: /api/reservations. */
export const reservationService = {
  getAll: <T = ReservaData>(): T[] => reservationStorage.getAll<T>(),
  saveAll: <T>(reservations: T[]): void => reservationStorage.saveAll(reservations),
  findById: (id: string): ReservaData | undefined =>
    reservationStorage.getAll<ReservaData>().find((r) => r.id === id),
};
