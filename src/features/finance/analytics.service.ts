import type { Order } from '../orders/types';
import { orderStorage } from '../../services/storage/orderStorage';
import { cashStorage } from '../../services/storage/cashStorage';

export type RangoFecha = 'hoy' | 'semana' | 'mes' | 'todos';

export interface GastoAnalitica {
  fecha?: string;
  monto?: number;
}

export interface StatsFinanzas {
  totalIngresos: number;
  totalGastos: number;
  neto: number;
  pedidosHoy: number;
  ticketPromedio: number;
  ingresosMes: number;
}

export interface VentaPorDia {
  key: string;
  label: string;
  total: number;
}

const dayKey = (d: Date): string => d.toISOString().split('T')[0];
const monthKey = (d: Date): string => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

/**
 * Dominio de analítica financiera. Fórmulas idénticas a las originales
 * de AdminFinanzas. Hoy lee localStorage vía adapters; mañana: /api/analytics.
 * Las páginas no tocan storage directamente.
 */
export const analyticsService = {
  getOrdenes: (): Order[] => orderStorage.getAll<Order>(),
  getGastos: (): GastoAnalitica[] => cashStorage.getExpenses<GastoAnalitica>(),

  filterOrdenesPorRango: (ordenes: Order[], rango: RangoFecha, now: Date = new Date()): Order[] =>
    ordenes.filter((o) => {
      if (rango === 'hoy') return o.createdAt?.startsWith(dayKey(now));
      if (rango === 'semana') {
        const weekAgo = new Date(now.getTime() - 7 * 86400000);
        return !!o.createdAt && new Date(o.createdAt) >= weekAgo;
      }
      if (rango === 'mes') return o.createdAt?.startsWith(monthKey(now));
      return true;
    }),

  filterGastosPorRango: (gastos: GastoAnalitica[], rango: RangoFecha, now: Date = new Date()): GastoAnalitica[] =>
    gastos.filter((g) => {
      if (rango === 'hoy') return g.fecha === dayKey(now);
      if (rango === 'semana') {
        const weekAgo = new Date(now.getTime() - 7 * 86400000);
        return !!g.fecha && new Date(g.fecha) >= weekAgo;
      }
      if (rango === 'mes') return g.fecha?.startsWith(monthKey(now));
      return true;
    }),

  getStats: (ordenesFiltradas: Order[], gastosFiltrados: GastoAnalitica[], now: Date = new Date()): StatsFinanzas => {
    const activas = ordenesFiltradas.filter((o) => o.estado !== 'cancelado');
    const ordersHoy = activas.filter((o) => o.createdAt?.startsWith(dayKey(now)));
    const ordersMes = activas.filter((o) => o.createdAt?.startsWith(monthKey(now)));
    const totalGastos = gastosFiltrados.reduce((s, g) => s + (g.monto || 0), 0);
    const totalIngresos = activas.reduce((sum, o) => sum + (o.total || 0), 0);
    return {
      totalIngresos,
      totalGastos,
      neto: totalIngresos - totalGastos,
      pedidosHoy: ordersHoy.length,
      ticketPromedio: activas.length > 0 ? Math.round(totalIngresos / activas.length) : 0,
      ingresosMes: ordersMes.reduce((sum, o) => sum + (o.total || 0), 0),
    };
  },

  getVentasPorDia: (ordenes: Order[], now: Date = new Date()): VentaPorDia[] => {
    const dias: Record<string, { total: number; label: string }> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = dayKey(d);
      const label = d.toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric' });
      const total = ordenes
        .filter((o) => o.estado !== 'cancelado' && o.createdAt?.startsWith(key))
        .reduce((sum, o) => sum + (o.total || 0), 0);
      dias[key] = { total, label };
    }
    return Object.entries(dias).map(([key, { total, label }]) => ({ key, label, total }));
  },

  getMetodosPago: (ordenesFiltradas: Order[]): { metodo: string; total: number }[] => {
    const counts: Record<string, number> = {};
    ordenesFiltradas.forEach((o) => {
      const method = o.paymentMethod || 'Otro';
      counts[method] = (counts[method] || 0) + (o.total || 0);
    });
    return Object.entries(counts)
      .map(([metodo, total]) => ({ metodo, total }))
      .sort((a, b) => b.total - a.total);
  },

  getTopProductos: (ordenesFiltradas: Order[], top = 5): { nombre: string; cantidad: number }[] => {
    const counts: Record<string, number> = {};
    ordenesFiltradas.forEach((o) => {
      o.items?.forEach((item) => {
        counts[item.nombre] = (counts[item.nombre] || 0) + item.quantity;
      });
    });
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, top)
      .map(([nombre, cantidad]) => ({ nombre, cantidad }));
  },

  getPedidosPorEstado: (ordenesFiltradas: Order[]): { estado: string; cantidad: number }[] => {
    const counts: Record<string, number> = {};
    ordenesFiltradas.forEach((o) => {
      const estado = o.estado || 'desconocido';
      counts[estado] = (counts[estado] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([estado, cantidad]) => ({ estado, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad);
  },
};
