import { useEffect, useState, useMemo } from 'react'
import { reservationService } from '../../features/reservations/reservation.service'
import { customerService } from '../../features/customers/customer.service'
import { CONFIG } from '../../lib/config'
import { toast } from 'sonner'
import { FaPlus, FaSearch, FaWhatsapp, FaCheck, FaBan, FaCalendarAlt, FaChevronLeft, FaChevronRight, FaClock } from 'react-icons/fa'
import EmptyState from '../../components/feedback/EmptyState'
import ConfirmModal from '../../components/feedback/ConfirmModal'
import { ExportButton } from '../../components/admin/ExportButton'
import { PageHeader } from '../../components/admin/PageHeader'
import { DetailDrawer, DrawerSection, DrawerField } from '../../components/admin/DetailDrawer'
import { ActionMenu } from '../../components/admin/ActionMenu'
import type { ReservaData as Reserva } from '../../features/reservations/types'

const zonaOptions = ['Interior','Terraza','Barra','Zona Privada']
const ocasionOptions = ['Cumpleaños','Aniversario','Reunión empresarial','Romántica','Sin ocasión especial']
const estadoOptions = ['Pendiente','confirmada','rechazada','Cancelada'] as const
const estadoStyle: Record<string, {bg:string, text:string, border:string}> = {
  Pendiente: {bg:'bg-[#FFFBEB]', text:'text-[#92400E]', border:'border-[#FDE68A]'},
  confirmada: {bg:'bg-[#ECFDF5]', text:'text-[#065F46]', border:'border-[#A7F3D0]'},
  rechazada: {bg:'bg-[#FEF2F2]', text:'text-[#991B1B]', border:'border-[#FECACA]'},
  Cancelada: {bg:'bg-[#F8FAFC]', text:'text-[#475569]', border:'border-[#E5E7EB]'},
}
const emptyForm: Omit<Reserva,'id'|'createdAt'> = { nombre:'', email:'', telefono:'', fecha:'', hora:'', personas:1, zona:'Interior', ocasion:'Sin ocasión especial', comentarios:'', estado:'Pendiente' }

function startOfMonth(d:Date){ return new Date(d.getFullYear(), d.getMonth(), 1) }
function daysInMonth(d:Date){ return new Date(d.getFullYear(), d.getMonth()+1,0).getDate() }

export default function AdminReservas(){
  const [reservas, setReservas]=useState<Reserva[]>([])
  const [busqueda,setBusqueda]=useState('')
  const [filtroEstado,setFiltroEstado]=useState('')
  const [cursor,setCursor]=useState(new Date())
  const [selectedDate,setSelectedDate]=useState<string | null>(null)
  const [showCreate,setShowCreate]=useState(false)
  const [showEdit,setShowEdit]=useState<Reserva|null>(null)
  const [detail,setDetail]=useState<Reserva|null>(null)
  const [confirmDelete,setConfirmDelete]=useState<string|null>(null)
  const [msgTarget,setMsgTarget]=useState<Reserva|null>(null)
  const [mensaje,setMensaje]=useState('')
  const [formCreate,setFormCreate]=useState(emptyForm)
  const [formEdit,setFormEdit]=useState(emptyForm)
  useEffect(()=> setReservas(reservationService.getAll()), [])
  const guardar=(d:Reserva[])=>{ setReservas(d); reservationService.saveAll(d)}
  const filtered=useMemo(()=> reservationService.filterReservas(reservas, { busqueda, estado: filtroEstado }), [reservas,filtroEstado,busqueda])
  const byDate=useMemo(()=>{ const m=new Map<string, Reserva[]>(); filtered.forEach(r=>{ if(!m.has(r.fecha)) m.set(r.fecha,[]); m.get(r.fecha)!.push(r) }); return m}, [filtered])
  const agendaList = useMemo(()=>{
    const key = selectedDate || new Date().toISOString().split('T')[0]
    const list = filtered.filter(r=> r.fecha===key).sort((a,b)=> a.hora.localeCompare(b.hora))
    const upcoming = selectedDate ? [] : filtered.filter(r=> r.fecha > key).sort((a,b)=> a.fecha.localeCompare(b.fecha)).slice(0,4)
    return { key, list, upcoming }
  }, [filtered, selectedDate])

  const monthStart=startOfMonth(cursor); const dim=daysInMonth(cursor); const startDow=(monthStart.getDay()+6)%7
  const cells: (number|null)[]=[]; for(let i=0;i<startDow;i++) cells.push(null); for(let d=1;d<=dim;d++) cells.push(d)
  const monthLabel=cursor.toLocaleDateString('es-CO',{month:'long', year:'numeric'})

  const crear=()=>{
    const result = reservationService.crearReserva(formCreate)
    if(!result.ok){ toast.error(result.error); return }
    setReservas(result.reservas)
    // Vincular al historial del cliente si existe (para que cliente lo vea en /mi-cuenta)
    customerService.linkReserva({ telefono: formCreate.telefono, email: formCreate.email }, result.reserva.id)
    setShowCreate(false); setFormCreate(emptyForm); toast.success('Reserva creada y vinculada al cliente si existe')
  }
  const guardarEdit=()=>{
    if(!showEdit) return
    const result = reservationService.actualizarReserva(showEdit.id, formEdit)
    if(!result.ok){ toast.error(result.error); return }
    setReservas(result.reservas); setShowEdit(null); toast.success('Reserva actualizada')
  }
  const confirmar=(id:string)=>{ const r=reservas.find(x=>x.id===id); if(!r) return; setReservas(reservationService.cambiarEstado(id, 'confirmada')); setMsgTarget(r); setMensaje(`Hola ${r.nombre}, tu reserva del ${r.fecha} a las ${r.hora} ha sido confirmada. ¡Te esperamos!`); toast.success('Confirmada')}
  const rechazar=(id:string)=>{ const r=reservas.find(x=>x.id===id); if(!r) return; setReservas(reservationService.cambiarEstado(id, 'rechazada')); setMsgTarget(r); setMensaje(`Hola ${r.nombre}, lamentamos informarte que no hay disponibilidad para el ${r.fecha} a las ${r.hora}.`); toast.message('Rechazada')}

  return (
    <div>
      <PageHeader title="Reservas — Calendario" description={`${filtered.length} reservas · Selecciona un día en el calendario para ver la agenda`}
        actions={<>
          <ExportButton data={filtered} filename="reservas" columns={[{key:'id',label:'ID'},{key:'nombre',label:'Nombre'},{key:'fecha',label:'Fecha'},{key:'hora',label:'Hora'},{key:'estado',label:'Estado'}]} />
          <button onClick={()=>{setFormCreate(emptyForm); setShowCreate(true)}} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0F172A] text-white text-sm font-medium hover:bg-[#1E293B]"><FaPlus size={11}/> Nueva reserva</button>
        </>}
      />
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1"><FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={12}/><input value={busqueda} onChange={e=> setBusqueda(e.target.value)} placeholder="Buscar por nombre, email, teléfono…" className="w-full pl-9 pr-3 py-2 rounded-lg border border-[#E5E7EB] bg-white text-sm focus:outline-none focus:border-[#94A3B8]" /></div>
        <select value={filtroEstado} onChange={e=> setFiltroEstado(e.target.value)} className="px-3 py-2 rounded-lg border border-[#E5E7EB] bg-white text-sm"><option value="">Estado</option>{estadoOptions.map(e=> <option key={e} value={e}>{e}</option>)}</select>
      </div>

      <div className="grid lg:grid-cols-[380px_1fr] gap-6">
        {/* Calendario */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-4 h-fit">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[#0F172A] capitalize">{monthLabel}</h3>
            <div className="flex gap-1">
              <button onClick={()=> setCursor(d=> new Date(d.getFullYear(), d.getMonth()-1,1))} className="w-8 h-8 rounded-lg hover:bg-[#F1F5F9] flex items-center justify-center text-[#64748B]"><FaChevronLeft size={12}/></button>
              <button onClick={()=> {setCursor(new Date()); setSelectedDate(null)}} className="px-2.5 py-1 rounded-lg border border-[#E5E7EB] text-xs font-medium text-[#334155] hover:bg-[#F8FAFC]">Hoy</button>
              <button onClick={()=> setCursor(d=> new Date(d.getFullYear(), d.getMonth()+1,1))} className="w-8 h-8 rounded-lg hover:bg-[#F1F5F9] flex items-center justify-center text-[#64748B]"><FaChevronRight size={12}/></button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1 text-[11px] font-medium text-[#94A3B8] text-center mb-1"><span>Lu</span><span>Ma</span><span>Mi</span><span>Ju</span><span>Vi</span><span>Sa</span><span>Do</span></div>
          <div className="grid grid-cols-7 gap-1">
            {cells.map((d,i)=>{
              if(d===null) return <div key={i} className="h-10" />
              const iso = `${cursor.getFullYear()}-${String(cursor.getMonth()+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`
              const list=byDate.get(iso)||[]; const isToday=iso===new Date().toISOString().split('T')[0]; const isSelected=iso===(selectedDate|| new Date().toISOString().split('T')[0])
              return (
                <button key={i} onClick={()=> setSelectedDate(iso)} className={`h-10 rounded-xl border text-sm flex flex-col items-center justify-center gap-0.5 ${isSelected ? 'bg-[#0F172A] text-white border-[#0F172A]' : isToday ? 'bg-white border-[#0F172A] text-[#0F172A]' : 'bg-white border-[#E5E7EB] text-[#0F172A] hover:bg-[#F8FAFC]'}`}>
                  <span className="text-xs font-medium leading-none">{d}</span>
                  {list.length>0 && <span className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : list.some(x=> x.estado==='Pendiente') ? 'bg-[#F59E0B]' : 'bg-[#10B981]'}`} />}
                </button>
              )
            })}
          </div>
          <div className="flex gap-3 mt-4 text-[11px] text-[#64748B]"><span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#F59E0B]"/> Pendiente</span><span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#10B981]"/> Confirmada</span></div>
        </div>

        {/* Agenda */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-[#0F172A] flex items-center gap-2"><FaCalendarAlt size={12} className="text-[#64748B]"/> Agenda — {agendaList.key}</h3>
              <span className="text-xs px-2 py-1 rounded-full bg-[#F1F5F9] border border-[#E5E7EB] text-[#475569]">{agendaList.list.length} reservas</span>
            </div>
            {agendaList.list.length===0 ? <EmptyState icon={<FaCalendarAlt size={18}/>} title="Sin reservas" description={`No hay reservas para ${agendaList.key}. Crea una o selecciona otro día.`} /> : (
              <div className="space-y-2">
                {agendaList.list.map(r=>{
                  const st=estadoStyle[r.estado||'Pendiente']||estadoStyle.Pendiente
                  return (
                    <div key={r.id} className="flex items-center gap-3 p-3 rounded-xl border border-[#E5E7EB] hover:bg-[#F8FAFC] transition-colors">
                      <span className="text-sm font-mono font-semibold text-[#0F172A] w-14 shrink-0 flex items-center gap-1"><FaClock size={10} className="text-[#94A3B8]"/>{r.hora}</span>
                      <div className="flex-1 min-w-0"><p className="text-sm font-medium text-[#0F172A] truncate">{r.nombre} · {r.personas} pers · {r.zona}</p><p className="text-xs text-[#64748B] truncate">{r.email} · {r.telefono}</p></div>
                      <span className={`hidden sm:inline-flex px-2 py-1 rounded-full text-[11px] font-semibold border ${st.bg} ${st.text} ${st.border}`}>{r.estado}</span>
                      <ActionMenu items={[
                        {label:'Ver detalle', onClick:()=> setDetail(r)},
                        {label:'Confirmar', icon:FaCheck, onClick:()=> confirmar(r.id)},
                        {label:'Rechazar', icon:FaBan, onClick:()=> rechazar(r.id)},
                        {label:'WhatsApp', icon:FaWhatsapp, onClick:()=> {setMsgTarget(r); setMensaje(`Hola ${r.nombre}, sobre tu reserva #${r.id.slice(0,8)}:`)}},
                        {label:'Eliminar', danger:true, onClick:()=> setConfirmDelete(r.id)},
                      ]} />
                    </div>
                  )
                })}
              </div>
            )}
          </div>
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-4">
            <h4 className="text-sm font-semibold text-[#0F172A] mb-3">Timeline {agendaList.key} — 10:00–22:00</h4>
            <div className="space-y-1 max-h-[320px] overflow-y-auto pr-1">
              {Array.from({length:13}, (_,i)=> 10+i).map(h=>{
                const hh=String(h).padStart(2,'0')
                const atHour=agendaList.list.filter(r=> r.hora.startsWith(hh+':'))
                return (
                  <div key={h} className="flex gap-3 py-1.5 border-b border-[#F8FAFC] last:border-0">
                    <span className="text-xs font-mono text-[#94A3B8] w-12 shrink-0 pt-1">{hh}:00</span>
                    <div className="flex-1 flex flex-wrap gap-1.5">
                      {atHour.length===0 ? <span className="text-[11px] text-[#CBD5E1]">—</span> : atHour.map(r=>{
                        const st=estadoStyle[r.estado||'Pendiente']||estadoStyle.Pendiente
                        return <span key={r.id} className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full border ${st.bg} ${st.text} ${st.border}`}>{r.hora} · {r.nombre} ({r.personas})</span>
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
          {agendaList.upcoming.length>0 && (
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-4">
              <h4 className="text-sm font-semibold text-[#0F172A] mb-3">Próximas reservas</h4>
              <div className="space-y-2">
                {agendaList.upcoming.map(r=> (
                  <div key={r.id} className="flex items-center justify-between p-2.5 rounded-lg bg-[#F8FAFC] border border-[#E5E7EB]">
                    <span className="text-sm text-[#0F172A]">{r.fecha} {r.hora} — {r.nombre} ({r.personas})</span>
                    <span className="text-xs text-[#64748B]">{r.zona}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit/Detail/WhatsApp modals keep existing but styled — reuse original forms */}
      {showCreate && (
        <div className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={()=> setShowCreate(false)}>
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e=> e.stopPropagation()}>
            <div className="p-5 border-b border-[#E5E7EB] flex items-center justify-between"><h3 className="font-semibold text-[#0F172A]">Nueva reserva</h3><button onClick={()=> setShowCreate(false)} className="w-8 h-8 rounded-lg hover:bg-[#F1F5F9] flex items-center justify-center">✕</button></div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-medium text-[#334155]">Nombre *</label><input value={formCreate.nombre} onChange={e=> setFormCreate({...formCreate, nombre:e.target.value})} className="mt-1 w-full px-3 py-2 rounded-lg border border-[#E5E7EB] text-sm" /></div>
                <div><label className="text-xs font-medium text-[#334155]">Email *</label><input value={formCreate.email} onChange={e=> setFormCreate({...formCreate, email:e.target.value})} className="mt-1 w-full px-3 py-2 rounded-lg border border-[#E5E7EB] text-sm" /></div>
                <div><label className="text-xs font-medium text-[#334155]">Teléfono *</label><input value={formCreate.telefono} onChange={e=> setFormCreate({...formCreate, telefono:e.target.value})} className="mt-1 w-full px-3 py-2 rounded-lg border border-[#E5E7EB] text-sm" /></div>
                <div><label className="text-xs font-medium text-[#334155]">Fecha *</label><input type="date" value={formCreate.fecha} onChange={e=> setFormCreate({...formCreate, fecha:e.target.value})} className="mt-1 w-full px-3 py-2 rounded-lg border border-[#E5E7EB] text-sm" /></div>
                <div><label className="text-xs font-medium text-[#334155]">Hora *</label><input type="time" value={formCreate.hora} onChange={e=> setFormCreate({...formCreate, hora:e.target.value})} className="mt-1 w-full px-3 py-2 rounded-lg border border-[#E5E7EB] text-sm" /></div>
                <div><label className="text-xs font-medium text-[#334155]">Personas</label><input type="number" min={1} max={20} value={formCreate.personas} onChange={e=> setFormCreate({...formCreate, personas:Number(e.target.value)})} className="mt-1 w-full px-3 py-2 rounded-lg border border-[#E5E7EB] text-sm" /></div>
                <div><label className="text-xs font-medium text-[#334155]">Zona</label><select value={formCreate.zona} onChange={e=> setFormCreate({...formCreate, zona:e.target.value})} className="mt-1 w-full px-3 py-2 rounded-lg border border-[#E5E7EB] text-sm">{zonaOptions.map(z=> <option key={z} value={z}>{z}</option>)}</select></div>
                <div><label className="text-xs font-medium text-[#334155]">Estado</label><select value={formCreate.estado} onChange={e=> setFormCreate({...formCreate, estado:e.target.value as any})} className="mt-1 w-full px-3 py-2 rounded-lg border border-[#E5E7EB] text-sm">{estadoOptions.map(o=> <option key={o} value={o}>{o}</option>)}</select></div>
              </div>
              <div><label className="text-xs font-medium text-[#334155]">Ocasión</label><select value={formCreate.ocasion} onChange={e=> setFormCreate({...formCreate, ocasion:e.target.value})} className="mt-1 w-full px-3 py-2 rounded-lg border border-[#E5E7EB] text-sm">{ocasionOptions.map(o=> <option key={o} value={o}>{o}</option>)}</select></div>
              <div><label className="text-xs font-medium text-[#334155]">Comentarios</label><textarea value={formCreate.comentarios} onChange={e=> setFormCreate({...formCreate, comentarios:e.target.value})} rows={2} className="mt-1 w-full px-3 py-2 rounded-lg border border-[#E5E7EB] text-sm resize-none" /></div>
              <div className="flex justify-end gap-2 pt-2"><button onClick={()=> setShowCreate(false)} className="px-4 py-2 rounded-lg border border-[#E5E7EB] text-sm">Cancelar</button><button onClick={crear} className="px-4 py-2 rounded-lg bg-[#0F172A] text-white text-sm font-medium">Crear</button></div>
            </div>
          </div>
        </div>
      )}
      {showEdit && (
        <div className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={()=> setShowEdit(null)}>
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e=> e.stopPropagation()}>
            <div className="p-5 border-b border-[#E5E7EB] flex items-center justify-between"><h3 className="font-semibold text-[#0F172A]">Editar reserva</h3><button onClick={()=> setShowEdit(null)} className="w-8 h-8 rounded-lg hover:bg-[#F1F5F9] flex items-center justify-center">✕</button></div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-medium">Nombre *</label><input value={formEdit.nombre} onChange={e=> setFormEdit({...formEdit, nombre:e.target.value})} className="mt-1 w-full px-3 py-2 rounded-lg border border-[#E5E7EB] text-sm" /></div>
                <div><label className="text-xs font-medium">Email *</label><input value={formEdit.email} onChange={e=> setFormEdit({...formEdit, email:e.target.value})} className="mt-1 w-full px-3 py-2 rounded-lg border border-[#E5E7EB] text-sm" /></div>
                <div><label className="text-xs font-medium">Teléfono *</label><input value={formEdit.telefono} onChange={e=> setFormEdit({...formEdit, telefono:e.target.value})} className="mt-1 w-full px-3 py-2 rounded-lg border border-[#E5E7EB] text-sm" /></div>
                <div><label className="text-xs font-medium">Fecha *</label><input type="date" value={formEdit.fecha} onChange={e=> setFormEdit({...formEdit, fecha:e.target.value})} className="mt-1 w-full px-3 py-2 rounded-lg border border-[#E5E7EB] text-sm" /></div>
                <div><label className="text-xs font-medium">Hora *</label><input type="time" value={formEdit.hora} onChange={e=> setFormEdit({...formEdit, hora:e.target.value})} className="mt-1 w-full px-3 py-2 rounded-lg border border-[#E5E7EB] text-sm" /></div>
                <div><label className="text-xs font-medium">Personas</label><input type="number" value={formEdit.personas} onChange={e=> setFormEdit({...formEdit, personas:Number(e.target.value)})} className="mt-1 w-full px-3 py-2 rounded-lg border border-[#E5E7EB] text-sm" /></div>
              </div>
              <div className="flex justify-end gap-2"><button onClick={()=> setShowEdit(null)} className="px-4 py-2 rounded-lg border text-sm">Cancelar</button><button onClick={guardarEdit} className="px-4 py-2 rounded-lg bg-[#0F172A] text-white text-sm font-medium">Guardar</button></div>
            </div>
          </div>
        </div>
      )}
      <DetailDrawer open={!!detail} onClose={()=> setDetail(null)} title={detail ? `${detail.nombre} · ${detail.fecha} ${detail.hora}` : ''} subtitle={detail?.email}>
        {detail && <>
          <DrawerSection title="Reserva"><DrawerField label="Personas" value={detail.personas} /><DrawerField label="Zona" value={detail.zona} /><DrawerField label="Ocasión" value={detail.ocasion} /><DrawerField label="Estado" value={detail.estado} /></DrawerSection>
          {detail.comentarios && <DrawerSection title="Comentarios"><p className="text-sm text-[#334155] leading-5">{detail.comentarios}</p></DrawerSection>}
          <div className="flex gap-2"><button onClick={()=> { if(detail){ setFormEdit({ nombre:detail.nombre, email:detail.email, telefono:detail.telefono, fecha:detail.fecha, hora:detail.hora, personas:detail.personas, zona:detail.zona, ocasion:detail.ocasion, comentarios:detail.comentarios, estado:detail.estado }); setShowEdit(detail); setDetail(null)}} } className="flex-1 py-2.5 rounded-lg border border-[#E5E7EB] text-sm font-medium">Editar</button><button onClick={()=> { if(detail){ setMsgTarget(detail); setMensaje(`Hola ${detail.nombre}, sobre tu reserva #${detail.id.slice(0,8)}:`)}}} className="flex-1 py-2.5 rounded-lg bg-[#10B981] text-white text-sm font-medium">WhatsApp</button></div>
        </>}
      </DetailDrawer>
      {msgTarget && (
        <div className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={()=> setMsgTarget(null)}>
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl" onClick={e=> e.stopPropagation()}>
            <div className="p-5 border-b border-[#E5E7EB] flex items-center justify-between"><h3 className="font-semibold">WhatsApp · {msgTarget.nombre}</h3><button onClick={()=> setMsgTarget(null)} className="w-8 h-8 rounded-lg hover:bg-[#F1F5F9] flex items-center justify-center">✕</button></div>
            <div className="p-5 space-y-4"><textarea value={mensaje} onChange={e=> setMensaje(e.target.value)} rows={4} className="w-full px-3 py-2 rounded-lg border border-[#E5E7EB] text-sm resize-none" /><div className="flex justify-end gap-2"><button onClick={()=> setMsgTarget(null)} className="px-4 py-2 rounded-lg border text-sm">Cancelar</button><button onClick={()=> { const phone=msgTarget.telefono.replace(/[^0-9]/g,'')||CONFIG.contacto.whatsapp; window.open(`https://wa.me/${phone}?text=${encodeURIComponent(mensaje)}`,'_blank'); toast.success('WhatsApp listo'); setMsgTarget(null)}} className="px-4 py-2 rounded-lg bg-[#10B981] text-white text-sm font-medium">Enviar</button></div></div>
          </div>
        </div>
      )}
      <ConfirmModal open={!!confirmDelete} onClose={()=> setConfirmDelete(null)} onConfirm={()=> { if(confirmDelete){ guardar(reservas.filter(r=> r.id!==confirmDelete)); setConfirmDelete(null); toast.success('Eliminada')}}} title="Eliminar reserva" message="¿Eliminar esta reserva?" confirmText="Eliminar" variant="danger" />
    </div>
  )
}
