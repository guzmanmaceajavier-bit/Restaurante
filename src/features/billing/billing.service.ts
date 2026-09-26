import type { Order } from '../orders/types';
import { orderStorage } from '../../services/storage/orderStorage';

/**
 * Fachada de facturación. Hoy deriva de pedidos (una factura por pedido,
 * mismo criterio que AdminFacturacion); mañana: /api/invoices.
 */
export const billingService = {
  getInvoices: (): Order[] => orderStorage.getAll<Order>(),
};
