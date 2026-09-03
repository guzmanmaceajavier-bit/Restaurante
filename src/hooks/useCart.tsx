import { toast } from 'sonner'
import { useCartStore } from '../store/useCartStore'
import type { IProductCart } from '../types/product'

export function useCart() {
  const { addToCart, decrementQuantity, removeItem, cart } = useCartStore()

  const handleAddToCart = (product: IProductCart) => {
    const existing = cart.find((item) => item.nombre === product.nombre)
    addToCart(product)
    toast.success(existing ? `Se aumentó la cantidad de ${product.nombre}` : `${product.nombre} agregado al carrito`)
  }

  const handleDecrement = (product: IProductCart) => {
    decrementQuantity(product)
  }

  const handleRemove = (product: IProductCart) => {
    removeItem(product)
    toast.error(`${product.nombre} eliminado del carrito`)
  }

  return { addToCart: handleAddToCart, decrementQuantity: handleDecrement, removeItem: handleRemove }
}
