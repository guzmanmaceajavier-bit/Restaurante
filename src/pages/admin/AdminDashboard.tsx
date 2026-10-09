import { useEffect, useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { dashboardService } from '../../features/dashboard/dashboard.service'
import { analyticsService } from '../../features/finance/analytics.service'
import { activityService } from '../../features/activity/activity.service'
import { customerService } from '../../features/customers/customer.service'
import { cashService } from '../../features/cash/cash.service'
import { SEO } from '../../lib/seo'
import type { Order } from '../../features/orders/types'
import type { ReservaData } from '../../features/reservations/types'
import { FaUsers, FaClock, FaExclamationTriangle, FaPlus, FaCalendarAlt, FaUtensils, FaFire, FaChartLine, FaConciergeBell, FaGlassCheers, FaCheckCircle, FaDollarSign, FaCreditCard, FaHistory, FaTrophy } from 'react-icons/fa'
import EmptyState from '../../components/feedback/EmptyState'
import { StatCard } from '../../components/admin/StatCard'
import { getRestaurantConfig } from '../../lib/config'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const config = getRestaurantConfig()
  const [ordenes, setOrdenes] = useState<Order[]>([])
  const [reservas, setReservas] = useState<ReservaData[]>([])
  const [mesas, setMesas] = useState<any[]>([])
  const [productos, setProductos] = useState<any[]>([])
  useEffect(() => {
    const load = () => {
      setOrdenes(dashboardService.getOrdenes())
      setReservas(dashboardService.getReservas())
      setMesas(dashboardService.getMesas())
      setProductos(dashboardService.getProductos())
    }
    load(); const id=setInterval(load, 4000); return ()=> clearInterval(id)
  }, [])

  const today = new Date().toISOString().split('T')[0]
  const hour = new Date().getHours()
  const servicio = hour < 12 ? 'Desayuno' : hour < 17 ? 'Almuerzo' : 'Cena'
  const ServicioIcon = hour < 12 ? FaGlassCheers : hour < 17 ? FaUtensils : FaConciergeBell

  const s = useMemo(() => dashboardService.getResumen(ordenes, reservas, mesas, productos, today), [ordenes, reservas, mesas, productos, today])

  const ventasHora = useMemo(()=> dashboardService.getVentasPorHora(ordenes, today), [ordenes, today])
  const maxHora = Math.max(...ventasHora.map(v=> v.total), 1)

  const topProductos = useMemo(()=> dashboardService.getTopProductos(ordenes), [ordenes])

  const reservasHoyLista = useMemo(()=> dashboardService.getReservasHoy(reservas, today), [reservas, today])

  const ordenesHoy = useMemo(()=> ordenes.filter(o=> o.estado!=='cancelado' && o.createdAt?.startsWith(today)), [ordenes, today])
  const finanzasHoy = useMemo(()=> {
    const gastosHoy = cashService.getGastos().filter(g=> g.fecha===today)
    const ingresos = ordenesHoy.reduce((s,o)=> s+(o.total||0), 0)
    const gastos = gastosHoy.reduce((s,g)=> s+(g.monto||0), 0)
    return { ingresos, gastos, neto: ingresos - gastos }
  }, [ordenesHoy, today])
  const metodosPagoHoy = useMemo(()=> analyticsService.getMetodosPago(ordenesHoy), [ordenesHoy])
  const totalPagoHoy = useMemo(()=> metodosPagoHoy.reduce((s,m)=> s+m.total, 0), [metodosPagoHoy])
  const estadosHoy = useMemo(()=> analyticsService.getPedidosPorEstado(ordenesHoy), [ordenesHoy])
  const actividadReciente = useMemo(()=> activityService.getAll().slice(0, 5), [ordenes])
  const topClientes = useMemo(()=> customerService.getVistaAdmin()
    .filter(c=> (c.totalSpent||0) > 0)
    .sort((a,b)=> (b.totalSpent||0) - (a.totalSpent||0))
    .slice(0, 5), [ordenes])

  return (
    <div className="space-y-5">
      <SEO title="Dashboard — Servicio" />
      {/* Service header */}
      <div className="rounded-xl border border-[#E5E7EB] bg-white overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-[#667A22] via-[#F5B51B] to-[#667A22]" />
        <div className="px-4 sm:px-5 py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#0F172A] flex items-center justify-center text-white"><ServicioIcon size={16} /></div>
            <div>
              <p className="text-[11px] font-medium tracking-widest uppercase text-[#94A3B8]">Servicio de hoy — {servicio}</p>
              <p className="text-[15px] font-semibold text-[#0F172A]">{new Date().toLocaleDateString('es-CO', { weekday:'long', day:'2-digit', month:'long' })} · {config.nombre}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F8FAFC] border border-[#E5E7EB] text-xs font-medium text-[#334155]">
              <span className={`w-2 h-2 rounded-full ${s.ocupacion>70 ? 'bg-[#EF4444] animate-pulse' : s.ocupacion>40 ? 'bg-[#F59E0B]' : 'bg-[#10B981]'}`} /> Ocupación {s.ocupacion}% · {s.ocupadas}/{s.totalMesas} mesas
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#E5E7EB] text-xs font-medium text-[#334155]"><FaUsers size={11} className="text-[#94A3B8]"/> {s.cubiertos} cubiertos hoy</span>
            <span className="text-xs text-[#94A3B8] hidden sm:inline">{s.reservasHoy.length} reservas · {s.totalHoy} pedidos</span>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Ventas hoy" value={`$${s.ventasHoy.toLocaleString('es-CO')}`} delta={s.dVentas} deltaLabel="vs ayer" href="/admin-finanzas" />
        <StatCard label="Pedidos hoy" value={s.totalHoy} delta={s.dPedidos} deltaLabel="vs ayer" href="/admin-ordenes" />
        <StatCard label="Ticket promedio" value={`$${s.ticket.toLocaleString('es-CO')}`} href="/admin-ordenes" />
        <StatCard label="Cubiertos" value={s.cubiertos} href="/admin-ordenes" />
      </div>

      {/* Finanzas de hoy */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Ingresos hoy', value: `$${finanzasHoy.ingresos.toLocaleString('es-CO')}`, icon: FaDollarSign, accent: 'text-[#065F46] bg-[#ECFDF5]' },
          { label: 'Gastos hoy', value: `$${finanzasHoy.gastos.toLocaleString('es-CO')}`, icon: FaCreditCard, accent: 'text-[#991B1B] bg-[#FEF2F2]' },
          { label: 'Neto hoy', value: `$${finanzasHoy.neto.toLocaleString('es-CO')}`, icon: FaChartLine, accent: finanzasHoy.neto>=0 ? 'text-[#065F46] bg-[#ECFDF5]' : 'text-[#991B1B] bg-[#FEF2F2]' },
        ].map(c=> (
          <div key={c.label} className="bg-white rounded-xl border border-[#E5E7EB] p-4 flex items-center gap-3">
            <span className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${c.accent}`}><c.icon size={14} /></span>
            <div className="min-w-0"><p className="text-[11px] font-medium tracking-wide uppercase text-[#64748B]">{c.label}</p><p className="text-lg font-bold tracking-tight text-[#0F172A]" data-numeric>{c.value}</p></div>
          </div>
        ))}
      </div>

      {/* Main grid: ventas por hora + cocina + reservas */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-xl border border-[#E5E7EB] p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-[#0F172A] flex items-center gap-2"><FaChartLine size={12} className="text-[#667A22]"/> Ventas por hora · Hoy</h2>
            <span className="text-xs text-[#94A3B8]">10:00–21:00 · Almuerzo vs Cena</span>
          </div>
          <div className="flex items-end gap-1 h-28" role="img" aria-label={`Ventas por hora hoy, máximo $${maxHora.toLocaleString('es-CO')}`}>
            {ventasHora.map(v=>{
              const h=parseInt(v.label.split(':')[0]); const isLunch=h>=12 && h<=15; const isDinner=h>=19
              const bg = v.total===0 ? 'bg-[#F1F5F9]' : isDinner ? 'bg-[#1C2A0F]' : isLunch ? 'bg-[#667A22]' : 'bg-[#CBD5E1]'
              return (
                <div key={v.label} className="flex-1 flex flex-col items-center gap-1" title={`${v.label}: $${v.total.toLocaleString('es-CO')}`}>
                  <span className="text-[10px] font-medium text-[#475569]">{v.total>0 ? `$${(v.total/1000).toFixed(0)}k` : ''}</span>
                  <div className={`w-full rounded-t-md transition-all duration-500 ${bg}`} style={{ height: `${Math.max((v.total/maxHora)*100, v.total>0?8:4)}%`, minHeight: '8px' }} />
                  <span className="text-[10px] text-[#94A3B8]">{v.label.slice(0,2)}</span>
                </div>
              )
            })}
          </div>
          <div className="flex gap-3 mt-3 text-[11px] text-[#64748B]"><span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-[#667A22]"/> Almuerzo</span><span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-[#1C2A0F]"/> Cena</span><span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-[#CBD5E1]"/> Valle</span></div>
        </div>

        <div className="bg-white rounded-xl border border-[#E5E7EB] p-4">
          <h2 className="text-sm font-semibold text-[#0F172A] mb-3 flex items-center gap-2"><FaConciergeBell size={12} className="text-[#F59E0B]"/> Cocina · Carga</h2>
          <div className="space-y-3">
            {[
              {label:'Pendientes', value:s.pendientes, color:'bg-[#F59E0B]', to:'/admin-cocina'},
              {label:'En preparación', value:s.preparando, color:'bg-[#3B82F6]', to:'/admin-cocina'},
              {label:'Listos', value:s.listos, color:'bg-[#10B981]', to:'/admin-cocina'},
            ].map(r=> (
              <Link key={r.label} to={r.to} className="flex items-center gap-3 p-2.5 rounded-lg border border-[#F1F5F9] hover:border-[#E5E7EB] hover:bg-[#F8FAFC] transition-colors">
                <span className={`w-2 h-8 rounded-full ${r.color} ${r.value>3 ? 'animate-pulse' : ''}`} />
                <span className="flex-1 text-sm text-[#334155]">{r.label}</span>
                <span className="text-sm font-bold text-[#0F172A]">{r.value}</span>
              </Link>
            ))}
          </div>
          <div className="mt-4 p-3 rounded-lg bg-[#FFFBEB] border border-[#FDE68A]">
            <p className="text-xs font-medium text-[#92400E]">Mesas {s.ocupadas}/{s.totalMesas} · {s.libres} libres</p>
            <div className="mt-2 h-1.5 bg-white rounded-full overflow-hidden flex">
              <div className="bg-[#EF4444] h-full" style={{width: `${(s.ocupadas/s.totalMesas)*100}%`}} />
              <div className="bg-[#10B981] h-full" style={{width: `${(s.libres/s.totalMesas)*100}%`}} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-4">
          <h2 className="text-sm font-semibold text-[#0F172A] mb-3 flex items-center gap-2"><FaCalendarAlt size={12} className="text-[#0F172A]"/> Reservas hoy</h2>
          {reservasHoyLista.length===0 ? <p className="text-sm text-[#94A3B8]">Sin reservas hoy</p> : (
            <div className="space-y-2">
              {reservasHoyLista.map(r=> (
                <div key={r.id} className="flex items-center gap-3 py-2 border-b border-[#F8FAFC] last:border-0">
                  <span className="text-xs font-mono font-medium text-[#0F172A] w-12">{r.hora}</span>
                  <span className="flex-1 text-sm text-[#334155] truncate">{r.nombre} · {r.personas}p · {r.zona}</span>
                  <span className={`text-[11px] px-2 py-0.5 rounded-full border ${r.estado==='confirmada' ? 'bg-[#ECFDF5] text-[#065F46] border-[#A7F3D0]' : 'bg-[#FFFBEB] text-[#92400E] border-[#FDE68A]'}`}>{r.estado}</span>
                </div>
              ))}
              <Link to="/admin-reservas" className="text-xs font-medium text-[#667A22] hover:underline">Ver calendario →</Link>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-[#E5E7EB] p-4">
          <h2 className="text-sm font-semibold text-[#0F172A] mb-3 flex items-center gap-2"><FaFire size={12} className="text-[#F59E0B]"/> Platos estrella hoy</h2>
          {topProductos.length===0 ? <EmptyState icon={<FaUtensils size={18}/>} title="Sin ventas" description="Aparecerán con pedidos" /> : (
            <div className="space-y-2">
              {topProductos.map(([nombre,cant], i)=> (
                <div key={nombre} className="flex items-center gap-3 group">
                  <span className="w-6 h-6 rounded-md bg-[#F8FAFC] border border-[#E5E7EB] flex items-center justify-center text-xs font-bold text-[#475569] group-hover:border-[#CBD5E1] transition-colors">{i+1}</span>
                  <span className="flex-1 text-sm text-[#0F172A] truncate">{nombre}</span>
                  <span className="text-sm font-semibold text-[#0F172A]">{cant}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={`rounded-xl border p-4 transition-colors ${(s.stockBajo.length>0 || s.agotados.length>0 || s.pendientes>0) ? 'bg-white border-[#FECACA]' : 'bg-white border-[#E5E7EB]'}`}>
          <h2 className="text-sm font-semibold text-[#0F172A] mb-3 flex items-center gap-2">
            Requiere atención
            {(s.stockBajo.length>0 || s.agotados.length>0 || s.pendientes>0) && (
              <span className="w-2 h-2 rounded-full bg-[#DC2626] animate-pulse" aria-label="Hay alertas activas" />
            )}
          </h2>
          {(s.stockBajo.length===0 && s.agotados.length===0 && s.pendientes===0) ? <p className="text-sm text-[#10B981] inline-flex items-center gap-1.5"><FaCheckCircle size={13} /> Todo al día</p> : (
            <div className="space-y-2">
              {s.pendientes>0 && <Link to="/admin-ordenes" className="flex items-center gap-2 p-2.5 rounded-lg bg-[#FFFBEB] border border-[#FDE68A] text-sm text-[#92400E] hover:bg-[#FEF3C7] transition-colors"><FaClock size={12}/> {s.pendientes} pendientes <span className="ml-auto text-xs font-semibold">Ver →</span></Link>}
              {s.stockBajo.length>0 && <Link to="/admin-catalogo#inventario" className="flex items-center gap-2 p-2.5 rounded-lg bg-[#FEF2F2] border border-[#FECACA] text-sm text-[#991B1B] hover:bg-[#FEE2E2] transition-colors"><FaExclamationTriangle size={12}/> {s.stockBajo.length} stock bajo <span className="ml-auto text-xs font-semibold">Ver →</span></Link>}
              {s.agotados.length>0 && <Link to="/admin-catalogo#inventario" className="flex items-center gap-2 p-2.5 rounded-lg bg-[#FEF2F2] border border-[#FECACA] text-sm text-[#991B1B] hover:bg-[#FEE2E2] transition-colors"><FaExclamationTriangle size={12}/> {s.agotados.length} agotados <span className="ml-auto text-xs font-semibold">Ver →</span></Link>}
            </div>
          )}
          <div className="mt-4 pt-4 border-t border-[#F1F5F9]">
            <p className="text-[11px] font-semibold tracking-widest uppercase text-[#94A3B8] mb-2">Acciones rápidas</p>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={()=> navigate('/admin-ordenes')} className="py-2 rounded-lg bg-[#0F172A] text-white text-xs font-semibold hover:bg-[#1E293B] flex items-center justify-center gap-1.5"><FaPlus size={10}/> Pedido</button>
              <button onClick={()=> navigate('/admin-reservas')} className="py-2 rounded-lg border border-[#E5E7EB] bg-white text-xs font-semibold text-[#334155] hover:bg-[#F8FAFC]"><FaCalendarAlt size={10}/> Reserva</button>
            </div>
          </div>
        </div>
      </div>

      {/* Métodos de pago + estados de hoy */}
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-4">
          <h2 className="text-sm font-semibold text-[#0F172A] mb-3 flex items-center gap-2"><FaCreditCard size={12} className="text-[#667A22]"/> Métodos de pago · Hoy</h2>
          {metodosPagoHoy.length===0 ? <p className="text-sm text-[#94A3B8]">Sin cobros hoy</p> : (
            <div className="space-y-2.5">
              {metodosPagoHoy.map(m=> {
                const pct = totalPagoHoy>0 ? Math.round((m.total/totalPagoHoy)*100) : 0
                return (
                  <div key={m.metodo}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[13px] font-medium text-[#0F172A] capitalize">{m.metodo}</span>
                      <span className="text-[13px] font-semibold text-[#0F172A]" data-numeric>${m.total.toLocaleString('es-CO')} · {pct}%</span>
                    </div>
                    <div className="h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden"><div className="h-full bg-[#667A22] rounded-full" style={{ width: `${pct}%` }} /></div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-4">
          <h2 className="text-sm font-semibold text-[#0F172A] mb-3 flex items-center gap-2"><FaChartLine size={12} className="text-[#667A22]"/> Pedidos por estado · Hoy</h2>
          {estadosHoy.length===0 ? <p className="text-sm text-[#94A3B8]">Sin pedidos hoy</p> : (
            <div className="space-y-2.5">
              {estadosHoy.map(e=> {
                const total = estadosHoy.reduce((s,x)=> s+x.cantidad, 0)
                const pct = total>0 ? Math.round((e.cantidad/total)*100) : 0
                return (
                  <div key={e.estado} className="flex items-center gap-3">
                    <span className="text-[13px] font-medium text-[#0F172A] capitalize w-24 shrink-0">{e.estado}</span>
                    <div className="flex-1 h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden"><div className="h-full bg-[#0F172A] rounded-full" style={{ width: `${pct}%` }} /></div>
                    <span className="text-[13px] font-semibold text-[#0F172A] w-14 text-right">{e.cantidad} · {pct}%</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Actividad + top clientes */}
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-[#0F172A] flex items-center gap-2"><FaHistory size={12} className="text-[#667A22]"/> Actividad reciente</h2>
            <Link to="/admin-actividad" className="text-xs font-medium text-[#667A22] hover:underline">Ver todo →</Link>
          </div>
          {actividadReciente.length===0 ? <p className="text-sm text-[#94A3B8]">Sin actividad registrada</p> : (
            <div className="space-y-2">
              {actividadReciente.map((a:any)=> (
                <div key={a.id} className="flex items-center gap-3 py-2 border-b border-[#F8FAFC] last:border-0">
                  <span className="w-7 h-7 rounded-md bg-[#F8FAFC] border border-[#E5E7EB] flex items-center justify-center text-[#64748B] shrink-0"><FaHistory size={10}/></span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-[#0F172A] truncate">{a.action || a.accion || '—'}</p>
                    <p className="text-xs text-[#64748B] truncate">{a.details || a.detalle || ''}</p>
                  </div>
                  <span className="text-[11px] text-[#94A3B8] shrink-0">{a.timestamp ? new Date(a.timestamp).toLocaleTimeString('es-CO',{hour:'2-digit',minute:'2-digit'}) : a.fecha ? new Date(a.fecha).toLocaleTimeString('es-CO',{hour:'2-digit',minute:'2-digit'}) : ''}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-[#0F172A] flex items-center gap-2"><FaTrophy size={12} className="text-[#F59E0B]"/> Mejores clientes</h2>
            <Link to="/admin-clientes" className="text-xs font-medium text-[#667A22] hover:underline">Ver todos →</Link>
          </div>
          {topClientes.length===0 ? <p className="text-sm text-[#94A3B8]">Sin compras registradas</p> : (
            <div className="space-y-2">
              {topClientes.map((c,i)=> (
                <div key={c.id} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-md bg-[#F8FAFC] border border-[#E5E7EB] flex items-center justify-center text-xs font-bold text-[#475569] shrink-0">{i+1}</span>
                  <span className="flex-1 text-[13px] font-medium text-[#0F172A] truncate">{c.nombre}</span>
                  <span className="text-[13px] font-semibold text-[#0F172A]" data-numeric>${(c.totalSpent||0).toLocaleString('es-CO')}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
