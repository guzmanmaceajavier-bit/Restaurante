import { useEffect, useState, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { storage } from '../lib/storage'
import { SEO } from '../lib/seo'
import { toast } from 'sonner'
import type { Order } from '../types/order'

export default function AdminCocina() {
  const [ordenes, setOrdenes] = useState<Order[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    if (!storage.isAdmin()) { navigate('/admin-login'); return }
    setOrdenes(storage.getOrdenes<Order>())
  }, [navigate])

  const ordenesCocina = useMemo(() => {
    return ordenes.filter((o) => o.estado === 'recibido' || o.estado === 'preparando')
      .sort((a, b) => {
        if (a.estado === 'recibido' && b.estado !== 'recibido') return -1
        if (a.estado !== 'recibido' && b.estado === 'recibido') return 1
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      })
  }, [ordenes])

  const actualizarEstado = (id: string, nuevoEstado: string) => {
    const updated = ordenes.map((o) => o.id === id ? { ...o, estado: nuevoEstado } : o)
    setOrdenes(updated); storage.setOrdenes(updated)
    toast.success(`Pedido ${id} → ${nuevoEstado}`)
  }

  const recibidos = ordenesCocina.filter(o => o.estado === 'recibido')
  const preparando = ordenesCocina.filter(o => o.estado === 'preparando')

  return (
    <div className="min-h-screen bg-cream-50 p-6">
      <SEO title="Admin - Cocina" />
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-display font-bold text-espresso-800">Cocina</h1>
            <p className="text-steel text-sm mt-1">{ordenesCocina.length} ordenes pendientes</p>
          </div>
          <div className="flex gap-2">
            <Link to="/admin-dashboard" className="bg-white text-espresso-600 px-4 py-2 rounded-xl text-sm font-medium hover:bg-cream-100 transition-all border border-cream-200">Dashboard</Link>
            <Link to="/admin-ordenes" className="bg-white text-espresso-600 px-4 py-2 rounded-xl text-sm font-medium hover:bg-cream-100 transition-all border border-cream-200">Todos los pedidos</Link>
          </div>
        </div>

        {ordenesCocina.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-cream-200">
            <div className="w-20 h-20 bg-sage-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">👨‍🍳</span>
            </div>
            <p className="text-xl font-display font-bold text-espresso-800 mb-2">Sin ordenes pendientes</p>
            <p className="text-sm text-steel">Las nuevas ordenes aparecerán aquí automáticamente</p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
                <h2 className="font-display font-bold text-espresso-800">Nuevos ({recibidos.length})</h2>
              </div>
              <div className="space-y-4">
                {recibidos.length === 0 ? (
                  <div className="bg-white rounded-2xl p-8 text-center border border-cream-200 border-dashed">
                    <p className="text-sm text-steel">Sin pedidos nuevos</p>
                  </div>
                ) : recibidos.map((o) => (
                  <div key={o.id} className="bg-white rounded-2xl border-2 border-blue-200 p-5 animate-fade-in">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-mono text-sm font-bold text-espresso-800">{o.id}</span>
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 uppercase">
                        {o.estado}
                      </span>
                    </div>
                    <p className="font-medium text-espresso-800 mb-1">{o.fullName}</p>
                    <p className="text-xs text-steel mb-1">{o.typeOrder === 'eatHere' ? `Mesa ${o.tableNumber || '?'}` : o.typeOrder === 'delivery' ? 'Domicilio' : 'Recoger'}</p>
                    <p className="text-xs text-steel mb-3">{new Date(o.createdAt).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}</p>
                    <div className="border-t border-cream-200 pt-3 mb-4 space-y-1">
                      {o.items?.map((item) => (
                        <div key={item.nombre} className="flex justify-between text-sm">
                          <span className="text-espresso-700">{item.nombre}</span>
                          <span className="font-bold text-espresso-800">×{item.quantity}</span>
                        </div>
                      ))}
                    </div>
                    <button onClick={() => actualizarEstado(o.id, 'preparando')} className="w-full bg-gold-500 hover:bg-gold-600 text-espresso-900 py-2.5 rounded-xl text-sm font-semibold transition-all">
                      Iniciar preparación
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 bg-gold-500 rounded-full animate-pulse" />
                <h2 className="font-display font-bold text-espresso-800">Preparando ({preparando.length})</h2>
              </div>
              <div className="space-y-4">
                {preparando.length === 0 ? (
                  <div className="bg-white rounded-2xl p-8 text-center border border-cream-200 border-dashed">
                    <p className="text-sm text-steel">Sin pedidos en preparación</p>
                  </div>
                ) : preparando.map((o) => (
                  <div key={o.id} className="bg-white rounded-2xl border-2 border-gold-200 p-5 animate-fade-in">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-mono text-sm font-bold text-espresso-800">{o.id}</span>
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-gold-100 text-gold-700 uppercase">
                        preparando
                      </span>
                    </div>
                    <p className="font-medium text-espresso-800 mb-1">{o.fullName}</p>
                    <p className="text-xs text-steel mb-3">{new Date(o.createdAt).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}</p>
                    <div className="border-t border-cream-200 pt-3 mb-4 space-y-1">
                      {o.items?.map((item) => (
                        <div key={item.nombre} className="flex justify-between text-sm">
                          <span className="text-espresso-700">{item.nombre}</span>
                          <span className="font-bold text-espresso-800">×{item.quantity}</span>
                        </div>
                      ))}
                    </div>
                    <button onClick={() => actualizarEstado(o.id, 'listo')} className="w-full bg-sage-500 hover:bg-sage-600 text-white py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md shadow-sage-500/20">
                      Marcar como listo ✓
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
