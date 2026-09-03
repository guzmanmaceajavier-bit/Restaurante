import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCartStore } from '../../store/useCartStore'
import { useClientStore } from '../../store/useClientStore'
import { ProductsList } from '../cart/ProductsList'
import { CheckOutForm, type OrderData } from './CheckOutForm'
import { Summary } from './Summary'
import { storage } from '../../lib/storage'
import { CONFIG } from '../../lib/config'
import { calcularPuntos, puntosParaSiguienteNivel, FIDELIDAD_CONFIG } from '../../lib/fidelidad'
import { toast } from 'sonner'
import { SEO } from '../../lib/seo'

const nf = (num: number) => new Intl.NumberFormat('es-CO').format(num)

export function CheckOutView() {
  const { cart, clearCart } = useCartStore()
  const { addCliente, findCliente, sumarPuntos, clienteActual, setClienteActual } = useClientStore()
  const [orderData, setOrderData] = useState<OrderData | undefined>()
  const [puntosGanados, setPuntosGanados] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    return () => setClienteActual(null)
  }, [setClienteActual])

  const handleOrderSubmit = (data: OrderData) => {
    setOrderData(data)

    const orderId = `ORD-${Date.now().toString(36).toUpperCase()}`
    const subtotal = cart.reduce((acc, item) => acc + (item.precio ?? 0) * item.quantity, 0)
    const deliveryFee = data.typeOrder === 'delivery' && subtotal < CONFIG.delivery.minimoGratis ? CONFIG.delivery.tarifa : 0
    const total = subtotal + deliveryFee

    let cliente = findCliente(data.phone)
    if (!cliente) {
      cliente = addCliente({ nombre: data.fullName, email: '', telefono: data.phone })
    }
    setClienteActual(cliente)
    sumarPuntos(data.phone, total, orderId)
    const puntos = calcularPuntos(total)
    setPuntosGanados(puntos)

    const newOrder = {
      id: orderId,
      ...data,
      items: cart,
      subtotal,
      deliveryFee,
      total,
      estado: 'recibido',
      createdAt: new Date().toISOString(),
    }

    const ordenes = storage.getOrdenes()
    ordenes.push(newOrder)
    storage.setOrdenes(ordenes)

    let message = `🍽️ *Nuevo pedido* #${orderId}%0A%0A`
    message += `👤 *Cliente:* ${data.fullName}%0A`
    message += `📞 *Teléfono:* ${data.phone}%0A`

    const typeLabels: Record<string, string> = { eatHere: 'Comer en el restaurante', delivery: 'A domicilio', pickup: 'Recoger en el local' }
    message += `📦 *Tipo:* ${typeLabels[data.typeOrder] || data.typeOrder}%0A`

    if (data.tableNumber) message += `🪑 *Mesa:* ${data.tableNumber}%0A`
    if (data.neighborhood) message += `📍 *Barrio:* ${data.neighborhood}%0A`
    if (data.address) message += `🏠 *Dirección:* ${data.address}%0A`
    if (data.scheduled && data.scheduledTime) message += `⏰ *Programado:* ${data.scheduledTime}%0A`
    message += `💳 *Pago:* ${CONFIG.metodosPago.find(m => m.id === data.paymentMethod)?.nombre}%0A%0A`

    message += `🧾 *Productos:*%0A`
    cart.forEach((item) => {
      message += `- ${item.nombre} ×${item.quantity} = $${nf((item.precio ?? 0) * item.quantity)}%0A`
    })

    message += `%0A💰 *Subtotal:* $${nf(subtotal)}%0A`
    if (deliveryFee > 0) message += `🚚 *Delivery:* $${nf(deliveryFee)}%0A`
    message += `*Total:* $${nf(total)}%0A`
    if (puntos > 0) message += `⭐ *Puntos ganados:* ${puntos}%0A`
    message += `%0A🙏 ¡Gracias!`

    const whatsappUrl = `https://wa.me/${CONFIG.contacto.whatsapp}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')

    clearCart()
    toast.success(`Pedido #${orderId} enviado!`)
    navigate(`/orden-confirmacion/${orderId}`)
  }

  if (!cart.length && !orderData) {
      return (
        <>
          <SEO title="Carrito" />
          <section className="min-h-[60vh] flex flex-col items-center justify-center px-6 text-center">
            <div className="text-smoke text-6xl mb-4">🛒</div>
            <h2 className="text-2xl font-serif font-bold text-ink mb-2">Tu carrito está vacío</h2>
            <p className="text-steel mb-6">Agrega productos desde nuestro menú</p>
            <button
              onClick={() => navigate('/menu')}
              className="bg-brick-500 text-white px-8 py-3 rounded-xl font-semibold hover:bg-brick-600 transition-all shadow-lg shadow-brick-500/30"
            >
              Ver menú
            </button>
          </section>
        </>
      )
  }

  return (
    <section className="pt-28 pb-20 px-6">
      <div className="max-w-content mx-auto">
        <SEO title="Checkout" description="Confirma tu pedido" />
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {!orderData && <CheckOutForm onSubmit={handleOrderSubmit} />}
            {orderData && (
              <div className="bg-warm border border-smoke rounded-2xl p-8 text-center">
                <div className="text-5xl mb-4">✅</div>
                <h2 className="text-2xl font-serif font-bold text-ink mb-2">Pedido enviado</h2>
                <p className="text-steel">Revisa WhatsApp para confirmar tu pedido</p>
                {puntosGanados > 0 && (
                  <div className="mt-4 bg-brick-50 border border-brick-200 rounded-xl p-4">
                    <p className="text-brick-700 font-semibold">⭐ ¡Ganaste {puntosGanados} puntos!</p>
                    <p className="text-sm text-steel mt-1">
                      Acumula {FIDELIDAD_CONFIG.puntosCanje} puntos para canjear descuentos
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="space-y-4">
            <Summary orderData={orderData} />
            {clienteActual && clienteActual.puntos > 0 && (
              <div className="bg-white rounded-2xl shadow-card border border-smoke p-5">
                <h3 className="font-bold text-ink mb-3">⭐ Tu programa de fidelidad</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-steel">Puntos acumulados</span>
                    <span className="font-bold text-brick-600">{clienteActual.puntos}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-steel">Nivel actual</span>
                    <span className={`font-bold capitalize ${clienteActual.nivel === 'oro' ? 'text-yellow-600' : clienteActual.nivel === 'plata' ? 'text-gray-500' : 'text-amber-700'}`}>
                      {clienteActual.nivel}
                    </span>
                  </div>
                  {puntosParaSiguienteNivel(clienteActual.puntos) && (
                    <div className="bg-brick-50 rounded-lg p-2 text-center">
                      <p className="text-brick-600 text-xs">
                        Te faltan {puntosParaSiguienteNivel(clienteActual.puntos)!.faltan} puntos para nivel {puntosParaSiguienteNivel(clienteActual.puntos)!.siguiente}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {cart.length > 0 && !orderData && (
          <div className="mt-8 bg-warm rounded-2xl p-6">
            <h3 className="font-bold text-ink mb-4">Productos en tu carrito</h3>
            <ProductsList cart={cart} />
          </div>
        )}
      </div>
    </section>
  )
}
