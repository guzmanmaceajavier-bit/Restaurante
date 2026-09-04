import { useState, useEffect } from 'react'
import { storage } from '../lib/storage'
import { toast } from 'sonner'
import { SEO } from '../lib/seo'
import { CONFIG } from '../lib/config'
import { FaWhatsapp, FaSearch } from 'react-icons/fa'
import type { ReservaData } from '../types/ReservaData'

export default function GestionReserva() {
  const [reservas, setReservas] = useState<ReservaData[]>([])
  const [busqueda, setBusqueda] = useState('')
  const [filtro, setFiltro] = useState<ReservaData | null>(null)

  useEffect(() => { setReservas(storage.getReservas()) }, [])

  const buscarReserva = () => {
    if (!busqueda.trim()) { toast.error('Ingresa un ID o correo para buscar'); return }
    const q = busqueda.toLowerCase()
    const encontrada = reservas.find((r) => r.email.toLowerCase() === q || r.id.toLowerCase() === q)
    if (encontrada) { setFiltro(encontrada) }
    else { toast.error('No se encontró ninguna reserva con ese ID o correo') }
  }

  const actualizarReserva = (actualizada: ReservaData) => {
    const nuevas = reservas.map((r) => (r.id === actualizada.id ? actualizada : r))
    setReservas(nuevas); storage.setReservas(nuevas); setFiltro(null)
    toast.success('Reserva actualizada correctamente')
  }

  const eliminarReserva = (id: string) => {
    const nuevas = reservas.filter((r) => r.id !== id)
    setReservas(nuevas); storage.setReservas(nuevas); setFiltro(null)
    toast.success('Reserva eliminada')
  }

  return (
    <>
      <SEO title="Gestionar Reserva" description="Busca, edita o cancela tu reserva en Sabor y Origen" />
      <section className="pt-8 pb-20 px-6 bg-cream-50 min-h-screen">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-olive-500 font-semibold text-sm tracking-[0.15em] uppercase">Reservas</span>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-espresso-800 mt-2">Gestión de Reservas</h1>
          </div>

          <div className="bg-white rounded-3xl shadow-card border border-cream-200 p-8 mb-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-steel/40" size={14} />
                <input
                  type="text" placeholder="Buscar por ID o correo"
                  className="input-base pl-11"
                  value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && buscarReserva()}
                />
              </div>
              <button onClick={buscarReserva} className="btn-primary shrink-0">Buscar</button>
            </div>
          </div>

          {filtro && (
            <div className="bg-white border border-cream-200 rounded-3xl p-8 shadow-card">
              <h2 className="text-xl font-display font-bold text-espresso-800 mb-6">Reserva encontrada</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-espresso-700 mb-1 block">Nombre</label>
                  <input type="text" value={filtro.nombre} onChange={(e) => setFiltro({ ...filtro, nombre: e.target.value })} className="input-base" />
                </div>
                <div>
                  <label className="text-sm font-medium text-espresso-700 mb-1 block">Email</label>
                  <input type="email" value={filtro.email} onChange={(e) => setFiltro({ ...filtro, email: e.target.value })} className="input-base" />
                </div>
                <div>
                  <label className="text-sm font-medium text-espresso-700 mb-1 block">Fecha</label>
                  <input type="date" value={filtro.fecha} onChange={(e) => setFiltro({ ...filtro, fecha: e.target.value })} className="input-base" />
                </div>
                <div>
                  <label className="text-sm font-medium text-espresso-700 mb-1 block">Hora</label>
                  <input type="time" value={filtro.hora} onChange={(e) => setFiltro({ ...filtro, hora: e.target.value })} className="input-base" />
                </div>
                <div>
                  <label className="text-sm font-medium text-espresso-700 mb-1 block">Personas</label>
                  <input type="number" value={filtro.personas} onChange={(e) => setFiltro({ ...filtro, personas: Number(e.target.value) })} className="input-base" />
                </div>
                <div>
                  <label className="text-sm font-medium text-espresso-700 mb-1 block">Teléfono</label>
                  <input type="text" value={filtro.telefono || ''} onChange={(e) => setFiltro({ ...filtro, telefono: e.target.value })} className="input-base" />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-sm font-medium text-espresso-700 mb-1 block">Comentarios</label>
                  <textarea value={filtro.comentarios || ''} onChange={(e) => setFiltro({ ...filtro, comentarios: e.target.value })} className="input-base resize-none" rows={3} placeholder="Alguna solicitud especial..." />
                </div>
              </div>
              <div className="flex flex-wrap justify-end gap-3 mt-6">
                <button onClick={() => setFiltro(null)} className="btn-secondary text-sm py-2.5">Cerrar</button>
                <a
                  href={`https://wa.me/${CONFIG.contacto.whatsapp}?text=${encodeURIComponent(`🚫 *Cancelar reserva*%0AID: ${filtro.id}%0ANombre: ${filtro.nombre}%0AFecha: ${filtro.fecha} ${filtro.hora}%0APersonas: ${filtro.personas}`)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-sage-500 text-white px-4 py-2.5 rounded-xl hover:bg-sage-600 transition-all font-medium text-sm"
                >
                  <FaWhatsapp size={14} /> Cancelar por WhatsApp
                </a>
                <button onClick={() => eliminarReserva(filtro.id)} className="bg-red-500 text-white px-4 py-2.5 rounded-xl hover:bg-red-600 transition-all font-medium text-sm">
                  Eliminar
                </button>
                <button onClick={() => actualizarReserva(filtro)} className="btn-primary text-sm py-2.5">
                  Guardar cambios
                </button>
              </div>
            </div>
          )}

          {!filtro && (
            <div className="bg-white border border-cream-200 rounded-3xl p-10 text-center shadow-card">
              <div className="w-16 h-16 bg-cream-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FaSearch className="text-steel/40" size={20} />
              </div>
              <p className="text-lg font-display font-bold text-espresso-800 mb-1">Busca tu reserva</p>
              <p className="text-sm text-steel">Ingresa tu código de reserva o correo electrónico</p>
              <p className="text-xs text-steel/50 mt-2">Ej: RES-A1B2C3 o correo@ejemplo.com</p>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
