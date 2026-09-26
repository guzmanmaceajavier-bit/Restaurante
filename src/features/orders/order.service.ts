import type { Order, OrderHistorialEntry } from './types';
import { orderStorage } from '../../services/storage/orderStorage';
import { activityStorage } from '../../services/storage/activityStorage';
import { productStorage } from '../../services/storage/productStorage';

export interface FiltroOrdenes {
  busqueda: string;
  estado: string;
  metodo: string;
  tipo: string;
  fecha: string;
}

export interface ResultadoCambioEstado {
  ok: boolean;
  error?: string;
  ordenes: Order[];
  entry?: OrderHistorialEntry;
}

const ETIQUETAS_ESTADO: Record<string, string> = {
  recibido: 'Recibido',
  preparando: 'Preparando',
  listo: 'Listo',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
};

/**
 * Dominio de pedidos: consultas, filtros, transiciones de estado con
 * compensación de stock y auditoría. Hoy persiste en localStorage vía
 * adapters; mañana: /api/orders. Las páginas no tocan storage directamente.
 */
export const orderService = {
  getAll: <T = Order>(): T[] => orderStorage.getAll<T>(),
  saveAll: <T>(orders: T[]): void => orderStorage.saveAll(orders),

  findById: (id: string): Order | undefined =>
    orderStorage.getAll<Order>().find((o) => o.id === id),

  filterByStatus: (estado: string): Order[] =>
    orderStorage.getAll<Order>().filter((o) => o.estado === estado),

  /** Pedidos activos en cocina (kanban): recibido → preparando → listo. */
  filterCocina: (ordenes: Order[]): Order[] =>
    ordenes.filter((o) => ['recibido', 'preparando', 'listo'].includes(o.estado)),

  /**
   * Avance rápido de cocina: solo cambia el estado (sin historial ni
   * auditoría, igual que el flujo KDS original).
   */
  avanzarPedido: (id: string, next: string): { ok: boolean; ordenes: Order[] } => {
    const ordenes = orderStorage.getAll<Order>();
    if (!ordenes.some((o) => o.id === id)) return { ok: false, ordenes };
    const updated = ordenes.map((x) => (x.id === id ? { ...x, estado: next } : x));
    orderStorage.saveAll(updated);
    return { ok: true, ordenes: updated };
  },

  getEstadoLabel: (estado: string): string => ETIQUETAS_ESTADO[estado] ?? estado,

  /** Reconstruye la línea de tiempo si el pedido no trae historial. */
  buildHistory: (o: Order): OrderHistorialEntry[] => {
    const historial = (o as unknown as { historial?: unknown }).historial;
    if (Array.isArray(historial) && historial.length) return historial as OrderHistorialEntry[];
    const base = o.createdAt ? new Date(o.createdAt) : new Date();
    const flow = ['recibido', 'preparando', 'listo', 'entregado'];
    const idx = flow.indexOf(o.estado);
    if (idx === -1) return [{ estado: o.estado, fecha: o.createdAt || new Date().toISOString() }];
    return flow
      .slice(0, idx + 1)
      .map((estado, i) => ({ estado, fecha: new Date(base.getTime() + i * 12 * 60000).toISOString() }));
  },

  filterOrders: (ordenes: Order[], filtro: FiltroOrdenes): Order[] =>
    ordenes
      .filter((o) => {
        if (filtro.estado && o.estado !== filtro.estado) return false;
        const raw = o as unknown as Record<string, unknown>;
        if (filtro.metodo && raw['metodoPago'] !== filtro.metodo && o.paymentMethod !== filtro.metodo) return false;
        if (filtro.tipo && raw['tipoServicio'] !== filtro.tipo && o.typeOrder !== filtro.tipo) return false;
        if (filtro.fecha && !o.createdAt?.startsWith(filtro.fecha)) return false;
        if (filtro.busqueda) {
          const q = filtro.busqueda.toLowerCase();
          return (
            o.id?.toLowerCase().includes(q) ||
            o.fullName?.toLowerCase().includes(q) ||
            o.phone?.includes(q)
          );
        }
        return true;
      })
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()),

  /**
   * Cambia el estado de un pedido: actualiza historial, compensa stock
   * (cancelar devuelve, reactivar descuenta) y registra auditoría.
   */
  cambiarEstado: (id: string, nuevoEstado: string): ResultadoCambioEstado => {
    const ordenes = orderStorage.getAll<Order>();
    const prev = ordenes.find((o) => o.id === id);
    if (!prev) return { ok: false, error: 'Pedido no encontrado', ordenes };
    const nowIso = new Date().toISOString();
    const entry: OrderHistorialEntry = { estado: nuevoEstado, fecha: nowIso };
    const updated = ordenes.map((o) => {
      if (o.id !== id) return o;
      const hist = [...orderService.buildHistory(o), entry];
      return { ...o, estado: nuevoEstado, historial: hist };
    });
    orderStorage.saveAll(updated);
    try {
      // Stock: cancelar devuelve, reactivar desde cancelado descuenta
      const items = (prev.items ?? []) as { nombre?: string; id?: string; quantity?: number }[];
      const devolver = nuevoEstado === 'cancelado' && prev.estado !== 'cancelado';
      const descontar = prev.estado === 'cancelado' && nuevoEstado !== 'cancelado';
      if (devolver || descontar) {
        const productos = productStorage.getAll();
        let changed = false;
        items.forEach((it) => {
          const idx = productos.findIndex((p) => p.nombre === it.nombre || p.id === it.id);
          if (idx !== -1) {
            const qty = it.quantity ?? 0;
            productos[idx].stock = devolver
              ? (productos[idx].stock || 0) + qty
              : Math.max(0, (productos[idx].stock || 0) - qty);
            changed = true;
          }
        });
        if (changed) productStorage.saveAll(productos);
      }
    } catch {
      /* el cambio de estado ya quedó persistido */
    }
    try {
      activityStorage.push('Pedidos', `Pedido #${id.slice(0, 8)} → ${orderService.getEstadoLabel(nuevoEstado)}`);
    } catch {
      /* auditoría opcional */
    }
    return { ok: true, ordenes: updated, entry };
  },

  /**
   * Cancelación desde el portal del cliente: marca cancelado directamente
   * (sin compensar stock ni auditar, igual que el flujo original).
   */
  cancelarPedido: (id: string): Order[] => {
    const updated = orderStorage
      .getAll<Order>()
      .map((x) => (x.id === id ? { ...x, estado: 'cancelado' } : x));
    orderStorage.saveAll(updated);
    return updated;
  },

  /** Búsqueda por código exacto insensible a mayúsculas (portal público). */
  buscarOrdenPorId: (codigo: string): Order | undefined => {
    const q = codigo.trim().toUpperCase();
    if (!q) return undefined;
    return orderStorage.getAll<Order>().find((o) => o.id.toUpperCase() === q);
  },
};
