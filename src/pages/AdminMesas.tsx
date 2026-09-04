import { useEffect, useState, useMemo } from 'react'
import { toast } from 'sonner'
import { FaThLarge, FaMapMarkerAlt } from 'react-icons/fa'
import clsx from 'clsx'

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
  'en preparación': { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', label: 'En preparación', dot: 'bg-blue-500' },
  mantenimiento: { bg: 'bg-cream-200', border: 'border-cream-300', text: 'text-steel', label: 'Mantenimiento', dot: 'bg-steel' },
}

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
  const [selected, setSelected] = useState<Mesa | null>(null)

  useEffect(() => { localStorage.setItem('mesas', JSON.stringify(mesas)) }, [mesas])

  const ubicaciones = useMemo(() => Array.from(new Set(mesas.map((m) => m.ubicacion))), [mesas])
  const filtradas = useMemo(() => filtroUbicacion ? mesas.filter((m) => m.ubicacion === filtroUbicacion) : mesas, [mesas, filtroUbicacion])

  const stats = useMemo(() => ({
    total: mesas.length,
    disponibles: mesas.filter((m) => m.estado === 'disponible').length,
    ocupadas: mesas.filter((m) => m.estado === 'ocupada').length,
    reservadas: mesas.filter((m) => m.estado === 'reservada').length,
  }), [mesas])

  const cambiarEstado = (id: string, nuevoEstado: string) => {
    setMesas(mesas.map((m) => m.id === id ? { ...m, estado: nuevoEstado } : m))
    setSelected(null)
    toast.success(`Mesa cambiada a "${estadoColores[nuevoEstado]?.label}"`)
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-espresso-800">Mesas</h1>
          <p className="text-steel text-sm mt-1">{mesas.length} mesa{mesas.length !== 1 ? 's' : ''} en total</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total', value: stats.total, color: 'bg-espresso-800' },
          { label: 'Disponibles', value: stats.disponibles, color: 'bg-sage-500' },
          { label: 'Ocupadas', value: stats.ocupadas, color: 'bg-red-500' },
          { label: 'Reservadas', value: stats.reservadas, color: 'bg-gold-500' },
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

      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        <button onClick={() => setFiltroUbicacion('')} className={clsx('shrink-0 px-4 py-2 rounded-xl text-xs font-medium transition-all', !filtroUbicacion ? 'bg-olive-500 text-white' : 'bg-white border border-cream-200 text-steel hover:bg-cream-50')}>
          Todas ({mesas.length})
        </button>
        {ubicaciones.map((u) => (
          <button key={u} onClick={() => setFiltroUbicacion(u)} className={clsx('shrink-0 px-4 py-2 rounded-xl text-xs font-medium transition-all', filtroUbicacion === u ? 'bg-olive-500 text-white' : 'bg-white border border-cream-200 text-steel hover:bg-cream-50')}>
            {u} ({mesas.filter((m) => m.ubicacion === u).length})
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtradas.map((m) => {
          const ec = estadoColores[m.estado] || estadoColores.disponible
          return (
            <button key={m.id} onClick={() => setSelected(m)}
              className={clsx('bg-white rounded-2xl border-2 p-5 text-center hover:shadow-lift transition-all group', ec.border)}>
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
          )
        })}
      </div>

      {selected && (
        <div className="fixed inset-0 bg-espresso-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-cream-200 text-center">
              <h3 className="text-lg font-display font-bold text-espresso-800">Mesa #{selected.numero}</h3>
              <p className="text-xs text-steel mt-1">{selected.ubicacion} • {selected.capacidad} personas</p>
            </div>
            <div className="p-4">
              <p className="text-xs font-semibold text-espresso-700 mb-3 px-2">Cambiar estado</p>
              <div className="space-y-1.5">
                {Object.entries(estadoColores).map(([key, val]) => (
                  <button key={key} onClick={() => cambiarEstado(selected.id, key)}
                    className={clsx('w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all', selected.estado === key ? `${val.bg} ${val.text} border ${val.border}` : 'hover:bg-cream-50 text-espresso-600')}>
                    <span className={`w-3 h-3 rounded-full ${val.dot}`} />
                    {val.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
