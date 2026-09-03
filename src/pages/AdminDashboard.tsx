import { useEffect, useState, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { storage } from '../lib/storage'
import { SEO } from '../lib/seo'
import { FaWhatsapp } from 'react-icons/fa'
import type { Order } from '../types/order'
import type { ReservaData } from '../types/ReservaData'

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
      const d = new Date()
      d.setDate(d.getDate() - i)
      const key = d.toISOString().split('T')[0]
      const label = d.toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric' })
      const total = ordenes.filter((o) => o.createdAt?.startsWith(key)).reduce((sum, o) => sum + (o.total || 0), 0)
      dias[key] = total
      dias[label] = total
    }
    return Object.entries(dias).filter(([k]) => !k.includes('T')).map(([dia, total]) => ({ dia, total }))
  }, [ordenes])

  const maxVenta = Math.max(...ventasPorDia.map((d) => d.total), 1)

  const topProductos = useMemo(() => {
    const counts: Record<string, number> = {}
    ordenes.forEach((o) => {
      o.items?.forEach((item) => {
        counts[item.nombre] = (counts[item.nombre] || 0) + item.quantity
      })
    })
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([nombre, cantidad]) => ({ nombre, cantidad }))
  }, [ordenes])

  const horasPico = useMemo(() => {
    const horas: Record<string, number> = {}
    ordenes.forEach((o) => {
      if (o.createdAt) {
        const hora = new Date(o.createdAt).getHours().toString().padStart(2, '0') + ':00'
        horas[hora] = (horas[hora] || 0) + 1
      }
    })
    return Object.entries(horas)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([hora, cantidad]) => ({ hora, cantidad }))
  }, [ordenes])

  const clientesFrecuentes = useMemo(() => {
    const counts: Record<string, { nombre: string; phone: string; total: number; count: number }> = {}
    ordenes.forEach((o) => {
      const key = o.phone
      if (!counts[key]) counts[key] = { nombre: o.fullName, phone: o.phone, total: 0, count: 0 }
      counts[key].total += o.total || 0
      counts[key].count += 1
    })
    return Object.values(counts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
  }, [ordenes])

  const cards = [
    { label: 'Pedidos hoy', value: stats.ordenesHoy, color: 'bg-blue-500', link: '/admin-ordenes' },
    { label: 'Reservas hoy', value: stats.reservasHoy, color: 'bg-emerald-500', link: '/admin-reservas' },
    { label: 'Ingresos hoy', value: `$${stats.ingresosHoy.toLocaleString('es-CO')}`, color: 'bg-brick-500', link: '/admin-ordenes' },
    { label: 'Clientes hoy', value: stats.clientesUnicos, color: 'bg-purple-500', link: '/admin-ordenes' },
  ]

  return (
    <div className="min-h-screen bg-warm p-6">
      <SEO title="Admin - Dashboard" />
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-serif font-bold text-ink">Dashboard</h1>
          <div className="flex gap-2">
            <Link to="/admin-ordenes" className="bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-600 transition-all">Pedidos</Link>
            <Link to="/admin-reservas" className="bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-emerald-600 transition-all">Reservas</Link>
            <button onClick={() => { storage.clearAdmin(); navigate('/admin-login') }} className="bg-red-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-red-600 transition-all">Salir</button>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {cards.map((card) => (
            <Link key={card.label} to={card.link} className="bg-white rounded-2xl p-6 border border-smoke hover:shadow-lift transition-all">
              <div className={`w-10 h-10 ${card.color} rounded-xl flex items-center justify-center mb-3`}>
                <span className="text-white text-sm font-bold">{card.label.charAt(0)}</span>
              </div>
              <p className="text-2xl font-bold text-ink">{card.value}</p>
              <p className="text-sm text-steel mt-1">{card.label}</p>
            </Link>
          ))}
        </div>

        {stats.pendientes > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-8">
            <p className="text-amber-800 text-sm font-semibold">
              Hay <strong>{stats.pendientes}</strong> pedido{stats.pendientes !== 1 ? 's' : ''} pendiente{stats.pendientes !== 1 ? 's' : ''} por atender
            </p>
            <Link to="/admin-ordenes" className="text-amber-700 underline text-xs mt-2 inline-block">Ir a pedidos</Link>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-2xl border border-smoke p-6">
            <h2 className="font-bold text-ink mb-4">Ventas últimos 7 días</h2>
            <div className="space-y-2">
              {ventasPorDia.map((v) => (
                <div key={v.dia} className="flex items-center gap-3">
                  <span className="text-xs text-steel w-20 text-right">{v.dia}</span>
                  <div className="flex-1 bg-smoke rounded-full h-5 overflow-hidden">
                    <div className="bg-brick-500 h-full rounded-full transition-all" style={{ width: `${(v.total / maxVenta) * 100}%` }} />
                  </div>
                  <span className="text-xs font-medium text-ink w-20">${v.total.toLocaleString('es-CO')}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-smoke p-6">
            <h2 className="font-bold text-ink mb-4">Top 5 productos más vendidos</h2>
            {topProductos.length === 0 ? (
              <p className="text-steel text-sm text-center py-4">Sin datos</p>
            ) : (
              <div className="space-y-3">
                {topProductos.map((p, i) => (
                  <div key={p.nombre} className="flex items-center gap-3">
                    <span className="text-lg font-bold text-brick-600 w-6">{i + 1}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-ink">{p.nombre}</p>
                      <div className="w-full bg-smoke rounded-full h-2 mt-1">
                        <div className="bg-brick-400 h-2 rounded-full" style={{ width: `${(p.cantidad / (topProductos[0]?.cantidad || 1)) * 100}%` }} />
                      </div>
                    </div>
                    <span className="text-xs font-medium text-steel">{p.cantidad} uds</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-2xl border border-smoke p-6">
            <h2 className="font-bold text-ink mb-4">Horas pico</h2>
            {horasPico.length === 0 ? (
              <p className="text-steel text-sm text-center py-4">Sin datos</p>
            ) : (
              <div className="space-y-2">
                {horasPico.map((h) => (
                  <div key={h.hora} className="flex items-center gap-3">
                    <span className="text-sm font-mono text-steel w-14">{h.hora}</span>
                    <div className="flex-1 bg-smoke rounded-full h-4 overflow-hidden">
                      <div className="bg-blue-500 h-full rounded-full" style={{ width: `${(h.cantidad / (horasPico[0]?.cantidad || 1)) * 100}%` }} />
                    </div>
                    <span className="text-xs font-medium text-ink">{h.cantidad}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-smoke p-6">
            <h2 className="font-bold text-ink mb-4">Clientes frecuentes</h2>
            {clientesFrecuentes.length === 0 ? (
              <p className="text-steel text-sm text-center py-4">Sin datos</p>
            ) : (
              <div className="space-y-3">
                {clientesFrecuentes.map((c, i) => (
                  <div key={c.phone} className="flex items-center gap-3 bg-warm rounded-xl p-3">
                    <span className="text-lg font-bold text-brick-600 w-6">{i + 1}</span>
                    <div className="w-8 h-8 rounded-full bg-brick-100 flex items-center justify-center text-brick-600 text-sm font-bold">
                      {c.nombre.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-ink">{c.nombre}</p>
                      <p className="text-xs text-steel">{c.phone}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-ink">{c.count} pedidos</p>
                      <p className="text-xs text-steel">${c.total.toLocaleString('es-CO')}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-smoke p-5">
            <h2 className="text-sm font-semibold text-ink mb-4 uppercase tracking-wider">Gestión</h2>
            <div className="space-y-3">
              <Link to="/admin-ordenes" className="flex items-center gap-3 bg-warm rounded-xl p-4 hover:bg-brick-50 transition-all">
                <span className="text-2xl">📦</span>
                <div><p className="font-medium text-ink text-sm">Pedidos</p><p className="text-xs text-steel">Ver y actualizar estado</p></div>
              </Link>
              <Link to="/admin-reservas" className="flex items-center gap-3 bg-warm rounded-xl p-4 hover:bg-brick-50 transition-all">
                <span className="text-2xl">📋</span>
                <div><p className="font-medium text-ink text-sm">Reservas</p><p className="text-xs text-steel">Confirmar o rechazar</p></div>
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-smoke p-5">
            <h2 className="text-sm font-semibold text-ink mb-4 uppercase tracking-wider">Marketing</h2>
            <div className="space-y-3">
              <Link to="/admin-whatsapp" className="flex items-center gap-3 bg-emerald-50 rounded-xl p-4 hover:bg-emerald-100 transition-all border border-emerald-200">
                <FaWhatsapp className="text-emerald-600" size={24} />
                <div>
                  <p className="font-medium text-ink text-sm">WhatsApp Masivo</p>
                  <p className="text-xs text-steel">Enviar mensajes a clientes</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
