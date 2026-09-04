import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { storage } from '../lib/storage'
import { SEO } from '../lib/seo'
import { CONFIG } from '../lib/config'
import type { Order } from '../types/order'
import type { ReservaData } from '../types/ReservaData'
import { FaBox, FaCalendarAlt, FaDollarSign, FaUsers, FaArrowUp, FaArrowDown, FaUtensils, FaThLarge, FaStar, FaComments, FaClock, FaShoppingBag } from 'react-icons/fa'

export default function AdminDashboard() {
  const [ordenes, setOrdenes] = useState<Order[]>([])
  const [reservas, setReservas] = useState<ReservaData[]>([])

  useEffect(() => {
    setOrdenes(storage.getOrdenes<Order>())
    setReservas(storage.getReservas<ReservaData>())
  }, [])

  const stats = useMemo(() => {
    const hoy = new Date().toISOString().split('T')[0]
    const ayer = new Date(Date.now() - 86400000).toISOString().split('T')[0]
    const ordenesHoy = ordenes.filter((o) => o.createdAt?.startsWith(hoy))
    const ordenesAyer = ordenes.filter((o) => o.createdAt?.startsWith(ayer))
    const reservasHoy = reservas.filter((r) => r.fecha === hoy)
    const ingresosHoy = ordenesHoy.reduce((sum, o) => sum + (o.total || 0), 0)
    const ingresosAyer = ordenesAyer.reduce((sum, o) => sum + (o.total || 0), 0)
    const pendientes = ordenes.filter((o) => o.estado === 'recibido').length
    const preparando = ordenes.filter((o) => o.estado === 'preparando').length
    const clientesUnicos = new Set(ordenesHoy.map((o) => o.phone)).size
    const ticketPromedio = ordenesHoy.length > 0 ? Math.round(ingresosHoy / ordenesHoy.length) : 0
    const changeOrdenes = ordenesAyer.length > 0 ? Math.round(((ordenesHoy.length - ordenesAyer.length) / ordenesAyer.length) * 100) : 0
    const changeIngresos = ingresosAyer > 0 ? Math.round(((ingresosHoy - ingresosAyer) / ingresosAyer) * 100) : 0
    return { ordenesHoy: ordenesHoy.length, reservasHoy: reservasHoy.length, ingresosHoy, clientesUnicos, pendientes, preparando, ticketPromedio, changeOrdenes, changeIngresos }
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

  const ultimasOrdenes = useMemo(() => {
    return [...ordenes].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()).slice(0, 5)
  }, [ordenes])

  const statCards = [
    { label: 'Pedidos hoy', value: stats.ordenesHoy, change: stats.changeOrdenes, icon: FaBox, color: 'bg-blue-500', link: '/admin-ordenes' },
    { label: 'Ingresos hoy', value: `$${stats.ingresosHoy.toLocaleString('es-CO')}`, change: stats.changeIngresos, icon: FaDollarSign, color: 'bg-olive-500', link: '/admin-ordenes' },
    { label: 'Reservas hoy', value: stats.reservasHoy, change: 0, icon: FaCalendarAlt, color: 'bg-sage-500', link: '/admin-reservas' },
    { label: 'Ticket promedio', value: `$${stats.ticketPromedio.toLocaleString('es-CO')}`, change: 0, icon: FaShoppingBag, color: 'bg-gold-500', link: '/admin-ordenes' },
  ]

  const navLinks = [
    { label: 'Pedidos', desc: 'Gestionar órdenes', icon: FaBox, link: '/admin-ordenes', badge: stats.pendientes },
    { label: 'Cocina', desc: 'Vista de comandas', icon: FaUtensils, link: '/admin-cocina', badge: stats.preparando },
    { label: 'Reservas', desc: 'Confirmar reservas', icon: FaCalendarAlt, link: '/admin-reservas' },
    { label: 'Mesas', desc: 'Mapa del restaurante', icon: FaThLarge, link: '/admin-mesas' },
    { label: 'Productos', desc: 'Catálogo completo', icon: FaUtensils, link: '/admin-productos' },
    { label: 'Clientes', desc: 'Base de datos', icon: FaUsers, link: '/admin-clientes' },
    { label: 'Reseñas', desc: 'Opiniones', icon: FaStar, link: '/admin-resenas' },
    { label: 'WhatsApp', desc: 'Mensajería', icon: FaComments, link: '/admin-whatsapp' },
  ]

  return (
    <div>
      <SEO title="Admin - Dashboard" />
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold text-espresso-800">Dashboard</h1>
        <p className="text-steel text-sm mt-1">Bienvenido, {CONFIG.admin.nombre}. Resumen del restaurante.</p>
      </div>

      {/* Alert */}
      {stats.pendientes > 0 && (
        <div className="bg-gradient-to-r from-gold-50 to-gold-100 border border-gold-200 rounded-2xl p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gold-500 rounded-xl flex items-center justify-center">
              <FaClock size={16} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-espresso-800">{stats.pendientes} pedido{stats.pendientes !== 1 ? 's' : ''} sin atender</p>
              <p className="text-xs text-steel">Revisa la cocina para actualizar estados</p>
            </div>
          </div>
          <Link to="/admin-cocina" className="bg-gold-500 hover:bg-gold-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all">
            Ver cocina
          </Link>
        </div>
      )}

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => (
          <Link key={card.label} to={card.link} className="bg-white rounded-2xl p-5 border border-cream-200 hover:shadow-lift transition-all group">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 ${card.color} rounded-xl flex items-center justify-center`}>
                <card.icon size={18} className="text-white" />
              </div>
              {card.change !== 0 && (
                <span className={`flex items-center gap-1 text-xs font-semibold ${card.change > 0 ? 'text-green-600' : 'text-red-500'}`}>
                  {card.change > 0 ? <FaArrowUp size={10} /> : <FaArrowDown size={10} />}
                  {Math.abs(card.change)}%
                </span>
              )}
            </div>
            <p className="text-2xl font-display font-bold text-espresso-800">{card.value}</p>
            <p className="text-xs text-steel mt-1">{card.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Sales chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-cream-200 p-6">
          <h2 className="font-display font-bold text-espresso-800 mb-5">Ventas últimos 7 días</h2>
          <div className="space-y-3">
            {ventasPorDia.map((v) => (
              <div key={v.dia} className="flex items-center gap-3">
                <span className="text-xs text-steel w-16 text-right font-medium">{v.dia}</span>
                <div className="flex-1 bg-cream-100 rounded-full h-6 overflow-hidden">
                  <div className="bg-gradient-to-r from-olive-400 to-olive-600 h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                    style={{ width: `${Math.max((v.total / maxVenta) * 100, v.total > 0 ? 8 : 0)}%` }}>
                    {v.total > 0 && <span className="text-[10px] text-white font-bold">${(v.total / 1000).toFixed(0)}k</span>}
                  </div>
                </div>
                <span className="text-xs font-semibold text-espresso-700 w-20 text-right">${v.total.toLocaleString('es-CO')}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top products */}
        <div className="bg-white rounded-2xl border border-cream-200 p-6">
          <h2 className="font-display font-bold text-espresso-800 mb-5">Top productos</h2>
          {topProductos.length === 0 ? (
            <div className="text-center py-8">
              <FaShoppingBag className="text-cream-300 mx-auto mb-2" size={32} />
              <p className="text-sm text-steel">Sin datos aún</p>
            </div>
          ) : (
            <div className="space-y-3">
              {topProductos.map((p, i) => (
                <div key={p.nombre} className="flex items-center gap-3">
                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-gold-100 text-gold-700' : i === 1 ? 'bg-cream-200 text-espresso-600' : 'bg-cream-100 text-steel'}`}>
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-espresso-800 truncate">{p.nombre}</p>
                    <div className="w-full bg-cream-100 rounded-full h-1.5 mt-1">
                      <div className="bg-olive-400 h-1.5 rounded-full" style={{ width: `${(p.cantidad / (topProductos[0]?.cantidad || 1)) * 100}%` }} />
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-olive-600">{p.cantidad}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent orders + Quick nav */}
      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 bg-white rounded-2xl border border-cream-200 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display font-bold text-espresso-800">Últimos pedidos</h2>
            <Link to="/admin-ordenes" className="text-xs text-olive-600 hover:text-olive-700 font-medium">Ver todos →</Link>
          </div>
          {ultimasOrdenes.length === 0 ? (
            <div className="text-center py-8">
              <FaBox className="text-cream-300 mx-auto mb-2" size={32} />
              <p className="text-sm text-steel">Sin pedidos hoy</p>
            </div>
          ) : (
            <div className="space-y-2">
              {ultimasOrdenes.map((o) => {
                const estadoColors: Record<string, string> = { recibido: 'bg-blue-100 text-blue-700', preparando: 'bg-gold-100 text-gold-700', listo: 'bg-sage-100 text-sage-700', entregado: 'bg-cream-200 text-steel', cancelado: 'bg-red-100 text-red-700' }
                return (
                  <div key={o.id} className="flex items-center justify-between py-2.5 border-b border-cream-100 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-cream-100 rounded-lg flex items-center justify-center">
                        <FaShoppingBag size={12} className="text-steel" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-espresso-800">{o.fullName || (o as any).clientName || 'Cliente'}</p>
                        <p className="text-[10px] text-steel">{o.items?.length || 0} items • {new Date(o.createdAt).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-espresso-800">${Number(o.total).toLocaleString('es-CO')}</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${estadoColors[o.estado] || 'bg-cream-100 text-steel'}`}>{o.estado}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="lg:col-span-2 bg-white rounded-2xl border border-cream-200 p-6">
          <h2 className="font-display font-bold text-espresso-800 mb-5">Accesos rápidos</h2>
          <div className="grid grid-cols-2 gap-2.5">
            {navLinks.map((item) => (
              <Link key={item.link} to={item.link}
                className="flex items-center gap-3 rounded-xl p-3 bg-cream-50 hover:bg-olive-50 border border-cream-200 hover:border-olive-200 transition-all group">
                <item.icon size={16} className="text-steel group-hover:text-olive-600 transition-colors" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-espresso-800 text-xs truncate">{item.label}</p>
                </div>
                {item.badge ? (
                  <span className="w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold">{item.badge}</span>
                ) : null}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
