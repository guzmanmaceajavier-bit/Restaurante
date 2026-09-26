import type { Order } from '../orders/types';
import { orderStorage } from '../../services/storage/orderStorage';

/**
 * Dominio de facturación. Hoy deriva de pedidos no cancelados
 * (una factura por pedido); mañana: /api/invoices.
 * Las páginas no tocan storage directamente.
 */
export const billingService = {
  getInvoices: (): Order[] => orderStorage.getAll<Order>(),

  /** Facturas = pedidos no cancelados, más recientes primero. */
  getFacturas: (): Order[] =>
    orderStorage
      .getAll<Order>()
      .filter((o) => o.estado !== 'cancelado')
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()),

  getTotalFacturado: (facturas: Order[]): number =>
    facturas.reduce((sum, o) => sum + (o.total || 0), 0),
};
