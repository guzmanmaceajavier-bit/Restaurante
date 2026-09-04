import { useNavigate } from 'react-router-dom'
import { useCartStore } from '../../store/useCartStore'
import { TotalOrder } from './TotalOrder'
import { ProductsList } from './ProductsList'
import { FiShoppingBag, FiX } from 'react-icons/fi'
import { FaTag } from 'react-icons/fa'
import { useEffect, useState } from 'react'
import { CONFIG } from '../../lib/config'
import { toast } from 'sonner'
import clsx from 'clsx'

interface IProps {
  open: boolean
  setOpen: (open: boolean) => void
}

export function CartModal({ open, setOpen }: IProps) {
  const cart = useCartStore((s) => s.cart)
  const navigate = useNavigate()
  const [promoCode, setPromoCode] = useState('')
  const [promoApplied, setPromoApplied] = useState(false)

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
    const validPromo = CONFIG.promociones?.find(p => p.codigo?.toUpperCase() === code)
    if (validPromo) {
      setPromoApplied(true)
      toast.success(`Cupón "${code}" aplicado: ${validPromo.descuento}% de descuento`)
    } else {
      toast.error('Cupón no válido')
    }
  }

  return (
    <>
      <div
        className={clsx(
          'fixed inset-0 bg-espresso-900/40 backdrop-blur-sm z-30 transition-opacity duration-300',
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={() => setOpen(false)}
      />
      <section
        className={clsx(
          'fixed bottom-0 top-0 right-0 flex flex-col overflow-hidden w-full max-w-md bg-cream-50 shadow-2xl transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] z-40',
          open ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-olive-500 to-olive-600 text-white py-5 px-6 flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <FiShoppingBag size={20} />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-display font-bold">Tu pedido</h2>
            <span className="text-sm text-white/70">{cart.length} {cart.length === 1 ? 'producto' : 'productos'}</span>
          </div>
          <button onClick={() => setOpen(false)} className="p-2 hover:bg-white/20 rounded-xl transition-all active:scale-90">
            <FiX size={20} />
          </button>
        </div>

        {/* Products */}
        <div className="flex-1 overflow-hidden">
          <ProductsList cart={cart} onClose={() => setOpen(false)} />
        </div>

        {/* Footer */}
        <div className="border-t border-cream-200 p-5 space-y-3 bg-white shrink-0">
          {/* Promo code */}
          {cart.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <FaTag className="absolute left-3 top-1/2 -translate-y-1/2 text-steel/40" size={12} />
                <input type="text" value={promoCode} onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="Cupón de descuento"
                  disabled={promoApplied}
                  className="w-full text-xs bg-cream-50 border border-cream-200 rounded-lg pl-8 pr-3 py-2 focus:outline-none focus:border-olive-400 disabled:opacity-50"
                  onKeyDown={(e) => e.key === 'Enter' && applyPromo()} />
              </div>
              <button onClick={applyPromo} disabled={promoApplied || !promoCode.trim()}
                className="text-xs font-medium px-3 py-2 rounded-lg bg-olive-500 text-white hover:bg-olive-600 disabled:bg-cream-200 disabled:text-steel transition-colors">
                {promoApplied ? '✓' : 'Aplicar'}
              </button>
            </div>
          )}

          <TotalOrder cart={cart} />
          <div className="flex gap-3">
            <button
              onClick={() => { navigate('/menu#menu'); setOpen(false) }}
              className="flex-1 py-3.5 bg-cream-100 text-espresso-700 font-semibold rounded-xl hover:bg-cream-200 transition-all duration-200 text-sm active:scale-95"
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
              className="flex-1 py-3.5 bg-olive-500 hover:bg-olive-600 disabled:bg-cream-200 disabled:text-steel text-white font-semibold rounded-xl transition-all duration-200 shadow-md shadow-olive-500/20 disabled:shadow-none text-sm active:scale-95"
            >
              Pedir ahora
            </button>
          </div>
        </div>
      </section>
    </>
  )
}
