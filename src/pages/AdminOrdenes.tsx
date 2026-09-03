import { useEffect, useState, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { storage } from '../lib/storage'
import { CONFIG } from '../../lib/config'
import { toast } from 'sonner'
import { SEO } from '../lib/seo'
import type { Order } from '../types/order'

const estados = ['recibido', 'preparando', 'listo', 'entregado', 'cancelado'] as const
const estadoColors: Record<string, string> = {
  recibido: 'bg-blue-100 text-blue-700',
  preparando: 'bg-yellow-100 text-yellow-700',
  listo: 'bg-green-100 text-green-700',
  entregado: 'bg-gray-100 text-gray-500',
  cancelado: 'bg-red-100 text-red-700',
}

export default function AdminOrdenes() {
  const [ordenes, setOrdenes] = useState<Order[]>([])
  const [selected, setSelected] = useState<Order | null>(null)
  const [filtroEstado, setFiltroEstado] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    if (!storage.isAdmin()) { navigate('/admin-login'); return }
    setOrdenes(storage.getOrdenes<Order>())
  }, [navigate])

  const ordenesFiltradas = useMemo(() => {
    return ordenes.filter((o) => {
      if (filtroEstado && o.estado !== filtroEstado) return false
      if (filtroTipo && o.typeOrder !== filtroTipo) return false
      if (busqueda) {
        const b = busqueda.toLowerCase()
        return o.fullName.toLowerCase().includes(b) || o.phone.includes(b) || o.id.toLowerCase().includes(b)
      }
      return true
    })
  }, [ordenes, filtroEstado, filtroTipo, busqueda])

  const updateEstado = (id: string, nuevoEstado: string) => {
    const updated = ordenes.map((o) => (o.id === id ? { ...o, estado: nuevoEstado } : o))
    setOrdenes(updated)
    storage.setOrdenes(updated)
    toast.success(`Pedido ${id} → ${nuevoEstado}`)
  }

  const nextEstado = (actual: string): string | null => {
    if (actual === 'cancelado') return null
    const idx = estados.indexOf(actual as any)
    return idx < estados.length - 1 ? estados[idx + 1] : null
  }

  return (
    <div className="min-h-screen bg-warm p-6">
      <SEO title="Admin - Pedidos" />
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-serif font-bold text-ink">Pedidos</h1>
            <p className="text-steel text-sm mt-1">{ordenesFiltradas.length} de {ordenes.length} pedido{ordenes.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="flex gap-3">
            <Link to="/admin-dashboard" className="bg-warm text-ink px-4 py-2 rounded-xl font-medium hover:bg-brick-50 transition-all border border-smoke">Dashboard</Link>
            <Link to="/admin-reservas" className="bg-warm text-ink px-4 py-2 rounded-xl font-medium hover:bg-brick-50 transition-all border border-smoke">Reservas</Link>
            <button onClick={() => { storage.clearAdmin(); navigate('/admin-login') }} className="bg-red-500 text-white px-4 py-2 rounded-xl font-medium hover:bg-red-600 transition-all">Cerrar sesión</button>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-smoke p-4 mb-6 flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre, teléfono o ID..."
            className="flex-1 px-4 py-2 rounded-xl border border-smoke bg-white text-ink placeholder:text-steel/50 focus:outline-none focus:ring-2 focus:ring-brick-500/30 focus:border-brick-500 text-sm"
          />
          <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}
            className="px-4 py-2 rounded-xl border border-smoke bg-white text-ink text-sm focus:outline-none focus:ring-2 focus:ring-brick-500/30">
            <option value="">Todos los estados</option>
            {estados.map((e) => <option key={e} value={e}>{e}</option>)}
          </select>
          <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}
            className="px-4 py-2 rounded-xl border border-smoke bg-white text-ink text-sm focus:outline-none focus:ring-2 focus:ring-brick-500/30">
            <option value="">Todos los tipos</option>
            <option value="eatHere">Comer aquí</option>
            <option value="delivery">Domicilio</option>
            <option value="pickup">Recoger</option>
          </select>
        </div>

        {ordenesFiltradas.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-smoke">
            <p className="text-xl mb-2 text-ink">No hay pedidos</p>
            <p className="text-sm text-steel">Los pedidos aparecerán aquí cuando los clientes los creen.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-smoke overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-warm text-left text-ink">
                    <th className="p-3 font-semibold text-sm">ID</th>
                    <th className="p-3 font-semibold text-sm">Cliente</th>
                    <th className="p-3 font-semibold text-sm">Teléfono</th>
                    <th className="p-3 font-semibold text-sm">Tipo</th>
                    <th className="p-3 font-semibold text-sm">Total</th>
                    <th className="p-3 font-semibold text-sm">Estado</th>
                    <th className="p-3 font-semibold text-sm text-center">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {ordenesFiltradas.map((o) => (
                    <tr key={o.id} className="border-t border-smoke hover:bg-warm/50 transition-colors">
                      <td className="p-3 text-sm font-mono text-steel">{o.id}</td>
                      <td className="p-3 font-medium text-ink">{o.fullName}</td>
                      <td className="p-3 text-sm text-steel">{o.phone}</td>
                      <td className="p-3 text-sm capitalize text-ink">{o.typeOrder === 'eatHere' ? 'Local' : o.typeOrder === 'pickup' ? 'Recoger' : 'Delivery'}</td>
                      <td className="p-3 font-semibold text-ink">${Number(o.total).toLocaleString('es-CO')}</td>
                      <td className="p-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${estadoColors[o.estado] || 'bg-gray-100 text-gray-600'}`}>
                          {o.estado}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex gap-2 justify-center">
                          <button onClick={() => setSelected(o)} className="bg-brick-500 hover:bg-brick-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-all">Ver</button>
                          {nextEstado(o.estado) && (
                            <button onClick={() => updateEstado(o.id, nextEstado(o.estado)!)} className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-all">
                              → {nextEstado(o.estado)}
                            </button>
                          )}
                          {o.estado !== 'cancelado' && o.estado !== 'entregado' && (
                            <button onClick={() => updateEstado(o.id, 'cancelado')} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-all">
                              Cancelar
                            </button>
                          )}
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

      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelected(null)}>
          <div className="bg-white p-6 rounded-2xl w-full max-w-lg shadow-xl mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-serif font-bold text-ink mb-4">Pedido {selected.id}</h3>

            <div className="space-y-3 mb-4">
              <div className="bg-warm rounded-xl p-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-steel">Cliente</span><span className="font-medium text-ink">{selected.fullName}</span></div>
                <div className="flex justify-between"><span className="text-steel">Teléfono</span><span className="font-medium text-ink">{selected.phone}</span></div>
                <div className="flex justify-between"><span className="text-steel">Tipo</span><span className="font-medium text-ink capitalize">{selected.typeOrder}</span></div>
                {selected.tableNumber && <div className="flex justify-between"><span className="text-steel">Mesa</span><span className="font-medium text-ink">{selected.tableNumber}</span></div>}
                {selected.neighborhood && <div className="flex justify-between"><span className="text-steel">Barrio</span><span className="font-medium text-ink">{selected.neighborhood}</span></div>}
                {selected.address && <div className="flex justify-between"><span className="text-steel">Dirección</span><span className="font-medium text-ink">{selected.address}</span></div>}
                <div className="flex justify-between"><span className="text-steel">Pago</span><span className="font-medium text-ink">{CONFIG.metodosPago.find(m => m.id === selected.paymentMethod)?.nombre}</span></div>
                <div className="flex justify-between"><span className="text-steel">Estado</span><span className={`px-3 py-1 rounded-full text-xs font-semibold ${estadoColors[selected.estado]}`}>{selected.estado}</span></div>
              </div>

              <div className="bg-white border border-smoke rounded-xl p-4">
                <p className="font-semibold text-sm text-ink mb-2">Productos</p>
                <div className="space-y-2">
                  {selected.items.map((item) => (
                    <div key={item.nombre} className="flex justify-between text-sm">
                      <span className="text-ink">{item.nombre} ×{item.quantity}</span>
                      <span className="font-medium text-ink">${Number(item.precio * item.quantity).toLocaleString('es-CO')}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-smoke mt-2 pt-2 space-y-1">
                  <div className="flex justify-between text-sm text-steel"><span>Subtotal</span><span>${Number(selected.subtotal).toLocaleString('es-CO')}</span></div>
                  {selected.deliveryFee > 0 && <div className="flex justify-between text-sm text-steel"><span>Delivery</span><span>${Number(selected.deliveryFee).toLocaleString('es-CO')}</span></div>}
                  <div className="flex justify-between font-bold text-ink"><span>Total</span><span>${Number(selected.total).toLocaleString('es-CO')}</span></div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button onClick={() => {
                const msg = `Hola ${selected.fullName}, soy de Sabor y Origen. Sobre tu pedido #${selected.id}: `
                window.open(`https://wa.me/${selected.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(msg)}`, '_blank')
              }} className="bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 transition-all font-medium flex items-center gap-2">
                <span>WhatsApp</span>
              </button>
              <button onClick={() => setSelected(null)} className="bg-gray-400 text-white px-4 py-2 rounded-xl hover:bg-gray-500 transition-all font-medium">Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
