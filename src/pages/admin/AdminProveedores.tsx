import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import { FaTruck, FaPlus, FaEdit, FaTrash, FaSearch, FaPhone, FaEnvelope } from 'react-icons/fa'
import EmptyState from '../../components/feedback/EmptyState'
import ConfirmModal from '../../components/feedback/ConfirmModal'
import { SEO } from '../../lib/seo'
import { Pagination } from '../../components/admin/Pagination'
import { ExportButton } from '../../components/admin/ExportButton'

interface Proveedor { id: string; nombre: string; contacto: string; telefono: string; email: string; categoria: string; estado: 'activo' | 'inactivo' }

const initial: Proveedor[] = [
  { id: 'p1', nombre: 'Distribuciones La Sabana', contacto: 'Carlos Ruiz', telefono: '3101234567', email: 'ventas@sabana.com', categoria: 'Carnes', estado: 'activo' },
  { id: 'p2', nombre: 'Frutas del Valle', contacto: 'María López', telefono: '3129876543', email: 'info@frutasvalle.com', categoria: 'Frutas/Verduras', estado: 'activo' },
  { id: 'p3', nombre: 'Lácteos Córdoba', contacto: 'Jorge Díaz', telefono: '3005551234', email: 'pedidos@lacteoscordoba.com', categoria: 'Lácteos', estado: 'activo' },
]
const ITEMS_PER_PAGE = 10

export default function AdminProveedores() {
  const [proveedores, setProveedores] = useState<Proveedor[]>(() => { try { const s = JSON.parse(localStorage.getItem('proveedores') || '[]'); return s.length ? s : initial } catch { return initial } })
  const [busqueda, setBusqueda] = useState('')
  const [page, setPage] = useState(1)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Proveedor | null>(null)
  const [form, setForm] = useState<Omit<Proveedor,'id'>>({ nombre:'', contacto:'', telefono:'', email:'', categoria:'', estado:'activo' })
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const save = (d: Proveedor[]) => { setProveedores(d); localStorage.setItem('proveedores', JSON.stringify(d)) }
  const filtrados = useMemo(() => proveedores.filter(p => !busqueda || p.nombre.toLowerCase().includes(busqueda.toLowerCase()) || p.categoria.toLowerCase().includes(busqueda.toLowerCase())), [proveedores, busqueda])
  const totalPages = Math.ceil(filtrados.length / ITEMS_PER_PAGE)
  const pagina = filtrados.slice((page-1)*ITEMS_PER_PAGE, page*ITEMS_PER_PAGE)
  const openCreate = () => { setEditing(null); setForm({ nombre:'', contacto:'', telefono:'', email:'', categoria:'', estado:'activo' }); setShowForm(true) }
  const openEdit = (p: Proveedor) => { setEditing(p); setForm({ nombre:p.nombre, contacto:p.contacto, telefono:p.telefono, email:p.email, categoria:p.categoria, estado:p.estado }); setShowForm(true) }
  const submit = () => {
    if (!form.nombre.trim()) { toast.error('Nombre requerido'); return }
    if (editing) { save(proveedores.map(p => p.id===editing.id ? { ...p, ...form } : p)); toast.success('Proveedor actualizado') }
    else { save([...proveedores, { id:'prov_'+Date.now(), ...form }]); toast.success('Proveedor creado') }
    setShowForm(false)
  }
  const eliminar = (id: string) => { save(proveedores.filter(p => p.id!==id)); toast.success('Proveedor eliminado') }
  return (
    <div>
      <SEO title="Proveedores" />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div><h1 className="text-2xl font-display font-bold text-espresso-800">Proveedores</h1><p className="text-steel text-sm mt-1">{filtrados.length} proveedor{filtrados.length!==1?'es':''} · Inventario → flujo de compras</p></div>
        <div className="flex items-center gap-2">
          <ExportButton data={filtrados} filename="proveedores" columns={[{key:'nombre',label:'Nombre'},{key:'categoria',label:'Categoría'},{key:'telefono',label:'Teléfono'},{key:'estado',label:'Estado'}]} />
          <button onClick={openCreate} className="flex items-center gap-2 bg-olive-500 hover:bg-olive-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm"><FaPlus size={12}/> Nuevo proveedor</button>
        </div>
      </div>
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1"><FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-steel/40" size={14}/><input value={busqueda} onChange={e=>{setBusqueda(e.target.value); setPage(1)}} placeholder="Buscar por nombre o categoría..." className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-cream-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-olive-500/20" /></div>
      </div>
      {pagina.length===0 ? <EmptyState icon={<FaTruck size={24}/>} title="Sin proveedores" description="Agrega tus proveedores para gestionar compras" action={{label:'Nuevo proveedor', onClick: openCreate}} /> : (
        <>
          <div className="bg-white rounded-2xl border border-cream-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="bg-cream-50 border-b border-cream-200">
                  <th className="p-3 text-left text-xs font-semibold text-espresso-700 uppercase">Proveedor</th>
                  <th className="p-3 text-left text-xs font-semibold text-espresso-700 uppercase hidden sm:table-cell">Categoría</th>
                  <th className="p-3 text-left text-xs font-semibold text-espresso-700 uppercase hidden md:table-cell">Contacto</th>
                  <th className="p-3 text-center text-xs font-semibold text-espresso-700 uppercase">Estado</th>
                  <th className="p-3 text-center text-xs font-semibold text-espresso-700 uppercase">Acciones</th>
                </tr></thead>
                <tbody>
                  {pagina.map(p => (
                    <tr key={p.id} className="border-t border-cream-100 hover:bg-cream-50/50">
                      <td className="p-3"><p className="text-sm font-medium text-espresso-800">{p.nombre}</p><p className="text-xs text-steel flex items-center gap-1"><FaEnvelope size={10}/>{p.email}</p></td>
                      <td className="p-3 text-xs text-steel hidden sm:table-cell">{p.categoria || '—'}</td>
                      <td className="p-3 hidden md:table-cell"><p className="text-xs text-espresso-700">{p.contacto}</p><p className="text-xs text-steel flex items-center gap-1"><FaPhone size={10}/>{p.telefono}</p></td>
                      <td className="p-3 text-center"><span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border ${p.estado==='activo' ? 'bg-sage-50 text-sage-700 border-sage-200' : 'bg-cream-100 text-steel border-cream-200'}`}>{p.estado}</span></td>
                      <td className="p-3"><div className="flex gap-1 justify-center"><button onClick={()=>openEdit(p)} className="p-1.5 rounded-lg hover:bg-cream-100"><FaEdit size={13} className="text-olive-600"/></button><button onClick={()=>setConfirmDelete(p.id)} className="p-1.5 rounded-lg hover:bg-red-50"><FaTrash size={13} className="text-red-400"/></button></div></td>
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
            <div className="p-6 border-b border-cream-200 flex items-center justify-between"><h3 className="text-lg font-display font-bold text-espresso-800">{editing?'Editar':'Nuevo'} proveedor</h3><button onClick={()=>setShowForm(false)} className="p-2 hover:bg-cream-100 rounded-xl">✕</button></div>
            <div className="p-6 space-y-4">
              <div><label className="block text-xs font-semibold text-espresso-700 mb-1.5">Nombre *</label><input value={form.nombre} onChange={e=>setForm({...form, nombre:e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-cream-200 text-sm focus:outline-none focus:ring-2 focus:ring-olive-500/20" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-semibold text-espresso-700 mb-1.5">Contacto</label><input value={form.contacto} onChange={e=>setForm({...form, contacto:e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-cream-200 text-sm focus:outline-none focus:ring-2 focus:ring-olive-500/20" /></div>
                <div><label className="block text-xs font-semibold text-espresso-700 mb-1.5">Teléfono</label><input value={form.telefono} onChange={e=>setForm({...form, telefono:e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-cream-200 text-sm focus:outline-none focus:ring-2 focus:ring-olive-500/20" /></div>
                <div><label className="block text-xs font-semibold text-espresso-700 mb-1.5">Email</label><input value={form.email} onChange={e=>setForm({...form, email:e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-cream-200 text-sm focus:outline-none focus:ring-2 focus:ring-olive-500/20" /></div>
                <div><label className="block text-xs font-semibold text-espresso-700 mb-1.5">Categoría</label><input value={form.categoria} onChange={e=>setForm({...form, categoria:e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-cream-200 text-sm focus:outline-none focus:ring-2 focus:ring-olive-500/20" placeholder="Carnes, Lácteos..." /></div>
              </div>
              <div><label className="block text-xs font-semibold text-espresso-700 mb-1.5">Estado</label><select value={form.estado} onChange={e=>setForm({...form, estado:e.target.value as any})} className="w-full px-4 py-2.5 rounded-xl border border-cream-200 text-sm"><option value="activo">Activo</option><option value="inactivo">Inactivo</option></select></div>
              <div className="flex gap-3 pt-2"><button onClick={()=>setShowForm(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-cream-200 text-sm">Cancelar</button><button onClick={submit} className="flex-1 px-4 py-2.5 rounded-xl bg-olive-500 hover:bg-olive-600 text-white text-sm font-semibold">{editing?'Guardar':'Crear'}</button></div>
            </div>
          </div>
        </div>
      )}
      <ConfirmModal open={!!confirmDelete} onClose={()=>setConfirmDelete(null)} onConfirm={()=>confirmDelete && eliminar(confirmDelete)} title="Eliminar proveedor" message="¿Eliminar este proveedor?" confirmText="Eliminar" variant="danger" />
    </div>
  )
}
