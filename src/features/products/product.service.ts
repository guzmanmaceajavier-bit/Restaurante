import type { IProduct } from './types';
import { productStorage } from '../../services/storage/productStorage';

export interface FiltroProductos {
  busqueda: string;
  categoria: string;
}

export interface ResultadoCategoria {
  ok: boolean;
  error?: string;
  categorias?: string[];
}

/**
 * Dominio de catálogo: productos, categorías y consultas.
 * Hoy persiste en localStorage vía adapters; mañana: /api/products.
 * Las páginas no tocan storage directamente.
 */
export const productService = {
  getAll: (): IProduct[] => productStorage.getAll(),
  saveAll: (items: IProduct[]): void => productStorage.saveAll(items),

  getById: (id: string): IProduct | undefined =>
    productStorage.getAll().find((p) => p.id === id || p.nombre === id),

  createProducto: (data: Omit<IProduct, 'id'>): IProduct => {
    const nuevo = { ...data, id: `prod-${Date.now().toString(36)}` } as IProduct;
    productStorage.saveAll([...productStorage.getAll(), nuevo]);
    return nuevo;
  },

  updateProducto: (id: string, data: Partial<IProduct>): IProduct[] => {
    const updated = productStorage.getAll().map((p) => (p.id === id ? { ...p, ...data } : p));
    productStorage.saveAll(updated);
    return updated;
  },

  deleteProducto: (id: string): IProduct[] => {
    const updated = productStorage.getAll().filter((p) => p.id !== id);
    productStorage.saveAll(updated);
    return updated;
  },

  deleteMany: (ids: string[]): IProduct[] => {
    const set = new Set(ids);
    const updated = productStorage.getAll().filter((p) => !set.has(p.id));
    productStorage.saveAll(updated);
    return updated;
  },

  filterProductos: (items: IProduct[], filtro: FiltroProductos): IProduct[] =>
    items.filter((p) => {
      if (filtro.categoria && p.categoría !== filtro.categoria) return false;
      if (filtro.busqueda) {
        const q = filtro.busqueda.toLowerCase();
        return p.nombre?.toLowerCase().includes(q) || p.descripcion?.toLowerCase().includes(q);
      }
      return true;
    }),

  paginate: <T>(items: T[], page: number, perPage: number): T[] =>
    items.slice((page - 1) * perPage, page * perPage),

  extractCategories: (items: IProduct[]): string[] => [
    ...new Set(items.map((p) => p.categoría).filter(Boolean)),
  ],

  getCategories: (): string[] => productService.extractCategories(productStorage.getAll()),

  /** Lee la lista guardada; si no existe la deriva de productos y la persiste. */
  getOrSeedCategories: (): string[] => {
    const stored = productStorage.getCategories();
    if (stored.length) return stored;
    const seeded = productService.extractCategories(productStorage.getAll());
    productStorage.saveCategories(seeded);
    return seeded;
  },

  saveCategories: (categorias: string[]): void => productStorage.saveCategories(categorias),

  createCategoria: (nombre: string, actuales: string[]): ResultadoCategoria => {
    const value = nombre.trim();
    if (!value) return { ok: false, error: 'Nombre requerido' };
    if (actuales.includes(value)) return { ok: false, error: 'Ya existe' };
    const categorias = [...actuales, value];
    productStorage.saveCategories(categorias);
    return { ok: true, categorias };
  },

  updateCategoria: (anterior: string, nombre: string, actuales: string[]): ResultadoCategoria => {
    const value = nombre.trim();
    if (!value) return { ok: false, error: 'Nombre requerido' };
    if (value !== anterior && actuales.includes(value)) return { ok: false, error: 'Ya existe' };
    const categorias = actuales.map((c) => (c === anterior ? value : c));
    productStorage.saveCategories(categorias);
    return { ok: true, categorias };
  },

  deleteCategoria: (categoria: string): ResultadoCategoria => {
    const count = productStorage.getAll().filter((p) => p.categoría === categoria).length;
    if (count > 0) return { ok: false, error: `No se puede: ${count} productos usan esta categoría` };
    const categorias = productStorage.getCategories().filter((c) => c !== categoria);
    productStorage.saveCategories(categorias);
    return { ok: true, categorias };
  },

  filterCategorias: (categorias: string[], busqueda: string): string[] =>
    !busqueda ? categorias : categorias.filter((c) => c.toLowerCase().includes(busqueda.toLowerCase())),

  countByCategoria: (items: IProduct[], categoria: string): number =>
    items.filter((p) => p.categoría === categoria).length,

  getDestacados: (): IProduct[] => productStorage.getAll().filter((p) => p.destacado),
  getMasVendidos: (): IProduct[] => productStorage.getAll().filter((p) => p.masVendido),
  getRecomendados: (): IProduct[] => productStorage.getAll().filter((p) => p.recomendado),
  getNuevos: (): IProduct[] => productStorage.getAll().filter((p) => p.nuevo),
};
