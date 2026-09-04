import { useEffect, useState, useMemo } from 'react'
import { FaChartLine, FaClock, FaUsers, FaCalendarAlt, FaDownload } from 'react-icons/fa'
import { SEO } from '../lib/seo'
import { storage } from '../lib/storage'
import { dataService } from '../lib/dataService'
import { ExportButton } from '../components/admin/ExportButton'
import EmptyState from '../components/core/EmptyState'
import type { Order } from '../types/order'
import type { ReservaData } from '../types/ReservaData'

interface ClientData {
  nombre: string; email: string; telefono: string
}

export default function AdminReportes() {
  const [ordenes, setOrdenes] = useState<Order[]>([])
  const [reservas, setReservas] = useState<ReservaData[]>([])
  const [clientes, setClientes] = useState<ClientData[]>([])

  useEffect(() => {
    setOrdenes(storage.getOrdenes<Order>())
    setReservas(storage.getReservas<ReservaData>())
    const stored: ClientData[] = JSON.parse(localStorage.getItem('clientes') || '[]')
    setClientes(stored)
  }, [])

  const productos = useMemo(() => dataService.getProductos(), [])

  const stats = useMemo(() => {
    const hoy = new Date().toISOString().split('T')[0]
    const ayer = new Date(Date.now() - 86400000).toISOString().split('T')[0]
    const ordenesHoy = ordenes.filter((o) => o.createdAt?.startsWith(hoy))
    const ordenesAyer = ordenes.filter((o) => o.createdAt?.startsWith(ayer))
    const ingresosHoy = ordenesHoy.reduce((sum, o) => sum + (o.total || 0), 0)
    const ingresosAyer = ordenesAyer.reduce((sum, o) => sum + (o.total || 0), 0)
    const ticketPromedio = ordenesHoy.length > 0 ? Math.round(ingresosHoy / ordenesHoy.length) : 0
    const changeOrdenes = ordenesAyer.length > 0 ? Math.round(((ordenesHoy.length - ordenesAyer.length) / ordenesAyer.length) * 100) : 0
    const changeIngresos = ingresosAyer > 0 ? Math.round(((ingresosHoy - ingresosAyer) / ingresosAyer) * 100) : 0
    return { totalOrdenes: ordenesHoy.length, ingresosHoy, ticketPromedio, changeOrdenes, changeIngresos }
  }, [ordenes])

  const pedidosPorHora = useMemo(() => {
    const horas: number[] = new Array(24).fill(0)
    ordenes.forEach((o) => {
      if (o.createdAt) {
        const hora = new Date(o.createdAt).getHours()
        horas[hora]++
      }
    })
    return horas.map((count, hora) => ({ hora, count }))
  }, [ordenes])

  const maxPedidosHora = Math.max(...pedidosPorHora.map((h) => h.count), 1)

  const categoriasVentas = useMemo(() => {
    const mapa: Record<string, number> = {}
    ordenes.forEach((o) => {
      o.items?.forEach((item) => {
        const producto = productos.find((p) => p.nombre === item.nombre)
        const cat = producto?.categoría || 'Otros'
        mapa[cat] = (mapa[cat] || 0) + item.precio * item.quantity
      })
    })
    const total = Object.values(mapa).reduce((s, v) => s + v, 0)
    return Object.entries(mapa)
      .map(([categoria, ventas]) => ({ categoria, ventas, porcentaje: total > 0 ? Math.round((ventas / total) * 100) : 0 }))
      .sort((a, b) => b.ventas - a.ventas)
      .slice(0, 8)
  }, [ordenes, productos])

  const maxCatVentas = Math.max(...categoriasVentas.map((c) => c.ventas), 1)

  const clientesActivos = useMemo(() => {
    const conteo: Record<string, { nombre: string; telefono: string; pedidos: number; total: number }> = {}
    ordenes.forEach((o) => {
      const key = o.phone || o.fullName
      if (!key) return
      if (!conteo[key]) {
        const cli = clientes.find((c) => c.telefono === o.phone)
        conteo[key] = { nombre: o.fullName || cli?.nombre || 'Cliente', telefono: o.phone || '', pedidos: 0, total: 0 }
      }
      conteo[key].pedidos++
      conteo[key].total += o.total || 0
    })
    return Object.values(conteo)
      .sort((a, b) => b.pedidos - a.pedidos)
      .slice(0, 5)
  }, [ordenes, clientes])

  const maxClientePedidos = Math.max(...clientesActivos.map((c) => c.pedidos), 1)

  const reservasResumen = useMemo(() => {
    const confirmadas = reservas.filter((r) => r.estado === 'confirmada').length
    const pendientes = reservas.filter((r) => r.estado === 'Pendiente').length
    const canceladas = reservas.filter((r) => r.estado === 'rechazada').length
    const total = reservas.length
    return { confirmadas, pendientes, canceladas, total }
  }, [reservas])

  const exportarTodo = () => {
    const rows = ordenes.map((o) => ({
      ID: o.id?.slice(0, 8), Cliente: o.fullName || '', Telefono: o.phone || '',
      Total: o.total || 0, Estado: o.estado || '', Fecha: o.createdAt || '',
      Items: o.items?.map((i) => `${i.nombre} x${i.quantity}`).join('; ') || '',
    }))
    if (!rows.length) return
    const header = Object.keys(rows[0]).join(',')
    const data = rows.map((r) => Object.values(r).map((v) => typeof v === 'string' && v.includes(',') ? `"${v}"` : v ?? '').join(','))
    const csv = [header, ...data].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'reporte-completo.csv'
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url)
  }

  const statCards = [
    { label: 'Pedidos hoy', value: stats.totalOrdenes, change: stats.changeOrdenes, icon: FaChartLine, color: 'bg-blue-500' },
    { label: 'Ingresos hoy', value: `$${stats.ingresosHoy.toLocaleString('es-CO')}`, change: stats.changeIngresos, icon: FaChartLine, color: 'bg-olive-500' },
    { label: 'Ticket promedio', value: `$${stats.ticketPromedio.toLocaleString('es-CO')}`, change: 0, icon: FaChartLine, color: 'bg-sage-500' },
    { label: 'Reservas totales', value: reservasResumen.total, change: 0, icon: FaCalendarAlt, color: 'bg-gold-500' },
  ]

  const reservationColors = [
    { label: 'Confirmadas', count: reservasResumen.confirmadas, color: 'bg-sage-400' },
    { label: 'Pendientes', count: reservasResumen.pendientes, color: 'bg-gold-400' },
    { label: 'Canceladas', count: reservasResumen.canceladas, color: 'bg-red-400' },
  ]

  return (
    <div className="min-h-screen bg-cream-50">
      <SEO title="Admin - Reportes y Análiticas" />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-espresso-800">Reportes y Análiticas</h1>
          <p className="text-steel text-sm mt-1">Resumen completo del rendimiento del restaurante</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={exportarTodo} disabled={ordenes.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-olive-500 text-white hover:bg-olive-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
            <FaDownload size={13} /> Exportar todo
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white rounded-2xl p-5 border border-cream-200">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 ${card.color} rounded-xl flex items-center justify-center`}>
                <card.icon size={18} className="text-white" />
              </div>
              {card.change !== 0 && (
                <span className={`text-xs font-semibold ${card.change > 0 ? 'text-green-600' : 'text-red-500'}`}>
                  {card.change > 0 ? '+' : ''}{card.change}%
                </span>
              )}
            </div>
            <p className="text-2xl font-display font-bold text-espresso-800">{card.value}</p>
            <p className="text-xs text-steel mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Pedidos por hora */}
        <div className="bg-white rounded-2xl border border-cream-200 p-6">
          <div className="flex items-center gap-2 mb-5">
            <FaClock size={16} className="text-olive-500" />
            <h2 className="font-display font-bold text-espresso-800">Pedidos por hora</h2>
          </div>
          {ordenes.length === 0 ? (
            <EmptyState icon={<FaClock size={24} />} title="Sin datos" description="Los datos aparecerán cuando haya pedidos" />
          ) : (
            <div className="flex items-end gap-1 h-40">
              {pedidosPorHora.map((h) => (
                <div key={h.hora} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[9px] font-semibold text-steel">{h.count > 0 ? h.count : ''}</span>
                  <div className="w-full bg-cream-100 rounded-t-md relative" style={{ height: `${Math.max((h.count / maxPedidosHora) * 120, h.count > 0 ? 8 : 2)}px` }}>
                    <div className={`absolute bottom-0 w-full rounded-t-md transition-all duration-500 ${h.count > 0 ? 'bg-olive-400' : 'bg-cream-200'}`}
                      style={{ height: '100%' }} />
                  </div>
                  <span className="text-[8px] text-steel">{h.hora}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Categorías más vendidas */}
        <div className="bg-white rounded-2xl border border-cream-200 p-6">
          <div className="flex items-center gap-2 mb-5">
            <FaChartLine size={16} className="text-olive-500" />
            <h2 className="font-display font-bold text-espresso-800">Categorías más vendidas</h2>
          </div>
          {categoriasVentas.length === 0 ? (
            <EmptyState icon={<FaChartLine size={24} />} title="Sin datos" description="Las categorías aparecerán cuando haya ventas" />
          ) : (
            <div className="space-y-3">
              {categoriasVentas.map((c) => (
                <div key={c.categoria} className="flex items-center gap-3">
                  <span className="text-xs text-steel w-24 text-right font-medium truncate">{c.categoria}</span>
                  <div className="flex-1 bg-cream-100 rounded-full h-6 overflow-hidden">
                    <div className="bg-olive-400 h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                      style={{ width: `${Math.max((c.ventas / maxCatVentas) * 100, c.ventas > 0 ? 8 : 0)}%` }}>
                      {c.ventas > 0 && <span className="text-[10px] text-white font-bold">{c.porcentaje}%</span>}
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-espresso-700 w-24 text-right">${c.ventas.toLocaleString('es-CO')}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Clientes más activos */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-cream-200 p-6">
          <div className="flex items-center gap-2 mb-5">
            <FaUsers size={16} className="text-olive-500" />
            <h2 className="font-display font-bold text-espresso-800">Clientes más activos</h2>
          </div>
          {clientesActivos.length === 0 ? (
            <EmptyState icon={<FaUsers size={24} />} title="Sin datos" description="Los clientes aparecerán cuando haya pedidos" />
          ) : (
            <div className="space-y-3">
              {clientesActivos.map((c, i) => (
                <div key={c.telefono || i} className="flex items-center gap-3">
                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-gold-100 text-gold-700' : i === 1 ? 'bg-cream-200 text-espresso-600' : 'bg-cream-100 text-steel'}`}>
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-espresso-800 truncate">{c.nombre}</p>
                    <div className="w-full bg-cream-100 rounded-full h-1.5 mt-1">
                      <div className="bg-olive-400 h-1.5 rounded-full" style={{ width: `${(c.pedidos / maxClientePedidos) * 100}%` }} />
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-espresso-700">{c.pedidos} pedidos</p>
                    <p className="text-[10px] text-steel">${c.total.toLocaleString('es-CO')}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Resumen de reservas */}
        <div className="bg-white rounded-2xl border border-cream-200 p-6">
          <div className="flex items-center gap-2 mb-5">
            <FaCalendarAlt size={16} className="text-olive-500" />
            <h2 className="font-display font-bold text-espresso-800">Resumen de reservas</h2>
          </div>
          {reservasResumen.total === 0 ? (
            <EmptyState icon={<FaCalendarAlt size={24} />} title="Sin reservas" description="Las reservas aparecerán cuando se registren" />
          ) : (
            <>
              <div className="text-center mb-5">
                <p className="text-4xl font-display font-bold text-espresso-800">{reservasResumen.total}</p>
                <p className="text-xs text-steel">reservas totales</p>
              </div>
              <div className="space-y-3">
                {reservationColors.map((r) => (
                  <div key={r.label} className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${r.color}`} />
                    <span className="text-sm text-espresso-700 flex-1">{r.label}</span>
                    <span className="text-sm font-bold text-espresso-800">{r.count}</span>
                    <span className="text-[10px] text-steel">{reservasResumen.total > 0 ? Math.round((r.count / reservasResumen.total) * 100) : 0}%</span>
                  </div>
                ))}
              </div>
              {/* Mini bar */}
              <div className="flex gap-0.5 h-4 rounded-full overflow-hidden mt-4">
                {reservasResumen.total > 0 && (
                  <>
                    <div className="bg-sage-400 rounded-l-full" style={{ width: `${(reservasResumen.confirmadas / reservasResumen.total) * 100}%` }} />
                    <div className="bg-gold-400" style={{ width: `${(reservasResumen.pendientes / reservasResumen.total) * 100}%` }} />
                    <div className="bg-red-400 rounded-r-full" style={{ width: `${(reservasResumen.canceladas / reservasResumen.total) * 100}%` }} />
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Export section */}
      <div className="bg-white rounded-2xl border border-cream-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FaDownload size={16} className="text-olive-500" />
            <h2 className="font-display font-bold text-espresso-800">Exportar datos</h2>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <ExportButton data={ordenes} filename="reporte-ordenes" columns={[
            { key: 'id', label: 'ID' }, { key: 'fullName', label: 'Cliente' }, { key: 'phone', label: 'Teléfono' },
            { key: 'total', label: 'Total' }, { key: 'estado', label: 'Estado' }, { key: 'createdAt', label: 'Fecha' }
          ]} />
          <ExportButton data={reservas} filename="reporte-reservas" columns={[
            { key: 'id', label: 'ID' }, { key: 'nombre', label: 'Nombre' }, { key: 'email', label: 'Email' },
            { key: 'fecha', label: 'Fecha' }, { key: 'hora', label: 'Hora' }, { key: 'estado', label: 'Estado' }
          ]} />
          <ExportButton data={clientesActivos} filename="reporte-clientes" columns={[
            { key: 'nombre', label: 'Nombre' }, { key: 'telefono', label: 'Teléfono' },
            { key: 'pedidos', label: 'Pedidos' }, { key: 'total', label: 'Total gastado' }
          ]} />
          <ExportButton data={categoriasVentas.map((c) => ({ ...c }))} filename="reporte-categorias" columns={[
            { key: 'categoria', label: 'Categoría' }, { key: 'ventas', label: 'Ventas' }, { key: 'porcentaje', label: '% Total' }
          ]} />
        </div>
      </div>
    </div>
  )
}
