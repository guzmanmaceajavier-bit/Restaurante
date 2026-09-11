import { useEffect, useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { storage } from '../lib/storage'
import { SEO } from '../lib/seo'
import type { Order } from '../types/order'
import type { ReservaData } from '../types/ReservaData'
import { FaBox, FaDollarSign, FaUsers, FaClock, FaExclamationTriangle, FaPlus, FaCalendarAlt, FaUtensils, FaThLarge, FaFire, FaChartLine, FaConciergeBell, FaGlassCheers } from 'react-icons/fa'
import EmptyState from '../components/core/EmptyState'
import { StatCard } from '../components/admin/StatCard'
import { getRestaurantConfig } from '../lib/config'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const config = getRestaurantConfig()
  const [ordenes, setOrdenes] = useState<Order[]>([])
  const [reservas, setReservas] = useState<ReservaData[]>([])
  const [mesas, setMesas] = useState<any[]>([])
  const [productos, setProductos] = useState<any[]>([])
  useEffect(() => {
    const load = () => {
      setOrdenes(storage.getOrdenes<Order>())
      setReservas(storage.getReservas<ReservaData>())
      try { setMesas(JSON.parse(localStorage.getItem('mesas')||'[]')) } catch {}
      try { setProductos(JSON.parse(localStorage.getItem('productos')||'[]')) } catch {}
    }
    load(); const id=setInterval(load, 4000); return ()=> clearInterval(id)
  }, [])

  const today = new Date().toISOString().split('T')[0]
  const hour = new Date().getHours()
  const servicio = hour < 12 ? 'Desayuno' : hour < 17 ? 'Almuerzo' : 'Cena'
  const ServicioIcon = hour < 12 ? FaGlassCheers : hour < 17 ? FaUtensils : FaConciergeBell

  const s = useMemo(() => {
    const ayer = new Date(Date.now()-86400000).toISOString().split('T')[0]
    const ordenesHoy = ordenes.filter(o=> o.createdAt?.startsWith(today))
    const ordenesAyer = ordenes.filter(o=> o.createdAt?.startsWith(ayer))
    const ventasHoy = ordenesHoy.reduce((a,o)=> a+(o.total||0),0)
    const ventasAyer = ordenesAyer.reduce((a,o)=> a+(o.total||0),0)
    const byEstado = (e:string)=> ordenes.filter(o=> o.estado===e).length
    const pendientes = byEstado('recibido'); const preparando = byEstado('preparando'); const listos = byEstado('listo')
    const cubiertos = ordenesHoy.reduce((a,o)=> a + (o.items?.reduce((s:any,i:any)=> s+i.quantity,0) || 0),0)
    const ticket = ordenesHoy.length ? Math.round(ventasHoy/ordenesHoy.length) : 0
    const dVentas = ventasAyer ? Math.round(((ventasHoy-ventasAyer)/ventasAyer)*100) : ventasHoy>0?100:0
    const dPedidos = ordenesAyer.length ? Math.round(((ordenesHoy.length-ordenesAyer.length)/ordenesAyer.length)*100) : ordenesHoy.length?100:0
    const reservasHoy = reservas.filter(r=> r.fecha===today)
    const ocupadas = mesas.filter((m:any)=> m.estado==='ocupada').length
    const libres = mesas.filter((m:any)=> m.estado==='disponible').length
    const totalMesas = mesas.length || 8
    const ocupacion = totalMesas ? Math.round((ocupadas/totalMesas)*100) : 0
    const stockBajo = productos.filter((p:any)=> (p.stock||0)>0 && (p.stock||0)<=5)
    const agotados = productos.filter((p:any)=> (p.stock||0)<=0)
    return { ventasHoy, dVentas, dPedidos, totalHoy: ordenesHoy.length, ticket, cubiertos, pendientes, preparando, listos, reservasHoy, ocupadas, libres, totalMesas, ocupacion, stockBajo, agotados }
  }, [ordenes, reservas, mesas, productos])

  const ventasHora = useMemo(()=>{
    const hours = Array.from({length:12}, (_,i)=> 10+i) // 10-21
    return hours.map(h=>{
      const label=`${String(h).padStart(2,'0')}:00`
      const total=ordenes.filter(o=> {
        if(!o.createdAt?.startsWith(today)) return false
        const hr=new Date(o.createdAt).getHours()
        return hr===h
      }).reduce((a,o)=> a+(o.total||0),0)
      return {label, total}
    })
  }, [ordenes, today])
  const maxHora = Math.max(...ventasHora.map(v=> v.total), 1)

  const topProductos = useMemo(()=>{
    const m: Record<string, number>={}; ordenes.forEach(o=> o.items?.forEach((it:any)=> m[it.nombre]=(m[it.nombre]||0)+it.quantity)); return Object.entries(m).sort((a,b)=> b[1]-a[1]).slice(0,4)
  }, [ordenes])

  const reservasHoyLista = useMemo(()=> reservas.filter(r=> r.fecha===today).sort((a,b)=> a.hora.localeCompare(b.hora)).slice(0,5), [reservas, today])

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

      {/* Main grid: ventas por hora + cocina + reservas */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-xl border border-[#E5E7EB] p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-[#0F172A] flex items-center gap-2"><FaChartLine size={12} className="text-[#667A22]"/> Ventas por hora · Hoy</h2>
            <span className="text-xs text-[#94A3B8]">10:00–21:00 · Almuerzo vs Cena</span>
          </div>
          <div className="flex items-end gap-1 h-28">
            {ventasHora.map(v=>{
              const h=parseInt(v.label.split(':')[0]); const isLunch=h>=12 && h<=15; const isDinner=h>=19
              const bg = v.total===0 ? 'bg-[#F1F5F9]' : isDinner ? 'bg-[#1C2A0F]' : isLunch ? 'bg-[#667A22]' : 'bg-[#CBD5E1]'
              return (
                <div key={v.label} className="flex-1 flex flex-col items-center gap-1">
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

        <div className="bg-white rounded-xl border border-[#E5E7EB] p-4">
          <h2 className="text-sm font-semibold text-[#0F172A] mb-3">Requiere atención</h2>
          {(s.stockBajo.length===0 && s.agotados.length===0 && s.pendientes===0) ? <p className="text-sm text-[#10B981]">✓ Todo al día</p> : (
            <div className="space-y-2">
              {s.pendientes>0 && <Link to="/admin-ordenes" className="flex items-center gap-2 p-2.5 rounded-lg bg-[#FFFBEB] border border-[#FDE68A] text-sm text-[#92400E] hover:bg-[#FEF3C7] transition-colors"><FaClock size={12}/> {s.pendientes} pendientes <span className="ml-auto text-xs font-semibold">Ver →</span></Link>}
              {s.stockBajo.length>0 && <Link to="/admin-inventario" className="flex items-center gap-2 p-2.5 rounded-lg bg-[#FEF2F2] border border-[#FECACA] text-sm text-[#991B1B]"><FaExclamationTriangle size={12}/> {s.stockBajo.length} stock bajo</Link>}
              {s.agotados.length>0 && <Link to="/admin-inventario" className="flex items-center gap-2 p-2.5 rounded-lg bg-[#FEF2F2] border border-[#FECACA] text-sm text-[#991B1B]"><FaExclamationTriangle size={12}/> {s.agotados.length} agotados</Link>}
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
    </div>
  )
}
