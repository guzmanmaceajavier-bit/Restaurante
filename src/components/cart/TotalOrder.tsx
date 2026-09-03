import { useMemo } from 'react'
import type { IProductCart } from '../../types/product'
import { numberFormatter } from '../../utils/numberFormatter'
import { CONFIG } from '../../lib/config'

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

  const deliveryFee = orderType === 'delivery' && subtotal < CONFIG.delivery.minimoGratis
    ? CONFIG.delivery.tarifa
    : 0

  const total = subtotal + deliveryFee

  return (
    <div className='w-full space-y-2'>
      <div className='flex justify-between text-sm text-steel'>
        <span>Subtotal</span>
        <span>$ {numberFormatter(subtotal)}</span>
      </div>
      {showDelivery && orderType === 'delivery' && (
        <div className='flex justify-between text-sm'>
          {deliveryFee > 0 ? (
            <>
              <span className='text-steel'>Delivery</span>
              <span className='text-steel'>$ {numberFormatter(deliveryFee)}</span>
            </>
          ) : (
            <span className='text-green-600 font-medium'>Delivery gratis</span>
          )}
        </div>
      )}
      <div className='flex justify-between border-t border-smoke pt-2 font-bold text-lg'>
        <span>Total</span>
        <span className='text-brick-600'>$ {numberFormatter(total)}</span>
      </div>
      {showDelivery && orderType === 'delivery' && subtotal < CONFIG.delivery.minimoGratis && (
        <p className='text-xs text-steel text-right'>
          Falta $ {numberFormatter(CONFIG.delivery.minimoGratis - subtotal)} para delivery gratis
        </p>
      )}
    </div>
  )
}
