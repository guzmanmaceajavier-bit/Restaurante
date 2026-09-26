import type { ReservaData } from './types';
import { reservationStorage } from '../../services/storage/reservationStorage';

export interface FiltroReservas {
  busqueda: string;
  estado: string;
}

export type NuevaReserva = Omit<ReservaData, 'id' | 'createdAt'>;
export type ResultadoReserva =
  | { ok: true; reserva: ReservaData; reservas: ReservaData[] }
  | { ok: false; error: string; reservas?: undefined; reserva?: undefined };

function validarObligatorios(data: NuevaReserva): string | null {
  if (!data.nombre || !data.email || !data.telefono || !data.fecha || !data.hora) {
    return 'Completa obligatorios';
  }
  return null;
}

/**
 * Dominio de reservas: consultas, filtros, CRUD y cambios de estado.
 * Hoy persiste en localStorage vía adapters; mañana: /api/reservations.
 * Las páginas no tocan storage directamente.
 */
export const reservationService = {
  getAll: <T = ReservaData>(): T[] => reservationStorage.getAll<T>(),
  saveAll: <T>(reservations: T[]): void => reservationStorage.saveAll(reservations),

  findById: (id: string): ReservaData | undefined =>
    reservationStorage.getAll<ReservaData>().find((r) => r.id === id),

  filterReservas: (reservas: ReservaData[], filtro: FiltroReservas): ReservaData[] =>
    reservas.filter((r) => {
      if (filtro.estado && r.estado !== filtro.estado) return false;
      if (filtro.busqueda) {
        const q = filtro.busqueda.toLowerCase();
        return (
          r.nombre?.toLowerCase().includes(q) ||
          r.email?.toLowerCase().includes(q) ||
          r.telefono?.includes(q)
        );
      }
      return true;
    }),

  crearReserva: (data: NuevaReserva): ResultadoReserva => {
    const error = validarObligatorios(data);
    if (error) return { ok: false, error };
    const reserva: ReservaData = { ...data, id: `res_${Date.now()}`, createdAt: new Date().toISOString() };
    const reservas = [...reservationStorage.getAll<ReservaData>(), reserva];
    reservationStorage.saveAll(reservas);
    return { ok: true, reserva, reservas };
  },

  actualizarReserva: (id: string, data: NuevaReserva): ResultadoReserva => {
    const error = validarObligatorios(data);
    if (error) return { ok: false, error };
    const reservas = reservationStorage
      .getAll<ReservaData>()
      .map((r) => (r.id === id ? { ...r, ...data } : r));
    reservationStorage.saveAll(reservas);
    const reserva = reservas.find((r) => r.id === id);
    if (!reserva) return { ok: false, error: 'Reserva no encontrada' };
    return { ok: true, reserva, reservas };
  },

  cambiarEstado: (id: string, estado: ReservaData['estado']): ReservaData[] => {
    const reservas = reservationStorage
      .getAll<ReservaData>()
      .map((r) => (r.id === id ? { ...r, estado } : r));
    reservationStorage.saveAll(reservas);
    return reservas;
  },

  eliminarReserva: (id: string): ReservaData[] => {
    const reservas = reservationStorage.getAll<ReservaData>().filter((r) => r.id !== id);
    reservationStorage.saveAll(reservas);
    return reservas;
  },
};
