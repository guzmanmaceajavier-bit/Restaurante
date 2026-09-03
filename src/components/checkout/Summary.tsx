import { useCartStore } from '../../store/useCartStore'
import { numberFormatter } from '../../utils/numberFormatter'
import { TotalOrder } from '../cart/TotalOrder'
import { CONFIG } from '../../lib/config'
import type { OrderData } from './CheckOutForm'

interface IProps {
  orderData?: OrderData
}

export function Summary({ orderData }: IProps) {
  const cart = useCartStore((state) => state.cart)

  return (
    <div className="bg-white rounded-2xl shadow-card border border-smoke p-6 md:sticky md:top-24 h-fit">
      <h2 className="text-xl font-serif font-bold text-ink mb-4">Resumen del pedido</h2>

      {!cart.length ? (
        <p className="text-steel text-center py-8">No hay productos</p>
      ) : (
        <div className="space-y-3 mb-4">
          {cart.map((item) => (
            <div key={item.nombre} className="flex items-center gap-3 pb-3 border-b border-dashed border-smoke last:border-0">
              <img src={item.imagen} alt={item.nombre} className="w-12 h-12 rounded-lg object-cover" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{item.nombre}</p>
                <p className="text-xs text-steel">x{item.quantity}</p>
              </div>
              <p className="font-semibold text-sm">$ {numberFormatter((item.precio ?? 0) * item.quantity)}</p>
            </div>
          ))}
        </div>
      )}

      <TotalOrder cart={cart} showDelivery orderType={orderData?.typeOrder} />

      {orderData && (
        <div className="mt-4 pt-4 border-t border-smoke text-xs text-steel space-y-1">
          {orderData.typeOrder === 'eatHere' && <p>🍴 Comer aquí {orderData.tableNumber ? `- Mesa ${orderData.tableNumber}` : ''}</p>}
          {orderData.typeOrder === 'pickup' && <p>🥡 Recoger en el local</p>}
          {orderData.typeOrder === 'delivery' && <p>🚚 A domicilio - {orderData.neighborhood}</p>}
          {orderData.paymentMethod && <p>💳 {CONFIG.metodosPago.find(m => m.id === orderData.paymentMethod)?.nombre}</p>}
        </div>
      )}
    </div>
  )
}
