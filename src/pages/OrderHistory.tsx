import { useState } from 'react'
import { Link } from 'react-router-dom'
import { storage } from '../lib/storage'
import { useCartStore } from '../store/useCartStore'
import { useAuthStore } from '../store/useAuthStore'
import { CONFIG } from '../lib/config'
import { toast } from 'sonner'
import { SEO } from '../lib/seo'
import { FaSearch, FaEye, FaWhatsapp, FaUser, FaArrowRight } from 'react-icons/fa'
import type { Order } from '../types/order'
import clsx from 'clsx'

const estadoBadge: Record<string, { bg: string; text: string }> = {
  recibido: { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700' },
  preparando: { bg: 'bg-gold-50 border-gold-200', text: 'text-gold-700' },
  listo: { bg: 'bg-sage-50 border-sage-200', text: 'text-sage-700' },
  entregado: { bg: 'bg-cream-100 border-cream-200', text: 'text-steel' },
  cancelado: { bg: 'bg-red-50 border-red-200', text: 'text-red-700' },
}

export default function OrderHistory() {
  const { clienteActual } = useAuthStore()
  const addToCart = useCartStore((s) => s.addToCart)
  const [busqueda, setBusqueda] = useState('')
  const [ordenEncontrada, setOrdenEncontrada] = useState<Order | null>(null)
  const [errorBusqueda, setErrorBusqueda] = useState('')

  const allOrders = storage.getOrdenes<Order>()
  const misOrdenes = clienteActual
    ? allOrders.filter((o) => clienteActual.historialPedidos.includes(o.id)).reverse()
    : []

  const buscarOrden = () => {
    if (!busqueda.trim()) { toast.error('Ingresa un número de orden'); return }
    const q = busqueda.trim().toUpperCase()
    const found = allOrders.find((o) => o.id.toUpperCase() === q)
    if (found) { setOrdenEncontrada(found); setErrorBusqueda('') }
    else { setOrdenEncontrada(null); setErrorBusqueda('No se encontró esa orden') }
  }

  const reorder = (order: Order) => {
    order.items.forEach((item: any) => {
      addToCart({ nombre: item.nombre, precio: item.precio, quantity: item.quantity, imagen: item.imagen, descripcion: item.descripcion })
    })
    toast.success('Productos agregados al carrito')
  }

  return (
    <section className="pt-8 pb-16 px-6">
      <SEO title="Mis pedidos" description="Consulta tus pedidos en Sabor y Origen" />
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <span className="text-olive-500 font-semibold text-sm tracking-[0.15em] uppercase">Historial</span>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-espresso-800 mt-2">Mis pedidos</h1>
          <p className="text-steel mt-2">
            {clienteActual ? 'Historial de tus pedidos realizados' : 'Consulta tu pedido por número de orden'}
          </p>
        </div>

        {!clienteActual && (
          <div className="bg-white rounded-3xl border border-cream-200 p-8 mb-8 shadow-card">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-steel/40" size={14} />
                <input
                  type="text" value={busqueda}
                  onChange={(e) => { setBusqueda(e.target.value); setOrdenEncontrada(null); setErrorBusqueda('') }}
                  placeholder="Ej: ORD-ABC123"
                  onKeyDown={(e) => e.key === 'Enter' && buscarOrden()}
                  className="input-base pl-11"
                />
              </div>
              <button onClick={buscarOrden} className="btn-primary shrink-0">Buscar</button>
            </div>
            {errorBusqueda && <p className="text-red-500 text-sm mt-2">{errorBusqueda}</p>}

            {ordenEncontrada && (
              <div className="mt-5 bg-cream-50 rounded-2xl p-5 border border-cream-200">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-mono text-sm text-steel">{ordenEncontrada.id}</p>
                    <p className="font-semibold text-espresso-800">{ordenEncontrada.fullName}</p>
                    <p className="text-xs text-steel">{new Date(ordenEncontrada.createdAt).toLocaleDateString('es-CO')} — {new Date(ordenEncontrada.createdAt).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  <div className="text-right">
                    <span className={clsx('px-3 py-1 rounded-full text-xs font-semibold border', estadoBadge[ordenEncontrada.estado]?.bg || 'bg-cream-100', estadoBadge[ordenEncontrada.estado]?.text || 'text-steel')}>
                      {ordenEncontrada.estado}
                    </span>
                    <p className="font-bold text-olive-500 text-sm mt-1">${Number(ordenEncontrada.total).toLocaleString('es-CO')}</p>
                  </div>
                </div>
                <div className="border-t border-cream-200 pt-3 space-y-1 text-sm">
                  {ordenEncontrada.items.map((item: any) => (
                    <div key={item.nombre} className="flex justify-between text-steel">
                      <span>{item.nombre} ×{item.quantity}</span>
                      <span>${Number(item.precio * item.quantity).toLocaleString('es-CO')}</span>
                    </div>
                  ))}
                </div>
                <a href={`https://wa.me/${CONFIG.contacto.whatsapp}?text=${encodeURIComponent(`Seguimiento pedido #${ordenEncontrada.id}`)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="mt-4 flex items-center justify-center gap-2 bg-sage-500 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-sage-600 transition-all">
                  <FaWhatsapp size={14} /> Seguimiento por WhatsApp
                </a>
              </div>
            )}

            <div className="flex gap-3 mt-5">
              <Link to="/login" className="flex-1 btn-secondary text-center text-sm flex items-center justify-center gap-2">
                <FaUser size={12} /> Iniciar sesión
              </Link>
            </div>
          </div>
        )}

        {clienteActual && (
          <>
            {misOrdenes.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-cream-200 shadow-card">
                <div className="w-16 h-16 bg-cream-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">📋</span>
                </div>
                <p className="text-xl font-display font-bold text-espresso-800 mb-2">No tienes pedidos aún</p>
                <Link to="/menu" className="btn-primary inline-flex items-center gap-2 mt-4">
                  Ver menú <FaArrowRight size={14} />
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {misOrdenes.map((o, i) => {
                  const badge = estadoBadge[o.estado] || { bg: 'bg-cream-100', text: 'text-steel' }
                  return (
                    <div key={o.id} className="bg-white rounded-2xl border border-cream-200 p-6 hover:shadow-lift transition-all animate-fade-in" style={{ animationDelay: `${i * 60}ms` }}>
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <p className="font-mono text-sm text-steel">{o.id}</p>
                          <p className="font-semibold text-espresso-800">{o.fullName}</p>
                          <p className="text-xs text-steel">{new Date(o.createdAt).toLocaleDateString('es-CO')} — {new Date(o.createdAt).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                        <div className="text-right">
                          <span className={clsx('px-3 py-1 rounded-full text-xs font-semibold border', badge.bg, badge.text)}>{o.estado}</span>
                          <p className="font-bold text-olive-500 mt-1">${Number(o.total).toLocaleString('es-CO')}</p>
                        </div>
                      </div>
                      <div className="border-t border-cream-200 pt-3 text-sm space-y-1">
                        {o.items.slice(0, 3).map((item: any) => (
                          <div key={item.nombre} className="flex justify-between text-steel">
                            <span>{item.nombre} ×{item.quantity}</span>
                            <span>${Number(item.precio * item.quantity).toLocaleString('es-CO')}</span>
                          </div>
                        ))}
                        {o.items.length > 3 && <p className="text-steel text-xs">+{o.items.length - 3} productos más</p>}
                      </div>
                      <div className="flex gap-3 mt-4">
                        <button onClick={() => reorder(o)} className="flex-1 btn-primary text-sm py-2.5">
                          Pedir de nuevo
                        </button>
                        <Link to={`/orden-confirmacion/${o.id}`} className="flex-1 btn-secondary text-sm py-2.5 text-center">
                          Ver detalle
                        </Link>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}
