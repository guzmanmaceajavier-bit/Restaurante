import { useEffect, useState } from 'react'
import type { IProduct } from '../features/products/types'
import { productService } from '../features/products/product.service'

interface IProps {
  productId?: string
}

export function useProducts({ productId }: IProps) {
  const [productById, setProductById] = useState<IProduct>()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
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
  }, [productId])

  const filterProducts = (category: string) => {
    return productService.getAll().filter((product) => product.categoría === category && product.nombre !== productId)
  }

  return {
    productById,
    loading,
    error,
    filterProducts,
  }
}
