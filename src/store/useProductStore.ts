import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { IProduct } from '../features/products/types'
import { productStorage } from '../services/storage/productStorage'
import { STORAGE_KEYS } from '../services/storage/storageKeys'

export type CatalogStatus = 'loading' | 'ready' | 'empty' | 'error'

interface ProductStore {
  productos: IProduct[]
  loaded: boolean
  status: CatalogStatus
  loadProductos: () => void
  getProductoById: (id: string) => IProduct | undefined
  getCategorias: () => string[]
}

export const useProductStore = create<ProductStore>()(
  persist(
    (set, get) => ({
      productos: [],
      loaded: false,
      status: 'loading',

      loadProductos: () => {
        if (get().loaded) {
          const current = get()
          set({ status: current.productos.length ? 'ready' : 'empty' })
          return
        }
        const data = productStorage.getAll()
        if (data.length) {
          const withIds = data.map((p, i) => ({
            ...p,
            id: p.id || `prod-${Date.now().toString(36)}-${i}`,
          }))
          set({ productos: withIds, loaded: true, status: 'ready' })
          productStorage.saveAll(withIds)
        } else if (get().status !== 'loading') {
          set({ status: 'empty' })
        }
        // status 'loading': init en curso, él resuelve a ready/empty/error
      },

      getProductoById: (id) => {
        return get().productos.find((p) => p.id === id)
      },

      getCategorias: () => {
        return [...new Set(get().productos.map((p) => p.categoría))]
      },
    }),
    { name: STORAGE_KEYS.PRODUCTS_STORE }
  )
)
