import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { storage } from '../lib/storage'
import { toast } from 'sonner'
import { FaUtensils, FaClock, FaCheck, FaArrowRight, FaExclamationTriangle } from 'react-icons/fa'
import type { Order } from '../types/order'

const estadoConfig: Record<string, { bg: string; border: string; text: string; next: string | null; label: string }> = {
  recibido: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', next: 'preparando', label: 'Recibido' },
  preparando: { bg: 'bg-gold-50', border: 'border-gold-200', text: 'text-gold-700', next: 'listo', label: 'Preparando' },
  listo: { bg: 'bg-sage-50', border: 'border-sage-200', text: 'text-sage-700', next: 'entregado', label: 'Listo' },
  entregado: { bg: 'bg-cream-100', border: 'border-cream-200', text: 'text-steel', next: null, label: 'Entregado' },
}

export default function AdminCocina() {
  const [ordenes, setOrdenes] = useState<Order[]>([])

  useEffect(() => {
    const load = () => setOrdenes(storage.getOrdenes<Order>())
    load()
    const interval = setInterval(load, 10000)
    return () => clearInterval(interval)
  }, [])

  const cocina = useMemo(() => ordenes.filter((o) => ['recibido', 'preparando', 'listo'].includes(o.estado)), [ordenes])
  const recibidos = cocina.filter((o) => o.estado === 'recibido')
  const preparando = cocina.filter((o) => o.estado === 'preparando')
  const listos = cocina.filter((o) => o.estado === 'listo')

  const avanzar = (id: string) => {
    const orden = ordenes.find((o) => o.id === id)
    if (!orden) return
    const config = estadoConfig[orden.estado]
    if (!config?.next) return
    const updated = ordenes.map((o) => o.id === id ? { ...o, estado: config.next as string } : o)
    setOrdenes(updated); storage.setOrdenes(updated)
    toast.success(`Pedido avanzado a "${estadoConfig[config.next]?.label}"`)
  }

  const OrderCard = ({ o, showAdvance = true }: { o: Order; showAdvance?: boolean }) => {
    const config = estadoConfig[o.estado] || estadoConfig.recibido
    const tiempo = o.createdAt ? Math.floor((Date.now() - new Date(o.createdAt).getTime()) / 60000) : 0
    return (
      <div className={`bg-white rounded-2xl border ${config.border} p-4 hover:shadow-lift transition-all`}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-mono text-steel">#{o.id?.slice(0, 8)}</span>
          <div className="flex items-center gap-1.5">
            <FaClock size={10} className="text-steel" />
            <span className={`text-[10px] font-semibold ${tiempo > 30 ? 'text-red-500' : tiempo > 15 ? 'text-gold-600' : 'text-steel'}`}>
              {tiempo} min
            </span>
          </div>
        </div>
        <p className="text-sm font-semibold text-espresso-800 mb-1">{o.fullName || (o as any).clientName || 'Cliente'}</p>
        <div className="space-y-1 mb-3">
          {o.items?.slice(0, 3).map((item: any, i: number) => (
            <div key={i} className="flex justify-between text-xs">
              <span className="text-espresso-700 truncate">{item.quantity}x {item.nombre}</span>
            </div>
          ))}
          {o.items && o.items.length > 3 && <p className="text-[10px] text-steel">+{o.items.length - 3} más</p>}
        </div>
        {(o as any).nota && (
          <div className="bg-gold-50 border border-gold-200 rounded-lg p-2 mb-3 flex items-start gap-1.5">
            <FaExclamationTriangle size={10} className="text-gold-600 mt-0.5 shrink-0" />
            <p className="text-[10px] text-gold-700">{(o as any).nota}</p>
          </div>
        )}
        {showAdvance && config.next && (
          <button onClick={() => avanzar(o.id)}
            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all ${config.bg} ${config.text} hover:opacity-80`}>
            Avanzar a <FaArrowRight size={10} /> {estadoConfig[config.next]?.label}
          </button>
        )}
      </div>
    )
  }

  const Column = ({ title, icon: Icon, orders, color, showAdvance }: { title: string; icon: any; orders: Order[]; color: string; showAdvance?: boolean }) => (
    <div className="flex-1 min-w-[280px]">
      <div className="flex items-center gap-2 mb-4">
        <div className={`w-8 h-8 ${color} rounded-lg flex items-center justify-center`}>
          <Icon size={14} className="text-white" />
        </div>
        <h2 className="font-display font-bold text-espresso-800">{title}</h2>
        <span className="w-6 h-6 bg-cream-100 rounded-full flex items-center justify-center text-xs font-bold text-espresso-700">{orders.length}</span>
      </div>
      <div className="space-y-3">
        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-cream-200 p-8 text-center">
            <p className="text-sm text-steel">Sin pedidos</p>
          </div>
        ) : (
          orders.map((o) => <OrderCard key={o.id} o={o} showAdvance={showAdvance} />)
        )}
      </div>
    </div>
  )

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-espresso-800">Cocina</h1>
          <p className="text-steel text-sm mt-1">{cocina.length} pedido{cocina.length !== 1 ? 's' : ''} en proceso</p>
        </div>
        <Link to="/admin-ordenes" className="text-sm text-olive-600 hover:text-olive-700 font-medium">Ver todos los pedidos →</Link>
      </div>

      <div className="flex gap-6 overflow-x-auto pb-4">
        <Column title="Nuevos" icon={FaUtensils} orders={recibidos} color="bg-blue-500" showAdvance />
        <Column title="Preparando" icon={FaClock} orders={preparando} color="bg-gold-500" showAdvance />
        <Column title="Listos" icon={FaCheck} orders={listos} color="bg-sage-500" />
      </div>
    </div>
  )
}
