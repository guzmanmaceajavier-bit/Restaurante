import type { Order } from '../orders/types';
import type { ReservaData } from '../reservations/types';
import { customerStorage } from '../../services/storage/customerStorage';
import type { StoredCustomer } from '../../services/storage/customerStorage';
import { authStorage } from '../../services/storage/authStorage';
import { orderStorage } from '../../services/storage/orderStorage';
import { reservationStorage } from '../../services/storage/reservationStorage';
import { STORAGE_KEYS } from '../../services/storage/storageKeys';
import { readJson, writeJson } from '../../services/storage/jsonStore';

export interface LookupCliente {
  telefono: string;
  email: string;
}

export interface HistorialCliente {
  historialPedidos: string[];
  historialReservas: string[];
  telefono: string;
  email: string;
}

export interface PreferenciasCliente {
  whatsapp: boolean;
  email: boolean;
  promos: boolean;
}

const DEFAULT_PREFS: PreferenciasCliente = { whatsapp: true, email: true, promos: true };

/** Teléfonos iguales ignorando formato (espacios, guiones, +). */
function matchPhone(a: string, b: string): boolean {
  return !!a && !!b && a.replace(/\D/g, '') === b.replace(/\D/g, '');
}

/** Fachada de clientes (vista admin). Hoy lee localStorage; mañana: /api/customers. */
export const customerService = {
  getAll: <T = StoredCustomer>(): T[] => customerStorage.getAll<T>(),
  saveAll: <T>(customers: T[]): void => {
    customerStorage.saveAll(customers);
    customerStorage.saveAdmin(customers);
  },

  /**
   * Vincula una reserva al historial del cliente (lista admin + sesión
   * del portal si es el mismo cliente logueado). Devuelve si vinculó.
   */
  linkReserva: (lookup: LookupCliente, reservaId: string): boolean => {
    const clientes = customerStorage.getAll<StoredCustomer & { historialReservas?: string[] }>();
    const idx = clientes.findIndex((c) => c.telefono === lookup.telefono || c.email === lookup.email);
    if (idx === -1) return false;
    clientes[idx].historialReservas = [...(clientes[idx].historialReservas || []), reservaId];
    customerStorage.saveAll(clientes);
    const state = authStorage.readState();
    const actual = state.state?.clienteActual as { telefono?: string; email?: string; historialReservas?: string[] } | undefined;
    if (actual && (actual.telefono === lookup.telefono || actual.email === lookup.email)) {
      actual.historialReservas = [...(actual.historialReservas || []), reservaId];
      const lista = (state.state?.clientes ?? []) as { id?: string; historialReservas?: string[] }[];
      state.state = {
        ...state.state,
        clientes: lista.map((c) =>
          c.id === clientes[idx].id ? { ...c, historialReservas: clientes[idx].historialReservas } : c,
        ),
      };
      authStorage.writeState(state);
    }
    return true;
  },

  /** Pedidos del historial del cliente (más recientes primero). */
  getMisPedidos: (cliente: Pick<HistorialCliente, 'historialPedidos'>): Order[] =>
    orderStorage
      .getAll<Order>()
      .filter((o) => cliente.historialPedidos.includes(o.id))
      .reverse(),

  /** Reservas del historial del cliente (más recientes primero). */
  getMisReservas: (cliente: Pick<HistorialCliente, 'historialReservas'>): ReservaData[] =>
    reservationStorage
      .getAll<ReservaData>()
      .filter((r) => cliente.historialReservas.includes(r.id))
      .reverse(),

  /** IDs con su teléfono/email aún no vinculados a su historial. */
  findHuerfanos: (cliente: HistorialCliente): { ordenes: string[]; reservas: string[] } => ({
    ordenes: orderStorage
      .getAll<Order>()
      .filter(
        (o) =>
          !cliente.historialPedidos.includes(o.id) &&
          (matchPhone((o as unknown as { phone?: string }).phone ?? '', cliente.telefono) ||
            (o as unknown as { email?: string }).email === cliente.email),
      )
      .map((o) => o.id),
    reservas: reservationStorage
      .getAll<ReservaData & { telefono?: string; email?: string }>()
      .filter(
        (r) =>
          !cliente.historialReservas.includes(r.id) &&
          (matchPhone(r.telefono ?? '', cliente.telefono) || r.email === cliente.email),
      )
      .map((r) => r.id),
  }),

  getPreferencias: (clientId: string | null): PreferenciasCliente =>
    clientId
      ? readJson<PreferenciasCliente>(`${STORAGE_KEYS.PREFS_PREFIX}${clientId}`, DEFAULT_PREFS)
      : readJson<PreferenciasCliente>(`${STORAGE_KEYS.PREFS_PREFIX}guest`, DEFAULT_PREFS),

  guardarPreferencias: (clientId: string, prefs: PreferenciasCliente): void => {
    writeJson(`${STORAGE_KEYS.PREFS_PREFIX}${clientId}`, prefs);
  },
};
