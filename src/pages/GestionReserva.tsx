import { useState, useEffect } from 'react'
import { storage } from '../lib/storage'
import { toast } from 'sonner'
import { SEO } from '../lib/seo'
import type { ReservaData } from '../types/ReservaData'

export default function GestionReserva() {
  const [reservas, setReservas] = useState<ReservaData[]>([])
  const [busqueda, setBusqueda] = useState('')
  const [filtro, setFiltro] = useState<ReservaData | null>(null)

  useEffect(() => {
    setReservas(storage.getReservas())
  }, [])

  const buscarReserva = () => {
    if (!busqueda.trim()) {
      toast.error('Ingresa un ID o correo para buscar')
      return
    }
    const q = busqueda.toLowerCase()
    const encontrada = reservas.find(
      (r) => r.email.toLowerCase() === q || r.id.toLowerCase() === q
    )
    if (encontrada) {
      setFiltro(encontrada)
    } else {
      toast.error('No se encontró ninguna reserva con ese ID o correo')
    }
  }

  const actualizarReserva = (actualizada: ReservaData) => {
    const nuevas = reservas.map((r) => (r.id === actualizada.id ? actualizada : r))
    setReservas(nuevas)
    storage.setReservas(nuevas)
    setFiltro(null)
    toast.success('Reserva actualizada correctamente')
  }

  const eliminarReserva = (id: string) => {
    const nuevas = reservas.filter((r) => r.id !== id)
    setReservas(nuevas)
    storage.setReservas(nuevas)
    setFiltro(null)
    toast.success('Reserva eliminada')
  }

  return (
    <>
      <SEO title="Gestionar Reserva" description="Busca, edita o cancela tu reserva en Sabor y Origen" />
      <div className="min-h-screen bg-orange-50 p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-orange-700 mb-8 text-center">Gestión de Reservas</h1>

        <div className="flex flex-col sm:flex-row gap-2 mb-6">
          <input
            type="text"
            placeholder="Buscar por ID o correo"
            className="border border-orange-300 p-3 flex-1 rounded-xl focus:ring-2 focus:ring-orange-400 outline-none"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && buscarReserva()}
          />
          <button
            onClick={buscarReserva}
            className="bg-orange-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-orange-700 transition-all"
          >
            Buscar
          </button>
        </div>

        {filtro && (
          <div className="bg-white border border-orange-200 rounded-2xl p-6 shadow-lg">
            <h2 className="text-xl font-bold text-orange-700 mb-4">Reserva encontrada</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input type="text" value={filtro.nombre} onChange={(e) => setFiltro({ ...filtro, nombre: e.target.value })} className="border border-orange-300 p-3 rounded-xl focus:ring-2 focus:ring-orange-400 outline-none" placeholder="Nombre" />
              <input type="email" value={filtro.email} onChange={(e) => setFiltro({ ...filtro, email: e.target.value })} className="border border-orange-300 p-3 rounded-xl focus:ring-2 focus:ring-orange-400 outline-none" placeholder="Email" />
              <input type="date" value={filtro.fecha} onChange={(e) => setFiltro({ ...filtro, fecha: e.target.value })} className="border border-orange-300 p-3 rounded-xl focus:ring-2 focus:ring-orange-400 outline-none" />
              <input type="time" value={filtro.hora} onChange={(e) => setFiltro({ ...filtro, hora: e.target.value })} className="border border-orange-300 p-3 rounded-xl focus:ring-2 focus:ring-orange-400 outline-none" />
              <input type="number" value={filtro.personas} onChange={(e) => setFiltro({ ...filtro, personas: Number(e.target.value) })} className="border border-orange-300 p-3 rounded-xl focus:ring-2 focus:ring-orange-400 outline-none" placeholder="Personas" />
              <input type="text" value={filtro.telefono || ''} onChange={(e) => setFiltro({ ...filtro, telefono: e.target.value })} className="border border-orange-300 p-3 rounded-xl focus:ring-2 focus:ring-orange-400 outline-none" placeholder="Teléfono" />
              <textarea value={filtro.comentarios || ''} onChange={(e) => setFiltro({ ...filtro, comentarios: e.target.value })} className="border border-orange-300 p-3 rounded-xl focus:ring-2 focus:ring-orange-400 outline-none col-span-2 resize-none" placeholder="Comentarios" rows={3} />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setFiltro(null)} className="bg-gray-400 text-white px-4 py-2 rounded-xl hover:bg-gray-500 transition-all">Cancelar</button>
              <button onClick={() => eliminarReserva(filtro.id)} className="bg-red-500 text-white px-4 py-2 rounded-xl hover:bg-red-600 transition-all">Eliminar</button>
              <button onClick={() => actualizarReserva(filtro)} className="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 transition-all">Guardar cambios</button>
            </div>
          </div>
        )}

        {!filtro && (
          <div className="bg-white border border-orange-200 rounded-2xl p-8 text-center text-gray-500">
            <p className="text-lg mb-2">Busca una reserva por su código o correo electrónico</p>
            <p className="text-sm">Ej: RES-A1B2C3 o correo@ejemplo.com</p>
          </div>
        )}
      </div>
    </div>
    </>
  )
}
