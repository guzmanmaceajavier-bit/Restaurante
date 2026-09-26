import type { Order } from './types';
import { orderStorage } from '../../services/storage/orderStorage';

/** Fachada de pedidos. Hoy lee localStorage; mañana: /api/orders. */
export const orderService = {
  getAll: <T = Order>(): T[] => orderStorage.getAll<T>(),
  saveAll: <T>(orders: T[]): void => orderStorage.saveAll(orders),
  findById: (id: string): Order | undefined =>
    orderStorage.getAll<Order>().find((o) => o.id === id),
  filterByStatus: (estado: string): Order[] =>
    orderStorage.getAll<Order>().filter((o) => o.estado === estado),
};
