export type NivelCliente = 'bronce' | 'plata' | 'oro'

export interface DireccionCliente {
  id: string
  alias: string
  direccion: string
  indicaciones?: string
}

export interface ICliente {
  id: string
  nombre: string
  email: string
  telefono: string
  puntos: number
  nivel: NivelCliente
  historialPedidos: string[]
  historialReservas: string[]
  direcciones: DireccionCliente[]
  createdAt: string
}

export interface PuntosConfig {
  pesosPorPunto: number
  puntosCanje: number
  descuentoNiveles: Record<NivelCliente, number>
}
