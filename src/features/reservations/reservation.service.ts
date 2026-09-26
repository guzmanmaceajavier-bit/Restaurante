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

  crearReserva: (data: NuevaReserva, actuales: ReservaData[]): ResultadoReserva => {
    const error = validarObligatorios(data);
    if (error) return { ok: false, error };
    const reserva: ReservaData = { ...data, id: `res_${Date.now()}`, createdAt: new Date().toISOString() };
    const reservas = [...actuales, reserva];
    reservationStorage.saveAll(reservas);
    return { ok: true, reserva, reservas };
  },

  actualizarReserva: (id: string, data: NuevaReserva, actuales: ReservaData[]): ResultadoReserva => {
    const error = validarObligatorios(data);
    if (error) return { ok: false, error };
    const reservas = actuales.map((r) => (r.id === id ? { ...r, ...data } : r));
    reservationStorage.saveAll(reservas);
    const reserva = reservas.find((r) => r.id === id);
    if (!reserva) return { ok: false, error: 'Reserva no encontrada' };
    return { ok: true, reserva, reservas };
  },

  cambiarEstado: (id: string, estado: ReservaData['estado'], actuales: ReservaData[]): ReservaData[] => {
    const reservas = actuales.map((r) => (r.id === id ? { ...r, estado } : r));
    reservationStorage.saveAll(reservas);
    return reservas;
  },

  eliminarReserva: (id: string, actuales: ReservaData[]): ReservaData[] => {
    const reservas = actuales.filter((r) => r.id !== id);
    reservationStorage.saveAll(reservas);
    return reservas;
  },

  /**
   * Cancelación desde el portal del cliente (estado 'Cancelada',
   * igual que el flujo original del portal). Lee storage porque el
   * portal solo tiene una vista filtrada.
   */
  cancelarReservaCliente: (id: string): ReservaData[] => {
    const reservas = reservationStorage
      .getAll<ReservaData>()
      .map((r) => (r.id === id ? { ...r, estado: 'Cancelada' as const } : r));
    reservationStorage.saveAll(reservas);
    return reservas;
  },

  /** Disponibilidad de un slot: 3+ reservas = lleno, 1+ = limitado. */
  getDisponibilidad: (fecha: string, hora: string): 'available' | 'limited' | 'full' => {
    if (!hora) return 'available';
    const same = reservationStorage
      .getAll<ReservaData>()
      .filter((r) => r.fecha === fecha && r.hora === hora && r.estado !== 'Cancelada');
    if (same.length >= 3) return 'full';
    if (same.length >= 1) return 'limited';
    return 'available';
  },

  /**
   * Creación desde el flujo público (id RES-*, sin validación extra: la hace
   * Yup). `zona` es opcional aquí porque el formulario público no la pide
   * (igual que el flujo original).
   */
  crearReservaPublica: (data: Omit<NuevaReserva, 'zona'> & { zona?: string }): ReservaData => {
    const reserva = {
      ...data,
      id: `RES-${Date.now().toString(36).toUpperCase()}`,
      createdAt: new Date().toISOString(),
    } as ReservaData;
    const reservas = [...reservationStorage.getAll<ReservaData>(), reserva];
    reservationStorage.saveAll(reservas);
    return reserva;
  },

  /**
   * Edición desde el portal: fecha/hora/personas, vuelve a 'Pendiente'.
   * Lee storage porque el portal solo tiene una vista filtrada.
   */
  actualizarReservaCliente: (
    id: string,
    cambios: Pick<ReservaData, 'fecha' | 'hora' | 'personas'>,
  ): ReservaData[] => {
    const reservas = reservationStorage
      .getAll<ReservaData>()
      .map((r) => (r.id === id ? { ...r, ...cambios, estado: 'Pendiente' as const } : r));
    reservationStorage.saveAll(reservas);
    return reservas;
  },
};
