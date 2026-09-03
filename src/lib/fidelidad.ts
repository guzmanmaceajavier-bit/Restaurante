import type { NivelCliente } from '../types/client'

export const FIDELIDAD_CONFIG = {
  pesosPorPunto: 10000,
  puntosCanje: 100,
  descuentoNiveles: {
    bronce: 0,
    plata: 5,
    oro: 10,
  } as Record<NivelCliente, number>,
  umbralesNivel: {
    bronce: 0,
    plata: 500,
    oro: 1500,
  } as Record<NivelCliente, number>,
}

export function calcularPuntos(montoTotal: number): number {
  return Math.floor(montoTotal / FIDELIDAD_CONFIG.pesosPorPunto)
}

export function obtenerNivel(puntos: number): NivelCliente {
  if (puntos >= FIDELIDAD_CONFIG.umbralesNivel.oro) return 'oro'
  if (puntos >= FIDELIDAD_CONFIG.umbralesNivel.plata) return 'plata'
  return 'bronce'
}

export function calcularDescuento(nivel: NivelCliente): number {
  return FIDELIDAD_CONFIG.descuentoNiveles[nivel]
}

export function puntosParaSiguienteNivel(puntos: number): { siguiente: NivelCliente; faltan: number } | null {
  const nivel = obtenerNivel(puntos)
  if (nivel === 'oro') return null
  const siguiente = nivel === 'bronce' ? 'plata' : 'oro'
  const faltan = FIDELIDAD_CONFIG.umbralesNivel[siguiente] - puntos
  return { siguiente, faltan }
}

export function canjearPuntos(puntosDisponibles: number, puntosACanjear: number): { exito: boolean; puntosRestantes: number; descuento: number } {
  if (puntosACanjear > puntosDisponibles || puntosACanjear < FIDELIDAD_CONFIG.puntosCanje) {
    return { exito: false, puntosRestantes: puntosDisponibles, descuento: 0 }
  }
  const descuento = (puntosACanjear / FIDELIDAD_CONFIG.puntosCanje) * 5000
  return { exito: true, puntosRestantes: puntosDisponibles - puntosACanjear, descuento }
}
