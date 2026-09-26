import type { Order } from '../orders/types';
import type { ReservaData } from '../reservations/types';
import { orderStorage } from '../../services/storage/orderStorage';
import { reservationStorage } from '../../services/storage/reservationStorage';
import { tableStorage } from '../../services/storage/tableStorage';
import { productStorage } from '../../services/storage/productStorage';

export interface MesaResumen {
  estado: string;
}

export interface ProductoResumen {
  stock?: number;
}

export interface ResumenDashboard {
  ventasHoy: number;
  dVentas: number;
  dPedidos: number;
  totalHoy: number;
  ticket: number;
  cubiertos: number;
  pendientes: number;
  preparando: number;
  listos: number;
  reservasHoy: ReservaData[];
  ocupadas: number;
  libres: number;
  totalMesas: number;
  ocupacion: number;
  stockBajo: ProductoResumen[];
  agotados: ProductoResumen[];
}

/**
 * Dominio del dashboard operativo. Fórmulas idénticas a las originales
 * de AdminDashboard. Hoy lee localStorage vía adapters; mañana: /api/dashboard.
 */
export const dashboardService = {
  getOrdenes: (): Order[] => orderStorage.getAll<Order>(),
  getReservas: (): ReservaData[] => reservationStorage.getAll<ReservaData>(),
  getMesas: (): MesaResumen[] => tableStorage.getAll<MesaResumen>(),
  getProductos: (): ProductoResumen[] => productStorage.getAll(),

  getResumen: (
    ordenes: Order[],
    reservas: ReservaData[],
    mesas: MesaResumen[],
    productos: ProductoResumen[],
    today: string,
  ): ResumenDashboard => {
    const ayer = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const ordenesHoy = ordenes.filter((o) => o.createdAt?.startsWith(today));
    const ordenesAyer = ordenes.filter((o) => o.createdAt?.startsWith(ayer));
    const ventasHoy = ordenesHoy.reduce((a, o) => a + (o.total || 0), 0);
    const ventasAyer = ordenesAyer.reduce((a, o) => a + (o.total || 0), 0);
    const byEstado = (e: string) => ordenes.filter((o) => o.estado === e).length;
    const pendientes = byEstado('recibido');
    const preparando = byEstado('preparando');
    const listos = byEstado('listo');
    const cubiertos = ordenesHoy.reduce(
      (a, o) =>
        a +
        ((o.items as { quantity: number }[] | undefined)?.reduce(
          (s: number, i: { quantity: number }) => s + i.quantity,
          0,
        ) || 0),
      0,
    );
    const ticket = ordenesHoy.length ? Math.round(ventasHoy / ordenesHoy.length) : 0;
    const dVentas = ventasAyer ? Math.round(((ventasHoy - ventasAyer) / ventasAyer) * 100) : ventasHoy > 0 ? 100 : 0;
    const dPedidos = ordenesAyer.length
      ? Math.round(((ordenesHoy.length - ordenesAyer.length) / ordenesAyer.length) * 100)
      : ordenesHoy.length
        ? 100
        : 0;
    const reservasHoy = reservas.filter((r) => r.fecha === today);
    const ocupadas = mesas.filter((m) => m.estado === 'ocupada').length;
    const libres = mesas.filter((m) => m.estado === 'disponible').length;
    const totalMesas = mesas.length || 8;
    const ocupacion = totalMesas ? Math.round((ocupadas / totalMesas) * 100) : 0;
    const stockBajo = productos.filter((p) => (p.stock || 0) > 0 && (p.stock || 0) <= 5);
    const agotados = productos.filter((p) => (p.stock || 0) <= 0);
    return {
      ventasHoy, dVentas, dPedidos, totalHoy: ordenesHoy.length, ticket, cubiertos,
      pendientes, preparando, listos, reservasHoy, ocupadas, libres, totalMesas,
      ocupacion, stockBajo, agotados,
    };
  },

  getVentasPorHora: (ordenes: Order[], today: string): { label: string; total: number }[] => {
    const hours = Array.from({ length: 12 }, (_, i) => 10 + i);
    return hours.map((h) => {
      const label = `${String(h).padStart(2, '0')}:00`;
      const total = ordenes
        .filter((o) => {
          if (!o.createdAt?.startsWith(today)) return false;
          return new Date(o.createdAt).getHours() === h;
        })
        .reduce((a, o) => a + (o.total || 0), 0);
      return { label, total };
    });
  },

  getTopProductos: (ordenes: Order[], top = 4): [string, number][] => {
    const m: Record<string, number> = {};
    ordenes.forEach((o) =>
      o.items?.forEach((it: { nombre: string; quantity: number }) => {
        m[it.nombre] = (m[it.nombre] || 0) + it.quantity;
      }),
    );
    return Object.entries(m)
      .sort((a, b) => b[1] - a[1])
      .slice(0, top);
  },

  getReservasHoy: (reservas: ReservaData[], today: string): ReservaData[] =>
    reservas
      .filter((r) => r.fecha === today)
      .sort((a, b) => a.hora.localeCompare(b.hora))
      .slice(0, 5),
};
