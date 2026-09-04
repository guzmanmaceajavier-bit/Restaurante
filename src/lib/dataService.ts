import type { IProduct } from '../types/product'
import { CONFIG, type Promocion, type Combo, type ProductoDestacado } from './config'

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
  getProductos: () => {
    const raw = localStorage.getItem('productos')
    if (raw) {
      return JSON.parse(raw) as IProduct[]
    }
    return []
  },

  getProductoById: (id: string) => {
    const productos = dataService.getProductos()
    return productos.find((p) => p.id === id || p.nombre === id)
  },

  getCategorias: () => {
    const productos = dataService.getProductos()
    return [...new Set(productos.map((p) => p.categoría))]
  },

  getDestacados: () => {
    return dataService.getProductos().filter((p) => p.destacado)
  },

  getMasVendidos: () => {
    return dataService.getProductos().filter((p) => p.masVendido)
  },

  getRecomendados: () => {
    return dataService.getProductos().filter((p) => p.recomendado)
  },

  getNuevos: () => {
    return dataService.getProductos().filter((p) => p.nuevo)
  },

  getPromociones: () => {
    return CONFIG.promociones.filter((p) => p.vigente)
  },

  getCombos: () => {
    return CONFIG.combos
  },

  getProductosDestacados: () => {
    return CONFIG.productosDestacados
  },
}

export async function initDataService(): Promise<void> {
  const existing = localStorage.getItem('productos')
  if (existing) return
  const data = await import('../mockData/mock_data.json')
  const productos = (data.default as IProduct[]).map((p, i) => ({
    ...p,
    id: p.id || `prod-${i}`,
  }))
  localStorage.setItem('productos', JSON.stringify(productos))
}
