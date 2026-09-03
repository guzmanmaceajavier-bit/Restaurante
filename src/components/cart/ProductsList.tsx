import { GiHotMeal } from 'react-icons/gi'
import type { IProductCart } from '../../types/product'
import { Card } from './Card'

interface IProps {
  cart: IProductCart[]
}

export function ProductsList({ cart }: IProps) {
  if (!cart.length) {
    return (
      <div className='flex-1 grid place-items-center text-smoke px-6'>
        <GiHotMeal size={100} />
        <p className='text-center text-lg font-bold text-steel mt-4'>No hay elementos en el pedido</p>
        <p className='text-sm text-steel'>Agrega productos desde el menú</p>
      </div>
    )
  }

  return (
    <div className='flex-1 overflow-y-auto p-4 space-y-3'>
      {cart.map((item) => (
        <Card key={item.nombre} item={item} />
      ))}
    </div>
  )
}
