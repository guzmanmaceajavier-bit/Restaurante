import { type Promocion } from '../../lib/config'
import { promotionService } from './promotion.service'

export function validarCodigo(codigo: string): Promocion | null {
  if (!codigo.trim()) return null
  const promo = promotionService.getVigentes().find(
    (p) => p.codigo && p.codigo.toLowerCase() === codigo.trim().toLowerCase() && p.vigente
  )
  return promo || null
}

export function aplicarDescuento(subtotal: number, promo: Promocion): number {
  if (promo.descuento <= 0) return 0
  return Math.round(subtotal * (promo.descuento / 100))
}
