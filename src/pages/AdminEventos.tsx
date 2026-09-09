import { useState } from 'react'
import { toast } from 'sonner'
import { FaPlus, FaEdit, FaTrash, FaBirthdayCake, FaBriefcase, FaUsers, FaGlassCheers } from 'react-icons/fa'
import EmptyState from '../components/core/EmptyState'
import ConfirmModal from '../components/core/ConfirmModal'
import { SEO } from '../lib/seo'
import { eventService, type Evento } from '../lib/eventService'

const iconOptions = [
  { value:'FaBirthdayCake', label:'Cumpleaños', icon: FaBirthdayCake },
  { value:'FaBriefcase', label:'Empresarial', icon: FaBriefcase },
  { value:'FaUsers', label:'Familiar', icon: FaUsers },
  { value:'FaGlassCheers', label:'Catering', icon: FaGlassCheers },
]

export default function AdminEventos(){
  const [eventos,setEventos]=useState<Evento[]>(()=> eventService.getAll())
  const [showForm,setShowForm]=useState(false)
  const [editing,setEditing]=useState<Evento|null>(null)
  const [form,setForm]=useState<Omit<Evento,'id'>>({ titulo:'', descripcion:'', icono:'FaBirthdayCake', features:[], activo:true})
  const [featInput,setFeatInput]=useState('')
  const [confirmDelete,setConfirmDelete]=useState<string|null>(null)
  const save=(d:Evento[])=>{ setEventos(d); eventService.save(d)}
  const openCreate=()=>{ setEditing(null); setForm({ titulo:'', descripcion:'', icono:'FaBirthdayCake', features:[], activo:true}); setShowForm(true)}
  const openEdit=(e:Evento)=>{ setEditing(e); setForm({ titulo:e.titulo, descripcion:e.descripcion, icono:e.icono, features:[...e.features], activo:e.activo}); setShowForm(true)}
  const submit=()=>{
    if(!form.titulo.trim()||!form.descripcion.trim()){ toast.error('Título y descripción requeridos'); return}
    if(editing) save(eventos.map(e=> e.id===editing.id ? {...e, ...form}:e))
    else save([...eventos, {id:'ev_'+Date.now(), ...form}])
    toast.success(editing?'Evento actualizado':'Evento creado'); setShowForm(false)
  }
  return (
    <div>
      <SEO title="Admin - Eventos" />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div><p className="text-[11px] font-medium tracking-widest uppercase text-[#94A3B8]">CONTENIDO / EVENTOS</p><h1 className="text-[18px] font-semibold tracking-tight text-[#0F172A] mt-1">Eventos</h1><p className="text-[13px] text-[#64748B] mt-1">{eventos.length} tipos · Se muestran en /eventos (solo activos)</p></div>
        <button onClick={openCreate} className="inline-flex items-center gap-1.5 bg-[#0F172A] hover:bg-[#1E293B] text-white px-4 py-2 rounded-md text-[13px] font-medium"><FaPlus size={11}/> Nuevo evento</button>
      </div>
      {eventos.length===0 ? <EmptyState icon={<FaGlassCheers size={20}/>} title="Sin eventos" description="Crea los tipos de eventos que ofreces" action={{label:'Nuevo evento', onClick: openCreate}} /> : (
        <div className="grid md:grid-cols-2 gap-3">
          {eventos.map(ev=>{
            const Icon = iconOptions.find(o=>o.value===ev.icono)?.icon || FaGlassCheers
            return (
              <div key={ev.id} className={`bg-white border rounded-md p-4 ${!ev.activo ? 'opacity-60' : 'border-[#E5E7EB]'}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3"><span className="w-8 h-8 rounded-md bg-[#F8FAFC] border border-[#E5E7EB] flex items-center justify-center text-[#667A22]"><Icon size={14}/></span><div><p className="text-sm font-medium text-[#0F172A]">{ev.titulo}</p><p className="text-xs text-[#64748B] line-clamp-2">{ev.descripcion}</p></div></div>
                  <span className={`text-[11px] px-2 py-0.5 rounded font-medium border ${ev.activo ? 'bg-[#ECFDF5] text-[#065F46] border-[#A7F3D0]' : 'bg-[#F1F5F9] text-[#64748B] border-[#E5E7EB]'}`}>{ev.activo?'Activo':'Inactivo'}</span>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-3">{ev.features.map(f=> <span key={f} className="text-xs px-2 py-1 rounded bg-[#F8FAFC] border border-[#E5E7EB] text-[#475569]">{f}</span>)}</div>
                <div className="flex gap-2 mt-3">
                  <button onClick={()=> openEdit(ev)} className="flex-1 py-2 rounded-md border border-[#E5E7EB] bg-white text-xs font-medium hover:bg-[#F8FAFC] flex items-center justify-center gap-1"><FaEdit size={11}/> Editar</button>
                  <button onClick={()=> setConfirmDelete(ev.id)} className="px-3 py-2 rounded-md hover:bg-[#FEF2F2] text-[#DC2626]"><FaTrash size={11}/></button>
                </div>
              </div>
            )
          })}
        </div>
      )}
      {showForm && (
        <div className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={()=> setShowForm(false)}>
          <div className="bg-white rounded-md w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto" onClick={e=> e.stopPropagation()}>
            <div className="p-4 border-b border-[#E5E7EB] flex items-center justify-between"><h3 className="font-semibold text-[#0F172A] text-sm">{editing?'Editar':'Nuevo'} evento</h3><button onClick={()=> setShowForm(false)} className="w-7 h-7 rounded-md hover:bg-[#F1F5F9] flex items-center justify-center">✕</button></div>
            <div className="p-4 space-y-3">
              <div><label className="block text-xs font-medium text-[#334155] mb-1">Título *</label><input value={form.titulo} onChange={e=> setForm({...form, titulo:e.target.value})} className="w-full px-3 py-2 rounded-md border border-[#E5E7EB] text-sm" /></div>
              <div><label className="block text-xs font-medium text-[#334155] mb-1">Descripción *</label><textarea value={form.descripcion} onChange={e=> setForm({...form, descripcion:e.target.value})} rows={2} className="w-full px-3 py-2 rounded-md border border-[#E5E7EB] text-sm resize-none" /></div>
              <div><label className="block text-xs font-medium text-[#334155] mb-1">Icono</label><select value={form.icono} onChange={e=> setForm({...form, icono:e.target.value})} className="w-full px-3 py-2 rounded-md border border-[#E5E7EB] text-sm">{iconOptions.map(o=> <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
              <div>
                <label className="block text-xs font-medium text-[#334155] mb-1">Características</label>
                <div className="flex gap-2"><input value={featInput} onChange={e=> setFeatInput(e.target.value)} onKeyDown={e=> {if(e.key==='Enter'){ e.preventDefault(); if(featInput.trim()){ setForm({...form, features:[...form.features, featInput.trim()]}); setFeatInput('')}}}} placeholder="Escribe y Enter" className="flex-1 px-3 py-2 rounded-md border border-[#E5E7EB] text-sm" /><button onClick={()=> {if(featInput.trim()){ setForm({...form, features:[...form.features, featInput.trim()]}); setFeatInput('')}}} className="px-3 py-2 rounded-md bg-[#0F172A] text-white text-xs">Agregar</button></div>
                <div className="flex flex-wrap gap-1.5 mt-2">{form.features.map((f,i)=> <span key={i} className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-[#F1F5F9] border border-[#E5E7EB]">{f} <button onClick={()=> setForm({...form, features: form.features.filter((_,idx)=> idx!==i)})} className="text-[#94A3B8] hover:text-[#DC2626]">×</button></span>)}</div>
              </div>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.activo} onChange={e=> setForm({...form, activo:e.target.checked})} /> Activo (visible en sitio)</label>
              <div className="flex gap-2 pt-2"><button onClick={()=> setShowForm(false)} className="flex-1 py-2.5 rounded-md border border-[#E5E7EB] text-sm font-medium">Cancelar</button><button onClick={submit} className="flex-1 py-2.5 rounded-md bg-[#0F172A] text-white text-sm font-medium">{editing?'Guardar':'Crear'}</button></div>
            </div>
          </div>
        </div>
      )}
      <ConfirmModal open={!!confirmDelete} onClose={()=> setConfirmDelete(null)} onConfirm={()=> { if(confirmDelete){ save(eventos.filter(e=> e.id!==confirmDelete)); setConfirmDelete(null); toast.success('Evento eliminado')}}} title="Eliminar evento" message="¿Eliminar este tipo de evento?" confirmText="Eliminar" variant="danger" />
    </div>
  )
}
