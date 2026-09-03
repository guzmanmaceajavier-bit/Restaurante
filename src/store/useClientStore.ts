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

export const useClientStore = create<ClientStore>()(
  persist(
    (set, get) => ({
      clientes: [],
      clienteActual: null,

      addCliente: (data) => {
        const existing = get().clientes.find((c) => c.telefono === data.telefono)
        if (existing) return existing

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
        return get().clientes.find((c) => c.telefono === telefono)
      },

      sumarPuntos: (telefono, montoTotal, orderId) => {
        set((state) => ({
          clientes: state.clientes.map((c) => {
            if (c.telefono !== telefono) return c
            const puntosGanados = calcularPuntos(montoTotal)
            const nuevosPuntos = c.puntos + puntosGanados
            return {
              ...c,
              puntos: nuevosPuntos,
              nivel: obtenerNivel(nuevosPuntos),
              historialPedidos: [...c.historialPedidos, orderId],
            }
          }),
        }))
      },

      canjearPuntos: (telefono, puntos) => {
        const cliente = get().clientes.find((c) => c.telefono === telefono)
        if (!cliente || cliente.puntos < puntos) return false

        set((state) => ({
          clientes: state.clientes.map((c) => {
            if (c.telefono !== telefono) return c
            return { ...c, puntos: c.puntos - puntos }
          }),
        }))
        return true
      },

      setClienteActual: (cliente) => set({ clienteActual: cliente }),
    }),
    { name: 'client-storage' }
  )
)
