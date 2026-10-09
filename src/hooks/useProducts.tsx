import { useEffect, useState } from 'react'
import type { IProduct } from '../features/products/types'
import { productService } from '../features/products/product.service'
import { useProductStore } from '../store/useProductStore'

interface IProps {
  productId?: string
}

export function useProducts({ productId }: IProps) {
  const [productById, setProductById] = useState<IProduct>()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const storeProductos = useProductStore((s) => s.productos)
  const catalogStatus = useProductStore((s) => s.status)

  useEffect(() => { useProductStore.getState().loadProductos() }, [])

  useEffect(() => {
    if (catalogStatus === 'loading') {
      setLoading(true)
      return
    }
    if (catalogStatus === 'error') {
      setLoading(false)
      setError('No se pudo cargar el catálogo')
      setProductById(undefined)
      return
    }
    setLoading(true)
    setError('')

    try {
      if (!productId) {
        setError('No se proporcionó un ID de producto')
        setProductById(undefined)
        return
      }

      const product = productService.getById(productId)

      if (!product) {
        setError(`No se encontró el producto: ${productId}`)
        setProductById(undefined)
      } else {
        setProductById(product)
      }
    } catch (err) {
      setError('Ocurrió un error al buscar el producto')
    } finally {
      setLoading(false)
    }
  }, [productId, storeProductos, catalogStatus])

  const filterProducts = (category: string) => {
    return storeProductos.filter((product) => product.categoría === category && product.nombre !== productId)
  }

  return {
    productById,
    loading,
    error,
    filterProducts,
  }
}
