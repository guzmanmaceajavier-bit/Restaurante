import { useNavigate } from 'react-router-dom'
import { useCartStore } from '../../store/useCartStore'
import { TotalOrder } from './TotalOrder'
import { ProductsList } from './ProductsList'
import { FiShoppingBag } from 'react-icons/fi'

interface IProps {
  open: boolean
  setOpen: (open: boolean) => void
}

export function CartModal({ open, setOpen }: IProps) {
  const cart = useCartStore((state) => state.cart)
  const navigate = useNavigate()

  return (
    <section
      style={{ transform: `translateX(${open ? 0 : 100}%)` }}
      className='fixed bottom-0 top-20 right-0 flex flex-col justify-between overflow-hidden w-full max-w-md bg-white rounded-l-2xl shadow-2xl transition-transform duration-300 ease-in-out z-30'
    >
      <div className='bg-brick-500 text-white py-5 px-6'>
        <div className='flex items-center gap-3'>
          <FiShoppingBag size={24} />
          <h2 className='text-xl font-bold'>Tu pedido</h2>
          <span className='ml-auto text-sm bg-white/20 px-3 py-1 rounded-full'>{cart.length} {cart.length === 1 ? 'item' : 'items'}</span>
        </div>
      </div>

      <ProductsList cart={cart} />
      
      <div className='border-t border-smoke p-4 space-y-3 bg-white'>
        <TotalOrder cart={cart} />
        <button
          onClick={() => {
            if (cart.length > 0) {
              navigate('/checkout')
              setOpen(false)
            }
          }}
          disabled={cart.length === 0}
          className='w-full py-3 bg-brick-500 hover:bg-brick-600 disabled:bg-smoke text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2'
        >
          Continuar pedido
        </button>
      </div>
    </section>
  )
}
