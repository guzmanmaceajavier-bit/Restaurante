import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import { FaSearch, FaPlus, FaEdit, FaTrash, FaTags, FaFolder } from 'react-icons/fa'
import EmptyState from '../components/core/EmptyState'
import { Pagination } from '../components/admin/Pagination'
import ConfirmModal from '../components/core/ConfirmModal'
import { ExportButton } from '../components/admin/ExportButton'
import { dataService } from '../lib/dataService'
import { SEO } from '../lib/seo'

const ITEMS_PER_PAGE = 10

export default function AdminCategorias() {
  const [categorias, setCategorias] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('categorias')
      if (stored) return JSON.parse(stored)
      const fromProducts = dataService.getCategorias()
      localStorage.setItem('categorias', JSON.stringify(fromProducts))
      return fromProducts
    } catch {
      return []
    }
  })
  const [busqueda, setBusqueda] = useState('')
  const [page, setPage] = useState(1)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<string | null>(null)
  const [formValue, setFormValue] = useState('')
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const productos = useMemo(() => dataService.getProductos(), [categorias])

  const getProductCount = (cat: string) =>
    productos.filter((p) => p['categoría'] === cat).length

  const filtrados = useMemo(() => {
    if (!busqueda) return categorias
    const b = busqueda.toLowerCase()
    return categorias.filter((c) => c.toLowerCase().includes(b))
  }, [categorias, busqueda])

  const totalPages = Math.ceil(filtrados.length / ITEMS_PER_PAGE)
  const pagina = filtrados.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  const save = () => {
    const trimmed = formValue.trim()
    if (!trimmed) { toast.error('El nombre es requerido'); return }
    if (trimmed.length > 50) { toast.error('Máximo 50 caracteres'); return }

    if (editing) {
      if (trimmed !== editing && categorias.includes(trimmed)) { toast.error('Categoría ya existe'); return }
      const updated = categorias.map((c) => c === editing ? trimmed : c)
      setCategorias(updated); localStorage.setItem('categorias', JSON.stringify(updated))
      toast.success('Categoría actualizada')
    } else {
      if (categorias.includes(trimmed)) { toast.error('Categoría ya existe'); return }
      const updated = [...categorias, trimmed]
      setCategorias(updated); localStorage.setItem('categorias', JSON.stringify(updated))
      toast.success('Categoría creada')
    }
    setShowForm(false); setEditing(null); setFormValue('')
  }

  const eliminar = (cat: string) => {
    const count = getProductCount(cat)
    if (count > 0) { toast.error(`No se puede eliminar: ${count} producto${count !== 1 ? 's' : ''} usa${count === 1 ? '' : 'n'} esta categoría`); return }
    const updated = categorias.filter((c) => c !== cat)
    setCategorias(updated); localStorage.setItem('categorias', JSON.stringify(updated))
    toast.success('Categoría eliminada')
  }

  const openEdit = (cat: string) => { setEditing(cat); setFormValue(cat); setShowForm(true) }
  const openNew = () => { setEditing(null); setFormValue(''); setShowForm(true) }
  const closeModal = () => { setShowForm(false); setEditing(null); setFormValue('') }

  return (
    <div className="min-h-screen bg-cream-50">
      <SEO title="Admin - Categorías" />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-espresso-800">Categorías</h1>
          <p className="text-steel text-sm mt-1">{filtrados.length} categor{filtrados.length !== 1 ? 'ías' : 'ía'}</p>
        </div>
        <div className="flex items-center gap-3">
          <ExportButton data={filtrados.map((c) => ({ nombre: c, productos: getProductCount(c) }))} filename="categorias" columns={[
            { key: 'nombre', label: 'Nombre' }, { key: 'productos', label: 'Productos' }
          ]} />
          <div className="relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-steel/40" size={14} />
            <input type="text" value={busqueda} onChange={(e) => { setBusqueda(e.target.value); setPage(1) }} placeholder="Buscar..." className="input-base pl-11 text-sm w-64" />
          </div>
          <button onClick={openNew} className="flex items-center gap-2 bg-olive-500 hover:bg-olive-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm shadow-olive-500/20">
            <FaPlus size={13} /> Nueva categoría
          </button>
        </div>
      </div>

      {pagina.length === 0 ? (
        <EmptyState icon={<FaTags size={24} />} title="No hay categorías" description="Crea tu primera categoría para organizar productos" action={{ label: 'Crear categoría', onClick: openNew }} />
      ) : (
        <>
          <div className="bg-white rounded-2xl border border-cream-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-cream-50 border-b border-cream-200">
                    <th className="p-3 text-left text-xs font-semibold text-espresso-700 uppercase tracking-wider">Categoría</th>
                    <th className="p-3 text-center text-xs font-semibold text-espresso-700 uppercase tracking-wider">Productos</th>
                    <th className="p-3 text-center text-xs font-semibold text-espresso-700 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {pagina.map((cat, i) => {
                    const count = getProductCount(cat)
                    return (
                      <tr key={i} className="border-t border-cream-100 hover:bg-cream-50/50 transition-colors">
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-olive-100 rounded-xl flex items-center justify-center">
                              <FaFolder size={14} className="text-olive-600" />
                            </div>
                            <p className="text-sm font-medium text-espresso-800">{cat}</p>
                          </div>
                        </td>
                        <td className="p-3 text-center">
                          <span className="w-8 h-8 bg-cream-100 rounded-lg flex items-center justify-center text-xs font-bold text-espresso-700 mx-auto">
                            {count}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button onClick={() => openEdit(cat)} className="p-1.5 rounded-lg hover:bg-cream-100 transition-all" title="Editar">
                              <FaEdit size={13} className="text-steel" />
                            </button>
                            <button onClick={() => setConfirmDelete(cat)} className="p-1.5 rounded-lg hover:bg-cream-100 transition-all" title="Eliminar">
                              <FaTrash size={13} className="text-red-500" />
                            </button>
                          </div>
                        </td>
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
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={closeModal}>
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-display font-bold text-espresso-800">{editing ? 'Editar categoría' : 'Nueva categoría'}</h3>
              <button onClick={closeModal} className="p-2 hover:bg-cream-100 rounded-xl text-steel">✕</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-espresso-700 mb-1.5">Nombre</label>
                <input
                  type="text"
                  value={formValue}
                  onChange={(e) => setFormValue(e.target.value)}
                  maxLength={50}
                  placeholder="Ej: Entradas, Bebidas, Postres..."
                  className="input-base text-sm"
                  autoFocus
                  onKeyDown={(e) => { if (e.key === 'Enter') save() }}
                />
                <p className="text-[10px] text-steel mt-1">{formValue.length}/50 caracteres</p>
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button onClick={closeModal} className="px-4 py-2.5 text-sm font-medium rounded-xl border border-cream-200 text-espresso-600 hover:bg-cream-50 transition-colors">
                  Cancelar
                </button>
                <button onClick={save} className="px-4 py-2.5 text-sm font-semibold rounded-xl bg-olive-500 hover:bg-olive-600 text-white transition-colors">
                  {editing ? 'Guardar cambios' : 'Crear categoría'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => { if (confirmDelete) eliminar(confirmDelete) }}
        title="Eliminar categoría"
        message={`¿Estás seguro de que deseas eliminar "${confirmDelete}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        variant="danger"
      />
    </div>
  )
}
