import { customerStorage } from '../../services/storage/customerStorage';
import type { StoredCustomer } from '../../services/storage/customerStorage';
import { authStorage } from '../../services/storage/authStorage';

export interface LookupCliente {
  telefono: string;
  email: string;
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
};
