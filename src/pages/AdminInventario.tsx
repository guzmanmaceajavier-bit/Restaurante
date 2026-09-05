import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import { FaBox, FaSearch, FaExclamationTriangle, FaCheckCircle, FaTimesCircle, FaEdit, FaTrash, FaPlus, FaTimes } from 'react-icons/fa'
import EmptyState from '../components/core/EmptyState'
import ConfirmModal from '../components/core/ConfirmModal'
import { Pagination } from '../components/admin/Pagination'
import { ExportButton } from '../components/admin/ExportButton'
import { SEO } from '../lib/seo'
import { dataService } from '../lib/dataService'
import type { IProduct } from '../types/product'

const ITEMS_PER_PAGE = 10
type StockStatus = 'agotado' | 'bajo' | 'normal' | 'alto'
function getStockStatus(stock: number): StockStatus {
  if (stock <= 0) return 'agotado'
  if (stock <= 5) return 'bajo'
  if (stock <= 20) return 'normal'
  return 'alto'
}
const STATUS_CONFIG: Record<StockStatus, { label: string; color: string; icon: typeof FaTimesCircle }> = {
  agotado: { label: 'Agotado', color: 'bg-red-50 text-red-700 border-red-200', icon: FaTimesCircle },
  bajo: { label: 'Bajo', color: 'bg-gold-50 text-gold-700 border-gold-200', icon: FaExclamationTriangle },
  normal: { label: 'Normal', color: 'bg-sage-50 text-sage-700 border-sage-200', icon: FaCheckCircle },
  alto: { label: 'Alto', color: 'bg-blue-50 text-blue-700 border-blue-200', icon: FaCheckCircle },
}
const emptyProduct: Omit<IProduct, 'id'> = { nombre: '', descripcion: '', precio: 0, categoría: '', imagen: '', stock: 0 }

export default function AdminInventario() {
  const [productos, setProductos] = useState<IProduct[]>(() => dataService.getProductos())
  const [busqueda, setBusqueda] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState('')
  const [page, setPage] = useState(1)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [formEdit, setFormEdit] = useState<IProduct | null>(null)
  const [formData, setFormData] = useState<Omit<IProduct, 'id'>>(emptyProduct)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const categorias = useMemo(() => {
    const cats = new Set(productos.map((p) => p.categoría).filter(Boolean))
    return Array.from(cats) as string[]
  }, [productos])

  const filtrados = useMemo(() => productos.filter((p) => {
    if (filtroCategoria && p.categoría !== filtroCategoria) return false
    if (busqueda) return p.nombre?.toLowerCase().includes(busqueda.toLowerCase())
    return true
  }), [productos, busqueda, filtroCategoria])

  const totalPages = Math.ceil(filtrados.length / ITEMS_PER_PAGE)
  const pagina = filtrados.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)
  const stats = useMemo(() => ({
    total: productos.length,
    agotados: productos.filter((p) => (p.stock || 0) <= 0).length,
    bajos: productos.filter((p) => (p.stock || 0) > 0 && (p.stock || 0) <= 5).length,
    normales: productos.filter((p) => (p.stock || 0) > 5 && (p.stock || 0) <= 20).length,
    altos: productos.filter((p) => (p.stock || 0) > 20).length,
  }), [productos])

  const persist = (updated: IProduct[]) => { setProductos(updated); localStorage.setItem('productos', JSON.stringify(updated)) }

  const saveStock = (productId: string, newStock: number) => {
    const updated = productos.map((p) => p.id === productId ? { ...p, stock: Math.max(0, newStock) } : p) as IProduct[]
    persist(updated); toast.success('Stock actualizado')
  }
  const startEditing = (product: IProduct) => { setEditingId(product.id); setEditValue(String(product.stock || 0)) }
  const finishEditing = (productId: string) => {
    const n = parseInt(editValue, 10)
    if (!isNaN(n) && n >= 0) saveStock(productId, n)
    setEditingId(null); setEditValue('')
  }
  const handleKeyDown = (e: React.KeyboardEvent, productId: string) => {
    if (e.key === 'Enter') finishEditing(productId)
    else if (e.key === 'Escape') { setEditingId(null); setEditValue('') }
  }
  const openCreate = () => { setFormEdit(null); setFormData({ ...emptyProduct, categoría: categorias[0] || '' }); setShowForm(true) }
  const openEdit = (p: IProduct) => { setFormEdit(p); setFormData({ nombre: p.nombre, descripcion: p.descripcion, precio: p.precio, categoría: p.categoría, imagen: p.imagen, stock: p.stock, ingredientes: p.ingredientes, picante: p.picante, tiempoPreparacion: p.tiempoPreparacion, calorias: p.calorias } as any); setShowForm(true) }
  const submitForm = () => {
    if (!formData.nombre.trim()) { toast.error('Nombre requerido'); return }
    if (!formData.categoría.trim()) { toast.error('Categoría requerida'); return }
    if (formData.precio < 0) { toast.error('Precio inválido'); return }
    if (formEdit) {
      const updated = productos.map((p) => p.id === formEdit.id ? { ...p, ...formData } as IProduct : p)
      persist(updated); toast.success('Producto actualizado')
    } else {
      const nuevo: IProduct = { id: 'prod_' + Date.now(), ...formData } as IProduct
      persist([...productos, nuevo]); toast.success('Producto creado')
    }
    setShowForm(false); setFormEdit(null)
  }
  const eliminar = (id: string) => { persist(productos.filter((p) => p.id !== id)); toast.success('Producto eliminado'); setConfirmDelete(null) }

  return (
    <div>
      <SEO title="Inventario" description="Gestión de inventario del restaurante" />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-espresso-800">Inventario</h1>
          <p className="text-steel text-sm mt-1">{filtrados.length} producto{filtrados.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={openCreate} className="flex items-center gap-2 bg-olive-500 hover:bg-olive-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm"><FaPlus size={12} /> Nuevo producto</button>
          <ExportButton data={filtrados.map((p) => ({ nombre: p.nombre, categoría: p.categoría, stock: p.stock || 0, estado: getStockStatus(p.stock || 0) }))} filename="inventario" columns={[{ key: 'nombre', label: 'Producto' }, { key: 'categoría', label: 'Categoría' }, { key: 'stock', label: 'Stock' }, { key: 'estado', label: 'Estado' }]} />
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total', value: stats.total, icon: FaBox, color: 'bg-olive-500' },
          { label: 'Agotados', value: stats.agotados, icon: FaTimesCircle, color: 'bg-red-500' },
          { label: 'Bajos', value: stats.bajos, icon: FaExclamationTriangle, color: 'bg-gold-500' },
          { label: 'Disponibles', value: stats.normales + stats.altos, icon: FaCheckCircle, color: 'bg-sage-500' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-4 border border-cream-200 flex items-center gap-3">
            <div className={`w-10 h-10 ${s.color} rounded-xl flex items-center justify-center`}><s.icon size={16} className="text-white" /></div>
            <div><p className="text-xl font-display font-bold text-espresso-800">{s.value}</p><p className="text-[10px] text-steel">{s.label}</p></div>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-steel/40" size={14} />
          <input type="text" value={busqueda} onChange={(e) => { setBusqueda(e.target.value); setPage(1) }} placeholder="Buscar producto..." className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-cream-200 bg-white text-sm text-espresso-800 placeholder:text-steel/40 focus:outline-none focus:ring-2 focus:ring-olive-500/20 focus:border-olive-400" />
        </div>
        <select value={filtroCategoria} onChange={(e) => { setFiltroCategoria(e.target.value); setPage(1) }} className="px-4 py-2.5 rounded-xl border border-cream-200 bg-white text-sm text-espresso-800 focus:outline-none focus:ring-2 focus:ring-olive-500/20">
          <option value="">Todas las categorías</option>
          {categorias.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {pagina.length === 0 ? (
        <EmptyState icon={<FaBox size={24} />} title="No hay productos" description="Crea tu primer producto" action={{ label: 'Nuevo producto', onClick: openCreate }} />
      ) : (
        <>
          <div className="bg-white rounded-2xl border border-cream-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="bg-cream-50 border-b border-cream-200">
                  <th className="p-3 text-left text-xs font-semibold text-espresso-700 uppercase">Producto</th>
                  <th className="p-3 text-left text-xs font-semibold text-espresso-700 uppercase hidden sm:table-cell">Categoría</th>
                  <th className="p-3 text-left text-xs font-semibold text-espresso-700 uppercase hidden md:table-cell">Precio</th>
                  <th className="p-3 text-center text-xs font-semibold text-espresso-700 uppercase">Stock</th>
                  <th className="p-3 text-center text-xs font-semibold text-espresso-700 uppercase">Estado</th>
                  <th className="p-3 text-center text-xs font-semibold text-espresso-700 uppercase">Acciones</th>
                </tr></thead>
                <tbody>
                  {pagina.map((p) => {
                    const stock = p.stock || 0; const status = getStockStatus(stock); const cfg = STATUS_CONFIG[status]; const Icon = cfg.icon; const isEd = editingId === p.id
                    return (
                      <tr key={p.id} className="border-t border-cream-100 hover:bg-cream-50/50 transition-colors">
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            {p.imagen ? <img src={p.imagen} alt={p.nombre} className="w-9 h-9 rounded-xl object-cover shrink-0" /> : <div className="w-9 h-9 bg-cream-100 rounded-xl flex items-center justify-center shrink-0"><FaBox size={14} className="text-cream-400" /></div>}
                            <div className="min-w-0"><p className="text-sm font-medium text-espresso-800 truncate max-w-[160px] sm:max-w-[200px]">{p.nombre}</p><p className="text-[11px] text-steel sm:hidden">{p.categoría} • ${Number(p.precio).toLocaleString('es-CO')}</p></div>
                          </div>
                        </td>
                        <td className="p-3 text-xs text-steel hidden sm:table-cell">{p.categoría || '—'}</td>
                        <td className="p-3 text-xs font-semibold text-espresso-800 hidden md:table-cell">${Number(p.precio).toLocaleString('es-CO')}</td>
                        <td className="p-3 text-center">
                          {isEd ? (
                            <input type="number" value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={() => finishEditing(p.id)} onKeyDown={(e) => handleKeyDown(e, p.id)} className="w-20 text-center text-sm font-bold border border-olive-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-olive-500" autoFocus min={0} />
                          ) : (
                            <button onClick={() => startEditing(p)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold text-espresso-800 hover:bg-cream-100 transition-all group" title="Click para editar">{stock}<FaEdit size={11} className="text-steel/40 group-hover:text-olive-500" /></button>
                          )}
                        </td>
                        <td className="p-3 text-center"><span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border ${cfg.color}`}><Icon size={10} /> {cfg.label}</span></td>
                        <td className="p-3"><div className="flex gap-1 justify-center">
                          <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg hover:bg-cream-100 transition-all" title="Editar"><FaEdit size={13} className="text-olive-600" /></button>
                          <button onClick={() => setConfirmDelete(p.id)} className="p-1.5 rounded-lg hover:bg-red-50 transition-all" title="Eliminar"><FaTrash size={13} className="text-red-400" /></button>
                        </div></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-espresso-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-cream-200 flex items-center justify-between">
              <h3 className="text-lg font-display font-bold text-espresso-800">{formEdit ? 'Editar producto' : 'Nuevo producto'}</h3>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-cream-100 rounded-xl text-steel"><FaTimes size={14} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div><label className="block text-xs font-semibold text-espresso-700 mb-1.5">Nombre *</label><input type="text" value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-cream-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-olive-500/20 focus:border-olive-400" placeholder="Ej: Bandeja Paisa" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-semibold text-espresso-700 mb-1.5">Categoría *</label><input type="text" value={formData.categoría} onChange={(e) => setFormData({ ...formData, categoría: e.target.value })} list="cat-list" className="w-full px-4 py-2.5 rounded-xl border border-cream-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-olive-500/20" placeholder="Ej: Platos fuertes" /><datalist id="cat-list">{categorias.map((c) => <option key={c} value={c} />)}</datalist></div>
                <div><label className="block text-xs font-semibold text-espresso-700 mb-1.5">Precio *</label><input type="number" min={0} value={formData.precio} onChange={(e) => setFormData({ ...formData, precio: Number(e.target.value) })} className="w-full px-4 py-2.5 rounded-xl border border-cream-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-olive-500/20" /></div>
                <div><label className="block text-xs font-semibold text-espresso-700 mb-1.5">Stock *</label><input type="number" min={0} value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })} className="w-full px-4 py-2.5 rounded-xl border border-cream-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-olive-500/20" /></div>
                <div><label className="block text-xs font-semibold text-espresso-700 mb-1.5">Tiempo (min)</label><input type="number" min={0} value={(formData as any).tiempoPreparacion || ''} onChange={(e) => setFormData({ ...formData, tiempoPreparacion: Number(e.target.value) } as any)} className="w-full px-4 py-2.5 rounded-xl border border-cream-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-olive-500/20" /></div>
              </div>
              <div><label className="block text-xs font-semibold text-espresso-700 mb-1.5">Imagen URL</label><input type="text" value={formData.imagen} onChange={(e) => setFormData({ ...formData, imagen: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-cream-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-olive-500/20" placeholder="https://..." /></div>
              <div><label className="block text-xs font-semibold text-espresso-700 mb-1.5">Descripción</label><textarea value={formData.descripcion} onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })} rows={3} className="w-full px-4 py-2.5 rounded-xl border border-cream-200 bg-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-olive-500/20" placeholder="Describe el producto..." /></div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowForm(false)} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium border border-cream-200 text-espresso-600 hover:bg-cream-50">Cancelar</button>
                <button onClick={submitForm} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold bg-olive-500 hover:bg-olive-600 text-white shadow-sm">{formEdit ? 'Guardar' : 'Crear'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
      <ConfirmModal open={!!confirmDelete} onClose={() => setConfirmDelete(null)} onConfirm={() => confirmDelete && eliminar(confirmDelete)} title="Eliminar producto" message="¿Eliminar este producto del inventario?" confirmText="Eliminar" variant="danger" />
    </div>
  )
}
