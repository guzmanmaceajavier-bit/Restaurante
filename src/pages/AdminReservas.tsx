import { useEffect, useState, useMemo } from 'react'
import { storage } from '../lib/storage'
import { CONFIG } from '../lib/config'
import { toast } from 'sonner'
import { FaSearch, FaWhatsapp } from 'react-icons/fa'
import type { ReservaData as Reserva } from '../types/ReservaData'
import clsx from 'clsx'

export default function AdminReservas() {
  const [reservas, setReservas] = useState<Reserva[]>([])
  const [editando, setEditando] = useState<Reserva | null>(null)
  const [enviandoMensaje, setEnviandoMensaje] = useState<Reserva | null>(null)
  const [mensaje, setMensaje] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')
  const [busqueda, setBusqueda] = useState('')

  useEffect(() => {
    setReservas(storage.getReservas())
  }, [])

  const reservasFiltradas = useMemo(() => {
    return reservas.filter((r) => {
      if (filtroEstado && r.estado !== filtroEstado) return false
      if (busqueda) {
        const b = busqueda.toLowerCase()
        return r.nombre.toLowerCase().includes(b) || r.email?.toLowerCase().includes(b) || r.telefono?.includes(b) || r.id.toLowerCase().includes(b)
      }
      return true
    })
  }, [reservas, filtroEstado, busqueda])

  const guardarReservas = (data: Reserva[]) => { setReservas(data); storage.setReservas(data) }
  const eliminarReserva = (id: string) => { guardarReservas(reservas.filter((r) => r.id !== id)); toast.success('Reserva eliminada') }
  const guardarEdicion = () => { if (!editando) return; guardarReservas(reservas.map((r) => (r.id === editando.id ? editando : r))); setEditando(null); toast.success('Reserva actualizada') }

  const confirmarReserva = (id: string) => {
    const actualizadas = reservas.map((r) => r.id === id ? { ...r, estado: 'confirmada' as const } : r)
    guardarReservas(actualizadas)
    const reserva = actualizadas.find((r) => r.id === id)
    if (reserva) { setEnviandoMensaje(reserva); setMensaje(`Hola ${reserva.nombre}, tu reserva para el ${reserva.fecha} a las ${reserva.hora} ha sido confirmada. ¡Te esperamos!`) }
    toast.success('Reserva confirmada')
  }

  const rechazarReserva = (id: string) => {
    const actualizadas = reservas.map((r) => r.id === id ? { ...r, estado: 'rechazada' as const } : r)
    guardarReservas(actualizadas)
    const reserva = actualizadas.find((r) => r.id === id)
    if (reserva) { setEnviandoMensaje(reserva); setMensaje(`Hola ${reserva.nombre}, lamentamos informarte que no hay disponibilidad para tu reserva del ${reserva.fecha} a las ${reserva.hora}.`) }
    toast.success('Reserva rechazada')
  }

  return (
    <div>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-display font-bold text-espresso-800">Reservas</h1>
            <p className="text-steel text-sm mt-1">{reservasFiltradas.length} de {reservas.length} reservas</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-cream-200 p-4 mb-6 flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-steel/40" size={14} />
              <input type="text" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar por nombre, email, teléfono o ID..." className="input-base pl-11 text-sm" />
            </div>
            <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)} className="input-base text-sm w-auto">
              <option value="">Todos los estados</option>
              <option value="Pendiente">Pendiente</option>
              <option value="confirmada">Confirmada</option>
              <option value="rechazada">Rechazada</option>
            </select>
          </div>

          {reservasFiltradas.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-cream-200">
              <p className="text-3xl mb-3">📅</p>
              <p className="text-lg font-display font-bold text-espresso-800 mb-1">No hay reservas</p>
              <p className="text-sm text-steel">Las reservas aparecerán aquí cuando los clientes las creen.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-cream-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-cream-50 text-left text-espresso-700 border-b border-cream-200">
                      <th className="p-3 font-semibold text-xs uppercase tracking-wider">ID</th>
                      <th className="p-3 font-semibold text-xs uppercase tracking-wider">Nombre</th>
                      <th className="p-3 font-semibold text-xs uppercase tracking-wider">Fecha</th>
                      <th className="p-3 font-semibold text-xs uppercase tracking-wider">Hora</th>
                      <th className="p-3 font-semibold text-xs uppercase tracking-wider">Personas</th>
                      <th className="p-3 font-semibold text-xs uppercase tracking-wider">Estado</th>
                      <th className="p-3 font-semibold text-xs uppercase tracking-wider text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reservasFiltradas.map((r) => (
                      <tr key={r.id} className="border-t border-cream-100 hover:bg-cream-50/50 transition-colors">
                        <td className="p-3 text-sm font-mono text-steel">{r.id}</td>
                        <td className="p-3 font-medium text-espresso-800">{r.nombre}</td>
                        <td className="p-3 text-sm text-espresso-700">{r.fecha}</td>
                        <td className="p-3 text-sm text-espresso-700">{r.hora}</td>
                        <td className="p-3 text-center text-espresso-700">{r.personas}</td>
                        <td className="p-3">
                          <span className={clsx('px-3 py-1 rounded-full text-xs font-semibold border',
                            r.estado === 'confirmada' ? 'bg-sage-50 border-sage-200 text-sage-700' :
                            r.estado === 'rechazada' ? 'bg-red-50 border-red-200 text-red-700' :
                            'bg-gold-50 border-gold-200 text-gold-700'
                          )}>{r.estado || 'Pendiente'}</span>
                        </td>
                        <td className="p-3">
                          <div className="flex gap-1.5 justify-center flex-wrap">
                            <button onClick={() => confirmarReserva(r.id)} className="bg-sage-500 hover:bg-sage-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-all">Confirmar</button>
                            <button onClick={() => rechazarReserva(r.id)} className="bg-gold-500 hover:bg-gold-600 text-espresso-900 px-3 py-1.5 rounded-lg text-xs font-medium transition-all">Rechazar</button>
                            <button onClick={() => setEditando(r)} className="bg-espresso-800 hover:bg-espresso-900 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-all">Editar</button>
                            <button onClick={() => eliminarReserva(r.id)} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-all">Eliminar</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {editando && (
          <div className="fixed inset-0 bg-espresso-900/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setEditando(null)}>
            <div className="bg-white p-8 rounded-3xl w-full max-w-lg shadow-xl mx-4" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-xl font-display font-bold text-espresso-800 mb-5">Editar Reserva</h3>
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
              <div className="flex justify-end gap-3 mt-6">
                <button onClick={() => setEditando(null)} className="btn-secondary text-sm py-2.5">Cancelar</button>
                <button onClick={guardarEdicion} className="btn-primary text-sm py-2.5">Guardar</button>
              </div>
            </div>
          </div>
        )}

        {enviandoMensaje && (
          <div className="fixed inset-0 bg-espresso-900/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setEnviandoMensaje(null)}>
            <div className="bg-white p-8 rounded-3xl w-full max-w-lg shadow-xl mx-4" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-xl font-display font-bold text-espresso-800 mb-5">Enviar mensaje a {enviandoMensaje.nombre}</h3>
              <textarea value={mensaje} onChange={(e) => setMensaje(e.target.value)} className="input-base resize-none" placeholder="Escribe tu mensaje..." rows={4} />
              <div className="flex justify-end gap-3 mt-5">
                <button onClick={() => setEnviandoMensaje(null)} className="btn-secondary text-sm py-2.5">Cancelar</button>
                <button onClick={() => {
                  const whatsappUrl = `https://wa.me/${enviandoMensaje.telefono ? enviandoMensaje.telefono.replace(/[^0-9]/g, '') : CONFIG.contacto.whatsapp}?text=${encodeURIComponent(mensaje)}`
                  window.open(whatsappUrl, '_blank')
                  toast.success(`Mensaje preparado para ${enviandoMensaje.nombre}`)
                  setEnviandoMensaje(null)
                }} className="flex items-center gap-2 bg-sage-500 text-white px-5 py-2.5 rounded-xl hover:bg-sage-600 transition-all font-medium text-sm">
                  <FaWhatsapp size={14} /> Enviar por WhatsApp
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
  )
}
