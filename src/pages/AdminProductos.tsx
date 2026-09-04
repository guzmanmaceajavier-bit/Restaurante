import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import { FaSearch, FaPlus, FaEdit, FaTrash, FaFilter, FaTimes, FaImage } from 'react-icons/fa'
import { ProductForm } from '../components/admin/ProductForm'
import { Pagination } from '../components/admin/Pagination'
import ConfirmModal from '../components/core/ConfirmModal'
import type { IProduct } from '../types/product'

const ITEMS_PER_PAGE = 8

export default function AdminProductos() {
  const [productos, setProductos] = useState<IProduct[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('productos') || '[]')
    } catch {
      return []
    }
  })
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<IProduct | null>(null)
  const [busqueda, setBusqueda] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState('')
  const [page, setPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const categorias = useMemo(() => {
    const cats = new Set(productos.map((p) => p['categoría']).filter(Boolean))
    return Array.from(cats) as string[]
  }, [productos])

  const filtrados = useMemo(() => {
    return productos.filter((p) => {
      if (filtroCategoria && p['categoría'] !== filtroCategoria) return false
      if (busqueda) {
        const b = busqueda.toLowerCase()
        return p.nombre?.toLowerCase().includes(b) || p.descripcion?.toLowerCase().includes(b)
      }
      return true
    })
  }, [productos, busqueda, filtroCategoria])

  const totalPages = Math.ceil(filtrados.length / ITEMS_PER_PAGE)
  const pagina = filtrados.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  const save = (data: Omit<IProduct, 'id'>) => {
    if (editing) {
      const updated = productos.map((p) => p.id === editing.id ? { ...data, id: editing.id } : p) as IProduct[]
      setProductos(updated); localStorage.setItem('productos', JSON.stringify(updated)); toast.success('Producto actualizado')
    } else {
      const newProduct = { ...data, id: `prod-${Date.now().toString(36)}` } as IProduct
      const updated = [...productos, newProduct]
      setProductos(updated); localStorage.setItem('productos', JSON.stringify(updated)); toast.success('Producto creado')
    }
    setShowForm(false); setEditing(null)
  }

  const eliminar = (id: string) => {
    const updated = productos.filter((p) => p.id !== id)
    setProductos(updated); localStorage.setItem('productos', JSON.stringify(updated)); toast.success('Producto eliminado')
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-espresso-800">Productos</h1>
          <p className="text-steel text-sm mt-1">{filtrados.length} producto{filtrados.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowFilters(!showFilters)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border ${showFilters ? 'bg-olive-50 border-olive-200 text-olive-700' : 'bg-white border-cream-200 text-espresso-600 hover:bg-cream-50'}`}>
            <FaFilter size={12} /> Filtros {(filtroCategoria || busqueda) && <span className="w-2 h-2 bg-olive-500 rounded-full" />}
          </button>
          <button onClick={() => { setEditing(null); setShowForm(true) }} className="flex items-center gap-2 bg-olive-500 hover:bg-olive-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm shadow-olive-500/20">
            <FaPlus size={13} /> Nuevo producto
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="bg-white rounded-2xl border border-cream-200 p-4 mb-4 flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-steel/40" size={14} />
            <input type="text" value={busqueda} onChange={(e) => { setBusqueda(e.target.value); setPage(1) }} placeholder="Buscar por nombre..." className="input-base pl-11 text-sm" />
          </div>
          <select value={filtroCategoria} onChange={(e) => { setFiltroCategoria(e.target.value); setPage(1) }} className="input-base text-sm w-auto">
            <option value="">Todas las categorías</option>
            {categorias.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <button onClick={() => { setBusqueda(''); setFiltroCategoria(''); setPage(1) }} className="text-xs text-steel hover:text-espresso-600 px-3">
            <FaTimes size={12} />
          </button>
        </div>
      )}

      {pagina.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 text-center border border-cream-200">
          <FaImage className="text-cream-300 mx-auto mb-3" size={40} />
          <p className="text-lg font-display font-bold text-espresso-800 mb-1">No hay productos</p>
          <p className="text-sm text-steel mb-4">Crea tu primer producto para comenzar.</p>
          <button onClick={() => { setEditing(null); setShowForm(true) }} className="btn-primary text-sm py-2.5">
            <FaPlus size={13} className="inline mr-2" /> Crear producto
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {pagina.map((p) => (
              <div key={p.id} className="bg-white rounded-2xl border border-cream-200 overflow-hidden hover:shadow-lift transition-all group">
                <div className="relative aspect-[4/3] bg-cream-100">
                  {p.imagen ? (
                    <img src={p.imagen} alt={p.nombre} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><FaImage className="text-cream-300" size={32} /></div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100 gap-2">
                    <button onClick={() => { setEditing(p); setShowForm(true) }} className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-lg hover:scale-110 transition-all">
                      <FaEdit size={13} className="text-olive-600" />
                    </button>
                    <button onClick={() => setConfirmDelete(p.id)} className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-lg hover:scale-110 transition-all">
                      <FaTrash size={13} className="text-red-500" />
                    </button>
                  </div>
                </div>
                <div className="p-3">
                  <h4 className="text-sm font-semibold text-espresso-800 truncate">{p.nombre}</h4>
                  <p className="text-xs text-steel truncate mt-0.5">{p['categoría'] || 'Sin categoría'}</p>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-olive-600 font-bold text-sm">${Number(p.precio).toLocaleString('es-CO')}</p>
                    {p.stock !== undefined && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${p.stock > 0 ? 'bg-sage-50 text-sage-700' : 'bg-red-50 text-red-700'}`}>
                        {p.stock > 0 ? `${p.stock} uds` : 'Agotado'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-espresso-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto" onClick={() => { setShowForm(false); setEditing(null) }}>
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-xl my-8" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-cream-200 flex items-center justify-between">
              <h3 className="text-lg font-display font-bold text-espresso-800">{editing ? 'Editar producto' : 'Nuevo producto'}</h3>
              <button onClick={() => { setShowForm(false); setEditing(null) }} className="p-2 hover:bg-cream-100 rounded-xl text-steel">✕</button>
            </div>
            <div className="p-6">
              <ProductForm initialData={editing || undefined} categorias={categorias} onSubmit={save} onCancel={() => { setShowForm(false); setEditing(null) }} />
            </div>
          </div>
        </div>
      )}
      <ConfirmModal
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => { if (confirmDelete) eliminar(confirmDelete) }}
        title="Eliminar producto"
        message="¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        variant="danger"
      />
    </div>
  )
}
