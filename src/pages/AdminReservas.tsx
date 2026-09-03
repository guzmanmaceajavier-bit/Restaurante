import { useEffect, useState, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { storage } from '../lib/storage'
import { toast } from 'sonner'
import { SEO } from '../lib/seo'
import type { ReservaData as Reserva } from '../types/ReservaData'

export default function AdminReservas() {
  const [reservas, setReservas] = useState<Reserva[]>([])
  const [editando, setEditando] = useState<Reserva | null>(null)
  const [enviandoMensaje, setEnviandoMensaje] = useState<Reserva | null>(null)
  const [mensaje, setMensaje] = useState('')
  const [adminName, setAdminName] = useState<string | null>(null)
  const [filtroEstado, setFiltroEstado] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    if (!storage.isAdmin()) { navigate('/admin-login'); return }
    setAdminName(storage.getAdminName())
    setReservas(storage.getReservas())
  }, [navigate])

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

  const guardarReservas = (data: Reserva[]) => {
    setReservas(data)
    storage.setReservas(data)
  }

  const eliminarReserva = (id: string) => {
    guardarReservas(reservas.filter((r) => r.id !== id))
    toast.success('Reserva eliminada')
  }

  const guardarEdicion = () => {
    if (!editando) return
    guardarReservas(reservas.map((r) => (r.id === editando.id ? editando : r)))
    setEditando(null)
    toast.success('Reserva actualizada')
  }

  const confirmarReserva = (id: string) => {
    const actualizadas = reservas.map((r) =>
      r.id === id ? { ...r, estado: 'confirmada' as const } : r
    )
    guardarReservas(actualizadas)
    const reserva = actualizadas.find((r) => r.id === id)
    if (reserva) {
      setEnviandoMensaje(reserva)
      setMensaje(`Hola ${reserva.nombre}, tu reserva para el ${reserva.fecha} a las ${reserva.hora} ha sido confirmada. ¡Te esperamos!`)
    }
    toast.success('Reserva confirmada')
  }

  const rechazarReserva = (id: string) => {
    const actualizadas = reservas.map((r) =>
      r.id === id ? { ...r, estado: 'rechazada' as const } : r
    )
    guardarReservas(actualizadas)
    const reserva = actualizadas.find((r) => r.id === id)
    if (reserva) {
      setEnviandoMensaje(reserva)
      setMensaje(`Hola ${reserva.nombre}, lamentamos informarte que no hay disponibilidad para tu reserva del ${reserva.fecha} a las ${reserva.hora}.`)
    }
    toast.success('Reserva rechazada')
  }

  const cerrarSesion = () => {
    storage.clearAdmin()
    navigate('/admin-login')
  }

  return (
    <>
      <SEO title="Admin - Reservas" />
      <div className="min-h-screen bg-warm p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-3xl font-serif font-bold text-ink">Panel de Reservas</h2>
            <p className="text-steel mt-1">Bienvenido {adminName || 'Administrador'} — {reservasFiltradas.length} de {reservas.length} reservas</p>
          </div>

          <div className="flex gap-3">
            <Link to="/admin-dashboard" className="bg-warm text-ink px-4 py-2 rounded-xl font-medium hover:bg-brick-50 transition-all border border-smoke">Dashboard</Link>
            <Link to="/admin-ordenes" className="bg-warm text-ink px-4 py-2 rounded-xl font-medium hover:bg-brick-50 transition-all border border-smoke">Pedidos</Link>
            <button onClick={cerrarSesion} className="bg-red-500 text-white px-4 py-2 rounded-xl hover:bg-red-600 transition-all font-semibold">Cerrar sesión</button>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-smoke p-4 mb-6 flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre, email, teléfono o ID..."
            className="flex-1 px-4 py-2 rounded-xl border border-smoke bg-white text-ink placeholder:text-steel/50 focus:outline-none focus:ring-2 focus:ring-brick-500/30 focus:border-brick-500 text-sm"
          />
          <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}
            className="px-4 py-2 rounded-xl border border-smoke bg-white text-ink text-sm focus:outline-none focus:ring-2 focus:ring-brick-500/30">
            <option value="">Todos los estados</option>
            <option value="Pendiente">Pendiente</option>
            <option value="confirmada">Confirmada</option>
            <option value="rechazada">Rechazada</option>
          </select>
        </div>

        {reservasFiltradas.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-smoke">
            <p className="text-xl mb-2 text-ink">No hay reservas registradas</p>
            <p className="text-sm text-steel">Las reservas aparecerán aquí cuando los clientes las creen.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-smoke overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-warm text-left text-ink">
                    <th className="p-3 font-semibold text-sm">ID</th>
                    <th className="p-3 font-semibold text-sm">Nombre</th>
                    <th className="p-3 font-semibold text-sm">Email</th>
                    <th className="p-3 font-semibold text-sm">Teléfono</th>
                    <th className="p-3 font-semibold text-sm">Fecha</th>
                    <th className="p-3 font-semibold text-sm">Hora</th>
                    <th className="p-3 font-semibold text-sm">Personas</th>
                    <th className="p-3 font-semibold text-sm">Zona</th>
                    <th className="p-3 font-semibold text-sm">Estado</th>
                    <th className="p-3 font-semibold text-sm text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {reservasFiltradas.map((r) => (
                    <tr key={r.id} className="border-t border-smoke hover:bg-warm/50 transition-colors">
                      <td className="p-3 text-sm font-mono text-steel">{r.id}</td>
                      <td className="p-3 font-medium text-ink">{r.nombre}</td>
                      <td className="p-3 text-sm text-steel">{r.email}</td>
                      <td className="p-3 text-sm text-steel">{r.telefono || '-'}</td>
                      <td className="p-3 text-sm text-ink">{r.fecha}</td>
                      <td className="p-3 text-sm text-ink">{r.hora}</td>
                      <td className="p-3 text-center text-ink">{r.personas}</td>
                      <td className="p-3 text-sm text-steel">{r.zona || '-'}</td>
                      <td className="p-3 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          r.estado === 'confirmada' ? 'bg-green-100 text-green-700' :
                          r.estado === 'rechazada' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {r.estado || 'Pendiente'}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2 justify-center flex-wrap">
                          <button onClick={() => confirmarReserva(r.id)} className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-all">Confirmar</button>
                          <button onClick={() => rechazarReserva(r.id)} className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-all">Rechazar</button>
                          <button onClick={() => setEditando(r)} className="bg-brick-500 hover:bg-brick-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-all">Editar</button>
                          <button onClick={() => eliminarReserva(r.id)} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-all">Eliminar</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {editando && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setEditando(null)}>
            <div className="bg-white p-6 rounded-2xl w-full max-w-lg shadow-xl mx-4" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-xl font-serif font-bold text-ink mb-4">Editar Reserva</h3>
              <div className="grid grid-cols-2 gap-3">
                <input type="text" value={editando.nombre} onChange={(e) => setEditando({ ...editando, nombre: e.target.value })} className="border border-smoke p-3 rounded-xl focus:ring-2 focus:ring-brick-500/30 outline-none bg-white text-ink" placeholder="Nombre" />
                <input type="email" value={editando.email} onChange={(e) => setEditando({ ...editando, email: e.target.value })} className="border border-smoke p-3 rounded-xl focus:ring-2 focus:ring-brick-500/30 outline-none bg-white text-ink" placeholder="Email" />
                <input type="tel" value={editando.telefono || ''} onChange={(e) => setEditando({ ...editando, telefono: e.target.value })} className="border border-smoke p-3 rounded-xl focus:ring-2 focus:ring-brick-500/30 outline-none bg-white text-ink" placeholder="Teléfono" />
                <input type="text" value={editando.zona || ''} onChange={(e) => setEditando({ ...editando, zona: e.target.value })} className="border border-smoke p-3 rounded-xl focus:ring-2 focus:ring-brick-500/30 outline-none bg-white text-ink" placeholder="Zona" />
                <input type="date" value={editando.fecha} onChange={(e) => setEditando({ ...editando, fecha: e.target.value })} className="border border-smoke p-3 rounded-xl focus:ring-2 focus:ring-brick-500/30 outline-none bg-white text-ink" />
                <input type="time" value={editando.hora} onChange={(e) => setEditando({ ...editando, hora: e.target.value })} className="border border-smoke p-3 rounded-xl focus:ring-2 focus:ring-brick-500/30 outline-none bg-white text-ink" />
                <input type="number" value={editando.personas} onChange={(e) => setEditando({ ...editando, personas: Number(e.target.value) })} className="border border-smoke p-3 rounded-xl focus:ring-2 focus:ring-brick-500/30 outline-none bg-white text-ink" />
                <select value={editando.estado} onChange={(e) => setEditando({ ...editando, estado: e.target.value as any })} className="border border-smoke p-3 rounded-xl focus:ring-2 focus:ring-brick-500/30 outline-none bg-white text-ink">
                  <option value="Pendiente">Pendiente</option>
                  <option value="confirmada">Confirmada</option>
                  <option value="rechazada">Rechazada</option>
                </select>
              </div>
              <textarea value={editando.comentarios || ''} onChange={(e) => setEditando({ ...editando, comentarios: e.target.value })} className="border border-smoke p-3 rounded-xl w-full mt-3 focus:ring-2 focus:ring-brick-500/30 outline-none resize-none bg-white text-ink" placeholder="Comentarios" rows={2} />
              <div className="flex justify-end gap-3 mt-4">
                <button onClick={() => setEditando(null)} className="bg-gray-400 text-white px-4 py-2 rounded-xl hover:bg-gray-500 transition-all font-medium">Cancelar</button>
                <button onClick={guardarEdicion} className="bg-brick-500 text-white px-4 py-2 rounded-xl hover:bg-brick-600 transition-all font-medium">Guardar</button>
              </div>
            </div>
          </div>
        )}

        {enviandoMensaje && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setEnviandoMensaje(null)}>
            <div className="bg-white p-6 rounded-2xl w-full max-w-lg shadow-xl mx-4" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-xl font-serif font-bold text-ink mb-4">Enviar mensaje a {enviandoMensaje.nombre}</h3>
              <textarea value={mensaje} onChange={(e) => setMensaje(e.target.value)} className="border border-smoke p-3 rounded-xl w-full focus:ring-2 focus:ring-brick-500/30 outline-none resize-none bg-white text-ink" placeholder="Escribe tu mensaje..." rows={4} />
              <div className="flex justify-end gap-3 mt-4">
                <button onClick={() => setEnviandoMensaje(null)} className="bg-gray-400 text-white px-4 py-2 rounded-xl hover:bg-gray-500 transition-all font-medium">Cancelar</button>
                <button onClick={() => {
                  const whatsappUrl = `https://wa.me/${enviandoMensaje.telefono ? enviandoMensaje.telefono.replace(/[^0-9]/g, '') : '573001234567'}?text=${encodeURIComponent(mensaje)}`
                  window.open(whatsappUrl, '_blank')
                  toast.success(`Mensaje preparado para ${enviandoMensaje.nombre}`)
                  setEnviandoMensaje(null)
                }} className="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 transition-all font-medium">
                  Enviar por WhatsApp
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  )
}
