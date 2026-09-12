import { useState, useMemo, useEffect } from 'react'
import { toast } from 'sonner'
import { FaSearch, FaPlus, FaEdit, FaTrash, FaTags, FaFolder, FaBox, FaClipboardList } from 'react-icons/fa'
import EmptyState from '../components/core/EmptyState'
import { ProductForm } from '../components/admin/ProductForm'
import { Pagination } from '../components/admin/Pagination'
import ConfirmModal from '../components/core/ConfirmModal'
import { ExportButton } from '../components/admin/ExportButton'
import { PageHeader } from '../components/admin/PageHeader'
import type { IProduct } from '../types/product'
import { dataService } from '../lib/dataService'
import { SEO } from '../lib/seo'

type Tab = 'productos' | 'inventario' | 'categorias'

export default function AdminCatalogo() {
  const [tab, setTab] = useState<Tab>('productos')
  const [productos, setProductos] = useState<IProduct[]>(() => {
    try { return JSON.parse(localStorage.getItem('productos') || '[]') } catch { return [] }
  })
  const [busqueda, setBusqueda] = useState('')
  const [filtroCat, setFiltroCat] = useState('')
  const [page, setPage] = useState(1)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<IProduct | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  // categorias
  const [categorias, setCategorias] = useState<string[]>(() => {
    try {
      const s = localStorage.getItem('categorias')
      if (s) return JSON.parse(s)
      const fromProds = [...new Set(productos.map(p=> (p as any)['categoría']).filter(Boolean))] as string[]
      localStorage.setItem('categorias', JSON.stringify(fromProds))
      return fromProds
    } catch { return [] }
  })
  const [catBusqueda, setCatBusqueda] = useState('')
  const [catForm, setCatForm] = useState('')
  const [catEditing, setCatEditing] = useState<string | null>(null)
  const [showCatForm, setShowCatForm] = useState(false)
  useEffect(()=>{ const h=window.location.hash.replace('#',''); if(h==='inventario'||h==='stock') setTab('inventario'); else if(h==='categorias') setTab('categorias'); else if(h==='productos') setTab('productos') },[])

  const categoriasList = useMemo(() => [...new Set(productos.map(p=> (p as any)['categoría']).filter(Boolean))] as string[], [productos])
  const filtrados = useMemo(() => productos.filter(p=>{
    if(filtroCat && (p as any)['categoría']!==filtroCat) return false
    if(busqueda){ const b=busqueda.toLowerCase(); return p.nombre?.toLowerCase().includes(b) || p.descripcion?.toLowerCase().includes(b)}
    return true
  }), [productos, filtroCat, busqueda])
  const totalPages = Math.ceil(filtrados.length / 8)
  const pagina = filtrados.slice((page-1)*8, page*8)

  const saveProducto = (data: Omit<IProduct,'id'>) => {
    if(editing){
      const u = productos.map(p=> p.id===editing.id ? {...data, id: editing.id} as IProduct : p)
      setProductos(u); localStorage.setItem('productos', JSON.stringify(u)); toast.success('Producto actualizado')
    } else {
      const np = {...data, id:`prod-${Date.now().toString(36)}`} as IProduct
      const u = [...productos, np]
      setProductos(u); localStorage.setItem('productos', JSON.stringify(u)); toast.success('Producto creado')
    }
    setShowForm(false); setEditing(null)
  }
  const eliminarProducto = (id:string) => {
    const u = productos.filter(p=> p.id!==id)
    setProductos(u); localStorage.setItem('productos', JSON.stringify(u)); toast.success('Producto eliminado'); setSelectedIds(s=>{ const n=new Set(s); n.delete(id); return n})
  }
  const toggleSelect = (id:string) => setSelectedIds(s=>{ const n=new Set(s); if(n.has(id)) n.delete(id); else n.add(id); return n})
  const bulkDelete = () => {
    const u = productos.filter(p=> !selectedIds.has(p.id))
    setProductos(u); localStorage.setItem('productos', JSON.stringify(u)); toast.success(`${selectedIds.size} eliminados`); setSelectedIds(new Set())
  }

  // categorias helpers
  const saveCat = () => {
    const v=catForm.trim(); if(!v) return toast.error('Nombre requerido')
    if(catEditing){
      if(v!==catEditing && categorias.includes(v)) return toast.error('Ya existe')
      const u=categorias.map(c=> c===catEditing? v:c)
      setCategorias(u); localStorage.setItem('categorias', JSON.stringify(u)); toast.success('Categoría actualizada')
    } else {
      if(categorias.includes(v)) return toast.error('Ya existe')
      const u=[...categorias, v]; setCategorias(u); localStorage.setItem('categorias', JSON.stringify(u)); toast.success('Categoría creada')
    }
    setShowCatForm(false); setCatEditing(null); setCatForm('')
  }
  const deleteCat = (cat:string) => {
    const count=productos.filter(p=> (p as any)['categoría']===cat).length
    if(count>0) return toast.error(`No se puede: ${count} productos usan esta categoría`)
    const u=categorias.filter(c=> c!==cat); setCategorias(u); localStorage.setItem('categorias', JSON.stringify(u)); toast.success('Categoría eliminada')
  }

  const catFiltradas = useMemo(()=> !catBusqueda ? categorias : categorias.filter(c=> c.toLowerCase().includes(catBusqueda.toLowerCase())), [categorias, catBusqueda])

  // Stock inline editing — single source of truth (same 'productos' key as AdminInventario)
  const [editingStockId, setEditingStockId] = useState<string | null>(null)
  const [editStockValue, setEditStockValue] = useState('')
  const saveStock = (id: string, n: number) => {
    const v = Math.max(0, Math.floor(n))
    const u = productos.map(p=> p.id===id ? {...p, stock: v} as IProduct : p)
    setProductos(u); localStorage.setItem('productos', JSON.stringify(u)); toast.success('Stock actualizado')
  }

  return (
    <div>
      <SEO title="Catálogo" />
      <PageHeader kicker="MENÚ / CATÁLOGO" title="Catálogo" description="Productos, stock e categorías — un solo lugar para gestionar el menú. Cambios impactan sitio, galería y categorías." actions={
        tab==='productos' ? <button onClick={()=>{setEditing(null); setShowForm(true)}} className="inline-flex items-center gap-1.5 bg-[#0F172A] text-white px-4 py-2 rounded-md text-[13px] font-medium hover:bg-[#1E293B]"><FaPlus size={11}/> Nuevo producto</button>
        : tab==='categorias' ? <button onClick={()=>{setCatEditing(null); setCatForm(''); setShowCatForm(true)}} className="inline-flex items-center gap-1.5 bg-[#0F172A] text-white px-4 py-2 rounded-md text-[13px] font-medium hover:bg-[#1E293B]"><FaPlus size={11}/> Nueva categoría</button>
        : undefined
      } />
      <div className="flex gap-1.5 mb-4 border-b border-[#E5E7EB] pb-3">
        {[
          {id:'productos', label:'Productos', icon: FaBox, count: productos.length},
          {id:'inventario', label:'Stock', icon: FaClipboardList, count: productos.filter(p=> (p.stock||0)<=5).length},
          {id:'categorias', label:'Categorías', icon: FaTags, count: categorias.length},
        ].map(t=> (
          <button key={t.id} onClick={()=> setTab(t.id as Tab)} className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${tab===t.id ? 'bg-[#0F172A] text-white border-[#0F172A]' : 'bg-white text-[#475569] border-[#E5E7EB] hover:bg-[#F8FAFC]'}`}>
            <t.icon size={11}/> {t.label} <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${tab===t.id ? 'bg-white/15 text-white' : 'bg-[#F1F5F9] text-[#475569] border border-[#E5E7EB]'}`}>{t.count}</span>
          </button>
        ))}
      </div>

      {tab==='productos' && (
        <>
          <div className="flex flex-col sm:flex-row gap-3 mb-3">
            <div className="relative flex-1"><FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={12}/><input value={busqueda} onChange={e=>{setBusqueda(e.target.value); setPage(1)}} placeholder="Buscar por nombre…" className="w-full pl-9 pr-3 py-2 rounded-md border border-[#E5E7EB] bg-white text-[13px] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#94A3B8]" /></div>
            <select value={filtroCat} onChange={e=>{setFiltroCat(e.target.value); setPage(1)}} className="px-3 py-2 rounded-md border border-[#E5E7EB] bg-white text-[13px]"><option value="">Todas las categorías</option>{categoriasList.map(c=> <option key={c} value={c}>{c}</option>)}</select>
            <ExportButton data={filtrados} filename="catalogo-productos" columns={[{key:'nombre',label:'Nombre'},{key:'categoría',label:'Categoría'},{key:'precio',label:'Precio'}]} />
          </div>
          {selectedIds.size>0 && (
            <div className="flex items-center gap-2 px-3 py-2 bg-[#0F172A] text-white rounded-md mb-3 text-[13px]"><span>{selectedIds.size} seleccionados</span><span className="flex-1"/><button onClick={bulkDelete} className="px-3 py-1 rounded-md bg-[#DC2626] text-xs font-medium">Eliminar</button><button onClick={()=> setSelectedIds(new Set())} className="px-2 py-1 rounded-md bg-white/10 text-xs">Limpiar</button></div>
          )}
          {pagina.length===0 ? <EmptyState icon={<FaBox size={20}/>} title="Sin productos" description="Crea tu primer producto" action={{label:'Nuevo producto', onClick:()=> setShowForm(true)}} /> : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {pagina.map(p=> (
                  <div key={p.id} className={`bg-white border rounded-md overflow-hidden ${selectedIds.has(p.id) ? 'border-[#0F172A] ring-1 ring-[#0F172A]' : 'border-[#E5E7EB] hover:border-[#CBD5E1]'}`}>
                    <div className="relative aspect-[4/3] bg-[#F8FAFC]"><input type="checkbox" checked={selectedIds.has(p.id)} onChange={()=> toggleSelect(p.id)} className="absolute top-2 left-2 w-4 h-4 rounded border-[#CBD5E1] z-10"/><img src={p.imagen} alt={p.nombre} className="w-full h-full object-cover" /></div>
                    <div className="p-3"><p className="text-[13px] font-medium text-[#0F172A] truncate">{p.nombre}</p><p className="text-xs text-[#64748B] truncate">{(p as any)['categoría']||'—'} · <span className={(p.stock||0)<=5 ? 'text-[#DC2626]' : 'text-[#475569]'}>{p.stock||0} uds</span></p><div className="flex items-center justify-between mt-2"><span className="text-sm font-semibold" data-numeric>${Number(p.precio).toLocaleString('es-CO')}</span><div className="flex gap-1"><button onClick={()=>{setEditing(p); setShowForm(true)}} className="w-7 h-7 rounded-md border border-[#E5E7EB] flex items-center justify-center hover:bg-[#F8FAFC]"><FaEdit size={11} className="text-[#475569]"/></button><button onClick={()=> setConfirmDelete(p.id)} className="w-7 h-7 rounded-md border border-[#E5E7EB] flex items-center justify-center hover:bg-[#FEF2F2]"><FaTrash size={11} className="text-[#DC2626]"/></button></div></div></div>
                  </div>
                ))}
              </div>
              <div className="mt-4"><Pagination page={page} totalPages={totalPages} onPageChange={setPage} /></div>
            </>
          )}
        </>
      )}

      {tab==='inventario' && (
        <div className="bg-white border border-[#E5E7EB] rounded-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#F8FAFC] border-b border-[#E5E7EB]"><tr><th className="px-3 py-2 text-left text-[11px] font-semibold tracking-widest uppercase text-[#64748B]">Producto</th><th className="px-3 py-2 text-left text-[11px] font-semibold tracking-widest uppercase text-[#64748B] hidden sm:table-cell">Categoría</th><th className="px-3 py-2 text-center text-[11px] font-semibold tracking-widest uppercase text-[#64748B]">Stock</th><th className="px-3 py-2 text-center text-[11px] font-semibold tracking-widest uppercase text-[#64748B]">Estado</th></tr></thead>
              <tbody>
                {filtrados.slice(0,20).map(p=> {
                  const s=p.stock||0; const st = s<=0? 'Agotado': s<=5? 'Bajo':'OK'; const cls = s<=0? 'bg-[#FEF2F2] text-[#991B1B] border-[#FECACA]': s<=5? 'bg-[#FFFBEB] text-[#92400E] border-[#FDE68A]':'bg-[#ECFDF5] text-[#065F46] border-[#A7F3D0]'
                  const isEd = editingStockId===p.id
                  return <tr key={p.id} className="border-t border-[#F1F5F9] hover:bg-[#F8FAFC]"><td className="px-3 py-2.5 text-[13px] text-[#0F172A] flex items-center gap-2"><img src={p.imagen} alt="" className="w-7 h-7 rounded-md object-cover border border-[#E5E7EB]"/>{p.nombre}</td><td className="px-3 py-2.5 text-xs text-[#64748B] hidden sm:table-cell">{(p as any)['categoría']||'—'}</td><td className="px-3 py-2.5 text-center">
                    {isEd ? <input autoFocus type="number" min={0} value={editStockValue} onChange={e=> setEditStockValue(e.target.value)} onBlur={()=>{ const n=parseInt(editStockValue,10); if(!isNaN(n)) saveStock(p.id, n); setEditingStockId(null)}} onKeyDown={e=>{ if(e.key==='Enter'){ const n=parseInt(editStockValue,10); if(!isNaN(n)) saveStock(p.id, n); setEditingStockId(null)} else if(e.key==='Escape') setEditingStockId(null)}} className="w-20 text-center text-sm font-bold border border-[#0F172A] rounded-md px-2 py-1 focus:outline-none" />
                    : <button onClick={()=>{ setEditingStockId(p.id); setEditStockValue(String(s))}} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-sm font-bold text-[#0F172A] hover:bg-[#F1F5F9] border border-transparent hover:border-[#E5E7EB]" title="Click para editar">{s} <FaEdit size={10} className="text-[#94A3B8]"/></button>}
                  </td><td className="px-3 py-2.5 text-center"><span className={`px-2 py-1 rounded-full text-[11px] font-medium border ${cls}`}>{st}</span></td></tr>
                })}
              </tbody>
            </table>
          </div>
          <div className="px-3 py-2 bg-[#ECFDF5] border-t border-[#A7F3D0] text-xs text-[#065F46]">Fuente única: <code className="bg-white px-1 rounded border">productos::stock</code> · mismo storage que Inventario · edición inline (Enter/blur guarda).</div>
        </div>
      )}

      {tab==='categorias' && (
        <>
          <div className="flex gap-3 mb-3"><div className="relative flex-1"><FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={12}/><input value={catBusqueda} onChange={e=> setCatBusqueda(e.target.value)} placeholder="Buscar categoría…" className="w-full pl-9 pr-3 py-2 rounded-md border border-[#E5E7EB] bg-white text-[13px]" /></div></div>
          <div className="bg-white border border-[#E5E7EB] rounded-md overflow-hidden">
            <table className="w-full"><thead className="bg-[#F8FAFC] border-b border-[#E5E7EB]"><tr><th className="px-3 py-2 text-left text-[11px] font-semibold tracking-widest uppercase text-[#64748B]">Categoría</th><th className="px-3 py-2 text-center text-[11px] font-semibold tracking-widest uppercase text-[#64748B]">Productos</th><th className="px-3 py-2 text-right text-[11px] font-semibold tracking-widest uppercase text-[#64748B]">Acciones</th></tr></thead>
              <tbody>
                {catFiltradas.map(cat=> {
                  const count=productos.filter(p=> (p as any)['categoría']===cat).length
                  return <tr key={cat} className="border-t border-[#F1F5F9] hover:bg-[#F8FAFC]"><td className="px-3 py-2.5 text-[13px] text-[#0F172A] flex items-center gap-2"><span className="w-7 h-7 rounded-md bg-[#F8FAFC] border border-[#E5E7EB] flex items-center justify-center"><FaFolder size={12} className="text-[#94A3B8]"/></span>{cat}</td><td className="px-3 py-2.5 text-center text-xs font-medium">{count}</td><td className="px-3 py-2.5 text-right"><div className="inline-flex gap-1"><button onClick={()=>{setCatEditing(cat); setCatForm(cat); setShowCatForm(true)}} className="w-7 h-7 rounded-md border border-[#E5E7EB] flex items-center justify-center hover:bg-[#F8FAFC]"><FaEdit size={11}/></button><button onClick={()=> {if(confirm(`Eliminar "${cat}"?`)) deleteCat(cat)}} className="w-7 h-7 rounded-md border border-[#E5E7EB] flex items-center justify-center hover:bg-[#FEF2F2]"><FaTrash size={11} className="text-[#DC2626]"/></button></div></td></tr>
                })}
                {catFiltradas.length===0 && <tr><td colSpan={3} className="px-3 py-8 text-center text-sm text-[#94A3B8]">Sin categorías</td></tr>}
              </tbody>
            </table>
          </div>
        </>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-sm flex items-center justify-center z-50 p-3" onClick={()=>{setShowForm(false); setEditing(null)}}>
          <div className="bg-white rounded-xl w-full max-w-xl max-h-[85vh] flex flex-col shadow-xl" onClick={e=> e.stopPropagation()}>
            <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center justify-between shrink-0"><h3 className="text-sm font-semibold text-[#0F172A]">{editing?'Editar':'Nuevo'} producto</h3><button onClick={()=>{setShowForm(false); setEditing(null)}} className="w-7 h-7 rounded-md hover:bg-[#F1F5F9] flex items-center justify-center text-[#64748B]">✕</button></div>
            <div className="p-4 overflow-y-auto"><ProductForm initialData={editing||undefined} categorias={categorias} onSubmit={saveProducto} onCancel={()=>{setShowForm(false); setEditing(null)}} /></div>
          </div>
        </div>
      )}
      {showCatForm && (
        <div className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={()=> setShowCatForm(false)}>
          <div className="bg-white rounded-md w-full max-w-sm shadow-xl" onClick={e=> e.stopPropagation()}>
            <div className="p-4 border-b border-[#E5E7EB] flex items-center justify-between"><h3 className="text-sm font-semibold">{catEditing?'Editar':'Nueva'} categoría</h3><button onClick={()=> setShowCatForm(false)} className="w-7 h-7 rounded-md hover:bg-[#F1F5F9] flex items-center justify-center">✕</button></div>
            <div className="p-4 space-y-3"><input value={catForm} onChange={e=> setCatForm(e.target.value)} placeholder="Ej: Bebidas" className="w-full px-3 py-2 rounded-md border border-[#E5E7EB] text-sm" /><div className="flex gap-2 justify-end"><button onClick={()=> setShowCatForm(false)} className="px-3 py-2 rounded-md border border-[#E5E7EB] text-sm">Cancelar</button><button onClick={saveCat} className="px-4 py-2 rounded-md bg-[#0F172A] text-white text-sm font-medium">Guardar</button></div></div>
          </div>
        </div>
      )}
      <ConfirmModal open={!!confirmDelete} onClose={()=> setConfirmDelete(null)} onConfirm={()=> confirmDelete && eliminarProducto(confirmDelete)} title="Eliminar producto" message="¿Eliminar este producto? No se puede deshacer." confirmText="Eliminar" variant="danger" />
    </div>
  )
}
