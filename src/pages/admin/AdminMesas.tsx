import { useState, useMemo, useEffect } from 'react'
import { toast } from 'sonner'
import { FaPlus, FaThLarge, FaMapMarkerAlt } from 'react-icons/fa'
import EmptyState from '../../components/feedback/EmptyState'
import ConfirmModal from '../../components/feedback/ConfirmModal'
import { ExportButton } from '../../components/admin/ExportButton'
import { PageHeader } from '../../components/admin/PageHeader'
import { DetailDrawer, DrawerSection, DrawerField } from '../../components/admin/DetailDrawer'
import { ActionMenu } from '../../components/admin/ActionMenu'

interface Mesa { id:string; numero:number; ubicacion:string; estado:string; occupiedSince?: string }
const initial: Mesa[] = [
  {id:'m1',numero:1,ubicacion:'Interior',estado:'disponible'},
  {id:'m2',numero:2,ubicacion:'Interior',estado:'disponible'},
  {id:'m3',numero:3,ubicacion:'Interior',estado:'ocupada'},
  {id:'m4',numero:4,ubicacion:'Terraza',estado:'disponible'},
  {id:'m5',numero:5,ubicacion:'Terraza',estado:'reservada'},
  {id:'m6',numero:6,ubicacion:'Barra',estado:'disponible'},
  {id:'m7',numero:7,ubicacion:'Zona Privada',estado:'disponible'},
  {id:'m8',numero:8,ubicacion:'Interior',estado:'mantenimiento'},
]
const estadoCfg: Record<string, {label:string, bg:string, border:string, text:string, dot:string}> = {
  disponible: {label:'Libre', bg:'bg-white', border:'border-[#E5E7EB]', text:'text-[#475569]', dot:'bg-[#10B981]'},
  ocupada: {label:'Ocupada', bg:'bg-[#FEF2F2]', border:'border-[#FECACA]', text:'text-[#991B1B]', dot:'bg-[#EF4444]'},
  reservada: {label:'Reservada', bg:'bg-[#FFFBEB]', border:'border-[#FDE68A]', text:'text-[#92400E]', dot:'bg-[#F59E0B]'},
  mantenimiento: {label:'Limpieza', bg:'bg-[#F8FAFC]', border:'border-[#E5E7EB]', text:'text-[#64748B]', dot:'bg-[#94A3B8]'},
}
const ubicacionesOptions=['Interior','Terraza','Barra','Zona Privada','Exterior']
const estadosOptions=['disponible','ocupada','reservada','mantenimiento'] as const

export default function AdminMesas(){
  const [mesas,setMesas]=useState<Mesa[]>(()=>{ try{ const s=JSON.parse(localStorage.getItem('mesas')||'[]'); return s.length? s: initial } catch{ return initial}})
  const [nowTick,setNowTick]=useState(Date.now())
  useEffect(()=>{ const id=setInterval(()=> setNowTick(Date.now()), 30000); return ()=> clearInterval(id)}, [])
  const [filtro,setFiltro]=useState('')
  const [selected,setSelected]=useState<Mesa|null>(null)
  const [showForm,setShowForm]=useState(false)
  const [editing,setEditing]=useState<Mesa|null>(null)
  const [confirmDelete,setConfirmDelete]=useState<string|null>(null)
  const [formNumero,setFormNumero]=useState('')
  const [formUbicacion,setFormUbicacion]=useState('Interior')
  const [formEstado,setFormEstado]=useState('disponible')
  const [customUbic,setCustomUbic]=useState('')
  const save=(u:Mesa[])=>{ setMesas(u); localStorage.setItem('mesas', JSON.stringify(u))}
  const stats=useMemo(()=> ({ total: mesas.length, libres: mesas.filter(m=>m.estado==='disponible').length, ocupadas: mesas.filter(m=>m.estado==='ocupada').length, reservadas: mesas.filter(m=>m.estado==='reservada').length }), [mesas])
  const zonas=useMemo(()=> Array.from(new Set(mesas.map(m=> m.ubicacion))), [mesas])
  const filtradas=useMemo(()=> mesas.filter(m=> !filtro || m.ubicacion===filtro), [mesas,filtro])
  const grouped=useMemo(()=>{ const g=new Map<string,Mesa[]>(); filtradas.forEach(m=>{ if(!g.has(m.ubicacion)) g.set(m.ubicacion,[]); g.get(m.ubicacion)!.push(m)}); return Array.from(g.entries())}, [filtradas])
  const reset=()=>{ setFormNumero(''); setFormUbicacion('Interior'); setFormEstado('disponible'); setCustomUbic(''); setEditing(null)}
  const openCreate=()=>{ reset(); setShowForm(true)}
  const openEdit=(m:Mesa)=>{ setEditing(m); setFormNumero(String(m.numero)); setFormUbicacion(ubicacionesOptions.includes(m.ubicacion)? m.ubicacion: m.ubicacion); setFormEstado(m.estado); setCustomUbic(ubicacionesOptions.includes(m.ubicacion)? '': m.ubicacion); setShowForm(true)}
  const submit=()=>{
    const num=parseInt(formNumero); if(isNaN(num)||num<=0){ toast.error('Número válido'); return}
    if(mesas.some(m=> m.numero===num && m.id!==editing?.id)){ toast.error('Número ya existe'); return}
    const ubic=customUbic.trim()||formUbicacion; if(!ubic){ toast.error('Ubicación requerida'); return}
    if(editing){ save(mesas.map(m=> m.id===editing.id ? {...m, numero:num, ubicacion:ubic, estado:formEstado, occupiedSince: formEstado==='ocupada' ? (m.occupiedSince || new Date().toISOString()) : undefined}:m)); toast.success('Mesa actualizada')}
    else { save([...mesas, {id:'mesa_'+Date.now(), numero:num, ubicacion:ubic, estado:formEstado, occupiedSince: formEstado==='ocupada' ? new Date().toISOString() : undefined}]); toast.success('Mesa creada')}
    setShowForm(false); reset()
  }
  const cambiarEstado=(id:string, estado:string)=>{ save(mesas.map(m=> m.id===id ? {...m, estado, occupiedSince: estado==='ocupada' ? new Date().toISOString() : undefined}:m)); toast.success(`Mesa → ${estadoCfg[estado]?.label}`); setSelected(null)}
  return (
    <div>
      <PageHeader title="Mesas — Mapa del salón" description={`${stats.total} mesas · ${stats.libres} libres · ${stats.ocupadas} ocupadas · ${stats.reservadas} reservadas · Toca una mesa para gestionar`} actions={<><ExportButton data={filtradas} filename="mesas" columns={[{key:'numero',label:'Número'},{key:'ubicacion',label:'Ubicación'},{key:'estado',label:'Estado'}]} /><button onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0F172A] text-white text-sm font-medium hover:bg-[#1E293B]"><FaPlus size={11}/> Nueva mesa</button></>} />
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
        <button onClick={()=> setFiltro('')} className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border ${!filtro ? 'bg-[#0F172A] text-white border-[#0F172A]' : 'bg-white border-[#E5E7EB] text-[#475569] hover:bg-[#F8FAFC]'}`}>Todas ({mesas.length})</button>
        {zonas.map(z=> <button key={z} onClick={()=> setFiltro(z)} className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border ${filtro===z ? 'bg-[#0F172A] text-white border-[#0F172A]' : 'bg-white border-[#E5E7EB] text-[#475569] hover:bg-[#F8FAFC]'}`}>{z} ({mesas.filter(m=> m.ubicacion===z).length})</button>)}
      </div>
      {filtradas.length===0 ? <EmptyState icon={<FaThLarge size={20}/>} title="Sin mesas" description="Crea mesas para construir el mapa del salón" action={{label:'Nueva mesa', onClick: openCreate}} /> : (
        <div className="space-y-6">
          {grouped.map(([zona, list])=> (
            <div key={zona} className="bg-white rounded-xl border border-[#E5E7EB] p-4">
              <div className="flex items-center gap-2 mb-4">
                <FaMapMarkerAlt size={12} className="text-[#94A3B8]"/><h3 className="text-sm font-semibold text-[#0F172A]">{zona}</h3><span className="text-xs px-2 py-0.5 rounded-full bg-[#F1F5F9] border border-[#E5E7EB] text-[#475569]">{list.length}</span>
                <div className="ml-auto hidden sm:flex gap-2 text-[11px] text-[#64748B]">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#10B981]"/> Libre</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#EF4444]"/> Ocupada</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#F59E0B]"/> Reservada</span>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                {list.map(m=>{
                  const c=estadoCfg[m.estado]||estadoCfg.disponible
                  return (
                    <div key={m.id} role="button" tabIndex={0} onClick={()=> setSelected(m)} onKeyDown={e=> e.key==='Enter' && setSelected(m)} className={`relative text-left rounded-xl border-2 p-4 hover:shadow-card-hover transition-all cursor-pointer ${c.bg} ${c.border}`}>
                      <div className="absolute top-2 right-2" onClick={e=> e.stopPropagation()}><ActionMenu items={[{label:'Cambiar estado', onClick:()=> setSelected(m)}, {label:'Editar', onClick:()=> openEdit(m)}, {label:'Eliminar', danger:true, onClick:()=> setConfirmDelete(m.id)}]} /></div>
                      <div className="flex items-center gap-1.5 mb-2"><span className={`w-2 h-2 rounded-full ${c.dot} ${m.estado==='ocupada' ? 'animate-pulse' : ''}`} /><span className={`text-[11px] font-semibold ${c.text}`}>{c.label}</span></div>
                      <div className="w-12 h-12 rounded-xl bg-white border border-[#E5E7EB] flex items-center justify-center mx-auto mb-2"><FaThLarge size={18} className="text-[#94A3B8]"/></div>
                      <p className="text-center text-lg font-semibold text-[#0F172A] tracking-tight">Mesa {m.numero}</p>
                      <p className="text-center text-xs text-[#64748B]">{m.ubicacion}</p>
                      {m.estado==='ocupada' && m.occupiedSince && <p className="text-center text-[11px] font-medium text-[#991B1B] mt-1">⏱ {Math.max(0, Math.floor((nowTick - new Date(m.occupiedSince).getTime())/60000))} min ocupada</p>}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={()=> {setShowForm(false); reset()}}>
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl" onClick={e=> e.stopPropagation()}>
            <div className="p-5 border-b border-[#E5E7EB] flex items-center justify-between"><h3 className="font-semibold text-[#0F172A]">{editing ? 'Editar mesa' : 'Nueva mesa'}</h3><button onClick={()=> {setShowForm(false); reset()}} className="w-8 h-8 rounded-lg hover:bg-[#F1F5F9] flex items-center justify-center">✕</button></div>
            <div className="p-5 space-y-4">
              <div><label className="block text-xs font-medium text-[#334155] mb-1">Número *</label><input type="number" value={formNumero} onChange={e=> setFormNumero(e.target.value)} placeholder="Ej: 12" className="w-full px-3 py-2 rounded-lg border border-[#E5E7EB] text-sm" /></div>
              <div><label className="block text-xs font-medium text-[#334155] mb-1">Ubicación *</label>
                <select value={customUbic? '__custom': formUbicacion} onChange={e=> { if(e.target.value==='__custom'){ setCustomUbic(formUbicacion); setFormUbicacion('')} else {setFormUbicacion(e.target.value); setCustomUbic('')}}} className="w-full px-3 py-2 rounded-lg border border-[#E5E7EB] text-sm mb-2">
                  {ubicacionesOptions.map(u=> <option key={u} value={u}>{u}</option>)}<option value="__custom">Otra…</option>
                </select>
                {(customUbic || !ubicacionesOptions.includes(formUbicacion)) && <input value={customUbic} onChange={e=> setCustomUbic(e.target.value)} placeholder="Escribe ubicación…" className="w-full px-3 py-2 rounded-lg border border-[#E5E7EB] text-sm" />}
              </div>
              <div><label className="block text-xs font-medium text-[#334155] mb-1">Estado</label><div className="grid grid-cols-2 gap-2">{estadosOptions.map(est=>{ const c=estadoCfg[est]; return <button key={est} onClick={()=> setFormEstado(est)} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border ${formEstado===est ? `${c.bg} ${c.text} ${c.border}` : 'bg-white border-[#E5E7EB] text-[#475569] hover:bg-[#F8FAFC]'}`}><span className={`w-2 h-2 rounded-full ${c.dot}`}/>{c.label}</button>})}</div></div>
              <div className="flex gap-2 pt-2"><button onClick={()=> {setShowForm(false); reset()}} className="flex-1 py-2.5 rounded-lg border border-[#E5E7EB] text-sm font-medium">Cancelar</button><button onClick={submit} className="flex-1 py-2.5 rounded-lg bg-[#0F172A] text-white text-sm font-semibold">{editing?'Guardar':'Crear'}</button></div>
            </div>
          </div>
        </div>
      )}

      <DetailDrawer open={!!selected} onClose={()=> setSelected(null)} title={selected ? `Mesa ${selected.numero}` : ''} subtitle={selected?.ubicacion}
        actions={selected ? (<><button onClick={()=> selected && openEdit(selected)} className="px-4 py-2 rounded-lg border border-[#E5E7EB] bg-white text-sm font-medium">Editar</button><button onClick={()=> selected && setConfirmDelete(selected.id)} className="px-4 py-2 rounded-lg bg-[#DC2626] text-white text-sm font-medium">Eliminar</button></>) : undefined}>
        {selected && <>
          <DrawerSection title="Estado">
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(estadoCfg).map(([k,v])=> (
                <button key={k} onClick={()=> cambiarEstado(selected.id, k)} className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium ${selected.estado===k ? `${v.bg} ${v.text} ${v.border}` : 'bg-white border-[#E5E7EB] text-[#475569] hover:bg-[#F8FAFC]'}`}><span className={`w-2 h-2 rounded-full ${v.dot}`}/>{v.label}</button>
              ))}
            </div>
          </DrawerSection>
          <DrawerSection title="Información">
            <DrawerField label="Número" value={`#${selected.numero}`} />
            <DrawerField label="Ubicación" value={selected.ubicacion} />
            <DrawerField label="Estado actual" value={estadoCfg[selected.estado]?.label||selected.estado} />
          </DrawerSection>
          <div className="pt-2">
            <button onClick={()=> { const estado=selected.estado==='disponible' ? 'ocupada' : 'disponible'; cambiarEstado(selected.id, estado)}} className="w-full py-2.5 rounded-lg bg-[#667A22] text-white text-sm font-semibold hover:bg-[#556619]">
              {selected.estado==='disponible' ? 'Ocupar mesa' : selected.estado==='ocupada' ? 'Liberar mesa' : 'Marcar libre'}
            </button>
            <p className="text-xs text-[#94A3B8] text-center mt-2">Flujo: abrir pedido → agregar productos → cobrar → liberar mesa</p>
          </div>
        </>}
      </DetailDrawer>

      <ConfirmModal open={!!confirmDelete} onClose={()=> setConfirmDelete(null)} onConfirm={()=> { if(confirmDelete){ save(mesas.filter(m=> m.id!==confirmDelete)); setConfirmDelete(null); toast.success('Mesa eliminada')}}} title="Eliminar mesa" message="¿Eliminar esta mesa?" confirmText="Eliminar" variant="danger" />
    </div>
  )
}
