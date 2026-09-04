import { useState, useMemo, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { SEO } from '../lib/seo'
import { storage } from '../lib/storage'
import { numberFormatter } from '../utils/numberFormatter'
import { FaSearch, FaBox, FaCheckCircle, FaUtensils, FaMotorcycle, FaWhatsapp, FaArrowLeft } from 'react-icons/fa'
import type { IOrder } from '../types/order'

const steps = [
  { key: 'recibido', label: 'Recibido', icon: FaBox, desc: 'Tu pedido fue recibido' },
  { key: 'preparando', label: 'Preparando', icon: FaUtensils, desc: 'Estamos preparando tu pedido' },
  { key: 'listo', label: 'Listo', icon: FaCheckCircle, desc: 'Tu pedido está listo' },
  { key: 'entregado', label: 'Entregado', icon: FaMotorcycle, desc: 'Pedido entregado' },
]

export default function OrderTracking() {
  const { id } = useParams()
  const [searchId, setSearchId] = useState(id || '')
  const [order, setOrder] = useState<IOrder | null>(null)

  useEffect(() => {
    if (id) {
      const orders = storage.getOrdenes<IOrder[]>()
      setOrder(orders.find(o => o.id === id) || null)
    }
  }, [id])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchId.trim()) return
    const orders = storage.getOrdenes<IOrder[]>()
    setOrder(orders.find(o => o.id === searchId.trim()) || null)
  }

  const currentStep = useMemo(() => {
    if (!order) return -1
    return steps.findIndex(s => s.key === order.estado)
  }, [order])

  const timeEstimate = useMemo(() => {
    if (!order) return ''
    const types: Record<string, string> = { delivery: '45-60 min', pickup: '20-30 min', dinein: '15-25 min' }
    return types[order.tipo || 'delivery'] || '45 min'
  }, [order])

  return (
    <>
      <SEO title="Seguimiento de Pedido" description="Sigue el estado de tu pedido en tiempo real" />
      <section className="min-h-screen bg-cream-50 dark:bg-[#1a1f16] py-12 px-6">
        <div className="max-w-lg mx-auto">
          <Link to="/" className="inline-flex items-center gap-2 text-steel hover:text-olive-600 text-sm mb-6 transition-colors">
            <FaArrowLeft size={12} /> Volver al inicio
          </Link>

          <h1 className="text-3xl font-display font-bold text-espresso-800 dark:text-cream-200 mb-2">Seguimiento de pedido</h1>
          <p className="text-steel dark:text-cream-400 mb-8">Ingresa tu número de pedido para ver el estado</p>

          <form onSubmit={handleSearch} className="flex gap-2 mb-8">
            <div className="relative flex-1">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-steel/40" size={14} />
              <input type="text" value={searchId} onChange={(e) => setSearchId(e.target.value)}
                placeholder="Ej: PED-00123"
                className="input-base pl-11 text-sm" />
            </div>
            <button type="submit" className="btn-primary text-sm px-6">Buscar</button>
          </form>

          {id && !order && (
            <div className="bg-white dark:bg-[#1e2518] rounded-2xl border border-cream-200 dark:border-[#2d3523] p-8 text-center">
              <FaBox size={40} className="text-cream-300 mx-auto mb-3" />
              <p className="text-lg font-display font-bold text-espresso-800 dark:text-cream-200 mb-1">Pedido no encontrado</p>
              <p className="text-sm text-steel dark:text-cream-400">Verifica el número de pedido e intenta de nuevo</p>
            </div>
          )}

          {order && (
            <div className="bg-white dark:bg-[#1e2518] rounded-2xl border border-cream-200 dark:border-[#2d3523] overflow-hidden animate-fade-in">
              {/* Header */}
              <div className="bg-olive-500 p-6 text-white">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-sm opacity-80">{order.id}</span>
                  <span className="text-xs bg-white/20 px-3 py-1 rounded-full">{timeEstimate}</span>
                </div>
                <p className="text-2xl font-display font-bold">{steps[currentStep]?.label || 'Desconocido'}</p>
                <p className="text-sm opacity-80 mt-1">{steps[currentStep]?.desc}</p>
              </div>

              {/* Progress steps */}
              <div className="p-6">
                <div className="space-y-0">
                  {steps.map((step, i) => {
                    const isComplete = i <= currentStep
                    const isCurrent = i === currentStep
                    return (
                      <div key={step.key} className="flex items-start gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                            isComplete ? 'bg-olive-500 text-white' : 'bg-cream-100 dark:bg-[#252e1e] text-steel'
                          } ${isCurrent ? 'ring-4 ring-olive-200 dark:ring-olive-800' : ''}`}>
                            <step.icon size={16} />
                          </div>
                          {i < steps.length - 1 && (
                            <div className={`w-0.5 h-8 ${i < currentStep ? 'bg-olive-500' : 'bg-cream-200 dark:bg-[#2d3523]'}`} />
                          )}
                        </div>
                        <div className="pt-2">
                          <p className={`text-sm font-semibold ${isComplete ? 'text-espresso-800 dark:text-cream-200' : 'text-steel'}`}>{step.label}</p>
                          <p className="text-xs text-steel dark:text-cream-400">{step.desc}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Order summary */}
              <div className="border-t border-cream-200 dark:border-[#2d3523] p-6">
                <h3 className="text-sm font-bold text-espresso-800 dark:text-cream-200 mb-3">Resumen del pedido</h3>
                <div className="space-y-2">
                  {(order.items || []).map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-steel dark:text-cream-400">{item.quantity}x {item.nombre}</span>
                      <span className="font-medium text-espresso-700 dark:text-cream-300">${numberFormatter((item.precio ?? 0) * (item.quantity ?? 1))}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-cream-200 dark:border-[#2d3523] mt-3 pt-3 flex justify-between">
                  <span className="font-bold text-espresso-800 dark:text-cream-200">Total</span>
                  <span className="font-bold text-olive-600 dark:text-olive-400">${numberFormatter(order.total ?? 0)}</span>
                </div>
              </div>

              {/* WhatsApp */}
              <div className="p-6 pt-0">
                <a href={`https://wa.me/${CONFIG?.contacto?.whatsapp || '573001234567'}?text=${encodeURIComponent(`Hola, quiero dar seguimiento a mi pedido ${order.id}`)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition-colors">
                  <FaWhatsapp size={18} /> Consultar por WhatsApp
                </a>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
