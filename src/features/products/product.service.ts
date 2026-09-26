import type { IProduct } from './types';
import { productStorage } from '../../services/storage/productStorage';

/** Fachada de catálogo. Hoy lee localStorage; mañana: GET /api/products. */
export const productService = {
  getAll: (): IProduct[] => productStorage.getAll(),
  saveAll: (items: IProduct[]): void => productStorage.saveAll(items),
  getById: (id: string): IProduct | undefined =>
    productStorage.getAll().find((p) => p.id === id || p.nombre === id),
  getCategories: (): string[] => [...new Set(productStorage.getAll().map((p) => p.categoría))],
  getDestacados: (): IProduct[] => productStorage.getAll().filter((p) => p.destacado),
  getMasVendidos: (): IProduct[] => productStorage.getAll().filter((p) => p.masVendido),
  getRecomendados: (): IProduct[] => productStorage.getAll().filter((p) => p.recomendado),
  getNuevos: (): IProduct[] => productStorage.getAll().filter((p) => p.nuevo),
};
