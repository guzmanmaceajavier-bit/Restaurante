export type NivelCliente = 'bronce' | 'plata' | 'oro'

export interface ICliente {
  id: string
  nombre: string
  email: string
  telefono: string
  puntos: number
  nivel: NivelCliente
  historialPedidos: string[]
  createdAt: string
}

export interface PuntosConfig {
  pesosPorPunto: number
  puntosCanje: number
  descuentoNiveles: Record<NivelCliente, number>
}
