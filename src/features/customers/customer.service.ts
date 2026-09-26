import type { Order } from '../orders/types';
import type { ReservaData } from '../reservations/types';
import { customerStorage } from '../../services/storage/customerStorage';
import type { StoredCustomer } from '../../services/storage/customerStorage';
import { authStorage } from '../../services/storage/authStorage';
import { orderStorage } from '../../services/storage/orderStorage';
import { reservationStorage } from '../../services/storage/reservationStorage';
import { whatsappStorage } from '../../services/storage/whatsappStorage';
import type { MensajeEnviado } from '../../services/storage/whatsappStorage';
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

export interface ContactoWhatsApp {
  name: string;
  phone: string;
  source: 'pedido' | 'reserva';
  lastDate: string;
}

const DEFAULT_PREFS: PreferenciasCliente = { whatsapp: true, email: true, promos: true };

/** Teléfonos iguales ignorando formato (espacios, guiones, +). */
function matchPhone(a: string, b: string): boolean {
  return !!a && !!b && a.replace(/\D/g, '') === b.replace(/\D/g, '');
}

/** Normalización de WhatsApp: quita espacios, guiones y paréntesis. */
function normalizePhone(phone: string): string {
  return phone.replace(/[\s\-()]/g, '');
}

export interface ClienteAdmin {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  password?: string;
  puntos: number;
  nivel: 'bronce' | 'plata' | 'oro';
  activo: boolean;
  historialPedidos: string[];
  historialReservas: string[];
  createdAt: string;
  totalOrders?: number;
  totalSpent?: number;
  lastOrder?: string;
}

export interface ClienteForm {
  nombre: string;
  email: string;
  telefono: string;
  password: string;
  puntos: number;
  nivel: 'bronce' | 'plata' | 'oro';
  activo: boolean;
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

  /** Contactos únicos (pedidos + reservas) para mensajería, más recientes primero. */
  getContactosWhatsApp: (): ContactoWhatsApp[] => {
    const map = new Map<string, ContactoWhatsApp>();
    orderStorage.getAll<{ phone?: string; fullName?: string; createdAt?: string }>().forEach((o) => {
      const phone = normalizePhone(o.phone || '');
      if (!phone) return;
      const existing = map.get(phone);
      if (!existing || (o.createdAt ?? '') > existing.lastDate) {
        map.set(phone, { name: o.fullName || '', phone, source: 'pedido', lastDate: o.createdAt || '' });
      }
    });
    reservationStorage
      .getAll<{ telefono?: string; nombre?: string; createdAt?: string }>()
      .forEach((r) => {
        const phone = normalizePhone(r.telefono || '');
        if (!phone) return;
        const existing = map.get(phone);
        if (!existing || (r.createdAt ?? '') > existing.lastDate) {
          map.set(phone, { name: r.nombre || '', phone, source: 'reserva', lastDate: r.createdAt || '' });
        }
      });
    return Array.from(map.values()).sort((a, b) => b.lastDate.localeCompare(a.lastDate));
  },

  getHistorialWhatsApp: (): MensajeEnviado[] => whatsappStorage.getHistorial(),

  registrarEnvioWhatsApp: (mensaje: string, destinatarios: number): MensajeEnviado[] => {
    const nuevo: MensajeEnviado = {
      id: `MSG-${Date.now().toString(36).toUpperCase()}`,
      mensaje,
      destinatarios,
      fecha: new Date().toISOString(),
    };
    const updated = [nuevo, ...whatsappStorage.getHistorial()];
    whatsappStorage.saveHistorial(updated);
    return updated;
  },

  getPreferencias: (clientId: string | null): PreferenciasCliente =>
    clientId
      ? readJson<PreferenciasCliente>(`${STORAGE_KEYS.PREFS_PREFIX}${clientId}`, DEFAULT_PREFS)
      : readJson<PreferenciasCliente>(`${STORAGE_KEYS.PREFS_PREFIX}guest`, DEFAULT_PREFS),

  guardarPreferencias: (clientId: string, prefs: PreferenciasCliente): void => {
    writeJson(`${STORAGE_KEYS.PREFS_PREFIX}${clientId}`, prefs);
  },

  /**
   * Vista admin: une la lista con el portal (auth-client-storage) y
   * enriquece con pedidos (totales, último, historial).
   */
  getVistaAdmin: (): ClienteAdmin[] => {
    const stored = customerStorage.getAll<ClienteAdmin>();
    const raw = readJson<any>(STORAGE_KEYS.AUTH_CLIENT, null);
    const authClientes: ClienteAdmin[] = raw?.state?.clientes ?? raw?.clientes ?? [];
    const byTel = new Map(stored.map((c) => [c.telefono, c]));
    const byEmail = new Map(stored.map((c) => [c.email, c]));
    authClientes.forEach((ac) => {
      const exists = byTel.get(ac.telefono) || byEmail.get(ac.email);
      if (!exists) {
        stored.push({
          ...ac,
          activo: (ac as unknown as { activo?: boolean }).activo ?? true,
          historialPedidos: ac.historialPedidos || [],
          historialReservas: ac.historialReservas || [],
        });
      } else {
        exists.puntos = ac.puntos ?? exists.puntos;
        exists.nivel = ac.nivel ?? exists.nivel;
        if (ac.historialPedidos) exists.historialPedidos = ac.historialPedidos;
        if (ac.historialReservas) exists.historialReservas = ac.historialReservas;
      }
    });
    const ordenes = orderStorage.getAll<{
      id: string;
      phone?: string;
      email?: string;
      total?: number;
      createdAt?: string;
    }>();
    return stored.map((c) => {
      const clientOrders = ordenes.filter((o) => o.phone === c.telefono || o.email === c.email);
      const sorted = [...clientOrders].sort(
        (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime(),
      );
      return {
        ...c,
        totalOrders: clientOrders.length,
        totalSpent: clientOrders.reduce((sum, o) => sum + (o.total || 0), 0),
        lastOrder: sorted.length > 0 ? sorted[0].createdAt : undefined,
        historialPedidos: clientOrders.map((o) => o.id || ''),
        historialReservas: [],
      };
    });
  },

  validarCliente: (form: ClienteForm, isEditing: boolean): string | null => {
    if (!form.nombre.trim()) return 'El nombre es requerido';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) return 'Email inválido';
    if (!form.telefono.trim()) return 'El teléfono es requerido';
    if (!isEditing && (!form.password || form.password.length < 6)) {
      return 'La contraseña debe tener al menos 6 caracteres';
    }
    if (isEditing && form.password && form.password.length < 6) {
      return 'La contraseña debe tener al menos 6 caracteres';
    }
    return null;
  },

  guardarCliente: (
    form: ClienteForm,
    editing: ClienteAdmin | null,
    actuales: ClienteAdmin[],
  ): ClienteAdmin[] => {
    if (editing) {
      const updated = actuales.map((c) =>
        c.id === editing.id
          ? {
              ...c,
              nombre: form.nombre.trim(),
              email: form.email.trim(),
              telefono: form.telefono.trim(),
              ...(form.password ? { password: form.password } : {}),
              puntos: form.puntos,
              nivel: form.nivel,
              activo: form.activo,
            }
          : c,
      );
      customerStorage.saveAll(updated);
      const raw = readJson<any>(STORAGE_KEYS.AUTH_CLIENT, null);
      if (raw) {
        const state = raw.state || raw;
        if (state.clientes) {
          state.clientes = (state.clientes as any[]).map((c: any) =>
            c.telefono === form.telefono || c.email === form.email
              ? {
                  ...c,
                  nombre: form.nombre.trim(),
                  email: form.email.trim(),
                  telefono: form.telefono.trim(),
                  puntos: form.puntos,
                  nivel: form.nivel,
                }
              : c,
          );
          writeJson(STORAGE_KEYS.AUTH_CLIENT, raw.state ? { ...raw, state } : raw);
        }
      }
      return updated;
    }
    const newClient: ClienteAdmin = {
      id: `cli_${Date.now()}`,
      nombre: form.nombre.trim(),
      email: form.email.trim(),
      telefono: form.telefono.trim(),
      password: form.password,
      puntos: form.puntos,
      nivel: form.nivel,
      activo: form.activo,
      historialPedidos: [],
      historialReservas: [],
      createdAt: new Date().toISOString(),
    };
    const updated = [...actuales, newClient];
    customerStorage.saveAll(updated);
    const raw = readJson<any>(STORAGE_KEYS.AUTH_CLIENT, null);
    if (raw) {
      const state = raw.state || raw;
      if (state.clientes) {
        const lista = state.clientes as any[];
        if (!lista.some((c: any) => c.telefono === newClient.telefono || c.email === newClient.email)) {
          lista.push({ ...newClient, password: newClient.password || '123456' });
          writeJson(STORAGE_KEYS.AUTH_CLIENT, raw.state ? { ...raw, state } : raw);
        }
      }
    }
    return updated;
  },

  eliminarCliente: (id: string, actuales: ClienteAdmin[]): ClienteAdmin[] => {
    const updated = actuales.filter((c) => c.id !== id);
    customerStorage.saveAll(updated);
    return updated;
  },

  toggleActivo: (id: string, actuales: ClienteAdmin[]): ClienteAdmin[] => {
    const updated = actuales.map((c) => (c.id === id ? { ...c, activo: !c.activo } : c));
    customerStorage.saveAll(updated);
    return updated;
  },

  filterClientes: (
    clientes: ClienteAdmin[],
    filtro: { busqueda: string; estado: 'todos' | 'activos' | 'inactivos' },
  ): ClienteAdmin[] => {
    let result = clientes;
    if (filtro.estado === 'activos') result = result.filter((c) => c.activo);
    else if (filtro.estado === 'inactivos') result = result.filter((c) => !c.activo);
    if (filtro.busqueda) {
      const q = filtro.busqueda.toLowerCase();
      result = result.filter(
        (c) =>
          c.nombre?.toLowerCase().includes(q) ||
          c.email?.toLowerCase().includes(q) ||
          c.telefono?.includes(q),
      );
    }
    return result;
  },
};
