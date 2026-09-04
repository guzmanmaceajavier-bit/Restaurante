import { useEffect, useState, useMemo } from 'react'
import { storage } from '../lib/storage'
import { FaSearch, FaEye, FaUsers, FaShoppingBag, FaPhone, FaEnvelope } from 'react-icons/fa'
import EmptyState from '../components/core/EmptyState'
import { Pagination } from '../components/admin/Pagination'
import { ExportButton } from '../components/admin/ExportButton'

const ITEMS_PER_PAGE = 10

interface ClientData {
  nombre: string; email: string; telefono: string; password?: string
  totalOrders?: number; totalSpent?: number; lastOrder?: string; level?: string
}

export default function AdminClientes() {
  const [clientes, setClientes] = useState<ClientData[]>([])
  const [selected, setSelected] = useState<ClientData | null>(null)
  const [busqueda, setBusqueda] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    const stored: ClientData[] = JSON.parse(localStorage.getItem('clientes') || '[]')
    const ordenes: any[] = storage.getOrdenes<any>()
    const enriched = stored.map((c: ClientData) => {
      const clientOrders = ordenes.filter((o: any) => o.phone === c.telefono || o.email === c.email)
      return {
        ...c,
        totalOrders: clientOrders.length,
        totalSpent: clientOrders.reduce((sum: number, o: any) => sum + (o.total || 0), 0),
        lastOrder: clientOrders.length > 0 ? clientOrders.sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())[0].createdAt : null,
        level: clientOrders.length >= 20 ? 'Diamante' : clientOrders.length >= 10 ? 'Oro' : clientOrders.length >= 5 ? 'Plata' : 'Bronce',
      }
    })
    setClientes(enriched)
  }, [])

  const filtrados = useMemo(() => {
    if (!busqueda) return clientes
    const b = busqueda.toLowerCase()
    return clientes.filter((c) => c.nombre?.toLowerCase().includes(b) || c.email?.toLowerCase().includes(b) || c.telefono?.includes(b))
  }, [clientes, busqueda])

  const totalPages = Math.ceil(filtrados.length / ITEMS_PER_PAGE)
  const pagina = filtrados.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  const levelColors: Record<string, string> = { Diamante: 'bg-blue-50 text-blue-700 border-blue-200', Oro: 'bg-gold-50 text-gold-700 border-gold-200', Plata: 'bg-cream-200 text-espresso-600 border-cream-300', Bronce: 'bg-orange-50 text-orange-700 border-orange-200' }

  const stats = useMemo(() => ({
    total: clientes.length,
    activos: clientes.filter((c) => c.totalOrders && c.totalOrders > 0).length,
    diamante: clientes.filter((c) => c.level === 'Diamante').length,
    oro: clientes.filter((c) => c.level === 'Oro').length,
  }), [clientes])

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-espresso-800">Clientes</h1>
          <p className="text-steel text-sm mt-1">{filtrados.length} cliente{filtrados.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-3">
          <ExportButton data={filtrados} filename="clientes" columns={[
            { key: 'nombre', label: 'Nombre' }, { key: 'email', label: 'Email' }, { key: 'telefono', label: 'Teléfono' },
            { key: 'totalOrders', label: 'Pedidos' }, { key: 'totalSpent', label: 'Total gastado' }, { key: 'level', label: 'Nivel' }
          ]} />
          <div className="relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-steel/40" size={14} />
            <input type="text" value={busqueda} onChange={(e) => { setBusqueda(e.target.value); setPage(1) }} placeholder="Buscar..." className="input-base pl-11 text-sm w-64" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total', value: stats.total, icon: FaUsers, color: 'bg-blue-500' },
          { label: 'Con pedidos', value: stats.activos, icon: FaShoppingBag, color: 'bg-olive-500' },
          { label: 'Diamante', value: stats.diamante, icon: FaEye, color: 'bg-sage-500' },
          { label: 'Oro', value: stats.oro, icon: FaEye, color: 'bg-gold-500' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-4 border border-cream-200 flex items-center gap-3">
            <div className={`w-10 h-10 ${s.color} rounded-xl flex items-center justify-center`}>
              <s.icon size={16} className="text-white" />
            </div>
            <div>
              <p className="text-xl font-display font-bold text-espresso-800">{s.value}</p>
              <p className="text-[10px] text-steel">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {pagina.length === 0 ? (
        <EmptyState icon={<FaUsers size={24} />} title="No hay clientes" description="Los clientes aparecerán cuando se registren" />
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
                    <th className="p-3 text-right text-xs font-semibold text-espresso-700 uppercase tracking-wider">Total gastado</th>
                    <th className="p-3 text-center text-xs font-semibold text-espresso-700 uppercase tracking-wider">Nivel</th>
                    <th className="p-3 text-center text-xs font-semibold text-espresso-700 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {pagina.map((c, i) => (
                    <tr key={i} className="border-t border-cream-100 hover:bg-cream-50/50 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-olive-100 rounded-xl flex items-center justify-center text-sm font-bold text-olive-600">
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
                          {c.totalOrders || 0}
                        </span>
                      </td>
                      <td className="p-3 text-right text-sm font-semibold text-espresso-800">${(c.totalSpent || 0).toLocaleString('es-CO')}</td>
                      <td className="p-3 text-center">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-semibold border ${levelColors[c.level || 'Bronce']}`}>{c.level}</span>
                      </td>
                      <td className="p-3 text-center">
                        <button onClick={() => setSelected(c)} className="p-1.5 rounded-lg hover:bg-cream-100 transition-all" title="Ver detalle">
                          <FaEye size={13} className="text-steel" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}

      {selected && (
        <div className="fixed inset-0 bg-espresso-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-3xl w-full max-w-md shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-cream-200 flex items-center justify-between">
              <h3 className="text-lg font-display font-bold text-espresso-800">Detalle del cliente</h3>
              <button onClick={() => setSelected(null)} className="p-2 hover:bg-cream-100 rounded-xl text-steel">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-olive-400 to-olive-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mx-auto mb-3">
                  {selected.nombre?.charAt(0)}
                </div>
                <h4 className="text-lg font-bold text-espresso-800">{selected.nombre}</h4>
                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold border mt-2 ${levelColors[selected.level || 'Bronce']}`}>{selected.level}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-cream-50 rounded-xl p-3 flex items-center gap-2">
                  <FaEnvelope size={12} className="text-steel" />
                  <span className="text-xs text-espresso-700 truncate">{selected.email}</span>
                </div>
                <div className="bg-cream-50 rounded-xl p-3 flex items-center gap-2">
                  <FaPhone size={12} className="text-steel" />
                  <span className="text-xs text-espresso-700">{selected.telefono || '—'}</span>
                </div>
                <div className="bg-cream-50 rounded-xl p-3">
                  <p className="text-[10px] text-steel">Pedidos totales</p>
                  <p className="text-lg font-bold text-espresso-800">{selected.totalOrders || 0}</p>
                </div>
                <div className="bg-cream-50 rounded-xl p-3">
                  <p className="text-[10px] text-steel">Total gastado</p>
                  <p className="text-lg font-bold text-olive-600">${(selected.totalSpent || 0).toLocaleString('es-CO')}</p>
                </div>
              </div>
              {selected.lastOrder && (
                <p className="text-xs text-steel text-center">Último pedido: {new Date(selected.lastOrder).toLocaleDateString('es-CO')}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
