import { CONFIG, type Promocion } from './config'

export function validarCodigo(codigo: string): Promocion | null {
  if (!codigo.trim()) return null
  const promo = CONFIG.promociones.find(
    (p) => p.codigo && p.codigo.toLowerCase() === codigo.trim().toLowerCase() && p.vigente
  )
  return promo || null
}

export function aplicarDescuento(subtotal: number, promo: Promocion): number {
  if (promo.descuento <= 0) return 0
  return Math.round(subtotal * (promo.descuento / 100))
}
