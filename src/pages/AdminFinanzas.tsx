import { useState, useEffect, useMemo } from 'react'
import { storage } from '../lib/storage'
import { SEO } from '../lib/seo'
import type { Order } from '../types/order'
import { FaDollarSign, FaShoppingBag, FaChartBar, FaCalendarAlt, FaCreditCard, FaWallet } from 'react-icons/fa'

type DateRange = 'hoy' | 'semana' | 'mes' | 'todos'

const dateRangeLabels: Record<DateRange, string> = {
  hoy: 'Hoy',
  semana: 'Esta semana',
  mes: 'Este mes',
  todos: 'Todos',
}

export default function AdminFinanzas() {
  const [ordenes, setOrdenes] = useState<Order[]>([])
  const [dateRange, setDateRange] = useState<DateRange>('todos')

  useEffect(() => {
    setOrdenes(storage.getOrdenes<Order>())
  }, [])

  const filteredOrders = useMemo(() => {
    const now = new Date()
    const today = now.toISOString().split('T')[0]

    return ordenes.filter((o) => {
      if (dateRange === 'hoy') {
        return o.createdAt?.startsWith(today)
      }
      if (dateRange === 'semana') {
        const weekAgo = new Date(now.getTime() - 7 * 86400000)
        return o.createdAt && new Date(o.createdAt) >= weekAgo
      }
      if (dateRange === 'mes') {
        const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
        return o.createdAt?.startsWith(currentMonth)
      }
      return true
    })
  }, [ordenes, dateRange])

  const stats = useMemo(() => {
    const activas = filteredOrders.filter((o) => o.estado !== 'cancelado')
    const hoy = new Date().toISOString().split('T')[0]
    const ordersHoy = activas.filter((o) => o.createdAt?.startsWith(hoy))
    const currentMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`
    const ordersMes = activas.filter((o) => o.createdAt?.startsWith(currentMonth))

    return {
      totalIngresos: activas.reduce((sum, o) => sum + (o.total || 0), 0),
      pedidosHoy: ordersHoy.length,
      ticketPromedio: activas.length > 0 ? Math.round(activas.reduce((sum, o) => sum + (o.total || 0), 0) / activas.length) : 0,
      ingresosMes: ordersMes.reduce((sum, o) => sum + (o.total || 0), 0),
    }
  }, [filteredOrders])

  const ventasPorDia = useMemo(() => {
    const dias: Record<string, { total: number; label: string }> = {}
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const key = d.toISOString().split('T')[0]
      const label = d.toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric' })
      const total = ordenes
        .filter((o) => o.estado !== 'cancelado' && o.createdAt?.startsWith(key))
        .reduce((sum, o) => sum + (o.total || 0), 0)
      dias[key] = { total, label }
    }
    return Object.entries(dias).map(([key, { total, label }]) => ({ key, label, total }))
  }, [ordenes])

  const maxVenta = Math.max(...ventasPorDia.map((d) => d.total), 1)

  const metodosPago = useMemo(() => {
    const counts: Record<string, number> = {}
    filteredOrders.forEach((o) => {
      const method = o.paymentMethod || 'Otro'
      counts[method] = (counts[method] || 0) + (o.total || 0)
    })
    return Object.entries(counts)
      .map(([metodo, total]) => ({ metodo, total }))
      .sort((a, b) => b.total - a.total)
  }, [filteredOrders])

  const totalPago = metodosPago.reduce((sum, m) => sum + m.total, 0)

  const topProductos = useMemo(() => {
    const counts: Record<string, number> = {}
    filteredOrders.forEach((o) => {
      o.items?.forEach((item) => {
        counts[item.nombre] = (counts[item.nombre] || 0) + item.quantity
      })
    })
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([nombre, cantidad]) => ({ nombre, cantidad }))
  }, [filteredOrders])

  const pedidosPorEstado = useMemo(() => {
    const counts: Record<string, number> = {}
    filteredOrders.forEach((o) => {
      const estado = o.estado || 'desconocido'
      counts[estado] = (counts[estado] || 0) + 1
    })
    return Object.entries(counts)
      .map(([estado, cantidad]) => ({ estado, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad)
  }, [filteredOrders])

  const totalPedidos = pedidosPorEstado.reduce((sum, e) => sum + e.cantidad, 0)

  const estadoColors: Record<string, string> = {
    recibido: 'bg-blue-500',
    preparando: 'bg-gold-500',
    listo: 'bg-sage-500',
    entregado: 'bg-cream-300',
    cancelado: 'bg-red-500',
  }

  const estadoLabels: Record<string, string> = {
    recibido: 'Recibido',
    preparando: 'Preparando',
    listo: 'Listo',
    entregado: 'Entregado',
    cancelado: 'Cancelado',
  }

  const metedoPagoIcon: Record<string, typeof FaDollarSign> = {
    efectivo: FaWallet,
    nequi: FaCreditCard,
    daviplata: FaCreditCard,
  }

  const statCards = [
    { label: 'Total ingresos', value: `$${stats.totalIngresos.toLocaleString('es-CO')}`, icon: FaDollarSign, color: 'bg-olive-500' },
    { label: 'Pedidos hoy', value: stats.pedidosHoy, icon: FaShoppingBag, color: 'bg-blue-500' },
    { label: 'Ticket promedio', value: `$${stats.ticketPromedio.toLocaleString('es-CO')}`, icon: FaChartBar, color: 'bg-gold-500' },
    { label: 'Ingresos del mes', value: `$${stats.ingresosMes.toLocaleString('es-CO')}`, icon: FaCalendarAlt, color: 'bg-sage-500' },
  ]

  return (
    <div className="min-h-screen bg-cream-50">
      <SEO title="Admin - Finanzas" description="Resumen financiero del restaurante" />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-espresso-800">Finanzas</h1>
          <p className="text-steel text-sm mt-1">Resumen financiero del restaurante</p>
        </div>
        <div className="flex items-center gap-2">
          {(Object.keys(dateRangeLabels) as DateRange[]).map((key) => (
            <button
              key={key}
              onClick={() => setDateRange(key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                dateRange === key
                  ? 'bg-olive-500 border-olive-500 text-white'
                  : 'bg-white border-cream-200 text-espresso-600 hover:bg-cream-50'
              }`}
            >
              {dateRangeLabels[key]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white rounded-2xl border border-cream-200 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 ${card.color} rounded-xl flex items-center justify-center`}>
                <card.icon size={18} className="text-white" />
              </div>
              <p className="text-xs text-steel">{card.label}</p>
            </div>
            <p className="text-2xl font-display font-bold text-espresso-800">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-cream-200 p-6">
          <h2 className="font-display font-bold text-espresso-800 mb-5">Ingresos por día</h2>
          <div className="flex items-end justify-between gap-2 h-48">
            {ventasPorDia.map((v) => {
              const heightPct = v.total > 0 ? Math.max((v.total / maxVenta) * 100, 5) : 0
              return (
                <div key={v.key} className="flex-1 flex flex-col items-center gap-2">
                  <span className="text-[10px] font-semibold text-espresso-700">
                    {v.total > 0 ? `$${(v.total / 1000).toFixed(0)}k` : ''}
                  </span>
                  <div className="w-full flex-1 flex items-end">
                    <div
                      className="w-full bg-olive-400 rounded-t-lg transition-all duration-500"
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-steel font-medium">{v.label}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Métodos de pago */}
        <div className="bg-white rounded-2xl border border-cream-200 p-6">
          <h2 className="font-display font-bold text-espresso-800 mb-5">Métodos de pago</h2>
          {metodosPago.length === 0 ? (
            <div className="text-center py-8">
              <FaWallet size={24} className="mx-auto text-cream-300 mb-2" />
              <p className="text-sm text-steel">Sin datos de pago</p>
            </div>
          ) : (
            <div className="space-y-4">
              {metodosPago.map((m) => {
                const Icon = metedoPagoIcon[m.metodo.toLowerCase()] || FaDollarSign
                const pct = totalPago > 0 ? Math.round((m.total / totalPago) * 100) : 0
                return (
                  <div key={m.metodo}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Icon size={14} className="text-olive-500" />
                        <span className="text-sm font-medium text-espresso-800 capitalize">{m.metodo}</span>
                      </div>
                      <span className="text-sm font-bold text-espresso-800">${m.total.toLocaleString('es-CO')}</span>
                    </div>
                    <div className="w-full bg-cream-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-olive-400 h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-steel">{pct}% del total</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top productos */}
        <div className="bg-white rounded-2xl border border-cream-200 p-6">
          <h2 className="font-display font-bold text-espresso-800 mb-5">Top 5 productos más vendidos</h2>
          {topProductos.length === 0 ? (
            <div className="text-center py-8">
              <FaShoppingBag size={24} className="mx-auto text-cream-300 mb-2" />
              <p className="text-sm text-steel">Sin ventas aún</p>
            </div>
          ) : (
            <div className="space-y-3">
              {topProductos.map((p, i) => (
                <div key={p.nombre} className="flex items-center gap-3">
                  <span
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                      i === 0 ? 'bg-gold-100 text-gold-700' : i === 1 ? 'bg-cream-200 text-espresso-600' : 'bg-cream-100 text-steel'
                    }`}
                  >
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-espresso-800 truncate">{p.nombre}</p>
                    <div className="w-full bg-cream-100 rounded-full h-1.5 mt-1">
                      <div
                        className="bg-olive-400 h-1.5 rounded-full"
                        style={{ width: `${(p.cantidad / (topProductos[0]?.cantidad || 1)) * 100}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-olive-600">{p.cantidad}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pedidos por estado */}
        <div className="bg-white rounded-2xl border border-cream-200 p-6">
          <h2 className="font-display font-bold text-espresso-800 mb-5">Pedidos por estado</h2>
          {pedidosPorEstado.length === 0 ? (
            <div className="text-center py-8">
              <FaChartBar size={24} className="mx-auto text-cream-300 mb-2" />
              <p className="text-sm text-steel">Sin pedidos en el período</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pedidosPorEstado.map((e) => {
                const pct = totalPedidos > 0 ? Math.round((e.cantidad / totalPedidos) * 100) : 0
                return (
                  <div key={e.estado}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${estadoColors[e.estado] || 'bg-cream-300'}`} />
                        <span className="text-sm font-medium text-espresso-800">{estadoLabels[e.estado] || e.estado}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-espresso-800">{e.cantidad}</span>
                        <span className="text-[10px] text-steel">({pct}%)</span>
                      </div>
                    </div>
                    <div className="w-full bg-cream-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`${estadoColors[e.estado] || 'bg-cream-300'} h-full rounded-full transition-all duration-500`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
