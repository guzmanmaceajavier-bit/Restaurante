import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { storage } from '../lib/storage'
import { useCartStore } from '../store/useCartStore'
import { toast } from 'sonner'
import { SEO } from '../lib/seo'
import type { Order } from '../types/order'

const estadoBadge: Record<string, string> = {
  recibido: 'bg-blue-100 text-blue-700',
  preparando: 'bg-amber-100 text-amber-700',
  listo: 'bg-emerald-100 text-emerald-700',
  entregado: 'bg-smoke text-steel',
}

export default function OrderHistory() {
  const [ordenes, setOrdenes] = useState<Order[]>([])
  const addToCart = useCartStore((s) => s.addToCart)

  useEffect(() => {
    const all = storage.getOrdenes<Order>()
    setOrdenes(all.reverse())
  }, [])

  const reorder = (order: Order) => {
    order.items.forEach((item: any) => {
      addToCart({ nombre: item.nombre, precio: item.precio, quantity: item.quantity, imagen: item.imagen, descripcion: item.descripcion })
    })
    toast.success('Productos agregados al carrito')
  }

  return (
    <section className="pt-28 pb-12 px-6">
      <SEO title="Mis pedidos" description="Historial de tus pedidos en Sabor y Origen" />
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-serif font-bold text-ink mb-2">Mis pedidos</h1>
        <p className="text-steel mb-8">Historial de tus pedidos realizados</p>

        {ordenes.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-smoke">
            <p className="text-4xl mb-4">📋</p>
            <p className="text-xl text-ink mb-2">No tienes pedidos aún</p>
            <p className="text-steel mb-6">Cuando hagas tu primer pedido, aparecerá aquí</p>
            <Link to="/menu" className="bg-brick-500 hover:bg-brick-600 text-white px-8 py-3 rounded-xl font-semibold transition-all inline-block shadow-lg shadow-brick-500/30">
              Ver menú
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {ordenes.map((o) => {
              const fecha = new Date(o.createdAt)
              const fechaStr = fecha.toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })
              const horaStr = fecha.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })

              return (
                <div key={o.id} className="bg-white rounded-2xl border border-smoke p-5 hover:shadow-lift transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-mono text-sm text-steel">{o.id}</p>
                      <p className="font-semibold text-ink">{o.fullName}</p>
                      <p className="text-xs text-steel">{fechaStr} — {horaStr}</p>
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${estadoBadge[o.estado] || 'bg-smoke'}`}>
                        {o.estado}
                      </span>
                      <p className="font-bold text-brick-600 mt-1">${Number(o.total).toLocaleString('es-CO')}</p>
                    </div>
                  </div>

                  <div className="border-t border-smoke pt-3 text-sm space-y-1">
                    {o.items.slice(0, 3).map((item: any) => (
                      <div key={item.nombre} className="flex justify-between text-steel">
                        <span>{item.nombre} ×{item.quantity}</span>
                        <span>${Number(item.precio * item.quantity).toLocaleString('es-CO')}</span>
                      </div>
                    ))}
                    {o.items.length > 3 && <p className="text-steel text-xs">+{o.items.length - 3} productos más</p>}
                  </div>

                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => reorder(o)}
                      className="flex-1 bg-brick-500 hover:bg-brick-600 text-white py-2 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-brick-500/30"
                    >
                      Pedir de nuevo
                    </button>
                    <Link
                      to={`/orden-confirmacion/${o.id}`}
                      className="flex-1 bg-warm text-brick-600 py-2 rounded-xl text-sm font-semibold hover:bg-brick-50 transition-all text-center"
                    >
                      Ver detalle
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
