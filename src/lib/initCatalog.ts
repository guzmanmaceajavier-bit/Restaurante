import type { IProduct } from '../features/products/types';
import { productService } from '../features/products/product.service';
import { useProductStore } from '../store/useProductStore';

/** Carga inicial del catálogo real (mock_data.json) si el storage está vacío. */
export async function initDataService(): Promise<void> {
  if (!productService.getAll().length) {
    const data = await import('../mockData/mock_data.json');
    const productos = (data.default as IProduct[]).map((p, i) => ({
      ...p,
      id: p.id || `prod-${i}`,
    }));
    productService.saveAll(productos);
  }
  useProductStore.getState().loadProductos();
}
