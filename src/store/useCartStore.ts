import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { IProductCart } from '../types/product'

interface CartStore {
  count: number
  cart: IProductCart[]
  setCount: (count: number) => void
  setCart: (cart: IProductCart[]) => void
  addToCart: (product: IProductCart) => void
  decrementQuantity: (product: IProductCart) => void
  removeItem: (product: IProductCart) => void
  clearCart: () => void
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      count: 0,
      cart: [],

      setCount: (count) => set({ count }),
      setCart: (cart) => set({ cart }),

      addToCart: (product) => {
        const currentCart = get().cart
        const existing = currentCart.find((item) => item.nombre === product.nombre)

        if (existing) {
          const updated = currentCart.map((item) =>
            item.nombre === product.nombre
              ? { ...item, quantity: item.quantity + product.quantity }
              : item
          )
          const newCount = updated.reduce((acc, item) => acc + item.quantity, 0)
          set({ cart: updated, count: newCount })
        } else {
          const updated = [...currentCart, product]
          const newCount = updated.reduce((acc, item) => acc + item.quantity, 0)
          set({ cart: updated, count: newCount })
        }
      },

      decrementQuantity: (product) => {
        const currentCart = get().cart
        const updated = currentCart.map((item) =>
          item.nombre === product.nombre
            ? { ...item, quantity: Math.max(item.quantity - 1, 1) }
            : item
        )
        const newCount = updated.reduce((acc, item) => acc + item.quantity, 0)
        set({ cart: updated, count: newCount })
      },

      removeItem: (product) => {
        const updated = get().cart.filter((item) => item.nombre !== product.nombre)
        const newCount = updated.reduce((acc, item) => acc + item.quantity, 0)
        set({ cart: updated, count: newCount })
      },

      clearCart: () => set({ cart: [], count: 0 }),
    }),
    {
      name: 'cart-storage',
    }
  )
)
