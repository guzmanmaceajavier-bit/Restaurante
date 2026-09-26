import type { Order } from '../orders/types';
import { cashStorage } from '../../services/storage/cashStorage';
import { orderStorage } from '../../services/storage/orderStorage';

export interface Movimiento {
  id: string;
  tipo: 'ingreso' | 'egreso';
  concepto: string;
  monto: number;
  metodo: string;
  fecha: string;
}

export interface Gasto {
  id: string;
  categoria?: string;
  descripcion: string;
  monto: number;
  fecha: string;
}

export interface ResumenCaja {
  hoy: string;
  apertura: number;
  ventasHoy: number;
  ingresosManuales: number;
  ingresos: number;
  egresosMovs: number;
  gastosNoDuplicados: number;
  egresos: number;
  balance: number;
}

export type NuevoMovimiento = Omit<Movimiento, 'id'>;
export type ResultadoMovimiento = { ok: true; movimiento: Movimiento } | { ok: false; error: string };

const todayKey = (): string => new Date().toISOString().split('T')[0];

/** Un gasto duplica un movimiento si coincide concepto + monto como egreso. */
function esGastoDuplicado(gasto: Gasto, movs: Movimiento[]): boolean {
  return movs.some((m) => m.tipo === 'egreso' && m.concepto === gasto.descripcion && m.monto === gasto.monto);
}

/**
 * Dominio de caja. Hoy persiste en localStorage vía adapters;
 * mañana: /api/cash. Las páginas no tocan storage directamente.
 */
export const cashService = {
  getMovements: (): Movimiento[] => cashStorage.getMovements<Movimiento>(),
  saveMovements: (movements: Movimiento[]): void => cashStorage.saveMovements(movements),
  getGastos: (): Gasto[] => cashStorage.getExpenses<Gasto>(),

  registrarMovimiento: (data: NuevoMovimiento): ResultadoMovimiento => {
    if (!data.concepto.trim() || !data.monto) return { ok: false, error: 'Concepto y monto requeridos' };
    const movimiento: Movimiento = { ...data, id: `mov_${Date.now()}` };
    cashStorage.saveMovements([...cashStorage.getMovements<Movimiento>(), movimiento]);
    return { ok: true, movimiento };
  },

  actualizarMovimiento: (id: string, data: Partial<NuevoMovimiento>): Movimiento[] => {
    const updated = cashStorage
      .getMovements<Movimiento>()
      .map((m) => (m.id === id ? { ...m, ...data } : m));
    cashStorage.saveMovements(updated);
    return updated;
  },

  eliminarMovimiento: (id: string): Movimiento[] => {
    const updated = cashStorage.getMovements<Movimiento>().filter((m) => m.id !== id);
    cashStorage.saveMovements(updated);
    return updated;
  },

  getVentasHoy: (hoy: string = todayKey()): number =>
    orderStorage
      .getAll<Order>()
      .filter((o) => o.createdAt?.startsWith(hoy))
      .reduce((sum, o) => sum + (o.total || 0), 0),

  /** Resumen con regla anti-doble-conteo: gastos ya registrados como egreso no se suman dos veces. */
  getResumen: (apertura: number): ResumenCaja => {
    const movs = cashStorage.getMovements<Movimiento>();
    const gastos = cashStorage.getExpenses<Gasto>();
    const hoy = todayKey();
    const ventasHoy = cashService.getVentasHoy(hoy);
    const ingresosManuales = movs.filter((m) => m.tipo === 'ingreso').reduce((s, m) => s + m.monto, 0);
    const ingresos = ingresosManuales + ventasHoy;
    const egresosMovs = movs.filter((m) => m.tipo === 'egreso').reduce((s, m) => s + m.monto, 0);
    const gastosNoDuplicados = gastos
      .filter((g) => !esGastoDuplicado(g, movs))
      .reduce((s, g) => s + (g.monto || 0), 0);
    const egresos = egresosMovs + gastosNoDuplicados;
    return { hoy, apertura, ventasHoy, ingresosManuales, ingresos, egresosMovs, gastosNoDuplicados, egresos, balance: apertura + ingresos - egresos };
  },

  isOpen: (): boolean => cashStorage.isOpen(),
  getOpeningAmount: (): number => cashStorage.getOpeningAmount(),

  abrirCaja: (montoApertura: number): number => {
    cashStorage.setOpen(true);
    cashStorage.setOpeningAmount(montoApertura);
    return montoApertura;
  },

  cerrarCaja: (): void => {
    cashStorage.setOpen(false);
  },
};
