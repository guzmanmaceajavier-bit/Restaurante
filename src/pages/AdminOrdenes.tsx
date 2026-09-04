import { useEffect, useState, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { storage } from '../lib/storage'
import { CONFIG } from '../lib/config'
import { toast } from 'sonner'
import { SEO } from '../lib/seo'
import { FaSignOutAlt, FaSearch } from 'react-icons/fa'
import type { Order } from '../types/order'
import clsx from 'clsx'

const estados = ['recibido', 'preparando', 'listo', 'entregado', 'cancelado'] as const
const estadoColors: Record<string, { bg: string; text: string }> = {
  recibido: { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700' },
  preparando: { bg: 'bg-gold-50 border-gold-200', text: 'text-gold-700' },
  listo: { bg: 'bg-sage-50 border-sage-200', text: 'text-sage-700' },
  entregado: { bg: 'bg-cream-100 border-cream-200', text: 'text-steel' },
  cancelado: { bg: 'bg-red-50 border-red-200', text: 'text-red-700' },
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
    setOrdenes(updated); storage.setOrdenes(updated)
    toast.success(`Pedido ${id} → ${nuevoEstado}`)
  }

  const nextEstado = (actual: string): string | null => {
    if (actual === 'cancelado') return null
    const idx = estados.indexOf(actual as any)
    return idx < estados.length - 1 ? estados[idx + 1] : null
  }

  return (
    <div className="min-h-screen bg-cream-50 p-6">
      <SEO title="Admin - Pedidos" />
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-display font-bold text-espresso-800">Pedidos</h1>
            <p className="text-steel text-sm mt-1">{ordenesFiltradas.length} de {ordenes.length} pedido{ordenes.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="flex gap-2">
            <Link to="/admin-dashboard" className="bg-white text-espresso-600 px-4 py-2 rounded-xl text-sm font-medium hover:bg-cream-100 transition-all border border-cream-200">Dashboard</Link>
            <button onClick={() => { storage.clearAdmin(); navigate('/admin-login') }} className="flex items-center gap-1.5 text-steel hover:text-red-500 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:bg-red-50">
              <FaSignOutAlt size={12} /> Salir
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-cream-200 p-4 mb-6 flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-steel/40" size={14} />
            <input type="text" value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre, teléfono o ID..." className="input-base pl-11 text-sm" />
          </div>
          <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)} className="input-base text-sm w-auto">
            <option value="">Todos los estados</option>
            {estados.map((e) => <option key={e} value={e}>{e}</option>)}
          </select>
          <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)} className="input-base text-sm w-auto">
            <option value="">Todos los tipos</option>
            <option value="eatHere">Comer aquí</option>
            <option value="delivery">Domicilio</option>
            <option value="pickup">Recoger</option>
          </select>
        </div>

        {ordenesFiltradas.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-cream-200">
            <p className="text-3xl mb-3">📦</p>
            <p className="text-lg font-display font-bold text-espresso-800 mb-1">No hay pedidos</p>
            <p className="text-sm text-steel">Los pedidos aparecerán aquí cuando los clientes los creen.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-cream-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-cream-50 text-left text-espresso-700 border-b border-cream-200">
                    <th className="p-3 font-semibold text-xs uppercase tracking-wider">ID</th>
                    <th className="p-3 font-semibold text-xs uppercase tracking-wider">Cliente</th>
                    <th className="p-3 font-semibold text-xs uppercase tracking-wider">Teléfono</th>
                    <th className="p-3 font-semibold text-xs uppercase tracking-wider">Tipo</th>
                    <th className="p-3 font-semibold text-xs uppercase tracking-wider">Total</th>
                    <th className="p-3 font-semibold text-xs uppercase tracking-wider">Estado</th>
                    <th className="p-3 font-semibold text-xs uppercase tracking-wider text-center">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {ordenesFiltradas.map((o) => {
                    const badge = estadoColors[o.estado] || { bg: 'bg-cream-100', text: 'text-steel' }
                    return (
                      <tr key={o.id} className="border-t border-cream-100 hover:bg-cream-50/50 transition-colors">
                        <td className="p-3 text-sm font-mono text-steel">{o.id}</td>
                        <td className="p-3 font-medium text-espresso-800">{o.fullName}</td>
                        <td className="p-3 text-sm text-steel">{o.phone}</td>
                        <td className="p-3 text-sm capitalize text-espresso-700">{o.typeOrder === 'eatHere' ? 'Local' : o.typeOrder === 'pickup' ? 'Recoger' : 'Delivery'}</td>
                        <td className="p-3 font-semibold text-espresso-800">${Number(o.total).toLocaleString('es-CO')}</td>
                        <td className="p-3">
                          <span className={clsx('px-3 py-1 rounded-full text-xs font-semibold border', badge.bg, badge.text)}>{o.estado}</span>
                        </td>
                        <td className="p-3">
                          <div className="flex gap-2 justify-center">
                            <button onClick={() => setSelected(o)} className="bg-espresso-800 hover:bg-espresso-900 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-all">Ver</button>
                            {nextEstado(o.estado) && (
                              <button onClick={() => updateEstado(o.id, nextEstado(o.estado)!)} className="bg-sage-500 hover:bg-sage-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-all">
                                → {nextEstado(o.estado)}
                              </button>
                            )}
                            {o.estado !== 'cancelado' && o.estado !== 'entregado' && (
                              <button onClick={() => updateEstado(o.id, 'cancelado')} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-all">
                                Cancelar
                              </button>
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
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 bg-espresso-900/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setSelected(null)}>
          <div className="bg-white p-8 rounded-3xl w-full max-w-lg shadow-xl mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-display font-bold text-espresso-800 mb-5">Pedido {selected.id}</h3>
            <div className="space-y-4">
              <div className="bg-cream-50 rounded-2xl p-5 space-y-2.5 text-sm border border-cream-200">
                <div className="flex justify-between"><span className="text-steel">Cliente</span><span className="font-semibold text-espresso-800">{selected.fullName}</span></div>
                <div className="flex justify-between"><span className="text-steel">Teléfono</span><span className="font-semibold text-espresso-800">{selected.phone}</span></div>
                <div className="flex justify-between"><span className="text-steel">Tipo</span><span className="font-semibold text-espresso-800 capitalize">{selected.typeOrder}</span></div>
                {selected.tableNumber && <div className="flex justify-between"><span className="text-steel">Mesa</span><span className="font-semibold text-espresso-800">{selected.tableNumber}</span></div>}
                {selected.address && <div className="flex justify-between"><span className="text-steel">Dirección</span><span className="font-semibold text-espresso-800">{selected.address}</span></div>}
                <div className="flex justify-between"><span className="text-steel">Pago</span><span className="font-semibold text-espresso-800">{CONFIG.metodosPago.find(m => m.id === selected.paymentMethod)?.nombre}</span></div>
                <div className="flex justify-between"><span className="text-steel">Estado</span>
                  <span className={clsx('px-3 py-1 rounded-full text-xs font-semibold border', estadoColors[selected.estado]?.bg, estadoColors[selected.estado]?.text)}>{selected.estado}</span>
                </div>
              </div>
              <div className="bg-white border border-cream-200 rounded-2xl p-5">
                <p className="font-semibold text-sm text-espresso-800 mb-3">Productos</p>
                <div className="space-y-2">
                  {selected.items.map((item) => (
                    <div key={item.nombre} className="flex justify-between text-sm">
                      <span className="text-espresso-700">{item.nombre} ×{item.quantity}</span>
                      <span className="font-semibold text-espresso-800">${Number(item.precio * item.quantity).toLocaleString('es-CO')}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-cream-200 mt-3 pt-3 space-y-1">
                  <div className="flex justify-between text-sm text-steel"><span>Subtotal</span><span>${Number(selected.subtotal).toLocaleString('es-CO')}</span></div>
                  {selected.deliveryFee > 0 && <div className="flex justify-between text-sm text-steel"><span>Delivery</span><span>${Number(selected.deliveryFee).toLocaleString('es-CO')}</span></div>}
                  <div className="flex justify-between font-bold text-espresso-800"><span>Total</span><span>${Number(selected.total).toLocaleString('es-CO')}</span></div>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => {
                const msg = `Hola ${selected.fullName}, soy de Sabor y Origen. Sobre tu pedido #${selected.id}: `
                window.open(`https://wa.me/${selected.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(msg)}`, '_blank')
              }} className="flex items-center gap-2 bg-sage-500 text-white px-5 py-2.5 rounded-xl hover:bg-sage-600 transition-all font-medium text-sm">
                <FaWhatsapp size={14} /> WhatsApp
              </button>
              <button onClick={() => setSelected(null)} className="btn-secondary text-sm py-2.5">Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
