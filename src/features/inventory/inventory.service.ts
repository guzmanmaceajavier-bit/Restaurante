import type { IProduct } from '../products/types';
import { productStorage } from '../../services/storage/productStorage';

export type EstadoStock = 'Agotado' | 'Bajo' | 'OK';

export const UMBRAL_STOCK_BAJO = 5;

/**
 * Dominio de inventario/stock. Fuente única: productos::stock.
 * Hoy persiste en localStorage vía adapters; mañana: /api/inventory.
 */
export const inventoryService = {
  getLowStock: (threshold = UMBRAL_STOCK_BAJO): IProduct[] =>
    productStorage.getAll().filter((p) => (p.stock ?? 0) <= threshold),

  getStockStatus: (stock: number): EstadoStock => {
    if (stock <= 0) return 'Agotado';
    if (stock <= UMBRAL_STOCK_BAJO) return 'Bajo';
    return 'OK';
  },

  updateStock: (productId: string, stock: number): IProduct[] => {
    const value = Math.max(0, Math.floor(stock));
    const updated = productStorage.getAll().map((p) => (p.id === productId ? { ...p, stock: value } : p));
    productStorage.saveAll(updated);
    return updated;
  },

  /** Ajuste relativo de stock (positivo devuelve, negativo descuenta). */
  adjustStock: (productIdOrName: string, delta: number): boolean => {
    let changed = false;
    const updated = productStorage.getAll().map((p) => {
      if (p.id !== productIdOrName && p.nombre !== productIdOrName) return p;
      changed = true;
      return { ...p, stock: Math.max(0, (p.stock || 0) + delta) };
    });
    if (changed) productStorage.saveAll(updated);
    return changed;
  },
};
