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
  addProducto: (producto: Omit<IProduct, 'id'>) => IProduct
  updateProducto: (id: string, data: Partial<IProduct>) => void
  deleteProducto: (id: string) => void
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

      addProducto: (producto) => {
        const nuevo: IProduct = {
          ...producto,
          id: `prod-${Date.now().toString(36)}`,
        }
        const updated = [...get().productos, nuevo]
        set({ productos: updated })
        productStorage.saveAll(updated)
        return nuevo
      },

      updateProducto: (id, data) => {
        const updated = get().productos.map((p) =>
          p.id === id ? { ...p, ...data } : p
        )
        set({ productos: updated })
        productStorage.saveAll(updated)
      },

      deleteProducto: (id) => {
        const updated = get().productos.filter((p) => p.id !== id)
        set({ productos: updated })
        productStorage.saveAll(updated)
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
