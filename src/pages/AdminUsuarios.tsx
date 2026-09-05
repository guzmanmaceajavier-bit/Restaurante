import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import { FaShieldAlt, FaPlus, FaEdit, FaTrash, FaSearch } from 'react-icons/fa'
import EmptyState from '../components/core/EmptyState'
import ConfirmModal from '../components/core/ConfirmModal'
import { SEO } from '../lib/seo'
import { Pagination } from '../components/admin/Pagination'

type Rol = 'Administrador'|'Gerente'|'Cajero'|'Cocina'|'Mesero'|'Marketing'
const ROLES: Rol[] = ['Administrador','Gerente','Cajero','Cocina','Mesero','Marketing']
const PERMS = ['Ver','Crear','Editar','Eliminar'] as const
interface Usuario { id:string; nombre:string; email:string; rol:Rol; permisos: string[]; activo:boolean }

const initial: Usuario[] = [
  { id:'u1', nombre:'Javier (Admin)', email:'admin@sabor.com', rol:'Administrador', permisos:[...PERMS], activo:true },
  { id:'u2', nombre:'Ana Cajera', email:'ana@sabor.com', rol:'Cajero', permisos:['Ver','Crear'], activo:true },
]

export default function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>(()=>{ try{ const s=JSON.parse(localStorage.getItem('usuarios_roles')||'[]'); return s.length? s: initial } catch{ return initial}})
  const [busqueda,setBusqueda]=useState('')
  const [page,setPage]=useState(1)
  const [showForm,setShowForm]=useState(false)
  const [editing,setEditing]=useState<Usuario|null>(null)
  const [form,setForm]=useState<Omit<Usuario,'id'>>({ nombre:'', email:'', rol:'Cajero', permisos:['Ver'], activo:true })
  const [confirmDelete,setConfirmDelete]=useState<string|null>(null)
  const save=(d:Usuario[])=>{ setUsuarios(d); localStorage.setItem('usuarios_roles', JSON.stringify(d)); try{ const log=JSON.parse(localStorage.getItem('activity_log')||'[]'); log.unshift({id:'act_'+Date.now(), accion: 'Usuarios', detalle: 'Actualización de usuarios y roles', fecha: new Date().toISOString(), usuario: 'Admin'}); localStorage.setItem('activity_log', JSON.stringify(log.slice(0,100)))} catch{} }
  const filtrados=useMemo(()=> usuarios.filter(u=> !busqueda || u.nombre.toLowerCase().includes(busqueda.toLowerCase()) || u.email.toLowerCase().includes(busqueda.toLowerCase())), [usuarios, busqueda])
  const totalPages=Math.ceil(filtrados.length/10)
  const pagina=filtrados.slice((page-1)*10, page*10)
  const openCreate=()=>{ setEditing(null); setForm({ nombre:'', email:'', rol:'Cajero', permisos:['Ver'], activo:true}); setShowForm(true)}
  const openEdit=(u:Usuario)=>{ setEditing(u); setForm({ nombre:u.nombre, email:u.email, rol:u.rol, permisos:[...u.permisos], activo:u.activo}); setShowForm(true)}
  const togglePerm=(p:string)=> setForm(f=> ({...f, permisos: f.permisos.includes(p) ? f.permisos.filter(x=>x!==p) : [...f.permisos, p]}))
  const submit=()=>{
    if(!form.nombre.trim()||!form.email.trim()){ toast.error('Nombre y email requeridos'); return }
    if(editing) save(usuarios.map(u=> u.id===editing.id ? {...u, ...form} : u))
    else save([...usuarios, {id:'usr_'+Date.now(), ...form}])
    toast.success(editing?'Usuario actualizado':'Usuario creado'); setShowForm(false)
  }
  return (
    <div>
      <SEO title="Usuarios y Roles" />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div><h1 className="text-2xl font-display font-bold text-espresso-800">Usuarios y Roles</h1><p className="text-steel text-sm mt-1">Control de acceso por rol y permisos</p></div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-olive-500 hover:bg-olive-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm"><FaPlus size={12}/> Nuevo usuario</button>
      </div>
      <div className="bg-white rounded-2xl border border-cream-200 p-4 mb-4">
        <p className="text-xs font-bold text-espresso-700 mb-2">Matriz de roles</p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr className="border-b border-cream-200"><th className="p-2 text-left">Rol</th><th className="p-2 text-left">Acceso</th></tr></thead>
            <tbody>
              <tr className="border-b border-cream-100"><td className="p-2 font-medium">Administrador</td><td className="p-2 text-steel">Todo</td></tr>
              <tr className="border-b border-cream-100"><td className="p-2 font-medium">Gerente</td><td className="p-2 text-steel">Todo excepto configuración crítica</td></tr>
              <tr className="border-b border-cream-100"><td className="p-2 font-medium">Cajero</td><td className="p-2 text-steel">Pedidos + Caja</td></tr>
              <tr className="border-b border-cream-100"><td className="p-2 font-medium">Cocina</td><td className="p-2 text-steel">Cocina</td></tr>
              <tr className="border-b border-cream-100"><td className="p-2 font-medium">Mesero</td><td className="p-2 text-steel">Mesas + pedidos</td></tr>
              <tr><td className="p-2 font-medium">Marketing</td><td className="p-2 text-steel">Promociones + clientes</td></tr>
            </tbody>
          </table>
        </div>
      </div>
      <div className="relative mb-4"><FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-steel/40" size={14}/><input value={busqueda} onChange={e=>{setBusqueda(e.target.value); setPage(1)}} placeholder="Buscar usuario..." className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-cream-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-olive-500/20" /></div>
      {pagina.length===0 ? <EmptyState icon={<FaShieldAlt size={24}/>} title="Sin usuarios" description="Crea usuarios con roles" action={{label:'Nuevo usuario', onClick: openCreate}} /> : (
        <>
          <div className="bg-white rounded-2xl border border-cream-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="bg-cream-50 border-b border-cream-200"><th className="p-3 text-left text-xs font-semibold uppercase">Usuario</th><th className="p-3 text-left text-xs font-semibold uppercase">Rol</th><th className="p-3 text-left text-xs font-semibold uppercase hidden sm:table-cell">Permisos</th><th className="p-3 text-center text-xs font-semibold uppercase">Estado</th><th className="p-3 text-center text-xs font-semibold uppercase">Acciones</th></tr></thead>
                <tbody>
                  {pagina.map(u=> (
                    <tr key={u.id} className="border-t border-cream-100 hover:bg-cream-50/50">
                      <td className="p-3"><p className="text-sm font-medium text-espresso-800">{u.nombre}</p><p className="text-xs text-steel">{u.email}</p></td>
                      <td className="p-3"><span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-olive-50 text-olive-700 border border-olive-200">{u.rol}</span></td>
                      <td className="p-3 text-xs text-steel hidden sm:table-cell">{u.permisos.join(' · ')}</td>
                      <td className="p-3 text-center"><span className={`px-2 py-1 rounded-full text-[10px] font-semibold border ${u.activo ? 'bg-sage-50 text-sage-700 border-sage-200' : 'bg-cream-100 text-steel border-cream-200'}`}>{u.activo ? 'Activo' : 'Inactivo'}</span></td>
                      <td className="p-3"><div className="flex gap-1 justify-center"><button onClick={()=>openEdit(u)} className="p-1.5 rounded-lg hover:bg-cream-100"><FaEdit size={13} className="text-olive-600"/></button><button onClick={()=>setConfirmDelete(u.id)} className="p-1.5 rounded-lg hover:bg-red-50"><FaTrash size={13} className="text-red-400"/></button></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
      {showForm && (
        <div className="fixed inset-0 bg-espresso-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={()=>setShowForm(false)}>
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-xl" onClick={e=>e.stopPropagation()}>
            <div className="p-6 border-b border-cream-200 flex items-center justify-between"><h3 className="font-display font-bold text-espresso-800">{editing?'Editar':'Nuevo'} usuario</h3><button onClick={()=>setShowForm(false)} className="p-2 hover:bg-cream-100 rounded-xl">✕</button></div>
            <div className="p-6 space-y-4">
              <div><label className="block text-xs font-semibold mb-1.5">Nombre *</label><input value={form.nombre} onChange={e=>setForm({...form, nombre:e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-cream-200 text-sm" /></div>
              <div><label className="block text-xs font-semibold mb-1.5">Email *</label><input value={form.email} onChange={e=>setForm({...form, email:e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-cream-200 text-sm" /></div>
              <div><label className="block text-xs font-semibold mb-1.5">Rol</label><select value={form.rol} onChange={e=>setForm({...form, rol:e.target.value as Rol})} className="w-full px-4 py-2.5 rounded-xl border border-cream-200 text-sm">{ROLES.map(r=> <option key={r} value={r}>{r}</option>)}</select></div>
              <div><label className="block text-xs font-semibold mb-1.5">Permisos</label><div className="flex flex-wrap gap-2">{PERMS.map(p=> <label key={p} className={`px-3 py-1.5 rounded-full text-xs font-medium border cursor-pointer ${form.permisos.includes(p) ? 'bg-olive-500 text-white border-olive-500' : 'bg-white border-cream-200'}`}><input type="checkbox" checked={form.permisos.includes(p)} onChange={()=>togglePerm(p)} className="hidden" />{p}</label>)}</div></div>
              <div className="flex items-center gap-2"><input type="checkbox" checked={form.activo} onChange={e=>setForm({...form, activo:e.target.checked})} id="activo"/><label htmlFor="activo" className="text-sm">Activo</label></div>
              <div className="flex gap-3 pt-2"><button onClick={()=>setShowForm(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-cream-200 text-sm">Cancelar</button><button onClick={submit} className="flex-1 px-4 py-2.5 rounded-xl bg-olive-500 hover:bg-olive-600 text-white text-sm font-semibold">{editing?'Guardar':'Crear'}</button></div>
            </div>
          </div>
        </div>
      )}
      <ConfirmModal open={!!confirmDelete} onClose={()=>setConfirmDelete(null)} onConfirm={()=>{ if(confirmDelete){ save(usuarios.filter(u=>u.id!==confirmDelete)); setConfirmDelete(null); toast.success('Usuario eliminado')}}} title="Eliminar usuario" message="¿Eliminar este usuario?" confirmText="Eliminar" variant="danger" />
    </div>
  )
}
