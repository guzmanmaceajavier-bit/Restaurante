import { useEffect, useState, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { storage } from '../lib/storage'
import { SEO } from '../lib/seo'
import { FaSignOutAlt } from 'react-icons/fa'
import type { Order } from '../types/order'
import type { ReservaData } from '../types/ReservaData'
import clsx from 'clsx'

export default function AdminDashboard() {
  const [ordenes, setOrdenes] = useState<Order[]>([])
  const [reservas, setReservas] = useState<ReservaData[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    if (!storage.isAdmin()) { navigate('/admin-login'); return }
    setOrdenes(storage.getOrdenes<Order>())
    setReservas(storage.getReservas<ReservaData>())
  }, [navigate])

  const stats = useMemo(() => {
    const hoy = new Date().toISOString().split('T')[0]
    const ordenesHoy = ordenes.filter((o) => o.createdAt?.startsWith(hoy))
    const reservasHoy = reservas.filter((r) => r.fecha === hoy)
    const ingresosHoy = ordenesHoy.reduce((sum, o) => sum + (o.total || 0), 0)
    const pendientes = ordenes.filter((o) => o.estado === 'recibido').length
    const clientesUnicos = new Set(ordenesHoy.map((o) => o.phone)).size
    return { ordenesHoy: ordenesHoy.length, reservasHoy: reservasHoy.length, ingresosHoy, clientesUnicos, pendientes }
  }, [ordenes, reservas])

  const ventasPorDia = useMemo(() => {
    const dias: Record<string, number> = {}
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i)
      const key = d.toISOString().split('T')[0]
      const label = d.toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric' })
      const total = ordenes.filter((o) => o.createdAt?.startsWith(key)).reduce((sum, o) => sum + (o.total || 0), 0)
      dias[label] = total
    }
    return Object.entries(dias).map(([dia, total]) => ({ dia, total }))
  }, [ordenes])

  const maxVenta = Math.max(...ventasPorDia.map((d) => d.total), 1)

  const topProductos = useMemo(() => {
    const counts: Record<string, number> = {}
    ordenes.forEach((o) => { o.items?.forEach((item) => { counts[item.nombre] = (counts[item.nombre] || 0) + item.quantity }) })
    return Object.entries(counts).sort(([, a], [, b]) => b - a).slice(0, 5).map(([nombre, cantidad]) => ({ nombre, cantidad }))
  }, [ordenes])

  const cards = [
    { label: 'Pedidos hoy', value: stats.ordenesHoy, color: 'bg-blue-500', icon: '📦', link: '/admin-ordenes' },
    { label: 'Reservas hoy', value: stats.reservasHoy, color: 'bg-sage-500', icon: '📅', link: '/admin-reservas' },
    { label: 'Ingresos hoy', value: `$${stats.ingresosHoy.toLocaleString('es-CO')}`, color: 'bg-olive-500', icon: '💰', link: '/admin-ordenes' },
    { label: 'Clientes hoy', value: stats.clientesUnicos, color: 'bg-gold-500', icon: '👥', link: '/admin-ordenes' },
  ]

  const navLinks = [
    { label: 'Pedidos', desc: 'Ver y actualizar estado', icon: '📦', link: '/admin-ordenes' },
    { label: 'Cocina', desc: 'Vista de comandas', icon: '👨‍🍳', link: '/admin-cocina' },
    { label: 'Reservas', desc: 'Confirmar o rechazar', icon: '📋', link: '/admin-reservas' },
    { label: 'Mesas', desc: 'Mapa y estados', icon: '🪑', link: '/admin-mesas' },
    { label: 'Productos', desc: 'Crear, editar, eliminar', icon: '🍽️', link: '/admin-productos' },
    { label: 'Clientes', desc: 'Listado y fidelización', icon: '👥', link: '/admin-clientes' },
    { label: 'Reseñas', desc: 'Gestionar opiniones', icon: '⭐', link: '/admin-resenas' },
    { label: 'WhatsApp', desc: 'Mensajes masivos', icon: '💬', link: '/admin-whatsapp', highlight: true },
  ]

  return (
    <div className="min-h-screen bg-cream-50 p-6">
      <SEO title="Admin - Dashboard" />
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-display font-bold text-espresso-800">Dashboard</h1>
            <p className="text-steel text-sm">Panel de administración</p>
          </div>
          <button onClick={() => { storage.clearAdmin(); navigate('/admin-login') }}
            className="flex items-center gap-2 text-steel hover:text-red-500 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:bg-red-50">
            <FaSignOutAlt size={14} /> Salir
          </button>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {cards.map((card, i) => (
            <Link key={card.label} to={card.link} className="bg-white rounded-2xl p-6 border border-cream-200 hover:shadow-lift transition-all animate-fade-in" style={{ animationDelay: `${i * 60}ms` }}>
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 ${card.color} rounded-xl flex items-center justify-center text-white text-lg`}>
                  {card.icon}
                </div>
              </div>
              <p className="text-2xl font-display font-bold text-espresso-800">{card.value}</p>
              <p className="text-sm text-steel mt-1">{card.label}</p>
            </Link>
          ))}
        </div>

        {stats.pendientes > 0 && (
          <div className="bg-gold-50 border border-gold-200 rounded-2xl p-5 mb-8 flex items-center gap-3">
            <span className="text-xl">⚡</span>
            <div>
              <p className="text-gold-700 text-sm font-semibold">
                Hay <strong>{stats.pendientes}</strong> pedido{stats.pendientes !== 1 ? 's' : ''} pendiente{stats.pendientes !== 1 ? 's' : ''} por atender
              </p>
              <Link to="/admin-cocina" className="text-gold-600 underline text-xs">Ir a cocina →</Link>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-2xl border border-cream-200 p-6">
            <h2 className="font-display font-bold text-espresso-800 mb-4">Ventas últimos 7 días</h2>
            <div className="space-y-2.5">
              {ventasPorDia.map((v) => (
                <div key={v.dia} className="flex items-center gap-3">
                  <span className="text-xs text-steel w-20 text-right">{v.dia}</span>
                  <div className="flex-1 bg-cream-100 rounded-full h-5 overflow-hidden">
                    <div className="bg-gradient-to-r from-olive-400 to-olive-600 h-full rounded-full transition-all" style={{ width: `${(v.total / maxVenta) * 100}%` }} />
                  </div>
                  <span className="text-xs font-semibold text-espresso-700 w-20">${v.total.toLocaleString('es-CO')}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-cream-200 p-6">
            <h2 className="font-display font-bold text-espresso-800 mb-4">Top 5 productos</h2>
            {topProductos.length === 0 ? (
              <p className="text-steel text-sm text-center py-6">Sin datos</p>
            ) : (
              <div className="space-y-3">
                {topProductos.map((p, i) => (
                  <div key={p.nombre} className="flex items-center gap-3">
                    <span className="text-sm font-bold text-olive-500 w-6">{i + 1}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-espresso-800">{p.nombre}</p>
                      <div className="w-full bg-cream-100 rounded-full h-2 mt-1">
                        <div className="bg-olive-400 h-2 rounded-full" style={{ width: `${(p.cantidad / (topProductos[0]?.cantidad || 1)) * 100}%` }} />
                      </div>
                    </div>
                    <span className="text-xs font-medium text-steel">{p.cantidad} uds</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-cream-200 p-6">
          <h2 className="font-display font-bold text-espresso-800 mb-5">Accesos rápidos</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {navLinks.map((item) => (
              <Link key={item.link} to={item.link}
                className={clsx(
                  'flex items-center gap-3 rounded-xl p-4 transition-all',
                  item.highlight ? 'bg-sage-50 hover:bg-sage-100 border border-sage-200' : 'bg-cream-50 hover:bg-cream-100 border border-cream-200'
                )}>
                <span className="text-xl">{item.icon}</span>
                <div>
                  <p className="font-medium text-espresso-800 text-sm">{item.label}</p>
                  <p className="text-xs text-steel">{item.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
