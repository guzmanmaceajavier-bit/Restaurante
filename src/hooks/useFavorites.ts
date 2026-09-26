import { useState, useEffect, useCallback } from 'react'
import { authStorage } from '../services/storage/authStorage'
import { STORAGE_KEYS } from '../services/storage/storageKeys'
import { readJson, writeJson } from '../services/storage/jsonStore'

const baseKey = (clientId?: string) =>
  clientId ? `${STORAGE_KEYS.FAVORITES_PREFIX}-${clientId}` : STORAGE_KEYS.FAVORITES_PREFIX

export function useFavorites(clientId?: string) {
  const key = baseKey(clientId)
  const [favorites, setFavorites] = useState<string[]>(() => {
    // Compatibilidad: useAuthStore migra `sabor-favorites-<telefono>` al cambiar teléfono
    return clientId ? authStorage.getFavorites(clientId) : readJson<string[]>(key, [])
  })

  useEffect(() => {
    if (clientId) authStorage.setFavorites(clientId, favorites)
    else writeJson(key, favorites)
  }, [favorites, clientId, key])

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
