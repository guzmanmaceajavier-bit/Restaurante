import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface DireccionCliente { id: string; alias: string; direccion: string; indicaciones?: string }
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
  direcciones?: DireccionCliente[]
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
  canjearPuntos: (costo: number) => { ok:boolean; error?:string }
  updateProfile: (data: Partial<Pick<ClienteAuth,'nombre'|'email'|'telefono'|'password'>>) => { ok:boolean; error?:string }
  addDireccion: (d: Omit<DireccionCliente,'id'>) => void
  updateDireccion: (id: string, d: Partial<DireccionCliente>) => void
  deleteDireccion: (id: string) => void
  deleteAccount: () => void
}

const getFidelizacionCfg = () => {
  try { const c=JSON.parse(localStorage.getItem('fidelizacion_cfg')||'null'); if(c) return c } catch{}
  return { pesosPorPunto: 10000, puntosCanje: 100 }
}
const calcularNivel = (puntos: number): 'bronce' | 'plata' | 'oro' => {
  // umbrales únicos: bronce 0, plata 200, oro 500 (coherente con AdminFidelizacion default)
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
        const cfg=getFidelizacionCfg()
        const puntosGanados = Math.floor(monto / (cfg.pesosPorPunto||10000))
        const nuevosPuntos = actual.puntos + puntosGanados
        const updated = { ...actual, puntos: nuevosPuntos, nivel: calcularNivel(nuevosPuntos) }
        set({
          clienteActual: updated,
          clientes: get().clientes.map((c) => c.id === actual.id ? updated : c),
        })
      },
      canjearPuntos: (costo) => {
        const actual=get().clienteActual
        if(!actual) return {ok:false, error:'No autenticado'}
        if(actual.puntos < costo) return {ok:false, error:'Puntos insuficientes'}
        const nuevos=actual.puntos - costo
        const updated={...actual, puntos: nuevos, nivel: calcularNivel(nuevos)}
        set({ clienteActual: updated, clientes: get().clientes.map(c=> c.id===actual.id ? updated : c)})
        return {ok:true}
      },
      updateProfile: (data) => {
        const actual=get().clienteActual
        if(!actual) return {ok:false, error:'No autenticado'}
        if(data.email && data.email!==actual.email && get().clientes.some(c=> c.email===data.email)) return {ok:false, error:'Ese email ya está en uso'}
        if(data.telefono && data.telefono!==actual.telefono && get().clientes.some(c=> c.telefono===data.telefono)) return {ok:false, error:'Ese teléfono ya está en uso'}
        // Migrar favoritos si cambia teléfono
        if(data.telefono && data.telefono!==actual.telefono){
          try{
            const oldKey=`sabor-favorites-${actual.telefono}`
            const newKey=`sabor-favorites-${data.telefono}`
            const fav=localStorage.getItem(oldKey)
            if(fav && !localStorage.getItem(newKey)) localStorage.setItem(newKey, fav)
          } catch{}
        }
        const updated={...actual, ...data}
        set({ clienteActual: updated, clientes: get().clientes.map(c=> c.id===actual.id ? updated : c)})
        return {ok:true}
      },
      addDireccion: (d) => {
        const actual=get().clienteActual; if(!actual) return
        const nueva={...d, id:`DIR-${Date.now().toString(36).toUpperCase()}`}
        const updated={...actual, direcciones:[...(actual.direcciones||[]), nueva]}
        set({ clienteActual: updated, clientes: get().clientes.map(c=> c.id===actual.id ? updated : c)})
      },
      updateDireccion: (id, d) => {
        const actual=get().clienteActual; if(!actual) return
        const updated={...actual, direcciones:(actual.direcciones||[]).map(x=> x.id===id ? {...x, ...d}: x)}
        set({ clienteActual: updated, clientes: get().clientes.map(c=> c.id===actual.id ? updated : c)})
      },
      deleteDireccion: (id) => {
        const actual=get().clienteActual; if(!actual) return
        const updated={...actual, direcciones:(actual.direcciones||[]).filter(x=> x.id!==id)}
        set({ clienteActual: updated, clientes: get().clientes.map(c=> c.id===actual.id ? updated : c)})
      },
      deleteAccount: () => {
        const actual=get().clienteActual; if(!actual) return
        try{
          localStorage.removeItem(`sabor-favorites-${actual.telefono}`)
          localStorage.removeItem(`fidelidad_historial_${actual.id}`)
          localStorage.removeItem(`prefs_${actual.id}`)
        } catch{}
        set({ clientes: get().clientes.filter(c=> c.id!==actual.id), clienteActual: null })
      },
    }),
    { name: 'auth-client-storage' }
  )
)
