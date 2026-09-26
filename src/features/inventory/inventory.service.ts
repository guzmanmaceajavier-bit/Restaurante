import type { IProduct } from '../products/types';
import { productStorage } from '../../services/storage/productStorage';

/** Fachada de inventario/stock. Hoy lee localStorage; mañana: /api/inventory. */
export const inventoryService = {
  getLowStock: (threshold = 5): IProduct[] =>
    productStorage.getAll().filter((p) => (p.stock ?? 0) <= threshold),
  updateStock: (productId: string, stock: number): IProduct[] => {
    const updated = productStorage.getAll().map((p) => (p.id === productId ? { ...p, stock } : p));
    productStorage.saveAll(updated);
    return updated;
  },
};
