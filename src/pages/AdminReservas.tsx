import { useEffect, useState, useMemo } from 'react'
import { storage } from '../lib/storage'
import { CONFIG } from '../lib/config'
import { toast } from 'sonner'
import { FaPlus, FaEdit, FaTrash, FaSearch, FaWhatsapp, FaFilter, FaTimes, FaCheck, FaBan, FaCalendarAlt } from 'react-icons/fa'
import EmptyState from '../components/core/EmptyState'
import ConfirmModal from '../components/core/ConfirmModal'
import { ExportButton } from '../components/admin/ExportButton'
import { Pagination } from '../components/admin/Pagination'
import { SEO } from '../lib/seo'
import type { ReservaData as Reserva } from '../types/ReservaData'

const ITEMS_PER_PAGE = 10

const zonaOptions = ['Interior', 'Terraza', 'Barra', 'Zona Privada']
const ocasionOptions = ['Cumpleaños', 'Aniversario', 'Reunión empresarial', 'Romántica', 'Sin ocasión especial']
const estadoOptions = ['Pendiente', 'confirmada', 'rechazada', 'Cancelada'] as const

const estadoConfig: Record<string, { bg: string; text: string; border: string }> = {
  Pendiente: { bg: 'bg-gold-50', text: 'text-gold-700', border: 'border-gold-200' },
  confirmada: { bg: 'bg-sage-50', text: 'text-sage-700', border: 'border-sage-200' },
  rechazada: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  Cancelada: { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' },
}

const emptyForm: Omit<Reserva, 'id' | 'createdAt'> = {
  nombre: '',
  email: '',
  telefono: '',
  fecha: '',
  hora: '',
  personas: 1,
  zona: 'Interior',
  ocasion: 'Sin ocasión especial',
  comentarios: '',
  estado: 'Pendiente',
}

export default function AdminReservas() {
  const [reservas, setReservas] = useState<Reserva[]>([])
  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')
  const [page, setPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)

  const [showCreate, setShowCreate] = useState(false)
  const [showEdit, setShowEdit] = useState<Reserva | null>(null)
  const [showDetail, setShowDetail] = useState<Reserva | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [enviandoMensaje, setEnviandoMensaje] = useState<Reserva | null>(null)
  const [mensaje, setMensaje] = useState('')

  const [formCreate, setFormCreate] = useState(emptyForm)
  const [formEdit, setFormEdit] = useState(emptyForm)

  useEffect(() => { setReservas(storage.getReservas()) }, [])

  const guardar = (data: Reserva[]) => { setReservas(data); storage.setReservas(data) }

  const reservasFiltradas = useMemo(() => {
    return reservas.filter((r) => {
      if (filtroEstado && r.estado !== filtroEstado) return false
      if (busqueda) {
        const b = busqueda.toLowerCase()
        return (
          r.nombre?.toLowerCase().includes(b) ||
          r.email?.toLowerCase().includes(b) ||
          r.telefono?.includes(b) ||
          r.id?.toLowerCase().includes(b)
        )
      }
      return true
    }).sort((a, b) => (a.fecha || '').localeCompare(b.fecha || ''))
  }, [reservas, filtroEstado, busqueda])

  const totalPages = Math.ceil(reservasFiltradas.length / ITEMS_PER_PAGE)
  const reservasPagina = reservasFiltradas.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  const crearReserva = () => {
    if (!formCreate.nombre || !formCreate.email || !formCreate.telefono || !formCreate.fecha || !formCreate.hora) {
      toast.error('Completa los campos obligatorios')
      return
    }
    const nueva: Reserva = {
      ...formCreate,
      id: 'res_' + Date.now(),
      createdAt: new Date().toISOString(),
    }
    guardar([...reservas, nueva])
    setShowCreate(false)
    setFormCreate(emptyForm)
    toast.success('Reserva creada')
  }

  const guardarEdicion = () => {
    if (!showEdit) return
    if (!formEdit.nombre || !formEdit.email || !formEdit.telefono || !formEdit.fecha || !formEdit.hora) {
      toast.error('Completa los campos obligatorios')
      return
    }
    const updated = reservas.map((r) => (r.id === showEdit.id ? { ...showEdit, ...formEdit } : r))
    guardar(updated)
    setShowEdit(null)
    toast.success('Reserva actualizada')
  }

  const eliminar = (id: string) => {
    guardar(reservas.filter((r) => r.id !== id))
    toast.success('Reserva eliminada')
  }

  const confirmarReserva = (id: string) => {
    const r = reservas.find((res) => res.id === id)
    if (!r) return
    guardar(reservas.map((res) => res.id === id ? { ...res, estado: 'confirmada' as const } : res))
    setEnviandoMensaje(r)
    setMensaje(`Hola ${r.nombre}, tu reserva para el ${r.fecha} a las ${r.hora} ha sido confirmada. ¡Te esperamos!`)
    toast.success('Reserva confirmada')
  }

  const rechazarReserva = (id: string) => {
    const r = reservas.find((res) => res.id === id)
    if (!r) return
    guardar(reservas.map((res) => res.id === id ? { ...res, estado: 'rechazada' as const } : res))
    setEnviandoMensaje(r)
    setMensaje(`Hola ${r.nombre}, lamentamos informarte que no hay disponibilidad para tu reserva del ${r.fecha} a las ${r.hora}.`)
  }

  const openCreate = () => { setFormCreate(emptyForm); setShowCreate(true) }
  const openEdit = (r: Reserva) => { setFormEdit({ nombre: r.nombre, email: r.email, telefono: r.telefono, fecha: r.fecha, hora: r.hora, personas: r.personas, zona: r.zona, ocasion: r.ocasion, comentarios: r.comentarios, estado: r.estado }); setShowEdit(r) }

  return (
    <>
      <SEO title="Administrar Reservas" description="Gestión de reservas del restaurante" />
      <div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-display font-bold text-espresso-800">Reservas</h1>
            <p className="text-steel text-sm mt-1">{reservasFiltradas.length} reserva{reservasFiltradas.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="flex items-center gap-2">
            <ExportButton data={reservasFiltradas} filename="reservas" columns={[
              { key: 'id', label: 'ID' }, { key: 'nombre', label: 'Nombre' }, { key: 'email', label: 'Email' },
              { key: 'telefono', label: 'Teléfono' }, { key: 'fecha', label: 'Fecha' }, { key: 'hora', label: 'Hora' },
              { key: 'personas', label: 'Personas' }, { key: 'zona', label: 'Zona' }, { key: 'estado', label: 'Estado' }
            ]} />
            <button onClick={() => setShowFilters(!showFilters)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border ${showFilters ? 'bg-olive-50 border-olive-200 text-olive-700' : 'bg-white border-cream-200 text-espresso-600 hover:bg-cream-50'}`}>
              <FaFilter size={12} /> Filtros {(filtroEstado || busqueda) && <span className="w-2 h-2 bg-olive-500 rounded-full" />}
            </button>
            <button onClick={() => { setBusqueda(''); setFiltroEstado(''); setPage(1) }} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-white border border-cream-200 text-espresso-600 hover:bg-cream-50 transition-all">
              <FaTimes size={12} /> Limpiar
            </button>
            <button onClick={openCreate} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-olive-600 text-white hover:bg-olive-700 transition-all">
              <FaPlus size={12} /> Nueva reserva
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="bg-white rounded-2xl border border-cream-200 p-4 mb-4 flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-steel/40" size={14} />
              <input type="text" value={busqueda} onChange={(e) => { setBusqueda(e.target.value); setPage(1) }} placeholder="Buscar por nombre, email, teléfono o ID..." className="input-base pl-11 text-sm" />
            </div>
            <select value={filtroEstado} onChange={(e) => { setFiltroEstado(e.target.value); setPage(1) }} className="input-base text-sm w-auto">
              <option value="">Todos los estados</option>
              {estadoOptions.map((e) => <option key={e} value={e}>{e.charAt(0).toUpperCase() + e.slice(1)}</option>)}
            </select>
          </div>
        )}

        {reservasPagina.length === 0 ? (
          <EmptyState icon={<FaCalendarAlt size={24} />} title="No hay reservas" description="Las reservas aparecerán aquí cuando los clientes las creen" />
        ) : (
          <>
            <div className="bg-white rounded-2xl border border-cream-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-cream-50 border-b border-cream-200">
                      <th className="p-3 text-left text-xs font-semibold text-espresso-700 uppercase tracking-wider">ID</th>
                      <th className="p-3 text-left text-xs font-semibold text-espresso-700 uppercase tracking-wider">Nombre</th>
                      <th className="p-3 text-left text-xs font-semibold text-espresso-700 uppercase tracking-wider">Fecha</th>
                      <th className="p-3 text-left text-xs font-semibold text-espresso-700 uppercase tracking-wider">Hora</th>
                      <th className="p-3 text-center text-xs font-semibold text-espresso-700 uppercase tracking-wider">Personas</th>
                      <th className="p-3 text-left text-xs font-semibold text-espresso-700 uppercase tracking-wider">Zona</th>
                      <th className="p-3 text-center text-xs font-semibold text-espresso-700 uppercase tracking-wider">Estado</th>
                      <th className="p-3 text-center text-xs font-semibold text-espresso-700 uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reservasPagina.map((r) => {
                      const ec = estadoConfig[r.estado || 'Pendiente'] || estadoConfig.Pendiente
                      return (
                        <tr key={r.id} className="border-t border-cream-100 hover:bg-cream-50/50 transition-colors cursor-pointer" onClick={() => setShowDetail(r)}>
                          <td className="p-3 text-xs font-mono text-steel">{r.id?.slice(0, 12)}...</td>
                          <td className="p-3">
                            <p className="text-sm font-medium text-espresso-800">{r.nombre}</p>
                            <p className="text-[10px] text-steel">{r.email}</p>
                          </td>
                          <td className="p-3 text-sm text-espresso-700">{r.fecha}</td>
                          <td className="p-3 text-sm text-espresso-700">{r.hora}</td>
                          <td className="p-3 text-center text-sm text-espresso-700">{r.personas}</td>
                          <td className="p-3 text-sm text-espresso-700">{r.zona}</td>
                          <td className="p-3 text-center">
                            <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-semibold border ${ec.bg} ${ec.text} ${ec.border}`}>
                              {r.estado || 'Pendiente'}
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="flex gap-1 justify-center" onClick={(e) => e.stopPropagation()}>
                              {r.estado !== 'confirmada' && (
                                <button onClick={() => confirmarReserva(r.id)} className="p-1.5 rounded-lg hover:bg-sage-50 transition-all" title="Confirmar">
                                  <FaCheck size={12} className="text-sage-600" />
                                </button>
                              )}
                              {r.estado !== 'rechazada' && (
                                <button onClick={() => rechazarReserva(r.id)} className="p-1.5 rounded-lg hover:bg-red-50 transition-all" title="Rechazar">
                                  <FaBan size={12} className="text-red-500" />
                                </button>
                              )}
                              <button onClick={() => openEdit(r)} className="p-1.5 rounded-lg hover:bg-cream-100 transition-all" title="Editar">
                                <FaEdit size={12} className="text-steel" />
                              </button>
                              <button onClick={() => setConfirmDelete(r.id)} className="p-1.5 rounded-lg hover:bg-red-50 transition-all" title="Eliminar">
                                <FaTrash size={12} className="text-red-400" />
                              </button>
                              <button onClick={() => { setEnviandoMensaje(r); setMensaje(`Hola ${r.nombre}, sobre tu reserva #${r.id.slice(0, 8)}:`) }} className="p-1.5 rounded-lg hover:bg-emerald-50 transition-all" title="WhatsApp">
                                <FaWhatsapp size={12} className="text-emerald-600" />
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

        {/* Create Modal */}
        {showCreate && (
          <div className="fixed inset-0 bg-espresso-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowCreate(false)}>
            <div className="bg-white rounded-3xl w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="p-6 border-b border-cream-200 flex items-center justify-between">
                <h3 className="text-lg font-display font-bold text-espresso-800">Nueva Reserva</h3>
                <button onClick={() => setShowCreate(false)} className="p-2 rounded-lg hover:bg-cream-100 transition-all"><FaTimes size={14} className="text-steel" /></button>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="text-xs font-medium text-espresso-700 mb-1 block">Nombre *</label>
                    <input type="text" value={formCreate.nombre} onChange={(e) => setFormCreate({ ...formCreate, nombre: e.target.value })} className="input-base text-sm" required />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="text-xs font-medium text-espresso-700 mb-1 block">Email *</label>
                    <input type="email" value={formCreate.email} onChange={(e) => setFormCreate({ ...formCreate, email: e.target.value })} className="input-base text-sm" required />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="text-xs font-medium text-espresso-700 mb-1 block">Teléfono *</label>
                    <input type="text" value={formCreate.telefono} onChange={(e) => setFormCreate({ ...formCreate, telefono: e.target.value })} className="input-base text-sm" required />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="text-xs font-medium text-espresso-700 mb-1 block">Fecha *</label>
                    <input type="date" value={formCreate.fecha} onChange={(e) => setFormCreate({ ...formCreate, fecha: e.target.value })} className="input-base text-sm" required />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="text-xs font-medium text-espresso-700 mb-1 block">Hora *</label>
                    <input type="time" value={formCreate.hora} onChange={(e) => setFormCreate({ ...formCreate, hora: e.target.value })} className="input-base text-sm" required />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="text-xs font-medium text-espresso-700 mb-1 block">Personas *</label>
                    <input type="number" min={1} max={20} value={formCreate.personas} onChange={(e) => setFormCreate({ ...formCreate, personas: Number(e.target.value) })} className="input-base text-sm" required />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="text-xs font-medium text-espresso-700 mb-1 block">Estado</label>
                    <select value={formCreate.estado} onChange={(e) => setFormCreate({ ...formCreate, estado: e.target.value as Reserva['estado'] })} className="input-base text-sm">
                      {estadoOptions.map((e) => <option key={e} value={e}>{e.charAt(0).toUpperCase() + e.slice(1)}</option>)}
                    </select>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="text-xs font-medium text-espresso-700 mb-1 block">Zona</label>
                    <select value={formCreate.zona} onChange={(e) => setFormCreate({ ...formCreate, zona: e.target.value })} className="input-base text-sm">
                      {zonaOptions.map((z) => <option key={z} value={z}>{z}</option>)}
                    </select>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="text-xs font-medium text-espresso-700 mb-1 block">Ocasión</label>
                    <select value={formCreate.ocasion} onChange={(e) => setFormCreate({ ...formCreate, ocasion: e.target.value })} className="input-base text-sm">
                      {ocasionOptions.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs font-medium text-espresso-700 mb-1 block">Comentarios</label>
                    <textarea value={formCreate.comentarios} onChange={(e) => setFormCreate({ ...formCreate, comentarios: e.target.value })} className="input-base text-sm resize-none" rows={3} placeholder="Comentarios adicionales..." />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button onClick={() => setShowCreate(false)} className="btn-secondary text-sm py-2.5">Cancelar</button>
                  <button onClick={crearReserva} className="btn-primary text-sm py-2.5">Crear reserva</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEdit && (
          <div className="fixed inset-0 bg-espresso-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowEdit(null)}>
            <div className="bg-white rounded-3xl w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="p-6 border-b border-cream-200 flex items-center justify-between">
                <h3 className="text-lg font-display font-bold text-espresso-800">Editar Reserva</h3>
                <button onClick={() => setShowEdit(null)} className="p-2 rounded-lg hover:bg-cream-100 transition-all"><FaTimes size={14} className="text-steel" /></button>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="text-xs font-medium text-espresso-700 mb-1 block">Nombre *</label>
                    <input type="text" value={formEdit.nombre} onChange={(e) => setFormEdit({ ...formEdit, nombre: e.target.value })} className="input-base text-sm" required />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="text-xs font-medium text-espresso-700 mb-1 block">Email *</label>
                    <input type="email" value={formEdit.email} onChange={(e) => setFormEdit({ ...formEdit, email: e.target.value })} className="input-base text-sm" required />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="text-xs font-medium text-espresso-700 mb-1 block">Teléfono *</label>
                    <input type="text" value={formEdit.telefono} onChange={(e) => setFormEdit({ ...formEdit, telefono: e.target.value })} className="input-base text-sm" required />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="text-xs font-medium text-espresso-700 mb-1 block">Fecha *</label>
                    <input type="date" value={formEdit.fecha} onChange={(e) => setFormEdit({ ...formEdit, fecha: e.target.value })} className="input-base text-sm" required />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="text-xs font-medium text-espresso-700 mb-1 block">Hora *</label>
                    <input type="time" value={formEdit.hora} onChange={(e) => setFormEdit({ ...formEdit, hora: e.target.value })} className="input-base text-sm" required />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="text-xs font-medium text-espresso-700 mb-1 block">Personas *</label>
                    <input type="number" min={1} max={20} value={formEdit.personas} onChange={(e) => setFormEdit({ ...formEdit, personas: Number(e.target.value) })} className="input-base text-sm" required />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="text-xs font-medium text-espresso-700 mb-1 block">Estado</label>
                    <select value={formEdit.estado} onChange={(e) => setFormEdit({ ...formEdit, estado: e.target.value as Reserva['estado'] })} className="input-base text-sm">
                      {estadoOptions.map((e) => <option key={e} value={e}>{e.charAt(0).toUpperCase() + e.slice(1)}</option>)}
                    </select>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="text-xs font-medium text-espresso-700 mb-1 block">Zona</label>
                    <select value={formEdit.zona} onChange={(e) => setFormEdit({ ...formEdit, zona: e.target.value })} className="input-base text-sm">
                      {zonaOptions.map((z) => <option key={z} value={z}>{z}</option>)}
                    </select>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="text-xs font-medium text-espresso-700 mb-1 block">Ocasión</label>
                    <select value={formEdit.ocasion} onChange={(e) => setFormEdit({ ...formEdit, ocasion: e.target.value })} className="input-base text-sm">
                      {ocasionOptions.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs font-medium text-espresso-700 mb-1 block">Comentarios</label>
                    <textarea value={formEdit.comentarios} onChange={(e) => setFormEdit({ ...formEdit, comentarios: e.target.value })} className="input-base text-sm resize-none" rows={3} placeholder="Comentarios adicionales..." />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button onClick={() => setShowEdit(null)} className="btn-secondary text-sm py-2.5">Cancelar</button>
                  <button onClick={guardarEdicion} className="btn-primary text-sm py-2.5">Guardar cambios</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Detail Modal */}
        {showDetail && (
          <div className="fixed inset-0 bg-espresso-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowDetail(null)}>
            <div className="bg-white rounded-3xl w-full max-w-lg shadow-xl" onClick={(e) => e.stopPropagation()}>
              <div className="p-6 border-b border-cream-200 flex items-center justify-between">
                <h3 className="text-lg font-display font-bold text-espresso-800">Detalle de Reserva</h3>
                <button onClick={() => setShowDetail(null)} className="p-2 rounded-lg hover:bg-cream-100 transition-all"><FaTimes size={14} className="text-steel" /></button>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><span className="text-[10px] text-steel uppercase tracking-wider">ID</span><p className="text-sm font-mono text-espresso-800">{showDetail.id}</p></div>
                  <div><span className="text-[10px] text-steel uppercase tracking-wider">Estado</span>
                    {(() => { const ec = estadoConfig[showDetail.estado || 'Pendiente'] || estadoConfig.Pendiente; return <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-semibold border mt-1 ${ec.bg} ${ec.text} ${ec.border}`}>{showDetail.estado}</span> })()}
                  </div>
                  <div><span className="text-[10px] text-steel uppercase tracking-wider">Nombre</span><p className="text-sm font-medium text-espresso-800">{showDetail.nombre}</p></div>
                  <div><span className="text-[10px] text-steel uppercase tracking-wider">Email</span><p className="text-sm text-espresso-700">{showDetail.email}</p></div>
                  <div><span className="text-[10px] text-steel uppercase tracking-wider">Teléfono</span><p className="text-sm text-espresso-700">{showDetail.telefono}</p></div>
                  <div><span className="text-[10px] text-steel uppercase tracking-wider">Fecha</span><p className="text-sm text-espresso-700">{showDetail.fecha}</p></div>
                  <div><span className="text-[10px] text-steel uppercase tracking-wider">Hora</span><p className="text-sm text-espresso-700">{showDetail.hora}</p></div>
                  <div><span className="text-[10px] text-steel uppercase tracking-wider">Personas</span><p className="text-sm text-espresso-700">{showDetail.personas}</p></div>
                  <div><span className="text-[10px] text-steel uppercase tracking-wider">Zona</span><p className="text-sm text-espresso-700">{showDetail.zona}</p></div>
                  <div><span className="text-[10px] text-steel uppercase tracking-wider">Ocasión</span><p className="text-sm text-espresso-700">{showDetail.ocasion}</p></div>
                  {showDetail.comentarios && <div className="col-span-2"><span className="text-[10px] text-steel uppercase tracking-wider">Comentarios</span><p className="text-sm text-espresso-700">{showDetail.comentarios}</p></div>}
                  <div className="col-span-2"><span className="text-[10px] text-steel uppercase tracking-wider">Creada</span><p className="text-sm text-espresso-700">{new Date(showDetail.createdAt).toLocaleString()}</p></div>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button onClick={() => { setShowDetail(null); openEdit(showEdit || showDetail) }} className="btn-secondary text-sm py-2.5 flex items-center gap-2"><FaEdit size={12} /> Editar</button>
                  <button onClick={() => { setShowDetail(null); setEnviandoMensaje(showDetail); setMensaje(`Hola ${showDetail.nombre}, sobre tu reserva #${showDetail.id.slice(0, 8)}:`) }} className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl hover:bg-emerald-700 transition-all font-medium text-sm"><FaWhatsapp size={14} /> WhatsApp</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* WhatsApp Message Modal */}
        {enviandoMensaje && (
          <div className="fixed inset-0 bg-espresso-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setEnviandoMensaje(null)}>
            <div className="bg-white rounded-3xl w-full max-w-lg shadow-xl" onClick={(e) => e.stopPropagation()}>
              <div className="p-6 border-b border-cream-200 flex items-center justify-between">
                <h3 className="text-lg font-display font-bold text-espresso-800">Enviar mensaje a {enviandoMensaje.nombre}</h3>
                <button onClick={() => setEnviandoMensaje(null)} className="p-2 rounded-lg hover:bg-cream-100 transition-all"><FaTimes size={14} className="text-steel" /></button>
              </div>
              <div className="p-6 space-y-4">
                <textarea value={mensaje} onChange={(e) => setMensaje(e.target.value)} className="input-base resize-none" placeholder="Escribe tu mensaje..." rows={4} />
                <div className="flex justify-end gap-3">
                  <button onClick={() => setEnviandoMensaje(null)} className="btn-secondary text-sm py-2.5">Cancelar</button>
                  <button onClick={() => {
                    const phone = enviandoMensaje.telefono ? enviandoMensaje.telefono.replace(/[^0-9]/g, '') : CONFIG.contacto.whatsapp
                    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(mensaje)}`, '_blank')
                    toast.success(`Mensaje preparado para ${enviandoMensaje.nombre}`)
                    setEnviandoMensaje(null)
                  }} className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl hover:bg-emerald-700 transition-all font-medium text-sm">
                    <FaWhatsapp size={14} /> Enviar por WhatsApp
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
          title="Eliminar reserva"
          message="¿Estás seguro de que deseas eliminar esta reserva? Esta acción no se puede deshacer."
          confirmText="Eliminar"
          variant="danger"
        />
      </div>
    </>
  )
}
