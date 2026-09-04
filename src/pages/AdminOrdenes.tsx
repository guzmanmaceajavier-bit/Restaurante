import { useEffect, useState, useMemo } from 'react'
import { storage } from '../lib/storage'
import { toast } from 'sonner'
import { FaSearch, FaWhatsapp, FaEye, FaFilter, FaTimes } from 'react-icons/fa'
import EmptyState from '../components/core/EmptyState'
import type { Order } from '../types/order'
import { Pagination } from '../components/admin/Pagination'
import { ExportButton } from '../components/admin/ExportButton'

const ITEMS_PER_PAGE = 10

const estadoBadge: Record<string, { bg: string; text: string; label: string }> = {
  recibido: { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700', label: 'Recibido' },
  preparando: { bg: 'bg-gold-50 border-gold-200', text: 'text-gold-700', label: 'Preparando' },
  listo: { bg: 'bg-sage-50 border-sage-200', text: 'text-sage-700', label: 'Listo' },
  entregado: { bg: 'bg-cream-100 border-cream-200', text: 'text-steel', label: 'Entregado' },
  cancelado: { bg: 'bg-red-50 border-red-200', text: 'text-red-700', label: 'Cancelado' },
}

const estadoColors: Record<string, { bg: string; text: string }> = {
  recibido: { bg: 'bg-blue-500', text: 'text-white' },
  preparando: { bg: 'bg-gold-500', text: 'text-white' },
  listo: { bg: 'bg-sage-500', text: 'text-white' },
  entregado: { bg: 'bg-cream-300', text: 'text-espresso-700' },
  cancelado: { bg: 'bg-red-500', text: 'text-white' },
}

export default function AdminOrdenes() {
  const [ordenes, setOrdenes] = useState<Order[]>([])
  const [selected, setSelected] = useState<Order | null>(null)
  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')
  const [page, setPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    setOrdenes(storage.getOrdenes<Order>())
  }, [])

  const ordenesFiltradas = useMemo(() => {
    return ordenes.filter((o) => {
      if (filtroEstado && o.estado !== filtroEstado) return false
      if (busqueda) {
        const b = busqueda.toLowerCase()
        return (o.id?.toLowerCase().includes(b)) || (o.fullName?.toLowerCase().includes(b)) || (o.phone?.includes(b))
      }
      return true
    }).sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
  }, [ordenes, busqueda, filtroEstado])

  const totalPages = Math.ceil(ordenesFiltradas.length / ITEMS_PER_PAGE)
  const ordenesPagina = ordenesFiltradas.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  const cambiarEstado = (id: string, nuevoEstado: string) => {
    const actualizadas = ordenes.map((o) => o.id === id ? { ...o, estado: nuevoEstado } : o)
    setOrdenes(actualizadas)
    storage.setOrdenes(actualizadas)
    if (selected?.id === id) setSelected({ ...selected, estado: nuevoEstado } as Order)
    toast.success(`Estado actualizado a "${estadoBadge[nuevoEstado]?.label || nuevoEstado}"`)
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-espresso-800">Pedidos</h1>
          <p className="text-steel text-sm mt-1">{ordenesFiltradas.length} pedido{ordenesFiltradas.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-2">
          <ExportButton data={ordenesFiltradas} filename="pedidos" columns={[
            { key: 'id', label: 'ID' }, { key: 'fullName', label: 'Cliente' }, { key: 'phone', label: 'Teléfono' },
            { key: 'total', label: 'Total' }, { key: 'estado', label: 'Estado' }, { key: 'createdAt', label: 'Fecha' }
          ]} />
          <button onClick={() => setShowFilters(!showFilters)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border ${showFilters ? 'bg-olive-50 border-olive-200 text-olive-700' : 'bg-white border-cream-200 text-espresso-600 hover:bg-cream-50'}`}>
            <FaFilter size={12} /> Filtros {(filtroEstado || busqueda) && <span className="w-2 h-2 bg-olive-500 rounded-full" />}
          </button>
          <button onClick={() => { setBusqueda(''); setFiltroEstado(''); setPage(1) }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-white border border-cream-200 text-espresso-600 hover:bg-cream-50 transition-all">
            <FaTimes size={12} /> Limpiar
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="bg-white rounded-2xl border border-cream-200 p-4 mb-4 flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-steel/40" size={14} />
            <input type="text" value={busqueda} onChange={(e) => { setBusqueda(e.target.value); setPage(1) }}
              placeholder="Buscar por ID, nombre o teléfono..." className="input-base pl-11 text-sm" />
          </div>
          <select value={filtroEstado} onChange={(e) => { setFiltroEstado(e.target.value); setPage(1) }} className="input-base text-sm w-auto">
            <option value="">Todos los estados</option>
            {Object.entries(estadoBadge).map(([key, val]) => (
              <option key={key} value={key}>{val.label}</option>
            ))}
          </select>
        </div>
      )}

      {ordenesPagina.length === 0 ? (
        <EmptyState icon={<FaSearch size={24} />} title="No hay pedidos" description="Los pedidos aparecerán aquí" />
      ) : (
        <>
          <div className="bg-white rounded-2xl border border-cream-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-cream-50 border-b border-cream-200">
                    <th className="p-3 text-left text-xs font-semibold text-espresso-700 uppercase tracking-wider">ID</th>
                    <th className="p-3 text-left text-xs font-semibold text-espresso-700 uppercase tracking-wider">Cliente</th>
                    <th className="p-3 text-left text-xs font-semibold text-espresso-700 uppercase tracking-wider">Fecha</th>
                    <th className="p-3 text-center text-xs font-semibold text-espresso-700 uppercase tracking-wider">Items</th>
                    <th className="p-3 text-right text-xs font-semibold text-espresso-700 uppercase tracking-wider">Total</th>
                    <th className="p-3 text-center text-xs font-semibold text-espresso-700 uppercase tracking-wider">Estado</th>
                    <th className="p-3 text-center text-xs font-semibold text-espresso-700 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {ordenesPagina.map((o) => {
                    const badge = estadoBadge[o.estado] || { bg: 'bg-cream-100', text: 'text-steel', label: o.estado }
                    return (
                      <tr key={o.id} className="border-t border-cream-100 hover:bg-cream-50/50 transition-colors">
                        <td className="p-3 text-xs font-mono text-steel">{o.id?.slice(0, 8)}...</td>
                        <td className="p-3">
                          <p className="text-sm font-medium text-espresso-800">{o.fullName || (o as any).clientName || 'Cliente'}</p>
                          <p className="text-[10px] text-steel">{o.phone}</p>
                        </td>
                        <td className="p-3 text-xs text-steel">{o.createdAt ? new Date(o.createdAt).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' }) : '—'}</td>
                        <td className="p-3 text-center text-xs text-espresso-700">{o.items?.length || 0}</td>
                        <td className="p-3 text-right text-sm font-bold text-espresso-800">${Number(o.total).toLocaleString('es-CO')}</td>
                        <td className="p-3 text-center">
                          <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-semibold border ${badge.bg} ${badge.text}`}>{badge.label}</span>
                        </td>
                        <td className="p-3">
                          <div className="flex gap-1 justify-center">
                            <button onClick={() => setSelected(o)} className="p-1.5 rounded-lg hover:bg-cream-100 transition-all" title="Ver detalle">
                              <FaEye size={13} className="text-steel" />
                            </button>
                            {o.phone && (
                              <a href={`https://wa.me/${o.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hola ${o.fullName}, sobre tu pedido #${o.id}: `)}`}
                                target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg hover:bg-emerald-50 transition-all" title="WhatsApp">
                                <FaWhatsapp size={13} className="text-emerald-600" />
                              </a>
                            )}
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

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 bg-espresso-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-cream-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-display font-bold text-espresso-800">Pedido #{selected.id?.slice(0, 8)}</h3>
                  <p className="text-xs text-steel mt-1">{selected.createdAt ? new Date(selected.createdAt).toLocaleString('es-CO') : ''}</p>
                </div>
                <button onClick={() => setSelected(null)} className="p-2 hover:bg-cream-100 rounded-xl text-steel">✕</button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-cream-50 rounded-xl p-3">
                  <p className="text-[10px] text-steel uppercase">Cliente</p>
                  <p className="text-sm font-medium text-espresso-800">{selected.fullName || (selected as any).clientName || '—'}</p>
                </div>
                <div className="bg-cream-50 rounded-xl p-3">
                  <p className="text-[10px] text-steel uppercase">Teléfono</p>
                  <p className="text-sm font-medium text-espresso-800">{selected.phone || '—'}</p>
                </div>
                <div className="bg-cream-50 rounded-xl p-3">
                  <p className="text-[10px] text-steel uppercase">Tipo</p>
                  <p className="text-sm font-medium text-espresso-800">{(selected as any).tipoServicio || '—'}</p>
                </div>
                <div className="bg-cream-50 rounded-xl p-3">
                  <p className="text-[10px] text-steel uppercase">Método de pago</p>
                  <p className="text-sm font-medium text-espresso-800">{(selected as any).metodoPago || '—'}</p>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-espresso-700 mb-2">Items</p>
                <div className="space-y-2">
                  {selected.items?.map((item: any, i: number) => (
                    <div key={i} className="flex justify-between items-center py-2 border-b border-cream-100 last:border-0">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 bg-olive-100 rounded-md flex items-center justify-center text-[10px] font-bold text-olive-600">{item.quantity}</span>
                        <span className="text-sm text-espresso-800">{item.nombre}</span>
                      </div>
                      <span className="text-sm font-semibold text-espresso-700">${Number(item.precio * item.quantity).toLocaleString('es-CO')}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center mt-3 pt-3 border-t border-cream-200">
                  <span className="font-bold text-espresso-800">Total</span>
                  <span className="font-bold text-olive-600 text-lg">${Number(selected.total).toLocaleString('es-CO')}</span>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-espresso-700 mb-2">Cambiar estado</p>
                <div className="grid grid-cols-5 gap-1.5">
                  {Object.entries(estadoBadge).map(([key, val]) => (
                    <button key={key} onClick={() => cambiarEstado(selected.id, key)}
                      className={`py-2 rounded-xl text-[10px] font-semibold transition-all ${selected.estado === key ? `${estadoColors[key]?.bg} ${estadoColors[key]?.text}` : 'bg-cream-100 text-steel hover:bg-cream-200'}`}>
                      {val.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
