import { useMemo } from 'react'
import type { IProductCart } from '../../features/products/types'
import { numberFormatter } from '../../utils/numberFormatter'
import { getRestaurantConfig } from '../../lib/config'

interface IProps {
  cart: IProductCart[]
  showDelivery?: boolean
  orderType?: string
}

export function TotalOrder({ cart, showDelivery, orderType }: IProps) {
  const subtotal = useMemo(
    () => cart.reduce((acc, item) => acc + (item.precio ?? 0) * item.quantity, 0),
    [cart]
  )

  const rc = getRestaurantConfig()
  const deliveryFee = orderType === 'delivery' && subtotal < rc.envioGratisMinimo
    ? rc.costoDomicilio
    : 0

  const total = subtotal + deliveryFee

  return (
    <div className='w-full space-y-1.5'>
      <div className='flex justify-between text-[13px] text-steel'>
        <span>Subtotal</span>
        <span className='tabular-nums'>${numberFormatter(subtotal)}</span>
      </div>
      {showDelivery && orderType === 'delivery' && (
        <div className='flex justify-between text-[13px]'>
          {deliveryFee > 0 ? (
            <>
              <span className='text-steel'>Delivery</span>
              <span className='text-steel tabular-nums'>${numberFormatter(deliveryFee)}</span>
            </>
          ) : (
            <span className='text-sage-600 font-medium'>Delivery gratis en este pedido</span>
          )}
        </div>
      )}
      <div className='flex justify-between items-baseline border-t border-dashed border-cream-300 pt-2.5'>
        <span className='text-sm font-semibold text-espresso-800'>Total</span>
        <span className='font-display font-bold text-2xl text-espresso-800 tabular-nums'>${numberFormatter(total)}</span>
      </div>
      {showDelivery && orderType === 'delivery' && subtotal < rc.envioGratisMinimo && (
        <p className='text-[11px] text-steel text-right'>
          Agrega ${numberFormatter(rc.envioGratisMinimo - subtotal)} más y el delivery va por nuestra cuenta
        </p>
      )}
    </div>
  )
}
