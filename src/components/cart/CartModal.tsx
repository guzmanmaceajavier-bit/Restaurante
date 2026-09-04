import { useNavigate } from 'react-router-dom'
import { useCartStore } from '../../store/useCartStore'
import { TotalOrder } from './TotalOrder'
import { ProductsList } from './ProductsList'
import { FiShoppingBag, FiX } from 'react-icons/fi'
import { useEffect } from 'react'
import clsx from 'clsx'

interface IProps {
  open: boolean
  setOpen: (open: boolean) => void
}

export function CartModal({ open, setOpen }: IProps) {
  const cart = useCartStore((s) => s.cart)
  const navigate = useNavigate()

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

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
        <div className="border-t border-cream-200 p-5 space-y-4 bg-white shrink-0">
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
