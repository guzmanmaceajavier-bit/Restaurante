import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface ClienteAuth {
  id: string
  nombre: string
  email: string
  telefono: string
  password: string
  puntos: number
  nivel: 'bronce' | 'plata' | 'oro'
  historialPedidos: string[]
  historialReservas: string[]
  createdAt: string
}

interface AuthStore {
  clientes: ClienteAuth[]
  clienteActual: ClienteAuth | null
  register: (data: Omit<ClienteAuth, 'id' | 'puntos' | 'nivel' | 'historialPedidos' | 'historialReservas' | 'createdAt'>) => { ok: boolean; error?: string }
  login: (email: string, password: string) => { ok: boolean; error?: string }
  logout: () => void
  addOrderToHistory: (orderId: string) => void
  addReservaToHistory: (reservaId: string) => void
  addPuntos: (monto: number) => void
}

const calcularNivel = (puntos: number): 'bronce' | 'plata' | 'oro' => {
  if (puntos >= 500) return 'oro'
  if (puntos >= 200) return 'plata'
  return 'bronce'
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      clientes: [],
      clienteActual: null,

      register: (data) => {
        const existing = get().clientes.find((c) => c.email === data.email || c.telefono === data.telefono)
        if (existing) {
          if (existing.email === data.email) return { ok: false, error: 'Ya existe una cuenta con este email' }
          return { ok: false, error: 'Ya existe una cuenta con este teléfono' }
        }
        const nuevo: ClienteAuth = {
          ...data,
          id: `CLI-${Date.now().toString(36).toUpperCase()}`,
          puntos: 0,
          nivel: 'bronce',
          historialPedidos: [],
          historialReservas: [],
          createdAt: new Date().toISOString(),
        }
        set((state) => ({ clientes: [...state.clientes, nuevo], clienteActual: nuevo }))
        return { ok: true }
      },

      login: (email, password) => {
        const cliente = get().clientes.find((c) => c.email === email && c.password === password)
        if (!cliente) return { ok: false, error: 'Email o contraseña incorrectos' }
        set({ clienteActual: cliente })
        return { ok: true }
      },

      logout: () => set({ clienteActual: null }),

      addOrderToHistory: (orderId) => {
        const actual = get().clienteActual
        if (!actual) return
        const updated = { ...actual, historialPedidos: [...actual.historialPedidos, orderId] }
        set({
          clienteActual: updated,
          clientes: get().clientes.map((c) => c.id === actual.id ? updated : c),
        })
      },

      addReservaToHistory: (reservaId) => {
        const actual = get().clienteActual
        if (!actual) return
        const updated = { ...actual, historialReservas: [...actual.historialReservas, reservaId] }
        set({
          clienteActual: updated,
          clientes: get().clientes.map((c) => c.id === actual.id ? updated : c),
        })
      },

      addPuntos: (monto) => {
        const actual = get().clienteActual
        if (!actual) return
        const puntosGanados = Math.floor(monto / 10000)
        const nuevosPuntos = actual.puntos + puntosGanados
        const updated = { ...actual, puntos: nuevosPuntos, nivel: calcularNivel(nuevosPuntos) }
        set({
          clienteActual: updated,
          clientes: get().clientes.map((c) => c.id === actual.id ? updated : c),
        })
      },
    }),
    { name: 'auth-client-storage' }
  )
)
