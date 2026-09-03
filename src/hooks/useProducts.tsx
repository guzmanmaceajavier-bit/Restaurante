import { useEffect, useState } from 'react'
import type { IProduct } from '../types/product'
import menuData from '../mockData/mock_data.json'

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

      const product = menuData.find((item) => item.nombre === productId)

      if (!product) {
        setError(`No se encontró el producto con nombre: ${productId}`)
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
    return menuData.filter((product) => product.categoría === category && product.nombre !== productId)
  }

  return {
    productById,
    loading,
    error,
    filterProducts,
  }
}
