import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import { FaPlus, FaEdit, FaTrash, FaTag, FaToggleOn, FaToggleOff, FaSearch } from 'react-icons/fa'
import EmptyState from '../components/core/EmptyState'
import ConfirmModal from '../components/core/ConfirmModal'
import { ExportButton } from '../components/admin/ExportButton'
import { SEO } from '../lib/seo'
import type { Promocion } from '../lib/config'

const initialForm = {
  titulo: '',
  descripcion: '',
  descuento: 0,
  codigo: '',
  imagen: '',
  vigente: true
}

export default function AdminPromociones() {
  const [promociones, setPromociones] = useState<Promocion[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('promociones_admin') || '[]')
    } catch {
      return []
    }
  })
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Promocion | null>(null)
  const [form, setForm] = useState(initialForm)
  const [busqueda, setBusqueda] = useState('')
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const filtradas = useMemo(() => {
    if (!busqueda) return promociones
    const b = busqueda.toLowerCase()
    return promociones.filter(p =>
      p.titulo.toLowerCase().includes(b) || p.codigo?.toLowerCase().includes(b)
    )
  }, [promociones, busqueda])

  const save = () => {
    if (!form.titulo.trim()) { toast.error('El título es requerido'); return }
    if (!form.descripcion.trim()) { toast.error('La descripción es requerida'); return }
    if (form.descuento < 0 || form.descuento > 100) { toast.error('El descuento debe ser entre 0 y 100'); return }

    if (editing) {
      const updated = promociones.map(p => p.id === editing.id ? { ...p, ...form } : p)
      setPromociones(updated)
      localStorage.setItem('promociones_admin', JSON.stringify(updated))
      toast.success('Promoción actualizada')
    } else {
      const newPromo: Promocion = { ...form, id: `promo_${Date.now()}` }
      const updated = [...promociones, newPromo]
      setPromociones(updated)
      localStorage.setItem('promociones_admin', JSON.stringify(updated))
      toast.success('Promoción creada')
    }
    setShowForm(false)
    setEditing(null)
    setForm(initialForm)
  }

  const toggleVigente = (promo: Promocion) => {
    const updated = promociones.map(p => p.id === promo.id ? { ...p, vigente: !p.vigente } : p)
    setPromociones(updated)
    localStorage.setItem('promociones_admin', JSON.stringify(updated))
    toast.success(promo.vigente ? 'Promoción desactivada' : 'Promoción activada')
  }

  const eliminar = (id: string) => {
    const updated = promociones.filter(p => p.id !== id)
    setPromociones(updated)
    localStorage.setItem('promociones_admin', JSON.stringify(updated))
    toast.success('Promoción eliminada')
  }

  const openEdit = (promo: Promocion) => {
    setEditing(promo)
    setForm({
      titulo: promo.titulo,
      descripcion: promo.descripcion,
      descuento: promo.descuento,
      codigo: promo.codigo || '',
      imagen: promo.imagen || '',
      vigente: promo.vigente
    })
    setShowForm(true)
  }

  const openNew = () => {
    setEditing(null)
    setForm(initialForm)
    setShowForm(true)
  }

  return (
    <div className="min-h-screen bg-cream-50">
      <SEO title="Admin - Promociones" description="Gestión de promociones" />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-espresso-800">Promociones</h1>
          <p className="text-steel text-sm mt-1">{filtradas.length} promoción{filtradas.length !== 1 ? 'es' : ''}</p>
        </div>
        <div className="flex items-center gap-2">
          <ExportButton data={filtradas} filename="promociones" columns={[
            { key: 'titulo', label: 'Título' },
            { key: 'descripcion', label: 'Descripción' },
            { key: 'descuento', label: 'Descuento %' },
            { key: 'codigo', label: 'Código' },
            { key: 'vigente', label: 'Vigente' }
          ]} />
          <button onClick={openNew} className="flex items-center gap-2 bg-olive-500 hover:bg-olive-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm shadow-olive-500/20">
            <FaPlus size={13} /> Nueva promoción
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-cream-200 p-4 mb-4">
        <div className="relative">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-steel/40" size={14} />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por título o código..."
            className="input-base pl-11 text-sm w-full"
          />
        </div>
      </div>

      {filtradas.length === 0 ? (
        <EmptyState
          icon={<FaTag size={24} />}
          title="No hay promociones"
          description="Crea tu primera promoción para comenzar"
          action={{ label: 'Crear promoción', onClick: openNew }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtradas.map(promo => (
            <div key={promo.id} className="bg-white rounded-2xl border border-cream-200 p-5 hover:shadow-lift transition-all group">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-olive-50 flex items-center justify-center">
                    <FaTag size={16} className="text-olive-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-espresso-800">{promo.titulo}</h4>
                    {promo.codigo && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-cream-100 text-espresso-600 font-mono font-bold">
                        {promo.codigo}
                      </span>
                    )}
                  </div>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${promo.vigente ? 'bg-sage-50 text-sage-700' : 'bg-red-50 text-red-700'}`}>
                  {promo.vigente ? 'Activa' : 'Inactiva'}
                </span>
              </div>

              <p className="text-xs text-steel line-clamp-2 mb-3">{promo.descripcion}</p>

              {promo.imagen && (
                <div className="mb-3 rounded-xl overflow-hidden bg-cream-100 aspect-video">
                  <img src={promo.imagen} alt={promo.titulo} className="w-full h-full object-cover" />
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-cream-100">
                <span className="text-lg font-bold text-olive-600">{promo.descuento}%</span>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => toggleVigente(promo)} className="p-2 hover:bg-cream-100 rounded-lg transition-colors" title={promo.vigente ? 'Desactivar' : 'Activar'}>
                    {promo.vigente ? <FaToggleOn size={16} className="text-sage-600" /> : <FaToggleOff size={16} className="text-steel" />}
                  </button>
                  <button onClick={() => openEdit(promo)} className="p-2 hover:bg-cream-100 rounded-lg transition-colors" title="Editar">
                    <FaEdit size={14} className="text-olive-600" />
                  </button>
                  <button onClick={() => setConfirmDelete(promo.id)} className="p-2 hover:bg-cream-100 rounded-lg transition-colors" title="Eliminar">
                    <FaTrash size={14} className="text-red-500" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => { setShowForm(false); setEditing(null) }}>
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-xl my-8" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-cream-200 flex items-center justify-between">
              <h3 className="text-lg font-display font-bold text-espresso-800">{editing ? 'Editar promoción' : 'Nueva promoción'}</h3>
              <button onClick={() => { setShowForm(false); setEditing(null) }} className="p-2 hover:bg-cream-100 rounded-xl text-steel">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-espresso-700 mb-1.5">Título *</label>
                <input
                  type="text"
                  maxLength={100}
                  value={form.titulo}
                  onChange={e => setForm({ ...form, titulo: e.target.value })}
                  className="input-base text-sm w-full"
                  placeholder="Ej: 2x1 en bebidas"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-espresso-700 mb-1.5">Descripción *</label>
                <textarea
                  maxLength={200}
                  rows={3}
                  value={form.descripcion}
                  onChange={e => setForm({ ...form, descripcion: e.target.value })}
                  className="input-base text-sm w-full resize-none"
                  placeholder="Describe la promoción..."
                />
                <p className="text-[10px] text-steel mt-1">{form.descripcion.length}/200</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-espresso-700 mb-1.5">Descuento % *</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={form.descuento}
                    onChange={e => setForm({ ...form, descuento: Number(e.target.value) })}
                    className="input-base text-sm w-full"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-espresso-700 mb-1.5">Código</label>
                  <input
                    type="text"
                    value={form.codigo}
                    onChange={e => setForm({ ...form, codigo: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '') })}
                    className="input-base text-sm w-full font-mono"
                    placeholder="OPCIONAL"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-espresso-700 mb-1.5">URL de imagen</label>
                <input
                  type="url"
                  value={form.imagen}
                  onChange={e => setForm({ ...form, imagen: e.target.value })}
                  className="input-base text-sm w-full"
                  placeholder="https://..."
                />
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, vigente: !form.vigente })}
                  className={`relative w-12 h-6 rounded-full transition-colors ${form.vigente ? 'bg-olive-500' : 'bg-cream-300'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.vigente ? 'translate-x-6' : ''}`} />
                </button>
                <span className="text-sm text-espresso-700">{form.vigente ? 'Activa' : 'Inactiva'}</span>
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button onClick={() => { setShowForm(false); setEditing(null) }} className="px-4 py-2.5 text-sm font-medium rounded-xl border border-cream-200 text-espresso-600 hover:bg-cream-50 transition-colors">
                  Cancelar
                </button>
                <button onClick={save} className="px-5 py-2.5 bg-olive-500 hover:bg-olive-600 text-white text-sm font-semibold rounded-xl transition-all shadow-sm shadow-olive-500/20">
                  {editing ? 'Guardar cambios' : 'Crear promoción'}
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
        title="Eliminar promoción"
        message="¿Estás seguro de que deseas eliminar esta promoción? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        variant="danger"
      />
    </div>
  )
}