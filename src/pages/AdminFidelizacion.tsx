import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import { FaTrophy, FaGift, FaStar, FaPlus, FaEdit, FaTrash } from 'react-icons/fa'
import { SEO } from '../lib/seo'
import { CONFIG } from '../lib/config'
import ConfirmModal from '../components/core/ConfirmModal'

interface Recompensa { id:string; nombre:string; puntos:number; descripcion:string; activa:boolean }

export default function AdminFidelizacion() {
  const [recompensas, setRecompensas] = useState<Recompensa[]>(()=>{ try{ const s=JSON.parse(localStorage.getItem('fidelizacion_recompensas')||'[]'); if(s.length) return s; return [
    { id:'r1', nombre:'Plato gratis', puntos:100, descripcion:'Canjea 100 puntos por un plato a elección', activa:true },
    { id:'r2', nombre:'Postre gratis', puntos:50, descripcion:'50 puntos = postre', activa:true },
    { id:'r3', nombre:'Descuento 20%', puntos:80, descripcion:'20% en tu próxima compra', activa:true },
  ]} catch{ return []}})
  const [cfg, setCfg]=useState(()=>{ try{ const s=JSON.parse(localStorage.getItem('fidelizacion_cfg')||'null'); return s || { pesosPorPunto: CONFIG.puntos.pesosPorPunto, puntosCanje: CONFIG.puntos.puntosCanje, descripcion: CONFIG.puntos.descripcion }} catch{ return {pesosPorPunto:10000, puntosCanje:100, descripcion:''}}})
  const [showForm,setShowForm]=useState(false)
  const [editing,setEditing]=useState<Recompensa|null>(null)
  const [form,setForm]=useState<Omit<Recompensa,'id'>>({ nombre:'', puntos:100, descripcion:'', activa:true})
  const [confirmDelete,setConfirmDelete]=useState<string|null>(null)
  const clientes = useMemo(()=>{ try{ return JSON.parse(localStorage.getItem('clientes')||'[]')} catch{ return []}}, [recompensas])
  const totalPuntos = clientes.reduce((s:any,c:any)=> s+(c.puntos||0),0)
  const saveRecomp=(d:Recompensa[])=>{ setRecompensas(d); localStorage.setItem('fidelizacion_recompensas', JSON.stringify(d))}
  const saveCfg=()=>{ localStorage.setItem('fidelizacion_cfg', JSON.stringify(cfg)); toast.success('Configuración guardada')}
  const openCreate=()=>{ setEditing(null); setForm({ nombre:'', puntos:100, descripcion:'', activa:true}); setShowForm(true)}
  const openEdit=(r:Recompensa)=>{ setEditing(r); setForm({ nombre:r.nombre, puntos:r.puntos, descripcion:r.descripcion, activa:r.activa}); setShowForm(true)}
  const submit=()=>{
    if(!form.nombre.trim()){ toast.error('Nombre requerido'); return }
    if(editing) saveRecomp(recompensas.map(r=> r.id===editing.id ? {...r, ...form} : r))
    else saveRecomp([...recompensas, {id:'rew_'+Date.now(), ...form}])
    toast.success(editing?'Recompensa actualizada':'Recompensa creada'); setShowForm(false)
  }
  return (
    <div>
      <SEO title="Fidelización" />
      <div className="mb-6"><h1 className="text-2xl font-display font-bold text-espresso-800">Fidelización</h1><p className="text-steel text-sm mt-1">Puntos · recompensas · niveles — cada $10.000 = 1 punto</p></div>
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-cream-200 p-5"><p className="text-xs text-steel flex items-center gap-1"><FaStar className="text-gold-500"/> Puntos en circulación</p><p className="text-2xl font-bold text-espresso-800 mt-1">{totalPuntos.toLocaleString('es-CO')}</p></div>
        <div className="bg-white rounded-2xl border border-cream-200 p-5"><p className="text-xs text-steel flex items-center gap-1"><FaTrophy className="text-olive-500"/> Recompensas activas</p><p className="text-2xl font-bold text-espresso-800 mt-1">{recompensas.filter(r=>r.activa).length}</p></div>
        <div className="bg-white rounded-2xl border border-cream-200 p-5"><p className="text-xs text-steel flex items-center gap-1"><FaGift className="text-sage-500"/> Clientes con puntos</p><p className="text-2xl font-bold text-espresso-800 mt-1">{clientes.filter((c:any)=> (c.puntos||0)>0).length}</p></div>
      </div>
      <div className="bg-white rounded-2xl border border-cream-200 p-6 mb-6">
        <h2 className="font-display font-bold text-espresso-800 mb-4">Configuración</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <div><label className="block text-xs font-semibold mb-1.5">Pesos por punto</label><input type="number" value={cfg.pesosPorPunto} onChange={e=>setCfg({...cfg, pesosPorPunto:Number(e.target.value)})} className="w-full px-4 py-2.5 rounded-xl border border-cream-200 text-sm" /></div>
          <div><label className="block text-xs font-semibold mb-1.5">Puntos para canje</label><input type="number" value={cfg.puntosCanje} onChange={e=>setCfg({...cfg, puntosCanje:Number(e.target.value)})} className="w-full px-4 py-2.5 rounded-xl border border-cream-200 text-sm" /></div>
          <div className="flex items-end"><button onClick={saveCfg} className="w-full px-4 py-2.5 rounded-xl bg-olive-500 hover:bg-olive-600 text-white text-sm font-semibold">Guardar</button></div>
        </div>
        <div className="mt-4"><label className="block text-xs font-semibold mb-1.5">Descripción</label><input value={cfg.descripcion} onChange={e=>setCfg({...cfg, descripcion:e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-cream-200 text-sm" /></div>
      </div>
      <div className="flex justify-between items-center mb-3">
        <h2 className="font-display font-bold text-espresso-800">Recompensas</h2>
        <button onClick={openCreate} className="flex items-center gap-2 bg-olive-500 hover:bg-olive-600 text-white px-4 py-2 rounded-xl text-sm font-semibold"><FaPlus size={12}/> Nueva recompensa</button>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {recompensas.map(r=> (
          <div key={r.id} className={`bg-white rounded-2xl border p-5 ${r.activa ? 'border-cream-200' : 'border-cream-200 opacity-60'}`}>
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 bg-gold-100 rounded-xl flex items-center justify-center"><FaGift size={16} className="text-gold-600"/></div>
              <span className={`px-2 py-1 rounded-full text-[10px] font-semibold border ${r.activa ? 'bg-sage-50 text-sage-700 border-sage-200' : 'bg-cream-100 text-steel border-cream-200'}`}>{r.activa ? 'Activa' : 'Inactiva'}</span>
            </div>
            <h3 className="font-bold text-espresso-800 mt-3">{r.nombre}</h3>
            <p className="text-xs text-steel mt-1">{r.descripcion}</p>
            <p className="text-sm font-bold text-olive-600 mt-2">{r.puntos} puntos</p>
            <div className="flex gap-2 mt-3">
              <button onClick={()=>openEdit(r)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-cream-50 hover:bg-cream-100 border border-cream-200 text-xs font-medium"><FaEdit size={11}/> Editar</button>
              <button onClick={()=>setConfirmDelete(r.id)} className="px-3 py-2 rounded-xl hover:bg-red-50 text-red-500"><FaTrash size={12}/></button>
            </div>
          </div>
        ))}
        {recompensas.length===0 && <p className="text-sm text-steel col-span-full text-center py-8">Sin recompensas</p>}
      </div>
      {showForm && (
        <div className="fixed inset-0 bg-espresso-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={()=>setShowForm(false)}>
          <div className="bg-white rounded-3xl w-full max-w-md shadow-xl" onClick={e=>e.stopPropagation()}>
            <div className="p-6 border-b border-cream-200 flex items-center justify-between"><h3 className="font-display font-bold text-espresso-800">{editing?'Editar':'Nueva'} recompensa</h3><button onClick={()=>setShowForm(false)} className="p-2 hover:bg-cream-100 rounded-xl">✕</button></div>
            <div className="p-6 space-y-4">
              <div><label className="block text-xs font-semibold mb-1.5">Nombre *</label><input value={form.nombre} onChange={e=>setForm({...form, nombre:e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-cream-200 text-sm" /></div>
              <div><label className="block text-xs font-semibold mb-1.5">Puntos requeridos</label><input type="number" min={1} value={form.puntos} onChange={e=>setForm({...form, puntos:Number(e.target.value)})} className="w-full px-4 py-2.5 rounded-xl border border-cream-200 text-sm" /></div>
              <div><label className="block text-xs font-semibold mb-1.5">Descripción</label><textarea value={form.descripcion} onChange={e=>setForm({...form, descripcion:e.target.value})} rows={2} className="w-full px-4 py-2.5 rounded-xl border border-cream-200 text-sm resize-none" /></div>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.activa} onChange={e=>setForm({...form, activa:e.target.checked})} /> Activa</label>
              <div className="flex gap-3 pt-2"><button onClick={()=>setShowForm(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-cream-200 text-sm">Cancelar</button><button onClick={submit} className="flex-1 px-4 py-2.5 rounded-xl bg-olive-500 hover:bg-olive-600 text-white text-sm font-semibold">{editing?'Guardar':'Crear'}</button></div>
            </div>
          </div>
        </div>
      )}
      <ConfirmModal open={!!confirmDelete} onClose={()=>setConfirmDelete(null)} onConfirm={()=>{ if(confirmDelete){ saveRecomp(recompensas.filter(r=>r.id!==confirmDelete)); setConfirmDelete(null); toast.success('Recompensa eliminada')}}} title="Eliminar recompensa" message="¿Eliminar esta recompensa?" confirmText="Eliminar" variant="danger" />
    </div>
  )
}
