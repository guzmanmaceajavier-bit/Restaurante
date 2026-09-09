import { useEffect, useState, useMemo } from 'react'
import { storage } from '../lib/storage'
import { toast } from 'sonner'
import { FaClock, FaCheck, FaArrowRight, FaExclamationTriangle, FaFire } from 'react-icons/fa'
import EmptyState from '../components/core/EmptyState'
import type { Order } from '../types/order'
import { PageHeader } from '../components/admin/PageHeader'

const cfg: Record<string, { label: string; dot: string; border: string; next: string | null; headerBg: string }> = {
  recibido: { label: 'Pendientes', dot: 'bg-[#3B82F6]', border: 'border-[#BFDBFE]', next: 'preparando', headerBg: 'bg-[#EFF6FF]' },
  preparando: { label: 'En preparación', dot: 'bg-[#F59E0B]', border: 'border-[#FDE68A]', next: 'listo', headerBg: 'bg-[#FFFBEB]' },
  listo: { label: 'Listos', dot: 'bg-[#10B981]', border: 'border-[#A7F3D0]', next: 'entregado', headerBg: 'bg-[#ECFDF5]' },
}

export default function AdminCocina() {
  const [ordenes, setOrdenes] = useState<Order[]>([])
  const [now, setNow] = useState(Date.now())
  useEffect(()=> {
    const load=()=> setOrdenes(storage.getOrdenes<Order>())
    load(); const id=setInterval(load, 5000); const tick=setInterval(()=> setNow(Date.now()), 30000)
    return ()=> {clearInterval(id); clearInterval(tick)}
  }, [])
  const cocina = useMemo(()=> ordenes.filter(o=> ['recibido','preparando','listo'].includes(o.estado)), [ordenes])
  const byEstado = (e:string)=> cocina.filter(o=> o.estado===e)
  const avanzar=(id:string)=>{
    const o=ordenes.find(x=> x.id===id); if(!o) return
    const next=cfg[o.estado]?.next; if(!next) return
    const u=ordenes.map(x=> x.id===id ? {...x, estado: next}:x); setOrdenes(u as any); storage.setOrdenes(u as any); toast.success(`Pedido → ${cfg[next]?.label}`)
  }

  const Card=({o}:{o:Order})=>{
    const c=cfg[o.estado]||cfg.recibido
    const mins=o.createdAt ? Math.max(0, Math.floor((now - new Date(o.createdAt).getTime())/60000)) : 0
    const urgent = mins>30
    const warn = mins>15 && mins<=30
    return (
      <div className={`bg-white rounded-xl border ${urgent ? 'border-[#FECACA]' : c.border} p-4 hover:shadow-card-hover transition-shadow`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono font-semibold text-[#0F172A]">#{o.id?.slice(0,8).toUpperCase()}</span>
          <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-1 rounded-full border ${urgent ? 'bg-[#FEF2F2] text-[#991B1B] border-[#FECACA]' : warn ? 'bg-[#FFFBEB] text-[#92400E] border-[#FDE68A]' : 'bg-[#F8FAFC] text-[#475569] border-[#E5E7EB]'}`}>
            <FaClock size={10}/>{mins} min
          </span>
        </div>
        <p className="text-sm font-semibold text-[#0F172A] leading-4">{o.fullName||(o as any).clientName||'Cliente'} <span className="text-xs font-normal text-[#64748B]">· {(o as any).tipoServicio||'—'}</span></p>
        <div className="mt-3 space-y-1.5">
          {o.items?.map((it:any,i:number)=> (
            <div key={i} className="flex justify-between text-sm leading-5"><span className="text-[#334155] truncate pr-2">{it.quantity}× {it.nombre}</span><span className="text-xs text-[#64748B] shrink-0">{(it as any).notas ? '• nota' : ''}</span></div>
          ))}
        </div>
        {(o as any).nota && <div className="mt-3 flex gap-2 p-2.5 rounded-lg bg-[#FFFBEB] border border-[#FDE68A]"><FaExclamationTriangle size={12} className="text-[#D97706] mt-0.5 shrink-0"/><p className="text-xs text-[#92400E] leading-4">{(o as any).nota}</p></div>}
        {mins>30 && <div className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-[#DC2626]"><FaFire size={10}/> Prioridad — retrasado</div>}
        {c.next && (
          <button onClick={()=> avanzar(o.id)} className="mt-3 w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[#0F172A] text-white text-xs font-semibold hover:bg-[#1E293B] transition-colors">
            {c.next==='preparando' ? 'Preparar' : c.next==='listo' ? 'Marcar listo' : 'Entregar'} <FaArrowRight size={10}/>
          </button>
        )}
      </div>
    )
  }

  const Column=({estado}:{estado:string})=>{
    const c=cfg[estado]; const list=byEstado(estado)
    return (
      <div className="flex-1 min-w-[320px] max-w-[420px]">
        <div className={`sticky top-0 z-10 flex items-center gap-2 px-3 py-2.5 rounded-xl border ${c.border} ${c.headerBg} mb-3`}>
          <span className={`w-2 h-2 rounded-full ${c.dot}`} />
          <h2 className="text-[13px] font-semibold text-[#0F172A]">{c.label}</h2>
          <span className="ml-auto min-w-[22px] h-6 px-1.5 rounded-full bg-white border border-[#E5E7EB] flex items-center justify-center text-xs font-semibold text-[#334155]">{list.length}</span>
        </div>
        <div className="space-y-3">
          {list.length===0 ? <div className="bg-white rounded-xl border border-dashed border-[#E5E7EB] p-6 text-center"><p className="text-sm text-[#94A3B8]">Sin pedidos</p></div> : list.map(o=> <Card key={o.id} o={o} />)}
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="Cocina — KDS" description={`${cocina.length} comandas activas · Tiempo transcurrido en cada tarjeta · Avanza con un toque`} />
      {cocina.length===0 ? <EmptyState icon={<FaCheck size={20}/>} title="Cocina al día" description="No hay comandas pendientes. Los pedidos en recibido, preparando y listo aparecen aquí." /> : (
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 lg:mx-0 lg:px-0">
          <Column estado="recibido" />
          <Column estado="preparando" />
          <Column estado="listo" />
        </div>
      )}
      <div className="mt-4 flex gap-2 text-xs text-[#64748B]">
        <span className="inline-flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#F8FAFC] border border-[#E5E7EB]"/>≤15 min normal</span>
        <span className="inline-flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#FFFBEB] border border-[#FDE68A]"/>15-30 min</span>
        <span className="inline-flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#FEF2F2] border border-[#FECACA]"/>+30 min retrasado</span>
      </div>
    </div>
  )
}
