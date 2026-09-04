import { useState, useEffect, useCallback } from 'react'

const FAV_KEY = 'sabor-favorites'

function getFavorites(): string[] {
  try {
    return JSON.parse(localStorage.getItem(FAV_KEY) || '[]')
  } catch { return [] }
}

export function useFavorites(clientId?: string) {
  const key = clientId ? `${FAV_KEY}-${clientId}` : FAV_KEY
  const [favorites, setFavorites] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(key) || '[]') } catch { return [] }
  })

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(favorites))
  }, [favorites, key])

  const toggleFavorite = useCallback((productId: string) => {
    setFavorites(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
  }, [])

  const isFavorite = useCallback((productId: string) => {
    return favorites.includes(productId)
  }, [favorites])

  return { favorites, toggleFavorite, isFavorite }
}
