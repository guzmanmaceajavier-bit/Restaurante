import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import { FaPlus, FaEdit, FaTrash, FaSearch, FaThLarge, FaMapMarkerAlt, FaEye } from 'react-icons/fa'
import clsx from 'clsx'
import EmptyState from '../components/core/EmptyState'
import ConfirmModal from '../components/core/ConfirmModal'
import { ExportButton } from '../components/admin/ExportButton'
import { SEO } from '../lib/seo'
import { Pagination } from '../components/admin/Pagination'

interface Mesa { id: string; numero: number; capacidad: number; ubicacion: string; estado: string }

const initialMesas: Mesa[] = [
  { id: 'm1', numero: 1, capacidad: 2, ubicacion: 'Interior', estado: 'disponible' },
  { id: 'm2', numero: 2, capacidad: 2, ubicacion: 'Interior', estado: 'disponible' },
  { id: 'm3', numero: 3, capacidad: 4, ubicacion: 'Interior', estado: 'ocupada' },
  { id: 'm4', numero: 4, capacidad: 4, ubicacion: 'Terraza', estado: 'disponible' },
  { id: 'm5', numero: 5, capacidad: 6, ubicacion: 'Terraza', estado: 'reservada' },
  { id: 'm6', numero: 6, capacidad: 2, ubicacion: 'Barra', estado: 'disponible' },
  { id: 'm7', numero: 7, capacidad: 8, ubicacion: 'Zona Privada', estado: 'disponible' },
  { id: 'm8', numero: 8, capacidad: 4, ubicacion: 'Interior', estado: 'mantenimiento' },
]

const estadoColores: Record<string, { bg: string; border: string; text: string; label: string; dot: string }> = {
  disponible: { bg: 'bg-sage-50', border: 'border-sage-200', text: 'text-sage-700', label: 'Disponible', dot: 'bg-sage-500' },
  ocupada: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', label: 'Ocupada', dot: 'bg-red-500' },
  reservada: { bg: 'bg-gold-50', border: 'border-gold-200', text: 'text-gold-700', label: 'Reservada', dot: 'bg-gold-500' },
  mantenimiento: { bg: 'bg-cream-200', border: 'border-cream-300', text: 'text-steel', label: 'Mantenimiento', dot: 'bg-steel' },
}

const ubicacionesOptions = ['Interior', 'Terraza', 'Barra', 'Zona Privada', 'Exterior']
const estadosOptions = ['disponible', 'ocupada', 'reservada', 'mantenimiento']

const ITEMS_PER_PAGE = 12

export default function AdminMesas() {
  const [mesas, setMesas] = useState<Mesa[]>(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('mesas') || '[]')
      return stored && stored.length > 0 ? stored : initialMesas
    } catch {
      return initialMesas
    }
  })
  const [filtroUbicacion, setFiltroUbicacion] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<Mesa | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Mesa | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [showEstadoModal, setShowEstadoModal] = useState<Mesa | null>(null)

  const [formNumero, setFormNumero] = useState('')
  const [formCapacidad, setFormCapacidad] = useState('')
  const [formUbicacion, setFormUbicacion] = useState('Interior')
  const [formEstado, setFormEstado] = useState('disponible')
  const [customUbicacion, setCustomUbicacion] = useState('')

  const save = (updated: Mesa[]) => {
    setMesas(updated)
    localStorage.setItem('mesas', JSON.stringify(updated))
  }

  const ubicaciones = useMemo(() => Array.from(new Set(mesas.map((m) => m.ubicacion))), [mesas])

  const stats = useMemo(() => ({
    total: mesas.length,
    disponibles: mesas.filter((m) => m.estado === 'disponible').length,
    ocupadas: mesas.filter((m) => m.estado === 'ocupada').length,
    reservadas: mesas.filter((m) => m.estado === 'reservada').length,
    mantenimiento: mesas.filter((m) => m.estado === 'mantenimiento').length,
  }), [mesas])

  const filtradas = useMemo(() => {
    return mesas.filter((m) => {
      if (filtroUbicacion && m.ubicacion !== filtroUbicacion) return false
      if (busqueda) {
        return String(m.numero).includes(busqueda)
      }
      return true
    })
  }, [mesas, filtroUbicacion, busqueda])

  const totalPages = Math.ceil(filtradas.length / ITEMS_PER_PAGE)
  const pagina = filtradas.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  const resetForm = () => {
    setFormNumero('')
    setFormCapacidad('')
    setFormUbicacion('Interior')
    setFormEstado('disponible')
    setCustomUbicacion('')
    setEditing(null)
  }

  const openCreate = () => {
    resetForm()
    setShowForm(true)
  }

  const openEdit = (mesa: Mesa) => {
    setEditing(mesa)
    setFormNumero(String(mesa.numero))
    setFormCapacidad(String(mesa.capacidad))
    setFormUbicacion(ubicacionesOptions.includes(mesa.ubicacion) ? mesa.ubicacion : mesa.ubicacion)
    setFormEstado(mesa.estado)
    setCustomUbicacion(ubicacionesOptions.includes(mesa.ubicacion) ? '' : mesa.ubicacion)
    setShowForm(true)
    setSelected(null)
  }

  const submitForm = () => {
    const numero = parseInt(formNumero)
    if (isNaN(numero) || numero <= 0) { toast.error('Ingresa un número válido'); return }
    const exists = mesas.some((m) => m.numero === numero && m.id !== editing?.id)
    if (exists) { toast.error('Ya existe una mesa con ese número'); return }

    const capacidad = parseInt(formCapacidad)
    if (isNaN(capacidad) || capacidad < 1 || capacidad > 50) { toast.error('Capacidad debe ser entre 1 y 50'); return }

    const ubicacionFinal = customUbicacion.trim() || formUbicacion
    if (!ubicacionFinal) { toast.error('Selecciona o escribe una ubicación'); return }

    if (editing) {
      const updated = mesas.map((m) => m.id === editing.id ? { ...m, numero, capacidad, ubicacion: ubicacionFinal, estado: formEstado } : m)
      save(updated)
      toast.success('Mesa actualizada')
    } else {
      const newMesa: Mesa = { id: 'mesa_' + Date.now(), numero, capacidad, ubicacion: ubicacionFinal, estado: formEstado }
      const updated = [...mesas, newMesa]
      save(updated)
      toast.success('Mesa creada')
    }
    setShowForm(false)
    resetForm()
  }

  const eliminar = (id: string) => {
    const updated = mesas.filter((m) => m.id !== id)
    save(updated)
    toast.success('Mesa eliminada')
    if (selected?.id === id) setSelected(null)
  }

  const cambiarEstado = (id: string, nuevoEstado: string) => {
    const updated = mesas.map((m) => m.id === id ? { ...m, estado: nuevoEstado } : m)
    save(updated)
    setShowEstadoModal(null)
    toast.success(`Mesa cambiada a "${estadoColores[nuevoEstado]?.label}"`)
  }

  return (
    <div>
      <SEO title="Administración de Mesas" description="Gestión completa de mesas del restaurante" />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-espresso-800">Mesas</h1>
          <p className="text-steel text-sm mt-1">{filtradas.length} mesa{filtradas.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-2">
          <ExportButton data={filtradas} filename="mesas" columns={[{ key: 'numero', label: 'Número' }, { key: 'capacidad', label: 'Capacidad' }, { key: 'ubicacion', label: 'Ubicación' }, { key: 'estado', label: 'Estado' }]} />
          <button onClick={openCreate} className="flex items-center gap-2 bg-olive-500 hover:bg-olive-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm shadow-olive-500/20">
            <FaPlus size={13} /> Nueva mesa
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
        {[
          { label: 'Total', value: stats.total, color: 'bg-espresso-800' },
          { label: 'Disponibles', value: stats.disponibles, color: 'bg-sage-500' },
          { label: 'Ocupadas', value: stats.ocupadas, color: 'bg-red-500' },
          { label: 'Reservadas', value: stats.reservadas, color: 'bg-gold-500' },
          { label: 'Mantenimiento', value: stats.mantenimiento, color: 'bg-steel' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-4 border border-cream-200 flex items-center gap-3">
            <div className={`w-3 h-3 ${s.color} rounded-full`} />
            <div>
              <p className="text-xl font-display font-bold text-espresso-800">{s.value}</p>
              <p className="text-[10px] text-steel">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-steel/40" size={14} />
          <input type="text" value={busqueda} onChange={(e) => { setBusqueda(e.target.value); setPage(1) }} placeholder="Buscar por número de mesa..." className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-cream-200 bg-white text-sm text-espresso-800 placeholder:text-steel/40 focus:outline-none focus:ring-2 focus:ring-olive-500/20 focus:border-olive-400 transition-all" />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button onClick={() => { setFiltroUbicacion(''); setPage(1) }} className={clsx('shrink-0 px-4 py-2 rounded-xl text-xs font-medium transition-all', !filtroUbicacion ? 'bg-olive-500 text-white' : 'bg-white border border-cream-200 text-steel hover:bg-cream-50')}>
            Todas ({mesas.length})
          </button>
          {ubicaciones.map((u) => (
            <button key={u} onClick={() => { setFiltroUbicacion(u); setPage(1) }} className={clsx('shrink-0 px-4 py-2 rounded-xl text-xs font-medium transition-all', filtroUbicacion === u ? 'bg-olive-500 text-white' : 'bg-white border border-cream-200 text-steel hover:bg-cream-50')}>
              {u} ({mesas.filter((m) => m.ubicacion === u).length})
            </button>
          ))}
        </div>
      </div>

      {pagina.length === 0 ? (
        <EmptyState icon={<FaThLarge size={24} />} title="No hay mesas" description="Crea tu primera mesa para comenzar" action={{ label: 'Crear mesa', onClick: openCreate }} />
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {pagina.map((m) => {
              const ec = estadoColores[m.estado] || estadoColores.disponible
              return (
                <div key={m.id} className={clsx('bg-white rounded-2xl border-2 p-5 text-center hover:shadow-lift transition-all group relative', ec.border)}>
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => { e.stopPropagation(); setShowEstadoModal(m) }} className="w-7 h-7 bg-white rounded-lg flex items-center justify-center shadow hover:scale-110 transition-all" title="Ver detalle">
                      <FaEye size={11} className="text-steel" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); openEdit(m) }} className="w-7 h-7 bg-white rounded-lg flex items-center justify-center shadow hover:scale-110 transition-all" title="Editar">
                      <FaEdit size={11} className="text-olive-600" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); setConfirmDelete(m.id) }} className="w-7 h-7 bg-white rounded-lg flex items-center justify-center shadow hover:scale-110 transition-all" title="Eliminar">
                      <FaTrash size={11} className="text-red-500" />
                    </button>
                  </div>
                  <button onClick={() => setShowEstadoModal(m)} className="w-full">
                    <div className="flex items-center justify-center gap-1.5 mb-3">
                      <span className={`w-2.5 h-2.5 rounded-full ${ec.dot}`} />
                      <span className={`text-[10px] font-semibold ${ec.text}`}>{ec.label}</span>
                    </div>
                    <div className="w-16 h-16 bg-cream-50 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition-transform">
                      <FaThLarge size={24} className="text-steel/40" />
                    </div>
                    <p className="text-2xl font-display font-bold text-espresso-800">#{m.numero}</p>
                    <p className="text-xs text-steel mt-1">{m.capacidad} personas</p>
                    <div className="flex items-center justify-center gap-1 mt-2">
                      <FaMapMarkerAlt size={10} className="text-steel/40" />
                      <span className="text-[10px] text-steel">{m.ubicacion}</span>
                    </div>
                  </button>
                </div>
              )
            })}
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-espresso-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => { setShowForm(false); resetForm() }}>
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-cream-200 flex items-center justify-between">
              <h3 className="text-lg font-display font-bold text-espresso-800">{editing ? 'Editar mesa' : 'Nueva mesa'}</h3>
              <button onClick={() => { setShowForm(false); resetForm() }} className="p-2 hover:bg-cream-100 rounded-xl text-steel">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-espresso-700 mb-1.5">Número de mesa *</label>
                <input type="number" value={formNumero} onChange={(e) => setFormNumero(e.target.value)} min={1} placeholder="Ej: 1" className="w-full px-4 py-2.5 rounded-xl border border-cream-200 bg-white text-sm text-espresso-800 placeholder:text-steel/40 focus:outline-none focus:ring-2 focus:ring-olive-500/20 focus:border-olive-400 transition-all" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-espresso-700 mb-1.5">Capacidad (1-50) *</label>
                <input type="number" value={formCapacidad} onChange={(e) => setFormCapacidad(e.target.value)} min={1} max={50} placeholder="Ej: 4" className="w-full px-4 py-2.5 rounded-xl border border-cream-200 bg-white text-sm text-espresso-800 placeholder:text-steel/40 focus:outline-none focus:ring-2 focus:ring-olive-500/20 focus:border-olive-400 transition-all" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-espresso-700 mb-1.5">Ubicación *</label>
                <select value={customUbicacion ? '__custom' : formUbicacion} onChange={(e) => { if (e.target.value === '__custom') { setCustomUbicacion(formUbicacion); setFormUbicacion('') } else { setFormUbicacion(e.target.value); setCustomUbicacion('') } }} className="w-full px-4 py-2.5 rounded-xl border border-cream-200 bg-white text-sm text-espresso-800 focus:outline-none focus:ring-2 focus:ring-olive-500/20 focus:border-olive-400 transition-all mb-2">
                  {ubicacionesOptions.map((u) => <option key={u} value={u}>{u}</option>)}
                  {!ubicacionesOptions.includes(formUbicacion) && customUbicacion && <option value="__custom">Otra...</option>}
                  <option value="__custom">Otra ubicación...</option>
                </select>
                {(!ubicacionesOptions.includes(formUbicacion) || customUbicacion) && (
                  <input type="text" value={customUbicacion} onChange={(e) => setCustomUbicacion(e.target.value)} placeholder="Escribe la ubicación..." className="w-full px-4 py-2.5 rounded-xl border border-cream-200 bg-white text-sm text-espresso-800 placeholder:text-steel/40 focus:outline-none focus:ring-2 focus:ring-olive-500/20 focus:border-olive-400 transition-all" />
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-espresso-700 mb-1.5">Estado</label>
                <div className="flex flex-wrap gap-2">
                  {estadosOptions.map((est) => {
                    const ec = estadoColores[est]
                    return (
                      <button key={est} type="button" onClick={() => setFormEstado(est)} className={clsx('flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition-all', formEstado === est ? `${ec.bg} ${ec.text} ${ec.border}` : 'border-cream-200 text-steel hover:bg-cream-50')}>
                        <span className={`w-2.5 h-2.5 rounded-full ${ec.dot}`} />
                        {ec.label}
                      </button>
                    )
                  })}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => { setShowForm(false); resetForm() }} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium border border-cream-200 text-espresso-600 hover:bg-cream-50 transition-all">Cancelar</button>
                <button onClick={submitForm} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold bg-olive-500 hover:bg-olive-600 text-white transition-all shadow-sm shadow-olive-500/20">{editing ? 'Guardar cambios' : 'Crear mesa'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showEstadoModal && (
        <div className="fixed inset-0 bg-espresso-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowEstadoModal(null)}>
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-cream-200 text-center">
              <h3 className="text-lg font-display font-bold text-espresso-800">Mesa #{showEstadoModal.numero}</h3>
              <p className="text-xs text-steel mt-1">{showEstadoModal.ubicacion} • {showEstadoModal.capacidad} personas</p>
            </div>
            <div className="p-4">
              <p className="text-xs font-semibold text-espresso-700 mb-3 px-2">Cambiar estado</p>
              <div className="space-y-1.5">
                {Object.entries(estadoColores).map(([key, val]) => (
                  <button key={key} onClick={() => cambiarEstado(showEstadoModal.id, key)}
                    className={clsx('w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all', showEstadoModal.estado === key ? `${val.bg} ${val.text} border ${val.border}` : 'hover:bg-cream-50 text-espresso-600')}>
                    <span className={`w-3 h-3 rounded-full ${val.dot}`} />
                    {val.label}
                  </button>
                ))}
              </div>
              <div className="flex gap-3 mt-4">
                <button onClick={() => { openEdit(showEstadoModal) }} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border border-cream-200 text-espresso-600 hover:bg-cream-50 transition-all">
                  <FaEdit size={13} /> Editar
                </button>
                <button onClick={() => { setShowEstadoModal(null); setConfirmDelete(showEstadoModal.id) }} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border border-red-200 text-red-600 hover:bg-red-50 transition-all">
                  <FaTrash size={13} /> Eliminar
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
        title="Eliminar mesa"
        message="¿Estás seguro de que deseas eliminar esta mesa? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        variant="danger"
      />
    </div>
  )
}
