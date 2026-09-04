import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ICliente } from '../types/client'
import { obtenerNivel, calcularPuntos } from '../lib/fidelidad'

interface ClientStore {
  clientes: ICliente[]
  clienteActual: ICliente | null
  addCliente: (cliente: Omit<ICliente, 'id' | 'puntos' | 'nivel' | 'historialPedidos' | 'createdAt'>) => ICliente
  findCliente: (telefono: string) => ICliente | undefined
  sumarPuntos: (telefono: string, montoTotal: number, orderId: string) => void
  canjearPuntos: (telefono: string, puntos: number) => boolean
  setClienteActual: (cliente: ICliente | null) => void
}

function syncAuthStore(clientes: ICliente[]) {
  try {
    const authData = localStorage.getItem('auth-client-storage')
    if (!authData) return
    const parsed = JSON.parse(authData)
    const authClientes = parsed.state?.clientes || []
    const updated = authClientes.map((ac: any) => {
      const synced = clientes.find((c) => c.telefono === ac.telefono)
      if (synced) {
        return { ...ac, puntos: synced.puntos, nivel: synced.nivel, historialPedidos: synced.historialPedidos }
      }
      return ac
    })
    localStorage.setItem('auth-client-storage', JSON.stringify({ ...parsed, state: { ...parsed.state, clientes: updated } }))
  } catch {}
}

function readFromAuthStore(): ICliente[] {
  try {
    const authData = localStorage.getItem('auth-client-storage')
    if (!authData) return []
    const parsed = JSON.parse(authData)
    const authClientes = parsed.state?.clientes || []
    return authClientes.map((c: any) => ({
      id: c.id, nombre: c.nombre, email: c.email, telefono: c.telefono,
      puntos: c.puntos || 0, nivel: c.nivel || 'bronce',
      historialPedidos: c.historialPedidos || [], createdAt: c.createdAt || '',
    }))
  } catch { return [] }
}

export const useClientStore = create<ClientStore>()(
  persist(
    (set, get) => ({
      clientes: [],
      clienteActual: null,

      addCliente: (data) => {
        const authClientes = readFromAuthStore()
        const existing = get().clientes.find((c) => c.telefono === data.telefono)
        if (existing) return existing
        const existingAuth = authClientes.find((c) => c.telefono === data.telefono)
        if (existingAuth) return existingAuth

        const nuevo: ICliente = {
          ...data,
          id: `CLI-${Date.now().toString(36).toUpperCase()}`,
          puntos: 0,
          nivel: 'bronce',
          historialPedidos: [],
          createdAt: new Date().toISOString(),
        }
        set((state) => ({ clientes: [...state.clientes, nuevo] }))
        return nuevo
      },

      findCliente: (telefono) => {
        const local = get().clientes.find((c) => c.telefono === telefono)
        if (local) return local
        const authClientes = readFromAuthStore()
        return authClientes.find((c) => c.telefono === telefono)
      },

      sumarPuntos: (telefono, montoTotal, orderId) => {
        const puntosGanados = calcularPuntos(montoTotal)
        set((state) => {
          const updated = state.clientes.map((c) => {
            if (c.telefono !== telefono) return c
            const nuevosPuntos = c.puntos + puntosGanados
            return { ...c, puntos: nuevosPuntos, nivel: obtenerNivel(nuevosPuntos), historialPedidos: [...c.historialPedidos, orderId] }
          })
          syncAuthStore(updated)
          return { clientes: updated }
        })
      },

      canjearPuntos: (telefono, puntos) => {
        const cliente = get().clientes.find((c) => c.telefono === telefono)
        if (!cliente || cliente.puntos < puntos) return false
        set((state) => {
          const updated = state.clientes.map((c) => c.telefono !== telefono ? c : { ...c, puntos: c.puntos - puntos })
          syncAuthStore(updated)
          return { clientes: updated }
        })
        return true
      },

      setClienteActual: (cliente) => set({ clienteActual: cliente }),
    }),
    { name: 'client-storage' }
  )
)
