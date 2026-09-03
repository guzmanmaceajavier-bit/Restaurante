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

let rawCache: IProduct[] | null = null

export const dataService: IDataService = {
  getProductos: () => {
    if (rawCache) return rawCache
    const raw = localStorage.getItem('productos')
    if (raw) {
      rawCache = JSON.parse(raw) as IProduct[]
      return rawCache
    }
    return []
  },

  getProductoById: (id: string) => {
    const productos = dataService.getProductos()
    return productos[Number(id)]
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
  const data = await import('../mockData/mock_data.json')
  rawCache = data.default as IProduct[]
  localStorage.setItem('productos', JSON.stringify(rawCache))
}
