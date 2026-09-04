import { useEffect, useState, useMemo } from 'react'
import { storage } from '../lib/storage'
import { CONFIG } from '../lib/config'
import { toast } from 'sonner'
import { FaSearch, FaWhatsapp, FaFilter, FaTimes, FaCheck, FaBan, FaEdit, FaTrash, FaCalendarAlt } from 'react-icons/fa'
import EmptyState from '../components/core/EmptyState'
import type { ReservaData as Reserva } from '../types/ReservaData'
import clsx from 'clsx'
import { Pagination } from '../components/admin/Pagination'
import { ExportButton } from '../components/admin/ExportButton'
import ConfirmModal from '../components/core/ConfirmModal'

const ITEMS_PER_PAGE = 10

const estadoConfig: Record<string, { bg: string; text: string; border: string }> = {
  Pendiente: { bg: 'bg-gold-50', text: 'text-gold-700', border: 'border-gold-200' },
  confirmada: { bg: 'bg-sage-50', text: 'text-sage-700', border: 'border-sage-200' },
  rechazada: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
}

export default function AdminReservas() {
  const [reservas, setReservas] = useState<Reserva[]>([])
  const [editando, setEditando] = useState<Reserva | null>(null)
  const [enviandoMensaje, setEnviandoMensaje] = useState<Reserva | null>(null)
  const [mensaje, setMensaje] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [page, setPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  useEffect(() => { setReservas(storage.getReservas()) }, [])

  const reservasFiltradas = useMemo(() => {
    return reservas.filter((r) => {
      if (filtroEstado && r.estado !== filtroEstado) return false
      if (busqueda) {
        const b = busqueda.toLowerCase()
        return r.nombre?.toLowerCase().includes(b) || r.email?.toLowerCase().includes(b) || r.telefono?.includes(b) || r.id?.toLowerCase().includes(b)
      }
      return true
    }).sort((a, b) => (a.fecha || '').localeCompare(b.fecha || ''))
  }, [reservas, filtroEstado, busqueda])

  const totalPages = Math.ceil(reservasFiltradas.length / ITEMS_PER_PAGE)
  const reservasPagina = reservasFiltradas.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  const guardar = (data: Reserva[]) => { setReservas(data); storage.setReservas(data) }
  const eliminar = (id: string) => { guardar(reservas.filter((r) => r.id !== id)); toast.success('Reserva eliminada') }
  const guardarEdicion = () => { if (!editando) return; guardar(reservas.map((r) => (r.id === editando.id ? editando : r))); setEditando(null); toast.success('Reserva actualizada') }

  const confirmarReserva = (id: string) => {
    const r = reservas.find((res) => res.id === id)
    if (r) { guardar(reservas.map((res) => res.id === id ? { ...res, estado: 'confirmada' as const } : res)); setEnviandoMensaje(r); setMensaje(`Hola ${r.nombre}, tu reserva para el ${r.fecha} a las ${r.hora} ha sido confirmada. ¡Te esperamos!`); toast.success('Reserva confirmada') }
  }

  const rechazarReserva = (id: string) => {
    const r = reservas.find((res) => res.id === id)
    if (r) { guardar(reservas.map((res) => res.id === id ? { ...res, estado: 'rechazada' as const } : res)); setEnviandoMensaje(r); setMensaje(`Hola ${r.nombre}, lamentamos informarte que no hay disponibilidad para tu reserva del ${r.fecha} a las ${r.hora}.`) }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-espresso-800">Reservas</h1>
          <p className="text-steel text-sm mt-1">{reservasFiltradas.length} reserva{reservasFiltradas.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-2">
          <ExportButton data={reservasFiltradas} filename="reservas" columns={[
            { key: 'id', label: 'ID' }, { key: 'nombre', label: 'Nombre' }, { key: 'email', label: 'Email' },
            { key: 'fecha', label: 'Fecha' }, { key: 'hora', label: 'Hora' }, { key: 'personas', label: 'Personas' },
            { key: 'estado', label: 'Estado' }
          ]} />
          <button onClick={() => setShowFilters(!showFilters)} className={clsx('flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border', showFilters ? 'bg-olive-50 border-olive-200 text-olive-700' : 'bg-white border-cream-200 text-espresso-600 hover:bg-cream-50')}>
            <FaFilter size={12} /> Filtros {(filtroEstado || busqueda) && <span className="w-2 h-2 bg-olive-500 rounded-full" />}
          </button>
          <button onClick={() => { setBusqueda(''); setFiltroEstado(''); setPage(1) }} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-white border border-cream-200 text-espresso-600 hover:bg-cream-50 transition-all">
            <FaTimes size={12} /> Limpiar
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="bg-white rounded-2xl border border-cream-200 p-4 mb-4 flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-steel/40" size={14} />
            <input type="text" value={busqueda} onChange={(e) => { setBusqueda(e.target.value); setPage(1) }} placeholder="Buscar por nombre, email, teléfono..." className="input-base pl-11 text-sm" />
          </div>
          <select value={filtroEstado} onChange={(e) => { setFiltroEstado(e.target.value); setPage(1) }} className="input-base text-sm w-auto">
            <option value="">Todos los estados</option>
            <option value="Pendiente">Pendiente</option>
            <option value="confirmada">Confirmada</option>
            <option value="rechazada">Rechazada</option>
          </select>
        </div>
      )}

      {reservasPagina.length === 0 ? (
        <EmptyState icon={<FaCalendarAlt size={24} />} title="No hay reservas" description="Las reservas aparecerán aquí" />
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
                    <th className="p-3 text-center text-xs font-semibold text-espresso-700 uppercase tracking-wider">Estado</th>
                    <th className="p-3 text-center text-xs font-semibold text-espresso-700 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {reservasPagina.map((r) => {
                    const ec = estadoConfig[r.estado || 'Pendiente'] || estadoConfig.Pendiente
                    return (
                      <tr key={r.id} className="border-t border-cream-100 hover:bg-cream-50/50 transition-colors">
                        <td className="p-3 text-xs font-mono text-steel">{r.id?.slice(0, 8)}...</td>
                        <td className="p-3">
                          <p className="text-sm font-medium text-espresso-800">{r.nombre}</p>
                          <p className="text-[10px] text-steel">{r.email}</p>
                        </td>
                        <td className="p-3 text-sm text-espresso-700">{r.fecha}</td>
                        <td className="p-3 text-sm text-espresso-700">{r.hora}</td>
                        <td className="p-3 text-center text-sm text-espresso-700">{r.personas}</td>
                        <td className="p-3 text-center">
                          <span className={clsx('inline-flex px-2.5 py-1 rounded-full text-[10px] font-semibold border', ec.bg, ec.text, ec.border)}>
                            {r.estado || 'Pendiente'}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex gap-1 justify-center">
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
                            <button onClick={() => setEditando(r)} className="p-1.5 rounded-lg hover:bg-cream-100 transition-all" title="Editar">
                              <FaEdit size={12} className="text-steel" />
                            </button>
                            <button onClick={() => setConfirmDelete(r.id)} className="p-1.5 rounded-lg hover:bg-red-50 transition-all" title="Eliminar">
                              <FaTrash size={12} className="text-red-400" />
                            </button>
                            <a href={`https://wa.me/${(r.telefono || CONFIG.contacto.whatsapp).replace(/[^0-9]/g, '')}?text=${encodeURIComponent(mensaje || `Hola ${r.nombre}, sobre tu reserva #${r.id}`)}`}
                              target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg hover:bg-emerald-50 transition-all" title="WhatsApp">
                              <FaWhatsapp size={12} className="text-emerald-600" />
                            </a>
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

      {/* Edit modal */}
      {editando && (
        <div className="fixed inset-0 bg-espresso-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setEditando(null)}>
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-cream-200">
              <h3 className="text-lg font-display font-bold text-espresso-800">Editar Reserva</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs font-medium text-espresso-700 mb-1 block">Nombre</label><input type="text" value={editando.nombre} onChange={(e) => setEditando({ ...editando, nombre: e.target.value })} className="input-base text-sm" /></div>
                <div><label className="text-xs font-medium text-espresso-700 mb-1 block">Email</label><input type="email" value={editando.email} onChange={(e) => setEditando({ ...editando, email: e.target.value })} className="input-base text-sm" /></div>
                <div><label className="text-xs font-medium text-espresso-700 mb-1 block">Fecha</label><input type="date" value={editando.fecha} onChange={(e) => setEditando({ ...editando, fecha: e.target.value })} className="input-base text-sm" /></div>
                <div><label className="text-xs font-medium text-espresso-700 mb-1 block">Hora</label><input type="time" value={editando.hora} onChange={(e) => setEditando({ ...editando, hora: e.target.value })} className="input-base text-sm" /></div>
                <div><label className="text-xs font-medium text-espresso-700 mb-1 block">Personas</label><input type="number" value={editando.personas} onChange={(e) => setEditando({ ...editando, personas: Number(e.target.value) })} className="input-base text-sm" /></div>
                <div><label className="text-xs font-medium text-espresso-700 mb-1 block">Estado</label>
                  <select value={editando.estado} onChange={(e) => setEditando({ ...editando, estado: e.target.value as any })} className="input-base text-sm">
                    <option value="Pendiente">Pendiente</option>
                    <option value="confirmada">Confirmada</option>
                    <option value="rechazada">Rechazada</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => setEditando(null)} className="btn-secondary text-sm py-2.5">Cancelar</button>
                <button onClick={guardarEdicion} className="btn-primary text-sm py-2.5">Guardar cambios</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Message modal */}
      {enviandoMensaje && (
        <div className="fixed inset-0 bg-espresso-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setEnviandoMensaje(null)}>
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-cream-200">
              <h3 className="text-lg font-display font-bold text-espresso-800">Enviar mensaje a {enviandoMensaje.nombre}</h3>
            </div>
            <div className="p-6 space-y-4">
              <textarea value={mensaje} onChange={(e) => setMensaje(e.target.value)} className="input-base resize-none" placeholder="Escribe tu mensaje..." rows={4} />
              <div className="flex justify-end gap-3">
                <button onClick={() => setEnviandoMensaje(null)} className="btn-secondary text-sm py-2.5">Cancelar</button>
                <button onClick={() => {
                  window.open(`https://wa.me/${enviandoMensaje.telefono ? enviandoMensaje.telefono.replace(/[^0-9]/g, '') : CONFIG.contacto.whatsapp}?text=${encodeURIComponent(mensaje)}`, '_blank')
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
  )
}
