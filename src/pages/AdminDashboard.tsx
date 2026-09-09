import { useEffect, useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { storage } from '../lib/storage'
import { SEO } from '../lib/seo'
import type { Order } from '../types/order'
import type { ReservaData } from '../types/ReservaData'
import { FaBox, FaDollarSign, FaUsers, FaShoppingBag, FaClock, FaExclamationTriangle, FaPlus, FaCalendarAlt, FaUtensils } from 'react-icons/fa'
import EmptyState from '../components/core/EmptyState'
import { StatCard } from '../components/admin/StatCard'
import { PageHeader } from '../components/admin/PageHeader'

export default function AdminDashboard() {
  const navigate = useNavigate()
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
  const s = useMemo(() => {
    const ayer = new Date(Date.now()-86400000).toISOString().split('T')[0]
    const startWeek = new Date(); startWeek.setDate(startWeek.getDate()-7)
    const ordenesHoy = ordenes.filter(o=> o.createdAt?.startsWith(today))
    const ordenesAyer = ordenes.filter(o=> o.createdAt?.startsWith(ayer))
    const ventasHoy = ordenesHoy.reduce((a,o)=> a+(o.total||0),0)
    const ventasAyer = ordenesAyer.reduce((a,o)=> a+(o.total||0),0)
    const byEstado = (e:string)=> ordenes.filter(o=> o.estado===e).length
    const pendientes = byEstado('recibido'); const preparando = byEstado('preparando'); const listos = byEstado('listo'); const entregados = byEstado('entregado'); const cancelados = byEstado('cancelado')
    const totalHoy = ordenesHoy.length; const ticket = totalHoy ? Math.round(ventasHoy/totalHoy) : 0
    const clientesUnicosHoy = new Set(ordenesHoy.map(o=> o.phone)).size
    const dVentasHoy = ventasAyer ? Math.round(((ventasHoy-ventasAyer)/ventasAyer)*100) : ventasHoy>0 ? 100 : 0
    const dPedidosHoy = ordenesAyer.length ? Math.round(((totalHoy-ordenesAyer.length)/ordenesAyer.length)*100) : totalHoy>0 ? 100 : 0
    const reservasHoy = reservas.filter(r=> r.fecha===today).length
    const stockBajo = productos.filter((p:any)=> (p.stock||0)>0 && (p.stock||0)<=5)
    const agotados = productos.filter((p:any)=> (p.stock||0)<=0)
    return { ventasHoy, ventasAyer, dVentasHoy, dPedidosHoy, totalHoy, ticket, clientesUnicosHoy, pendientes, preparando, listos, entregados, cancelados, reservasHoy, stockBajo, agotados }
  }, [ordenes, reservas, productos])

  const ventas7 = useMemo(()=>{
    const out: {label:string, total:number}[]=[]
    for(let i=6;i>=0;i--){ const d=new Date(); d.setDate(d.getDate()-i); const k=d.toISOString().split('T')[0]; const label=d.toLocaleDateString('es-CO',{weekday:'short', day:'2-digit'}); const total=ordenes.filter(o=> o.createdAt?.startsWith(k)).reduce((a,o)=> a+(o.total||0),0); out.push({label, total})}
    return out
  }, [ordenes])
  const maxV = Math.max(...ventas7.map(v=> v.total), 1)
  const topProductos = useMemo(()=>{
    const m: Record<string, number>={}; ordenes.forEach(o=> o.items?.forEach((it:any)=> m[it.nombre]=(m[it.nombre]||0)+it.quantity)); return Object.entries(m).sort((a,b)=> b[1]-a[1]).slice(0,5)
  }, [ordenes])
  const actividad = useMemo(()=>{
    const o = ordenes.slice(0,4).map(x=> ({ time: x.createdAt ? new Date(x.createdAt).toLocaleTimeString('es-CO',{hour:'2-digit', minute:'2-digit'}) : '--:--', text: `Pedido ${x.id} · ${x.fullName||'Cliente'} · $${Number(x.total).toLocaleString('es-CO')}` }))
    const r = reservas.slice(0,2).map(x=> ({ time: x.hora, text: `Reserva ${x.nombre} · ${x.personas} pers · ${x.estado}` }))
    return [...o, ...r].slice(0,6)
  }, [ordenes, reservas])
  const distribucion = [
    { label:'Pendientes', value: s.pendientes, color:'bg-[#F59E0B]' },
    { label:'En preparación', value: s.preparando, color:'bg-[#3B82F6]' },
    { label:'Listos', value: s.listos, color:'bg-[#10B981]' },
    { label:'Entregados', value: s.entregados, color:'bg-[#94A3B8]' },
    { label:'Cancelados', value: s.cancelados, color:'bg-[#EF4444]' },
  ]
  const totalPedidos = distribucion.reduce((a,b)=> a+b.value,0)

  const alertas: {icon:any, text:string, to:string, tone:string}[] = []
  if(s.pendientes>2) alertas.push({icon:FaBox, text:`${s.pendientes} pedidos pendientes requieren atención`, to:'/admin-ordenes', tone:'amber'})
  if(s.stockBajo.length>0) alertas.push({icon:FaExclamationTriangle, text:`${s.stockBajo.length} productos con stock bajo`, to:'/admin-inventario', tone:'red'})
  if(s.agotados.length>0) alertas.push({icon:FaExclamationTriangle, text:`${s.agotados.length} productos agotados`, to:'/admin-inventario', tone:'red'})
  if(s.reservasHoy>0) alertas.push({icon:FaCalendarAlt, text:`${s.reservasHoy} reservas para hoy`, to:'/admin-reservas', tone:'blue'})

  return (
    <div>
      <SEO title="Admin — Dashboard" />
      <PageHeader
        title="Centro de operaciones"
        description="Ventas, pedidos, reservas y alertas — todo en tiempo real conectado a localStorage."
        actions={
          <>
            <button onClick={()=> navigate('/admin-ordenes')} className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[#E5E7EB] bg-white text-sm font-medium text-[#334155] hover:bg-[#F8FAFC]">Ver pedidos</button>
            <button onClick={()=> navigate('/admin-reportes')} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0F172A] text-white text-sm font-medium hover:bg-[#1E293B]">Ver reportes</button>
          </>
        }
      />

      {/* 4 KPIs principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Ventas de hoy" value={`$${s.ventasHoy.toLocaleString('es-CO')}`} delta={s.dVentasHoy} deltaLabel="vs. ayer" icon={FaDollarSign} href="/admin-ordenes" />
        <StatCard label="Pedidos" value={s.totalHoy} delta={s.dPedidosHoy} deltaLabel="vs. ayer" icon={FaBox} href="/admin-ordenes" />
        <StatCard label="Ticket promedio" value={`$${s.ticket.toLocaleString('es-CO')}`} icon={FaShoppingBag} href="/admin-ordenes" />
        <StatCard label="Clientes hoy" value={s.clientesUnicosHoy} icon={FaUsers} href="/admin-clientes" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {/* Ventas */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-[#E5E7EB] p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-[#0F172A]">Ventas · últimos 7 días</h2>
            <span className="text-xs text-[#64748B]">Total 7d ${ventas7.reduce((a,b)=>a+b.total,0).toLocaleString('es-CO')}</span>
          </div>
          <div className="space-y-3">
            {ventas7.map(v=> (
              <div key={v.label} className="flex items-center gap-3">
                <span className="text-xs text-[#64748B] w-20 text-right">{v.label}</span>
                <div className="flex-1 h-2.5 bg-[#F1F5F9] rounded-full overflow-hidden">
                  <div className="h-full bg-[#667A22] rounded-full transition-all" style={{ width: `${Math.max((v.total/maxV)*100, v.total>0?6:0)}%` }} />
                </div>
                <span className="text-xs font-medium text-[#0F172A] w-24 text-right" data-numeric>${v.total.toLocaleString('es-CO')}</span>
              </div>
            ))}
          </div>
        </div>
        {/* Distribución pedidos */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
          <h2 className="text-sm font-semibold text-[#0F172A] mb-4">Pedidos por estado</h2>
          <div className="flex gap-1 h-2 rounded-full overflow-hidden mb-4">
            {distribucion.map(d=> (
              <div key={d.label} className={`${d.color} transition-all`} style={{ width: `${totalPedidos ? (d.value/totalPedidos)*100 : 0}%` }} title={`${d.label}: ${d.value}`} />
            ))}
          </div>
          <div className="space-y-2.5">
            {distribucion.map(d=> (
              <div key={d.label} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-[#475569]"><span className={`w-2 h-2 rounded-full ${d.color}`} />{d.label}</span>
                <span className="font-medium text-[#0F172A]">{d.value}</span>
              </div>
            ))}
          </div>
          <Link to="/admin-ordenes" className="mt-4 inline-flex text-xs font-medium text-[#667A22] hover:underline">Gestionar pedidos →</Link>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {/* Top productos */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
          <h2 className="text-sm font-semibold text-[#0F172A] mb-4">Productos más vendidos</h2>
          {topProductos.length===0 ? <EmptyState icon={<FaShoppingBag size={20}/>} title="Sin ventas aún" description="Aparecerán cuando haya pedidos" /> : (
            <div className="space-y-3">
              {topProductos.map(([nombre,cant], i)=> (
                <div key={nombre} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-[#F8FAFC] border border-[#E5E7EB] flex items-center justify-center text-xs font-semibold text-[#475569]">{i+1}</span>
                  <span className="flex-1 text-sm text-[#0F172A] truncate">{nombre}</span>
                  <span className="text-sm font-semibold text-[#0F172A]">{cant}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Actividad reciente */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
          <h2 className="text-sm font-semibold text-[#0F172A] mb-4">Actividad reciente</h2>
          {actividad.length===0 ? <p className="text-sm text-[#94A3B8]">Sin actividad</p> : (
            <div className="space-y-3">
              {actividad.map((a,i)=> (
                <div key={i} className="flex gap-3">
                  <span className="text-xs font-medium text-[#94A3B8] w-12 shrink-0">{a.time}</span>
                  <span className="text-sm text-[#334155] leading-5">{a.text}</span>
                </div>
              ))}
            </div>
          )}
          <Link to="/admin-actividad" className="mt-4 inline-flex text-xs font-medium text-[#667A22] hover:underline">Ver actividad →</Link>
        </div>
        {/* Requiere atención */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
          <h2 className="text-sm font-semibold text-[#0F172A] mb-4">Requiere atención</h2>
          {alertas.length===0 ? <p className="text-sm text-[#10B981]">✓ Todo al día</p> : (
            <div className="space-y-2">
              {alertas.map((a,i)=> (
                <Link key={i} to={a.to} className={`flex items-center gap-3 p-3 rounded-xl border text-sm ${a.tone==='amber' ? 'bg-[#FFFBEB] border-[#FDE68A] text-[#92400E]' : a.tone==='red' ? 'bg-[#FEF2F2] border-[#FECACA] text-[#991B1B]' : 'bg-[#EFF6FF] border-[#BFDBFE] text-[#1E40AF]'}`}>
                  <a.icon size={14} className="shrink-0" />
                  <span className="flex-1 leading-5">{a.text}</span>
                  <span className="text-xs font-semibold">Ver →</span>
                </Link>
              ))}
            </div>
          )}
          {/* Acciones rápidas */}
          <div className="mt-5 pt-5 border-t border-[#F1F5F9]">
            <p className="text-[11px] font-semibold tracking-widest uppercase text-[#94A3B8] mb-3">Acciones rápidas</p>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={()=> navigate('/admin-ordenes')} className="flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-[#0F172A] text-white text-xs font-semibold hover:bg-[#1E293B]"><FaPlus size={10}/> Nuevo pedido</button>
              <button onClick={()=> navigate('/admin-reservas')} className="flex items-center justify-center gap-1.5 py-2.5 rounded-lg border border-[#E5E7EB] bg-white text-xs font-semibold text-[#334155] hover:bg-[#F8FAFC]"><FaCalendarAlt size={10}/> Nueva reserva</button>
              <button onClick={()=> navigate('/admin-productos')} className="flex items-center justify-center gap-1.5 py-2.5 rounded-lg border border-[#E5E7EB] bg-white text-xs font-semibold text-[#334155] hover:bg-[#F8FAFC]"><FaUtensils size={10}/> Nuevo producto</button>
              <button onClick={()=> navigate('/admin-gastos')} className="flex items-center justify-center gap-1.5 py-2.5 rounded-lg border border-[#E5E7EB] bg-white text-xs font-semibold text-[#334155] hover:bg-[#F8FAFC]"><FaClock size={10}/> Registrar gasto</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
