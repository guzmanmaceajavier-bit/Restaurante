import { useState, useMemo } from 'react'
import { FaUsers, FaCrown, FaUserFriends, FaUser, FaUserPlus, FaUserSlash, FaSearch } from 'react-icons/fa'
import EmptyState from '../components/core/EmptyState'
import { Pagination } from '../components/admin/Pagination'
import { ExportButton } from '../components/admin/ExportButton'
import { SEO } from '../lib/seo'

const ITEMS_PER_PAGE = 10

interface Cliente {
  nombre: string
  email: string
  telefono: string
  puntos?: number
}

interface Orden {
  phone: string
  createdAt?: string
  total?: number
}

interface Segmento {
  id: string
  label: string
  icon: any
  color: string
  borderColor: string
  bgColor: string
  description: string
  min: number
  max: number | null
}

const SEGMENTOS: Segmento[] = [
  { id: 'vip', label: 'VIP', icon: FaCrown, color: 'text-gold-500', borderColor: 'border-gold-300', bgColor: 'bg-gold-50', description: '10+ pedidos', min: 10, max: null },
  { id: 'frecuente', label: 'Frecuente', icon: FaUserFriends, color: 'text-olive-500', borderColor: 'border-olive-300', bgColor: 'bg-olive-50', description: '5-9 pedidos', min: 5, max: 9 },
  { id: 'ocasional', label: 'Ocasional', icon: FaUser, color: 'text-sage-500', borderColor: 'border-sage-300', bgColor: 'bg-sage-50', description: '2-4 pedidos', min: 2, max: 4 },
  { id: 'nuevo', label: 'Nuevo', icon: FaUserPlus, color: 'text-blue-500', borderColor: 'border-blue-300', bgColor: 'bg-blue-50', description: '1 pedido', min: 1, max: 1 },
  { id: 'inactivo', label: 'Inactivo', icon: FaUserSlash, color: 'text-steel', borderColor: 'border-cream-300', bgColor: 'bg-cream-100', description: 'Sin pedidos en 30 días', min: 0, max: 0 },
]

export default function AdminSegmentacion() {
  const [segmentoActivo, setSegmentoActivo] = useState<string | null>(null)
  const [busqueda, setBusqueda] = useState('')
  const [page, setPage] = useState(1)

  const clientes: Cliente[] = JSON.parse(localStorage.getItem('clientes') || '[]')
  const ordenes: Orden[] = JSON.parse(localStorage.getItem('ordenes') || '[]')

  const clientesEnriquecidos = useMemo(() => {
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    return clientes.map((c) => {
      const ordenesCliente = ordenes.filter((o) => o.phone === c.telefono)
      const ordenesRecientes = ordenesCliente.filter(
        (o) => o.createdAt && new Date(o.createdAt) >= thirtyDaysAgo
      )
      const totalOrdenes = ordenesCliente.length
      const puntos = c.puntos || 0

      let segmento: string
      if (totalOrdenes === 0) {
        segmento = 'inactivo'
      } else if (ordenesRecientes.length === 0) {
        segmento = 'inactivo'
      } else if (totalOrdenes >= 10) {
        segmento = 'vip'
      } else if (totalOrdenes >= 5) {
        segmento = 'frecuente'
      } else if (totalOrdenes >= 2) {
        segmento = 'ocasional'
      } else {
        segmento = 'nuevo'
      }

      const ultimaOrden = ordenesCliente
        .filter((o) => o.createdAt)
        .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())[0]

      return {
        ...c,
        totalOrdenes,
        puntos,
        segmento,
        ultimaOrden: ultimaOrden?.createdAt || null,
      }
    })
  }, [clientes, ordenes])

  const segmentCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    SEGMENTOS.forEach((s) => (counts[s.id] = 0))
    clientesEnriquecidos.forEach((c) => {
      if (counts[c.segmento] !== undefined) counts[c.segmento]++
    })
    return counts
  }, [clientesEnriquecidos])

  const clientesFiltrados = useMemo(() => {
    let filtered = segmentoActivo
      ? clientesEnriquecidos.filter((c) => c.segmento === segmentoActivo)
      : clientesEnriquecidos

    if (busqueda) {
      const b = busqueda.toLowerCase()
      filtered = filtered.filter(
        (c) =>
          c.nombre?.toLowerCase().includes(b) ||
          c.email?.toLowerCase().includes(b) ||
          c.telefono?.includes(b)
      )
    }

    return filtered
  }, [clientesEnriquecidos, segmentoActivo, busqueda])

  const totalPages = Math.ceil(clientesFiltrados.length / ITEMS_PER_PAGE)
  const pagina = clientesFiltrados.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  )

  const segmentoInfo = SEGMENTOS.find((s) => s.id === segmentoActivo)

  return (
    <div>
      <SEO title="Admin - Segmentación" description="Segmentación de clientes" />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-espresso-800">Segmentación</h1>
          <p className="text-steel text-sm mt-1">{clientesEnriquecidos.length} cliente{clientesEnriquecidos.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-3">
          {segmentoActivo && (
            <ExportButton
              data={clientesFiltrados}
              filename={`segmento-${segmentoActivo}`}
              columns={[
                { key: 'nombre', label: 'Nombre' },
                { key: 'email', label: 'Email' },
                { key: 'telefono', label: 'Teléfono' },
                { key: 'totalOrdenes', label: 'Pedidos' },
                { key: 'puntos', label: 'Puntos' },
                { key: 'ultimaOrden', label: 'Último pedido' },
              ]}
            />
          )}
          <div className="relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-steel/40" size={14} />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => {
                setBusqueda(e.target.value)
                setPage(1)
              }}
              placeholder="Buscar..."
              className="input-base pl-11 text-sm w-64"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        {SEGMENTOS.map((s) => {
          const count = segmentCounts[s.id] || 0
          const isActive = segmentoActivo === s.id
          return (
            <button
              key={s.id}
              onClick={() => {
                setSegmentoActivo(isActive ? null : s.id)
                setBusqueda('')
                setPage(1)
              }}
              className={`bg-white rounded-2xl p-4 border-2 text-left transition-all hover:shadow-lift ${
                isActive
                  ? `${s.borderColor} shadow-md`
                  : 'border-cream-200 hover:border-cream-300'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-10 h-10 ${s.bgColor} rounded-xl flex items-center justify-center`}>
                  <s.icon size={16} className={s.color} />
                </div>
                <span className={`text-2xl font-display font-bold ${isActive ? s.color : 'text-espresso-800'}`}>
                  {count}
                </span>
              </div>
              <p className="text-sm font-semibold text-espresso-800">{s.label}</p>
              <p className="text-[10px] text-steel">{s.description}</p>
            </button>
          )
        })}
      </div>

      {segmentoActivo && (
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-lg font-display font-bold text-espresso-800">
            {segmentoInfo?.label} ({clientesFiltrados.length})
          </h2>
          <button
            onClick={() => {
              setSegmentoActivo(null)
              setBusqueda('')
              setPage(1)
            }}
            className="text-xs text-steel hover:text-espresso-700 underline"
          >
            Limpiar filtro
          </button>
        </div>
      )}

      {pagina.length === 0 ? (
        <EmptyState
          icon={<FaUsers size={24} />}
          title="No hay clientes"
          description={segmentoActivo ? 'No hay clientes en este segmento' : 'Los clientes aparecerán cuando se registren'}
        />
      ) : (
        <>
          <div className="bg-white rounded-2xl border border-cream-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-cream-50 border-b border-cream-200">
                    <th className="p-3 text-left text-xs font-semibold text-espresso-700 uppercase tracking-wider">Cliente</th>
                    <th className="p-3 text-left text-xs font-semibold text-espresso-700 uppercase tracking-wider">Contacto</th>
                    <th className="p-3 text-center text-xs font-semibold text-espresso-700 uppercase tracking-wider">Pedidos</th>
                    <th className="p-3 text-center text-xs font-semibold text-espresso-700 uppercase tracking-wider">Puntos</th>
                    <th className="p-3 text-center text-xs font-semibold text-espresso-700 uppercase tracking-wider">Segmento</th>
                    <th className="p-3 text-right text-xs font-semibold text-espresso-700 uppercase tracking-wider">Último pedido</th>
                  </tr>
                </thead>
                <tbody>
                  {pagina.map((c, i) => {
                    const seg = SEGMENTOS.find((s) => s.id === c.segmento)
                    return (
                      <tr key={i} className="border-t border-cream-100 hover:bg-cream-50/50 transition-colors">
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 ${seg?.bgColor || 'bg-cream-100'} rounded-xl flex items-center justify-center text-sm font-bold ${seg?.color || 'text-steel'}`}>
                              {c.nombre?.charAt(0) || '?'}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-espresso-800">{c.nombre}</p>
                              <p className="text-[10px] text-steel">{c.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 text-xs text-steel">{c.telefono || '—'}</td>
                        <td className="p-3 text-center">
                          <span className="w-8 h-8 bg-cream-100 rounded-lg flex items-center justify-center text-xs font-bold text-espresso-700 mx-auto">
                            {c.totalOrdenes}
                          </span>
                        </td>
                        <td className="p-3 text-center text-sm font-semibold text-espresso-800">{c.puntos}</td>
                        <td className="p-3 text-center">
                          {seg && (
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold ${seg.bgColor} ${seg.color}`}>
                              <seg.icon size={10} />
                              {seg.label}
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-right text-xs text-steel">
                          {c.ultimaOrden
                            ? new Date(c.ultimaOrden).toLocaleDateString('es-CO')
                            : '—'}
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
    </div>
  )
}
