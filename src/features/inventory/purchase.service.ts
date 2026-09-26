import { productStorage } from '../../services/storage/productStorage';
import { purchaseStorage } from '../../services/storage/purchaseStorage';
import type { StoredSupplier } from '../../services/storage/purchaseStorage';

export interface Compra {
  id: string;
  proveedor: string;
  productos: string;
  cantidad: number;
  total: number;
  fecha: string;
  estado: 'pendiente' | 'recibida' | 'cancelada';
}

export type NuevaCompra = Omit<Compra, 'id'>;
export type ResultadoCompra =
  | { ok: true; compras: Compra[] }
  | { ok: false; error: string; compras?: undefined };

/**
 * Dominio de compras a proveedores. Si la compra entra como recibida,
 * suma stock a los productos cuyo nombre aparece en la descripción
 * (coincidencia por subcadena, igual que el flujo original).
 * Hoy persiste en localStorage vía adapters; mañana: /api/purchases.
 */
export const purchaseService = {
  getAll: (): Compra[] => purchaseStorage.getPurchases<Compra>(),
  saveAll: (compras: Compra[]): void => purchaseStorage.savePurchases(compras),
  getPurchases: (): Compra[] => purchaseStorage.getPurchases<Compra>(),
  getSuppliers: (): StoredSupplier[] => purchaseStorage.getSuppliers<StoredSupplier>(),

  filterCompras: (compras: Compra[], busqueda: string): Compra[] =>
    compras.filter(
      (c) =>
        !busqueda ||
        c.proveedor.toLowerCase().includes(busqueda.toLowerCase()) ||
        c.productos.toLowerCase().includes(busqueda.toLowerCase()),
    ),

  registrarCompra: (form: NuevaCompra, actuales: Compra[]): ResultadoCompra => {
    if (!form.proveedor.trim() || !form.productos.trim()) {
      return { ok: false, error: 'Proveedor y productos requeridos' };
    }
    const nueva: Compra = { ...form, id: `comp_${Date.now()}` };
    const compras = [...actuales, nueva];
    purchaseStorage.savePurchases(compras);
    if (form.estado === 'recibida') {
      const prods = productStorage.getAll();
      const updated = prods.map((p) => {
        const nombre = p.nombre?.toLowerCase();
        const coincide = form.productos.toLowerCase().includes(nombre as string);
        return coincide ? { ...p, stock: (p.stock || 0) + form.cantidad } : p;
      });
      productStorage.saveAll(updated);
    }
    return { ok: true, compras };
  },

  cambiarEstado: (id: string, estado: Compra['estado'], actuales: Compra[]): Compra[] => {
    const compras = actuales.map((c) => (c.id === id ? { ...c, estado } : c));
    purchaseStorage.savePurchases(compras);
    return compras;
  },

  eliminarCompra: (id: string, actuales: Compra[]): Compra[] => {
    const compras = actuales.filter((c) => c.id !== id);
    purchaseStorage.savePurchases(compras);
    return compras;
  },
};
