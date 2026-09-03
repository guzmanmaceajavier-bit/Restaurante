import { FaTrash } from 'react-icons/fa'
import { useCartStore } from '../../store/useCartStore'
import type { IProductCart } from '../../types/product'
import { numberFormatter } from '../../utils/numberFormatter'
import { Quantity } from './Quantity'

interface IProps {
  item: IProductCart
}

export function Card({ item }: IProps) {
  const { addToCart, decrementQuantity, removeItem } = useCartStore()

  return (
    <article className='flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm border border-smoke'>
      <div className='w-20 h-20 rounded-lg overflow-hidden shrink-0'>
        <img src={item.imagen} alt={item.nombre} className='size-full object-cover' />
      </div>
      <div className='flex-1 min-w-0'>
        <h3 className='font-semibold text-ink truncate'>{item.nombre}</h3>
        <p className='text-brick-600 font-bold text-sm mt-0.5'>$ {numberFormatter(item.precio! * item.quantity)}</p>
        <Quantity
          quantity={item.quantity}
          increment={() => addToCart({ ...item, quantity: 1 })}
          decrement={() => decrementQuantity(item)}
        />
      </div>
      <button
        type='button'
        onClick={() => { removeItem(item) }}
        className='text-steel hover:text-red-500 transition-colors p-2'
        aria-label={`Eliminar ${item.nombre}`}
      >
        <FaTrash size={14} />
      </button>
    </article>
  )
}
