import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import { FaSearch, FaPlus, FaEdit, FaTrash, FaFilter, FaTimes, FaImage } from 'react-icons/fa'
import EmptyState from '../components/core/EmptyState'
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
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

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
    setSelectedIds(s=> { const n=new Set(s); n.delete(id); return n })
  }
  const toggleSelect = (id:string) => setSelectedIds(s=> { const n=new Set(s); if(n.has(id)) n.delete(id); else n.add(id); return n })
  const toggleAll = () => setSelectedIds(s=> s.size===pagina.length ? new Set() : new Set(pagina.map(p=>p.id)))
  const bulkDelete = () => {
    if(selectedIds.size===0) return
    const updated = productos.filter(p=> !selectedIds.has(p.id))
    setProductos(updated); localStorage.setItem('productos', JSON.stringify(updated)); toast.success(`${selectedIds.size} productos eliminados`); setSelectedIds(new Set())
  }
  const bulkExport = () => {
    const data = productos.filter(p=> selectedIds.has(p.id))
    const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='productos-seleccionados.json'; a.click(); URL.revokeObjectURL(url)
    toast.success('Exportados '+data.length)
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div>
          <p className="text-[11px] font-medium tracking-widest uppercase text-[#94A3B8]">MENÚ / PRODUCTOS</p>
          <h1 className="text-[18px] font-semibold tracking-tight text-[#0F172A] mt-1">Productos</h1>
          <p className="text-[13px] text-[#64748B] mt-1">{filtrados.length} productos · Catálogo administrativo</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowFilters(!showFilters)} className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-[13px] font-medium border ${showFilters ? 'bg-[#F8FAFC] border-[#CBD5E1] text-[#0F172A]' : 'bg-white border-[#E5E7EB] text-[#475569] hover:bg-[#F8FAFC]'}`}>
            <FaFilter size={11} /> Filtros {(filtroCategoria || busqueda) && <span className="w-1.5 h-1.5 bg-[#B45309] rounded-full" />}
          </button>
          <button onClick={() => { setEditing(null); setShowForm(true) }} className="inline-flex items-center gap-1.5 bg-[#0F172A] hover:bg-[#1E293B] text-white px-4 py-2 rounded-md text-[13px] font-medium">
            <FaPlus size={11} /> Nuevo producto
          </button>
        </div>
      </div>
      {selectedIds.size>0 && (
        <div className="flex items-center gap-2 px-3 py-2 bg-[#0F172A] text-white rounded-md mb-3 text-[13px]">
          <span className="font-medium">{selectedIds.size} seleccionados</span>
          <span className="flex-1" />
          <button onClick={bulkExport} className="px-3 py-1 rounded-md bg-white/10 hover:bg-white/20 text-xs font-medium">Exportar</button>
          <button onClick={bulkDelete} className="px-3 py-1 rounded-md bg-[#DC2626] hover:bg-[#B91C1C] text-xs font-medium">Eliminar</button>
          <button onClick={()=> setSelectedIds(new Set())} className="px-2 py-1 rounded-md hover:bg-white/10"><FaTimes size={11}/></button>
        </div>
      )}

      {showFilters && (
        <div className="bg-white border border-[#E5E7EB] rounded-md p-3 mb-3 flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={12} />
            <input type="text" value={busqueda} onChange={(e) => { setBusqueda(e.target.value); setPage(1) }} placeholder="Buscar por nombre…" className="w-full pl-9 pr-3 py-2 rounded-md border border-[#E5E7EB] bg-[#F8FAFC] text-[13px] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#94A3B8] focus:bg-white" />
          </div>
          <select value={filtroCategoria} onChange={(e) => { setFiltroCategoria(e.target.value); setPage(1) }} className="px-3 py-2 rounded-md border border-[#E5E7EB] bg-white text-[13px]">
            <option value="">Todas las categorías</option>
            {categorias.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <button onClick={() => { setBusqueda(''); setFiltroCategoria(''); setPage(1) }} className="text-xs text-[#64748B] hover:text-[#0F172A] px-3">
            <FaTimes size={11} />
          </button>
        </div>
      )}

      {pagina.length === 0 ? (
        <EmptyState icon={<FaImage size={24} />} title="No hay productos" description="Crea tu primer producto para comenzar" action={{ label: 'Crear producto', onClick: () => setShowForm(true) }} />
      ) : (
        <>
          <div className="flex items-center gap-2 mb-2 text-[13px]">
            <label className="inline-flex items-center gap-2 text-[#475569]"><input type="checkbox" checked={pagina.length>0 && selectedIds.size===pagina.length} onChange={toggleAll} className="rounded border-[#CBD5E1]" /> Seleccionar página</label>
            <span className="text-[#94A3B8]">· {filtrados.length} productos</span>
            <button onClick={()=> { const inv=document.getElementById('prod-view-toggle'); if(inv) inv.click() }} className="ml-auto text-xs text-[#64748B] hover:text-[#0F172A] hidden">Toggle</button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {pagina.map((p) => (
              <div key={p.id} className={`bg-white border rounded-md overflow-hidden group ${selectedIds.has(p.id) ? 'border-[#0F172A] ring-1 ring-[#0F172A]' : 'border-[#E5E7EB] hover:border-[#CBD5E1]'}`}>
                <div className="relative aspect-[4/3] bg-[#F8FAFC]">
                  <input type="checkbox" checked={selectedIds.has(p.id)} onChange={()=> toggleSelect(p.id)} className="absolute top-2 left-2 w-4 h-4 rounded border-[#CBD5E1] z-10" onClick={e=> e.stopPropagation()} />
                  {p.imagen ? (
                    <img src={p.imagen} alt={p.nombre} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><FaImage className="text-[#CBD5E1]" size={28} /></div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100 gap-2">
                    <button onClick={() => { setEditing(p); setShowForm(true) }} className="w-8 h-8 bg-white rounded-md flex items-center justify-center shadow hover:scale-105 transition-transform">
                      <FaEdit size={12} className="text-[#334155]" />
                    </button>
                    <button onClick={() => setConfirmDelete(p.id)} className="w-8 h-8 bg-white rounded-md flex items-center justify-center shadow hover:scale-105 transition-transform">
                      <FaTrash size={12} className="text-[#DC2626]" />
                    </button>
                  </div>
                </div>
                <div className="p-3">
                  <h4 className="text-[13px] font-medium text-[#0F172A] truncate">{p.nombre}</h4>
                  <p className="text-xs text-[#64748B] truncate mt-0.5">{p['categoría'] || 'Sin categoría'}</p>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-[#0F172A] font-semibold text-[13px]" data-numeric>${Number(p.precio).toLocaleString('es-CO')}</p>
                    {p.stock !== undefined && (
                      <span className={`text-[11px] px-1.5 py-0.5 rounded font-medium border ${p.stock > 0 ? 'bg-[#F8FAFC] text-[#475569] border-[#E5E7EB]' : 'bg-[#FEF2F2] text-[#991B1B] border-[#FECACA]'}`}>
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
