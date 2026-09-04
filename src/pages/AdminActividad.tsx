import { useState, useMemo } from 'react'
import { SEO } from '../lib/seo'
import { toast } from 'sonner'
import { FaHistory, FaShoppingBag, FaCalendarAlt, FaBox, FaUsers, FaSearch, FaTrash, FaFilter } from 'react-icons/fa'
import EmptyState from '../components/core/EmptyState'
import ConfirmModal from '../components/core/ConfirmModal'
import { ExportButton } from '../components/admin/ExportButton'
import { Pagination } from '../components/admin/Pagination'

const ITEMS_PER_PAGE = 15

interface ActivityEntry {
  id: string
  action: string
  entity: string
  entityId?: string
  details?: string
  timestamp: string
  admin?: string
}

const entityIcons: Record<string, { icon: typeof FaShoppingBag; color: string; bg: string }> = {
  pedido: { icon: FaShoppingBag, color: 'text-blue-600', bg: 'bg-blue-100' },
  reserva: { icon: FaCalendarAlt, color: 'text-gold-600', bg: 'bg-gold-100' },
  producto: { icon: FaBox, color: 'text-olive-600', bg: 'bg-olive-100' },
  cliente: { icon: FaUsers, color: 'text-sage-600', bg: 'bg-sage-100' },
}

function timeAgo(timestamp: string): string {
  const now = Date.now()
  const then = new Date(timestamp).getTime()
  const diff = Math.floor((now - then) / 1000)

  if (diff < 60) return 'hace un momento'
  if (diff < 3600) {
    const min = Math.floor(diff / 60)
    return `hace ${min} min`
  }
  if (diff < 86400) {
    const hrs = Math.floor(diff / 3600)
    return `hace ${hrs} hora${hrs !== 1 ? 's' : ''}`
  }
  const dias = Math.floor(diff / 86400)
  return `hace ${dias} día${dias !== 1 ? 's' : ''}`
}

const entityFilters = [
  { value: '', label: 'Todos' },
  { value: 'pedido', label: 'Pedidos' },
  { value: 'reserva', label: 'Reservas' },
  { value: 'producto', label: 'Productos' },
  { value: 'cliente', label: 'Clientes' },
]

export default function AdminActividad() {
  const [activities, setActivities] = useState<ActivityEntry[]>(() => {
    return JSON.parse(localStorage.getItem('activity_log') || '[]')
  })
  const [busqueda, setBusqueda] = useState('')
  const [filtroEntity, setFiltroEntity] = useState('')
  const [page, setPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)
  const [confirmClear, setConfirmClear] = useState(false)

  const filtradas = useMemo(() => {
    return activities
      .filter((a) => {
        if (filtroEntity && a.entity !== filtroEntity) return false
        if (busqueda) {
          const b = busqueda.toLowerCase()
          return a.action?.toLowerCase().includes(b) || a.details?.toLowerCase().includes(b)
        }
        return true
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }, [activities, filtroEntity, busqueda])

  const totalPages = Math.ceil(filtradas.length / ITEMS_PER_PAGE)
  const pagina = filtradas.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  const limpiarRegistro = () => {
    localStorage.setItem('activity_log', '[]')
    setActivities([])
    toast.success('Registro limpiado')
  }

  return (
    <div className="min-h-screen bg-cream-50">
      <SEO title="Registro de Actividad" description="Historial de acciones del sistema" />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-espresso-800 flex items-center gap-3">
            <FaHistory size={22} className="text-olive-600" />
            Registro de Actividad
          </h1>
          <p className="text-steel text-sm mt-1">{filtradas.length} registro{filtradas.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-2">
          <ExportButton data={filtradas} filename="actividad" columns={[
            { key: 'action', label: 'Acción' }, { key: 'entity', label: 'Entidad' },
            { key: 'details', label: 'Detalles' }, { key: 'timestamp', label: 'Fecha' },
            { key: 'admin', label: 'Admin' }
          ]} />
          <button onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border ${showFilters ? 'bg-olive-50 border-olive-200 text-olive-700' : 'bg-white border-cream-200 text-espresso-600 hover:bg-cream-50'}`}>
            <FaFilter size={12} /> Filtros {(filtroEntity || busqueda) && <span className="w-2 h-2 bg-olive-500 rounded-full" />}
          </button>
          <button onClick={() => setConfirmClear(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-white border border-red-200 text-red-600 hover:bg-red-50 transition-all">
            <FaTrash size={12} /> Limpiar registro
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="bg-white rounded-2xl border border-cream-200 p-4 mb-4 flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-steel/40" size={14} />
            <input type="text" value={busqueda} onChange={(e) => { setBusqueda(e.target.value); setPage(1) }}
              placeholder="Buscar por acción o detalle..." className="input-base pl-11 text-sm" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {entityFilters.map((f) => (
              <button key={f.value} onClick={() => { setFiltroEntity(f.value); setPage(1) }}
                className={`px-3 py-2 rounded-xl text-sm font-medium transition-all border ${filtroEntity === f.value ? 'bg-olive-50 border-olive-200 text-olive-700' : 'bg-white border-cream-200 text-espresso-600 hover:bg-cream-50'}`}>
                {f.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {pagina.length === 0 ? (
        <EmptyState icon={<FaHistory size={24} />} title="No hay registros" description="Las acciones del sistema aparecerán aquí" />
      ) : (
        <>
          <div className="relative pl-6">
            <div className="absolute left-[11px] top-0 bottom-0 w-0.5 bg-cream-200" />
            <div className="space-y-3">
              {pagina.map((entry) => {
                const entityConfig = entityIcons[entry.entity] || { icon: FaBox, color: 'text-steel', bg: 'bg-cream-100' }
                const Icon = entityConfig.icon
                return (
                  <div key={entry.id} className="relative bg-white rounded-2xl border border-cream-200 p-4 hover:shadow-lift transition-all">
                    <div className="absolute -left-6 top-5 w-[10px] h-[10px] rounded-full bg-olive-500 border-2 border-white shadow-sm" />
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${entityConfig.bg}`}>
                        <Icon size={16} className={entityConfig.color} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-espresso-800 truncate">{entry.action}</p>
                            {entry.details && <p className="text-xs text-steel mt-0.5 truncate">{entry.details}</p>}
                          </div>
                          <span className="text-[10px] text-steel shrink-0 whitespace-nowrap">{timeAgo(entry.timestamp)}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-[10px] font-medium text-espresso-500 uppercase tracking-wide bg-cream-100 px-2 py-0.5 rounded-full">{entry.entity}</span>
                          {entry.admin && <span className="text-[10px] text-steel">por {entry.admin}</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}

      <ConfirmModal
        open={confirmClear}
        onClose={() => setConfirmClear(false)}
        onConfirm={limpiarRegistro}
        title="Limpiar registro de actividad"
        message="¿Estás seguro de que deseas eliminar todo el historial de actividad? Esta acción no se puede deshacer."
        confirmText="Limpiar"
        variant="danger"
      />
    </div>
  )
}
