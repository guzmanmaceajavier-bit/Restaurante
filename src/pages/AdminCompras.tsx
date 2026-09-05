import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import { FaShoppingCart, FaPlus, FaSearch, FaTrash } from 'react-icons/fa'
import EmptyState from '../components/core/EmptyState'
import ConfirmModal from '../components/core/ConfirmModal'
import { SEO } from '../lib/seo'
import { Pagination } from '../components/admin/Pagination'

interface Compra { id: string; proveedor: string; productos: string; cantidad: number; total: number; fecha: string; estado: 'pendiente' | 'recibida' | 'cancelada' }
const ITEMS_PER_PAGE = 10

export default function AdminCompras() {
  const [compras, setCompras] = useState<Compra[]>(() => { try { const s = JSON.parse(localStorage.getItem('compras')||'[]'); return s } catch { return [] } })
  const [busqueda, setBusqueda] = useState('')
  const [page, setPage] = useState(1)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<Omit<Compra,'id'>>({ proveedor:'', productos:'', cantidad:1, total:0, fecha: new Date().toISOString().split('T')[0], estado:'pendiente' })
  const [confirmDelete, setConfirmDelete] = useState<string|null>(null)
  const save = (d: Compra[]) => { setCompras(d); localStorage.setItem('compras', JSON.stringify(d)) }
  const filtradas = useMemo(()=> compras.filter(c=> !busqueda || c.proveedor.toLowerCase().includes(busqueda.toLowerCase()) || c.productos.toLowerCase().includes(busqueda.toLowerCase())), [compras, busqueda])
  const totalPages = Math.ceil(filtradas.length/ITEMS_PER_PAGE)
  const pagina = filtradas.slice((page-1)*ITEMS_PER_PAGE, page*ITEMS_PER_PAGE)
  const submit = () => {
    if (!form.proveedor.trim() || !form.productos.trim()) { toast.error('Proveedor y productos requeridos'); return }
    const nueva: Compra = { id:'comp_'+Date.now(), ...form }
    save([...compras, nueva])
    // actualizar inventario si recibida
    if (form.estado==='recibida') {
      try {
        const prods = JSON.parse(localStorage.getItem('productos')||'[]')
        // suma stock simple si coincide nombre
        const updated = prods.map((p:any)=> form.productos.toLowerCase().includes(p.nombre?.toLowerCase()) ? {...p, stock: (p.stock||0)+form.cantidad} : p)
        localStorage.setItem('productos', JSON.stringify(updated))
      } catch {}
    }
    toast.success('Compra registrada'); setShowForm(false)
  }
  const cambiarEstado = (id:string, estado: Compra['estado']) => { save(compras.map(c=> c.id===id ? {...c, estado} : c)); toast.success(`Compra ${estado}`) }
  return (
    <div>
      <SEO title="Compras" />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div><h1 className="text-2xl font-display font-bold text-espresso-800">Compras</h1><p className="text-steel text-sm mt-1">Registra compras a proveedores — actualiza inventario automáticamente</p></div>
        <button onClick={()=>setShowForm(true)} className="flex items-center gap-2 bg-olive-500 hover:bg-olive-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm"><FaPlus size={12}/> Nueva compra</button>
      </div>
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1"><FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-steel/40" size={14}/><input value={busqueda} onChange={e=>{setBusqueda(e.target.value); setPage(1)}} placeholder="Buscar proveedor o producto..." className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-cream-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-olive-500/20" /></div>
      </div>
      {pagina.length===0 ? <EmptyState icon={<FaShoppingCart size={24}/>} title="Sin compras" description="Registra tus compras a proveedores" action={{label:'Nueva compra', onClick:()=>setShowForm(true)}} /> : (
        <>
          <div className="bg-white rounded-2xl border border-cream-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="bg-cream-50 border-b border-cream-200">
                  <th className="p-3 text-left text-xs font-semibold text-espresso-700 uppercase">Proveedor</th>
                  <th className="p-3 text-left text-xs font-semibold text-espresso-700 uppercase">Productos</th>
                  <th className="p-3 text-center text-xs font-semibold text-espresso-700 uppercase">Cant.</th>
                  <th className="p-3 text-right text-xs font-semibold text-espresso-700 uppercase">Total</th>
                  <th className="p-3 text-center text-xs font-semibold text-espresso-700 uppercase">Estado</th>
                  <th className="p-3 text-center text-xs font-semibold text-espresso-700 uppercase">Acciones</th>
                </tr></thead>
                <tbody>
                  {pagina.map(c=> (
                    <tr key={c.id} className="border-t border-cream-100 hover:bg-cream-50/50">
                      <td className="p-3"><p className="text-sm font-medium text-espresso-800">{c.proveedor}</p><p className="text-xs text-steel">{c.fecha}</p></td>
                      <td className="p-3 text-sm text-espresso-700 max-w-[200px] truncate">{c.productos}</td>
                      <td className="p-3 text-center text-sm">{c.cantidad}</td>
                      <td className="p-3 text-right text-sm font-bold">${Number(c.total).toLocaleString('es-CO')}</td>
                      <td className="p-3 text-center">
                        <select value={c.estado} onChange={e=>cambiarEstado(c.id, e.target.value as any)} className={`text-xs font-semibold rounded-full px-2.5 py-1 border ${c.estado==='recibida' ? 'bg-sage-50 text-sage-700 border-sage-200' : c.estado==='pendiente' ? 'bg-gold-50 text-gold-700 border-gold-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                          <option value="pendiente">Pendiente</option><option value="recibida">Recibida</option><option value="cancelada">Cancelada</option>
                        </select>
                      </td>
                      <td className="p-3 text-center"><button onClick={()=>setConfirmDelete(c.id)} className="p-1.5 rounded-lg hover:bg-red-50"><FaTrash size={12} className="text-red-400"/></button></td>
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
            <div className="p-6 border-b border-cream-200 flex items-center justify-between"><h3 className="text-lg font-display font-bold text-espresso-800">Nueva compra</h3><button onClick={()=>setShowForm(false)} className="p-2 hover:bg-cream-100 rounded-xl">✕</button></div>
            <div className="p-6 space-y-4">
              <div><label className="block text-xs font-semibold text-espresso-700 mb-1.5">Proveedor *</label><input value={form.proveedor} onChange={e=>setForm({...form, proveedor:e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-cream-200 text-sm focus:outline-none focus:ring-2 focus:ring-olive-500/20" /></div>
              <div><label className="block text-xs font-semibold text-espresso-700 mb-1.5">Productos *</label><input value={form.productos} onChange={e=>setForm({...form, productos:e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-cream-200 text-sm focus:outline-none focus:ring-2 focus:ring-olive-500/20" placeholder="Ej: Arroz 10kg, Pollo 5kg" /></div>
              <div className="grid grid-cols-3 gap-4">
                <div><label className="block text-xs font-semibold text-espresso-700 mb-1.5">Cantidad</label><input type="number" min={1} value={form.cantidad} onChange={e=>setForm({...form, cantidad:Number(e.target.value)})} className="w-full px-4 py-2.5 rounded-xl border border-cream-200 text-sm" /></div>
                <div><label className="block text-xs font-semibold text-espresso-700 mb-1.5">Total</label><input type="number" min={0} value={form.total} onChange={e=>setForm({...form, total:Number(e.target.value)})} className="w-full px-4 py-2.5 rounded-xl border border-cream-200 text-sm" /></div>
                <div><label className="block text-xs font-semibold text-espresso-700 mb-1.5">Fecha</label><input type="date" value={form.fecha} onChange={e=>setForm({...form, fecha:e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-cream-200 text-sm" /></div>
              </div>
              <div><label className="block text-xs font-semibold text-espresso-700 mb-1.5">Estado</label><select value={form.estado} onChange={e=>setForm({...form, estado:e.target.value as any})} className="w-full px-4 py-2.5 rounded-xl border border-cream-200 text-sm"><option value="pendiente">Pendiente</option><option value="recibida">Recibida</option><option value="cancelada">Cancelada</option></select></div>
              <div className="flex gap-3 pt-2"><button onClick={()=>setShowForm(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-cream-200 text-sm">Cancelar</button><button onClick={submit} className="flex-1 px-4 py-2.5 rounded-xl bg-olive-500 hover:bg-olive-600 text-white text-sm font-semibold">Guardar</button></div>
            </div>
          </div>
        </div>
      )}
      <ConfirmModal open={!!confirmDelete} onClose={()=>setConfirmDelete(null)} onConfirm={()=>{ if(confirmDelete){ save(compras.filter(c=>c.id!==confirmDelete)); setConfirmDelete(null); toast.success('Compra eliminada')}}} title="Eliminar compra" message="¿Eliminar esta compra?" confirmText="Eliminar" variant="danger" />
    </div>
  )
}
