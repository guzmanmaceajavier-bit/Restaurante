import { useNavigate } from 'react-router-dom'
import { useCartStore } from '../../store/useCartStore'
import { TotalOrder } from './TotalOrder'
import { ProductsList } from './ProductsList'
import { FiShoppingBag, FiX } from 'react-icons/fi'
import { FaTag, FaTrash } from 'react-icons/fa'
import { useEffect, useState } from 'react'
import { promotionService } from '../../features/promotions/promotion.service'
import { toast } from 'sonner'
import clsx from 'clsx'

interface IProps {
  open: boolean
  setOpen: (open: boolean) => void
}

export function CartModal({ open, setOpen }: IProps) {
  const cart = useCartStore((s) => s.cart)
  const count = useCartStore((s) => s.count)
  const appliedPromo = useCartStore((s) => s.appliedPromo)
  const setAppliedPromo = useCartStore((s) => s.setAppliedPromo)
  const clearCart = useCartStore((s) => s.clearCart)
  const navigate = useNavigate()
  const [promoCode, setPromoCode] = useState('')

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  const applyPromo = () => {
    const code = promoCode.trim().toUpperCase()
    const validPromo = promotionService.getVigentes().find(p => p.codigo?.toUpperCase() === code)
    if (validPromo) {
      setAppliedPromo(validPromo)
      toast.success(`Cupón "${code}" aplicado: ${validPromo.descuento}% de descuento`)
    } else {
      toast.error('Cupón no válido')
    }
  }

  return (
    <>
      <div
        className={clsx(
          'fixed inset-0 bg-espresso-900/50 backdrop-blur-sm z-30 transition-opacity duration-300',
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={() => setOpen(false)}
      />
      <section
        className={clsx(
          'fixed bottom-0 top-0 right-0 flex flex-col overflow-hidden w-full max-w-md bg-cream-50 rounded-l-[1.75rem] shadow-soft transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] z-40',
          open ? 'translate-x-0' : 'translate-x-full'
        )}
        aria-label="Carrito de compras"
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="kicker text-olive-500 mb-1">Tu pedido</p>
              <h2 className="font-display font-bold text-espresso-800 text-2xl leading-none">
                {count === 0 ? 'Carrito vacío' : `${count} ${count === 1 ? 'plato' : 'platos'}`}
              </h2>
            </div>
            <div className="flex items-center gap-1.5">
              {cart.length > 0 && (
                <button
                  onClick={() => { clearCart(); toast.success('Carrito vaciado') }}
                  className="inline-flex items-center gap-1.5 text-[11px] font-medium text-steel hover:text-red-500 px-3 py-2 rounded-full hover:bg-red-50 transition-colors"
                >
                  <FaTrash size={10} /> Vaciar
                </button>
              )}
              <button onClick={() => setOpen(false)} aria-label="Cerrar carrito"
                className="w-9 h-9 rounded-full bg-white border border-cream-200 flex items-center justify-center text-espresso-600 hover:bg-cream-100 transition-all active:scale-90">
                <FiX size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Products */}
        <div className="flex-1 overflow-hidden flex flex-col px-6">
          {cart.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-10">
              <div className="w-20 h-20 bg-white border border-cream-200 rounded-3xl flex items-center justify-center mb-5 shadow-card">
                <FiShoppingBag className="text-steel/30" size={30} />
              </div>
              <p className="font-display font-bold text-espresso-800 text-lg">Empieza tu pedido</p>
              <p className="text-sm text-steel mt-1 mb-5">Los platos que agregues aparecen aquí</p>
              <button onClick={() => { navigate('/menu'); setOpen(false) }}
                className="px-6 py-2.5 rounded-full bg-espresso-800 hover:bg-espresso-900 text-white text-sm font-semibold transition-colors">
                Ver menú
              </button>
            </div>
          ) : (
            <ProductsList cart={cart} onClose={() => setOpen(false)} />
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="shrink-0 px-6 pt-4 pb-6 bg-white border-t border-cream-200 rounded-t-[1.5rem] shadow-[0_-12px_32px_rgba(48,69,29,0.08)]">
            {/* Promo code */}
            {appliedPromo ? (
              <div className="flex items-center justify-between gap-2 mb-3 px-4 py-2.5 rounded-2xl bg-olive-50 border border-dashed border-olive-300">
                <span className="inline-flex items-center gap-2 text-xs font-semibold text-olive-700">
                  <FaTag size={11} /> {appliedPromo.codigo} · -{appliedPromo.descuento}%
                </span>
                <button onClick={() => { setAppliedPromo(null); setPromoCode('') }}
                  className="text-[11px] font-medium text-steel hover:text-red-500 transition-colors">
                  Quitar
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 mb-3">
                <div className="relative flex-1">
                  <FaTag className="absolute left-3.5 top-1/2 -translate-y-1/2 text-steel/40" size={12} />
                  <input type="text" value={promoCode} onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="¿Tienes un cupón?"
                    className="w-full text-xs bg-cream-50 border border-dashed border-cream-300 rounded-full pl-9 pr-3 py-2.5 focus:outline-none focus:border-olive-400 placeholder:text-steel/50"
                    onKeyDown={(e) => e.key === 'Enter' && applyPromo()} />
                </div>
                <button onClick={applyPromo} disabled={!promoCode.trim()}
                  className="text-xs font-semibold px-4 py-2.5 rounded-full bg-espresso-800 text-white hover:bg-espresso-900 disabled:opacity-40 transition-all shrink-0">
                  Aplicar
                </button>
              </div>
            )}

            <TotalOrder cart={cart} />
            <div className="flex gap-2.5 mt-4">
              <button
                onClick={() => { navigate('/menu#menu'); setOpen(false) }}
                className="px-5 py-3.5 bg-cream-100 text-espresso-700 font-semibold rounded-full hover:bg-cream-200 transition-all duration-200 text-sm active:scale-95"
              >
                Seguir pidiendo
              </button>
              <button
                onClick={() => {
                  if (cart.length > 0) {
                    navigate('/checkout')
                    setOpen(false)
                  }
                }}
                disabled={cart.length === 0}
                className="flex-1 py-3.5 bg-olive-500 hover:bg-olive-600 disabled:bg-cream-200 disabled:text-steel text-white font-semibold rounded-full transition-all duration-200 shadow-md shadow-olive-500/20 disabled:shadow-none text-sm active:scale-95"
              >
                Pedir ahora
              </button>
            </div>
          </div>
        )}
      </section>
    </>
  )
}
