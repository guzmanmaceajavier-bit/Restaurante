import { useEffect, useState, useMemo } from 'react'
import { storage } from '../lib/storage'
import { toast } from 'sonner'
import { FaSearch, FaWhatsapp, FaPrint, FaFilter, FaTimes } from 'react-icons/fa'
import EmptyState from '../components/core/EmptyState'
import type { Order } from '../types/order'
import { Pagination } from '../components/admin/Pagination'
import { ExportButton } from '../components/admin/ExportButton'
import { imprimirPedido } from '../components/admin/PrintTicket'
import { PageHeader } from '../components/admin/PageHeader'
import { DetailDrawer, DrawerSection, DrawerField } from '../components/admin/DetailDrawer'
import { ActionMenu } from '../components/admin/ActionMenu'

const ITEMS_PER_PAGE = 10
const estadoBadge: Record<string, { bg: string; text: string; border: string; label: string }> = {
  recibido: { bg: 'bg-[#EFF6FF]', text: 'text-[#1D4ED8]', border: 'border-[#BFDBFE]', label: 'Recibido' },
  preparando: { bg: 'bg-[#FFFBEB]', text: 'text-[#92400E]', border: 'border-[#FDE68A]', label: 'Preparando' },
  listo: { bg: 'bg-[#ECFDF5]', text: 'text-[#065F46]', border: 'border-[#A7F3D0]', label: 'Listo' },
  entregado: { bg: 'bg-[#F8FAFC]', text: 'text-[#475569]', border: 'border-[#E5E7EB]', label: 'Entregado' },
  cancelado: { bg: 'bg-[#FEF2F2]', text: 'text-[#991B1B]', border: 'border-[#FECACA]', label: 'Cancelado' },
}

export default function AdminOrdenes() {
  const [ordenes, setOrdenes] = useState<Order[]>([])
  const [selected, setSelected] = useState<Order | null>(null)
  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')
  const [filtroMetodo, setFiltroMetodo] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('')
  const [filtroFecha, setFiltroFecha] = useState('')
  const [showMore, setShowMore] = useState(false)
  const [page, setPage] = useState(1)

  useEffect(() => {
    const load = () => setOrdenes(storage.getOrdenes<Order>())
    load(); const id=setInterval(load,5000); const onStorage=()=>load()
    window.addEventListener('storage', onStorage); return ()=>{clearInterval(id); window.removeEventListener('storage', onStorage)}
  }, [])

  const ordenesFiltradas = useMemo(()=> ordenes.filter(o=>{
    if(filtroEstado && o.estado!==filtroEstado) return false
    if(filtroMetodo && (o as any).metodoPago!==filtroMetodo) return false
    if(filtroTipo && (o as any).tipoServicio!==filtroTipo) return false
    if(filtroFecha && !o.createdAt?.startsWith(filtroFecha)) return false
    if(busqueda){ const b=busqueda.toLowerCase(); return (o.id?.toLowerCase().includes(b)) || (o.fullName?.toLowerCase().includes(b)) || (o.phone?.includes(b)) }
    return true
  }).sort((a,b)=> new Date(b.createdAt||0).getTime()-new Date(a.createdAt||0).getTime()), [ordenes,busqueda,filtroEstado,filtroMetodo,filtroTipo,filtroFecha])

  const totalPages=Math.ceil(ordenesFiltradas.length/ITEMS_PER_PAGE)
  const pagina=ordenesFiltradas.slice((page-1)*ITEMS_PER_PAGE, page*ITEMS_PER_PAGE)
  const hasActiveFilters = !!(filtroEstado||filtroMetodo||filtroTipo||filtroFecha||busqueda)
  const cambiarEstado=(id:string, s:string)=>{ const u=ordenes.map(o=> o.id===id ? {...o, estado:s}:o); setOrdenes(u); storage.setOrdenes(u); if(selected?.id===id) setSelected({...selected, estado:s} as Order); toast.success(`Estado → ${estadoBadge[s]?.label||s}`)}

  return (
    <div>
      <PageHeader
        title="Pedidos"
        description={`${ordenesFiltradas.length} pedidos · Operación en tiempo real · Recepción → Cocina → Entrega`}
        actions={
          <>
            <ExportButton data={ordenesFiltradas} filename="pedidos" columns={[{key:'id',label:'ID'},{key:'fullName',label:'Cliente'},{key:'phone',label:'Teléfono'},{key:'total',label:'Total'},{key:'estado',label:'Estado'},{key:'createdAt',label:'Fecha'}]} />
            {hasActiveFilters && <button onClick={()=>{setBusqueda(''); setFiltroEstado(''); setFiltroMetodo(''); setFiltroTipo(''); setFiltroFecha(''); setPage(1)}} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#E5E7EB] bg-white text-sm text-[#475569] hover:bg-[#F8FAFC]"><FaTimes size={11}/> Limpiar</button>}
          </>
        }
      />

      {/* Filtros: Buscar / Estado / Fecha + Más filtros */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-3 mb-4">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={12}/>
            <input value={busqueda} onChange={e=>{setBusqueda(e.target.value); setPage(1)}} placeholder="Buscar por ID, cliente o teléfono…" className="w-full pl-9 pr-3 py-2 rounded-lg border border-[#E5E7EB] bg-[#F8FAFC] text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#94A3B8] focus:bg-white" />
          </div>
          <select value={filtroEstado} onChange={e=>{setFiltroEstado(e.target.value); setPage(1)}} className="px-3 py-2 rounded-lg border border-[#E5E7EB] bg-white text-sm text-[#334155]">
            <option value="">Estado</option>{Object.entries(estadoBadge).map(([k,v])=> <option key={k} value={k}>{v.label}</option>)}
          </select>
          <input type="date" value={filtroFecha} onChange={e=>{setFiltroFecha(e.target.value); setPage(1)}} className="px-3 py-2 rounded-lg border border-[#E5E7EB] bg-white text-sm text-[#334155]" />
          <button onClick={()=> setShowMore(v=>!v)} className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium ${showMore ? 'bg-[#F1F5F9] border-[#CBD5E1] text-[#0F172A]' : 'bg-white border-[#E5E7EB] text-[#475569] hover:bg-[#F8FAFC]'}`}>
            <FaFilter size={11}/> Más filtros
          </button>
        </div>
        {showMore && (
          <div className="grid sm:grid-cols-3 gap-3 mt-3 pt-3 border-t border-[#F1F5F9]">
            <select value={filtroMetodo} onChange={e=>{setFiltroMetodo(e.target.value); setPage(1)}} className="px-3 py-2 rounded-lg border border-[#E5E7EB] bg-white text-sm"><option value="">Método de pago</option><option>Efectivo</option><option>Nequi</option><option>Daviplata</option><option>Bancolombia</option></select>
            <select value={filtroTipo} onChange={e=>{setFiltroTipo(e.target.value); setPage(1)}} className="px-3 py-2 rounded-lg border border-[#E5E7EB] bg-white text-sm"><option value="">Tipo</option><option value="delivery">Domicilio</option><option value="pickup">Recoger</option><option value="eatHere">Mesa</option></select>
            <div className="flex items-center gap-2 text-xs text-[#64748B]">Filtros avanzados · {hasActiveFilters ? 'activos' : 'ninguno'}</div>
          </div>
        )}
      </div>

      {(() => { const nuevos=ordenes.filter(o=> o.estado==='recibido'); if(!nuevos.length) return null; return (
        <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-xl p-4 mb-4">
          <p className="text-sm font-semibold text-[#92400E] flex items-center gap-2"><span className="w-2 h-2 bg-[#F59E0B] rounded-full animate-pulse"/>{nuevos.length} nuevo{nuevos.length!==1?'s':''} — requiere atención</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
            {nuevos.slice(0,6).map(o=> (
              <div key={o.id} className="bg-white rounded-xl border border-[#FDE68A] p-3 flex items-center justify-between">
                <div><p className="text-sm font-medium text-[#0F172A]">{o.fullName||(o as any).clientName||'Cliente'}</p><p className="text-xs text-[#64748B]">{o.phone} · {o.items?.length||0} items</p></div>
                <button onClick={()=> cambiarEstado(o.id,'preparando')} className="px-3 py-1.5 bg-[#0F172A] text-white rounded-lg text-xs font-semibold hover:bg-[#1E293B]">Aceptar</button>
              </div>
            ))}
          </div>
        </div>
      )})()}

      {pagina.length===0 ? <EmptyState icon={<FaSearch size={20}/>} title="No hay pedidos" description="Ajusta los filtros o espera nuevos pedidos. Los datos provienen de localStorage en tiempo real." /> : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="sticky top-0 z-10 bg-[#F8FAFC] border-b border-[#E5E7EB]">
                  <tr>
                    <th className="px-3 py-2.5 text-left text-[11px] font-semibold tracking-widest uppercase text-[#64748B]">Pedido</th>
                    <th className="px-3 py-2.5 text-left text-[11px] font-semibold tracking-widest uppercase text-[#64748B]">Cliente</th>
                    <th className="px-3 py-2.5 text-left text-[11px] font-semibold tracking-widest uppercase text-[#64748B]">Estado</th>
                    <th className="px-3 py-2.5 text-right text-[11px] font-semibold tracking-widest uppercase text-[#64748B]">Total</th>
                    <th className="px-3 py-2.5 text-left text-[11px] font-semibold tracking-widest uppercase text-[#64748B]">Fecha</th>
                    <th className="px-3 py-2.5 text-right text-[11px] font-semibold tracking-widest uppercase text-[#64748B]">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {pagina.map(o=>{
                    const b=estadoBadge[o.estado]||{bg:'bg-[#F8FAFC]', text:'text-[#64748B]', border:'border-[#E5E7EB]', label:o.estado}
                    return (
                      <tr key={o.id} className="border-t border-[#F1F5F9] hover:bg-[#F8FAFC] transition-colors">
                        <td className="px-3 py-3"><button onClick={()=> setSelected(o)} className="text-xs font-mono font-medium text-[#0F172A] hover:text-[#667A22]">#{o.id?.slice(0,8).toUpperCase()}</button></td>
                        <td className="px-3 py-3"><p className="text-sm font-medium text-[#0F172A] leading-4">{o.fullName||(o as any).clientName||'Cliente'}</p><p className="text-xs text-[#64748B]">{o.phone}</p></td>
                        <td className="px-3 py-3"><span className={`inline-flex px-2 py-1 rounded-full text-[11px] font-semibold border ${b.bg} ${b.text} ${b.border}`}>{b.label}</span></td>
                        <td className="px-3 py-3 text-right text-sm font-semibold text-[#0F172A]" data-numeric>${Number(o.total).toLocaleString('es-CO')}</td>
                        <td className="px-3 py-3 text-xs text-[#64748B]">{o.createdAt ? new Date(o.createdAt).toLocaleString('es-CO',{day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit'}) : '—'}</td>
                        <td className="px-3 py-3">
                          <div className="flex justify-end">
                            <ActionMenu items={[
                              {label:'Ver detalle', onClick:()=> setSelected(o)},
                              {label:'Imprimir', icon: FaPrint, onClick:()=> imprimirPedido(o)},
                              {label:'WhatsApp', icon: FaWhatsapp, onClick:()=> window.open(`https://wa.me/${(o.phone||'').replace(/[^0-9]/g,'')}?text=${encodeURIComponent(`Hola ${o.fullName||''}, sobre tu pedido #${o.id}: `)}`,'_blank')},
                              {label:'Marcar preparando', onClick:()=> cambiarEstado(o.id,'preparando')},
                              {label:'Marcar listo', onClick:()=> cambiarEstado(o.id,'listo')},
                              {label:'Marcar entregado', onClick:()=> cambiarEstado(o.id,'entregado')},
                              {label:'Cancelar', danger:true, onClick:()=> cambiarEstado(o.id,'cancelado')},
                            ]} />
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {pagina.map(o=>{
              const b=estadoBadge[o.estado]||{bg:'bg-[#F8FAFC]', text:'text-[#64748B]', border:'border-[#E5E7EB]', label:o.estado}
              return (
                <div key={o.id} className="bg-white rounded-xl border border-[#E5E7EB] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div><p className="text-sm font-semibold text-[#0F172A]">#{o.id?.slice(0,8).toUpperCase()}</p><p className="text-xs text-[#64748B]">{o.fullName||'Cliente'} · {o.phone}</p></div>
                    <span className={`px-2 py-1 rounded-full text-[11px] font-semibold border ${b.bg} ${b.text} ${b.border}`}>{b.label}</span>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-sm font-semibold" data-numeric>${Number(o.total).toLocaleString('es-CO')}</span>
                    <button onClick={()=> setSelected(o)} className="text-xs font-medium text-[#667A22]">Ver detalle →</button>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="mt-4"><Pagination page={page} totalPages={totalPages} onPageChange={setPage} /></div>
        </>
      )}

      <DetailDrawer open={!!selected} onClose={()=> setSelected(null)} title={selected ? `Pedido #${selected.id?.slice(0,8).toUpperCase()}` : ''} subtitle={selected?.createdAt ? new Date(selected.createdAt).toLocaleString('es-CO') : undefined}
        actions={selected ? (<>
          <button onClick={()=> selected && imprimirPedido(selected)} className="px-4 py-2 rounded-lg border border-[#E5E7EB] bg-white text-sm font-medium text-[#334155] hover:bg-[#F8FAFC]">Imprimir</button>
          <a href={`https://wa.me/${(selected.phone||'').replace(/[^0-9]/g,'')}?text=${encodeURIComponent(`Hola ${selected.fullName||''}, sobre tu pedido #${selected.id}: `)}`} target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-lg bg-[#10B981] text-white text-sm font-medium hover:bg-[#059669]">WhatsApp</a>
        </>) : undefined}>
        {selected && (
          <>
            <DrawerSection title="Cliente">
              <DrawerField label="Nombre" value={selected.fullName||(selected as any).clientName||'—'} />
              <DrawerField label="Teléfono" value={selected.phone||'—'} />
              <DrawerField label="Tipo" value={(selected as any).tipoServicio||'—'} />
              <DrawerField label="Pago" value={(selected as any).metodoPago||'—'} />
            </DrawerSection>
            <DrawerSection title="Productos">
              <div className="space-y-2">
                {selected.items?.map((it:any,i:number)=> (
                  <div key={i} className="flex justify-between gap-3 py-2 border-b border-[#F1F5F9] last:border-0">
                    <span className="text-sm text-[#0F172A]"><span className="inline-flex w-6 h-6 rounded-md bg-[#F1F5F9] items-center justify-center text-xs font-semibold mr-2">{it.quantity}</span>{it.nombre}</span>
                    <span className="text-sm font-medium" data-numeric>${Number(it.precio*it.quantity).toLocaleString('es-CO')}</span>
                  </div>
                ))}
                <div className="flex justify-between pt-2"><span className="text-sm font-semibold text-[#0F172A]">Total</span><span className="text-sm font-semibold text-[#0F172A]" data-numeric>${Number(selected.total).toLocaleString('es-CO')}</span></div>
              </div>
            </DrawerSection>
            <DrawerSection title="Estado">
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(estadoBadge).map(([k,v])=> (
                  <button key={k} onClick={()=> cambiarEstado(selected.id,k)} className={`py-2 rounded-lg text-xs font-semibold border ${selected.estado===k ? `${v.bg} ${v.text} ${v.border}` : 'bg-white border-[#E5E7EB] text-[#475569] hover:bg-[#F8FAFC]'}`}>{v.label}</button>
                ))}
              </div>
            </DrawerSection>
          </>
        )}
      </DetailDrawer>
    </div>
  )
}
