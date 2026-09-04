import { useEffect, useState, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { storage } from '../lib/storage'
import { SEO } from '../lib/seo'
import { toast } from 'sonner'
import clsx from 'clsx'

type EstadoMesa = 'disponible' | 'ocupada' | 'reservada' | 'en_preparacion' | 'limpieza'

interface IMesa {
  id: string; numero: number; capacidad: number; ubicacion: string; estado: EstadoMesa; notas?: string
}

const MESAS_INICIALES: IMesa[] = [
  { id: 'm1', numero: 1, capacidad: 2, ubicacion: 'Interior', estado: 'disponible' },
  { id: 'm2', numero: 2, capacidad: 2, ubicacion: 'Interior', estado: 'disponible' },
  { id: 'm3', numero: 3, capacidad: 4, ubicacion: 'Interior', estado: 'ocupada' },
  { id: 'm4', numero: 4, capacidad: 4, ubicacion: 'Interior', estado: 'disponible' },
  { id: 'm5', numero: 5, capacidad: 6, ubicacion: 'Terraza', estado: 'reservada' },
  { id: 'm6', numero: 6, capacidad: 6, ubicacion: 'Terraza', estado: 'disponible' },
  { id: 'm7', numero: 7, capacidad: 8, ubicacion: 'Terraza', estado: 'disponible' },
  { id: 'm8', numero: 8, capacidad: 2, ubicacion: 'Barra', estado: 'ocupada' },
  { id: 'm9', numero: 9, capacidad: 2, ubicacion: 'Barra', estado: 'disponible' },
  { id: 'm10', numero: 10, capacidad: 10, ubicacion: 'Zona Privada', estado: 'disponible' },
]

const estadoColores: Record<EstadoMesa, { bg: string; border: string; text: string; label: string; icon: string }> = {
  disponible: { bg: 'bg-sage-50', border: 'border-sage-300', text: 'text-sage-700', label: 'Disponible', icon: '✅' },
  ocupada: { bg: 'bg-red-50', border: 'border-red-300', text: 'text-red-700', label: 'Ocupada', icon: '🔴' },
  reservada: { bg: 'bg-gold-50', border: 'border-gold-300', text: 'text-gold-700', label: 'Reservada', icon: '📅' },
  en_preparacion: { bg: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-700', label: 'En preparación', icon: '👨‍🍳' },
  limpieza: { bg: 'bg-cream-100', border: 'border-cream-300', text: 'text-steel', label: 'Limpieza', icon: '🧹' },
}

export default function AdminMesas() {
  const [mesas, setMesas] = useState<IMesa[]>([])
  const [filtroUbicacion, setFiltroUbicacion] = useState('')
  const [selected, setSelected] = useState<IMesa | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (!storage.isAdmin()) { navigate('/admin-login'); return }
    const stored = localStorage.getItem('mesas-storage')
    if (stored) {
      try { setMesas(JSON.parse(stored).state?.mesas || JSON.parse(stored)) } catch { setMesas(MESAS_INICIALES) }
    } else {
      setMesas(MESAS_INICIALES)
      localStorage.setItem('mesas-storage', JSON.stringify({ state: { mesas: MESAS_INICIALES } }))
    }
  }, [navigate])

  const guardarMesas = (nuevas: IMesa[]) => { setMesas(nuevas); localStorage.setItem('mesas-storage', JSON.stringify({ state: { mesas: nuevas } })) }
  const cambiarEstado = (id: string, nuevoEstado: EstadoMesa) => { guardarMesas(mesas.map((m) => m.id === id ? { ...m, estado: nuevoEstado } : m)); setSelected(null); toast.success(`Mesa → ${estadoColores[nuevoEstado].label}`) }

  const ubicaciones = useMemo(() => [...new Set(mesas.map((m) => m.ubicacion))], [mesas])
  const mesasFiltradas = filtroUbicacion ? mesas.filter((m) => m.ubicacion === filtroUbicacion) : mesas
  const stats = useMemo(() => ({
    total: mesas.length, disponibles: mesas.filter((m) => m.estado === 'disponible').length,
    ocupadas: mesas.filter((m) => m.estado === 'ocupada').length, reservadas: mesas.filter((m) => m.estado === 'reservada').length,
  }), [mesas])

  return (
    <div className="min-h-screen bg-cream-50 p-6">
      <SEO title="Admin - Mesas" />
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-display font-bold text-espresso-800">Mesas</h1>
            <p className="text-steel text-sm mt-1">{stats.disponibles} disponibles · {stats.ocupadas} ocupadas · {stats.reservadas} reservadas</p>
          </div>
          <Link to="/admin-dashboard" className="bg-white text-espresso-600 px-4 py-2 rounded-xl text-sm font-medium hover:bg-cream-100 transition-all border border-cream-200">Dashboard</Link>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          <button onClick={() => setFiltroUbicacion('')} className={clsx('px-4 py-2 rounded-xl text-sm font-medium transition-all', !filtroUbicacion ? 'bg-espresso-800 text-white' : 'bg-white text-espresso-600 hover:bg-cream-100 border border-cream-200')}>
            Todas ({mesas.length})
          </button>
          {ubicaciones.map((u) => (
            <button key={u} onClick={() => setFiltroUbicacion(u)} className={clsx('px-4 py-2 rounded-xl text-sm font-medium transition-all', filtroUbicacion === u ? 'bg-espresso-800 text-white' : 'bg-white text-espresso-600 hover:bg-cream-100 border border-cream-200')}>
              {u} ({mesas.filter((m) => m.ubicacion === u).length})
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {mesasFiltradas.map((m) => {
            const col = estadoColores[m.estado]
            return (
              <button key={m.id} onClick={() => setSelected(m)} className={clsx('border-2 rounded-2xl p-5 text-center hover:shadow-lift transition-all', col.bg, col.border)}>
                <span className="text-2xl mb-2 block">{col.icon}</span>
                <p className="text-2xl font-display font-bold text-espresso-800 mb-1">#{m.numero}</p>
                <p className="text-xs text-steel mb-2">{m.capacidad} personas</p>
                <span className={clsx('inline-block px-3 py-1 rounded-full text-xs font-semibold border', col.bg, col.border, col.text)}>{col.label}</span>
                <p className="text-xs text-steel mt-2">{m.ubicacion}</p>
              </button>
            )
          })}
        </div>

        {selected && (
          <div className="fixed inset-0 bg-espresso-900/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setSelected(null)}>
            <div className="bg-white p-8 rounded-3xl w-full max-w-sm shadow-xl mx-4" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-xl font-display font-bold text-espresso-800 mb-1">Mesa #{selected.numero}</h3>
              <p className="text-sm text-steel mb-5">{selected.ubicacion} · {selected.capacidad} personas</p>
              <div className="space-y-2 mb-5">
                {(Object.keys(estadoColores) as EstadoMesa[]).map((estado) => (
                  <button key={estado} onClick={() => cambiarEstado(selected.id, estado)}
                    className={clsx('w-full text-left px-4 py-3 rounded-xl border-2 transition-all flex items-center gap-3',
                      selected.estado === estado ? 'border-olive-500 bg-olive-50' : 'border-cream-200 hover:border-olive-300'
                    )}>
                    <span className="text-lg">{estadoColores[estado].icon}</span>
                    <span className={clsx('font-medium', estadoColores[estado].text)}>{estadoColores[estado].label}</span>
                  </button>
                ))}
              </div>
              <button onClick={() => setSelected(null)} className="w-full btn-secondary py-2.5">Cerrar</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
