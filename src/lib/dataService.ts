import type { IProduct } from '../features/products/types'
import { CONFIG, type Promocion, type Combo, type ProductoDestacado } from './config'
import { productService } from '../features/products/product.service'
import { STORAGE_KEYS } from '../services/storage/storageKeys'
import { readJson } from '../services/storage/jsonStore'

export interface IDataService {
  getProductos: () => IProduct[]
  getProductoById: (id: string) => IProduct | undefined
  getCategorias: () => string[]
  getDestacados: () => IProduct[]
  getMasVendidos: () => IProduct[]
  getRecomendados: () => IProduct[]
  getNuevos: () => IProduct[]
  getPromociones: () => Promocion[]
  getCombos: () => Combo[]
  getProductosDestacados: () => ProductoDestacado[]
}

export const dataService: IDataService = {
  getProductos: () => productService.getAll(),

  getProductoById: (id: string) => productService.getById(id),

  getCategorias: () => productService.getCategories(),

  getDestacados: () => productService.getDestacados(),

  getMasVendidos: () => productService.getMasVendidos(),

  getRecomendados: () => productService.getRecomendados(),

  getNuevos: () => productService.getNuevos(),

  getPromociones: () => {
    const stored = readJson<Promocion[]>(STORAGE_KEYS.PROMOTIONS_ADMIN, []);
    if (stored.length) return stored.filter((p) => p.vigente);
    return CONFIG.promociones.filter((p) => p.vigente);
  },

  getCombos: () => {
    return CONFIG.combos
  },

  getProductosDestacados: () => {
    return CONFIG.productosDestacados
  },
}

export async function initDataService(): Promise<void> {
  if (!productService.getAll().length) {
    const data = await import('../mockData/mock_data.json')
    const productos = (data.default as IProduct[]).map((p, i) => ({
      ...p,
      id: p.id || `prod-${i}`,
    }))
    productService.saveAll(productos)
  }
  const { seedDemoData } = await import('./seedDemo')
  seedDemoData()
}
