import type { IProduct } from '../features/products/types';
import { productService } from '../features/products/product.service';
import { useProductStore } from '../store/useProductStore';
import mockData from '../mockData/mock_data.json';

/**
 * Carga inicial del catálogo real (mock_data.json) si el storage está vacío.
 * Import estático a propósito: evita un chunk async que pueda colgarse
 * (service worker / red) y dejar el catálogo en 'loading' para siempre.
 */
export function initDataService(): void {
  useProductStore.setState({ status: 'loading' });
  try {
    if (!productService.getAll().length) {
      const productos = (mockData as unknown as IProduct[]).map((p, i) => ({
        ...p,
        id: p.id || `prod-${i}`,
      }));
      productService.saveAll(productos);
    }
    useProductStore.getState().loadProductos();
    const state = useProductStore.getState();
    if (state.status === 'loading') {
      useProductStore.setState({ status: state.productos.length ? 'ready' : 'empty' });
    }
  } catch {
    useProductStore.setState({ status: 'error' });
  }
}
