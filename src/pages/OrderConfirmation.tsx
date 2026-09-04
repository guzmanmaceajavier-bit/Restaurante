import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { storage } from '../lib/storage'
import { CONFIG } from '../lib/config'
import { FaCheckCircle, FaWhatsapp, FaHome, FaUtensils, FaStar, FaMotorcycle, FaShoppingBag, FaClock } from 'react-icons/fa'
import { SEO } from '../lib/seo'
import type { Order } from '../types/order'
import { toast } from 'sonner'

const typeConfig: Record<string, { icon: any; title: string; subtitle: string; msg: string; color: string }> = {
  eatHere: {
    icon: FaUtensils,
    title: 'Pedido confirmado',
    subtitle: 'Tu pedido ya está en la cola',
    msg: '✨ ¡Tu pedido está en la cocina! Pronto lo llevaremos a tu mesa. Relájate y disfruta del ambiente.',
    color: 'from-olive-500 to-olive-600',
  },
  delivery: {
    icon: FaMotorcycle,
    title: 'Pedido confirmado',
    subtitle: 'Tu pedido está en preparación',
    msg: '🚗 ¡Tu pedido se está preparando! Pronto saldrá camino a tu dirección. Mantén tu teléfono cerca.',
    color: 'from-olive-500 to-olive-600',
  },
  pickup: {
    icon: FaShoppingBag,
    title: 'Pedido confirmado',
    subtitle: 'Tu pedido está listo',
    msg: '🛍️ ¡Tu pedido estará listo pronto! Cuando llegues, menciona tu número de pedido en caja.',
    color: 'from-olive-500 to-olive-600',
  },
}

export default function OrderConfirmation() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState<Order | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedbackMsg, setFeedbackMsg] = useState('')

  useEffect(() => {
    if (!id) { navigate('/'); return }
    const ordenes = storage.getOrdenes<Order>()
    const found = ordenes.find((o) => o.id === id)
    if (found) setOrder(found)
  }, [id, navigate])

  if (!order) {
    return (
      <section className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-olive-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-steel text-sm">Buscando tu pedido...</p>
        </div>
      </section>
    )
  }

  const config = typeConfig[order.typeOrder] || typeConfig.eatHere
  const TypeIcon = config.icon
  const typeLabels: Record<string, string> = { eatHere: 'Comer aquí', delivery: 'A domicilio', pickup: 'Recoger' }
  const message = `Hola, soy ${order.fullName}. Quiero hacer seguimiento a mi pedido #${order.id}`
  const whatsappUrl = `https://wa.me/${CONFIG.contacto.whatsapp}?text=${encodeURIComponent(message)}`

  const handleSendFeedback = () => {
    if (!feedbackMsg.trim()) { toast.error('Escribe un mensaje'); return }
    const fbMsg = `⭐ *Nuevo comentario de ${order.fullName}*%0APedido: #${order.id}%0A%0A${encodeURIComponent(feedbackMsg)}`
    window.open(`https://wa.me/${CONFIG.contacto.whatsapp}?text=${fbMsg}`, '_blank')
    toast.success('¡Gracias por tu comentario!')
    setShowFeedback(false); setFeedbackMsg('')
  }

  return (
    <section className="pt-8 pb-12 px-6">
      <SEO title="Pedido confirmado" description="Tu pedido ha sido enviado al restaurante" />
      <div className="max-w-lg mx-auto">
        <div className="bg-white rounded-3xl shadow-card border border-cream-200 overflow-hidden">
          {/* Header */}
          <div className={`bg-gradient-to-r ${config.color} text-white p-8 text-center`}>
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FaCheckCircle className="text-3xl" />
            </div>
            <h1 className="text-2xl font-display font-bold">{config.title}</h1>
            <p className="text-white/70 text-sm mt-1">{config.subtitle}</p>
          </div>

          <div className="p-8 space-y-5">
            {/* Order number */}
            <div className="text-center">
              <p className="text-xs text-steel uppercase tracking-wide mb-1">Número de pedido</p>
              <p className="text-2xl font-display font-bold text-olive-500 font-mono">{order.id}</p>
            </div>

            {/* Status message */}
            <div className="bg-olive-50 border border-olive-200 rounded-2xl p-5 text-center">
              <TypeIcon className="text-olive-500 text-2xl mx-auto mb-2" />
              <p className="text-sm text-espresso-700 leading-relaxed">{config.msg}</p>
            </div>

            {/* Order details */}
            <div className="bg-cream-50 rounded-2xl p-5 space-y-2.5 text-sm border border-cream-200">
              <div className="flex justify-between"><span className="text-steel">Cliente</span><span className="font-semibold text-espresso-800">{order.fullName}</span></div>
              <div className="flex justify-between"><span className="text-steel">Tipo</span><span className="font-semibold text-espresso-800">{typeLabels[order.typeOrder] || order.typeOrder}</span></div>
              <div className="flex justify-between"><span className="text-steel">Pago</span><span className="font-semibold text-espresso-800">{CONFIG.metodosPago.find(m => m.id === order.paymentMethod)?.nombre}</span></div>
              <div className="flex justify-between"><span className="text-steel">Total</span><span className="font-bold text-olive-500">${Number(order.total).toLocaleString('es-CO')}</span></div>
            </div>

            {/* Time estimate */}
            <div className="flex items-center gap-3 bg-gold-50 border border-gold-200 rounded-xl p-4">
              <FaClock className="text-gold-500 shrink-0" size={18} />
              <div className="text-sm">
                <p className="font-semibold text-gold-700">Tiempo estimado</p>
                <p className="text-gold-600 text-xs">
                  {order.typeOrder === 'eatHere' && `~${CONFIG.entrega.tiempoMesa} minutos para llevarlo a tu mesa`}
                  {order.typeOrder === 'delivery' && `~${CONFIG.entrega.tiempoDomicilio} minutos para llegar a tu dirección`}
                  {order.typeOrder === 'pickup' && `~${CONFIG.entrega.tiempoRecoger} minutos para que esté listo`}
                </p>
              </div>
            </div>

            {/* WhatsApp */}
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3.5 rounded-xl transition-all shadow-md shadow-emerald-500/20 active:scale-95">
              <FaWhatsapp size={18} /> Dar seguimiento por WhatsApp
            </a>

            {/* Feedback */}
            <div className="bg-olive-50 border border-olive-200 rounded-2xl p-5 text-center">
              <FaStar className="text-olive-500 text-2xl mx-auto mb-2" />
              <p className="font-semibold text-espresso-800 text-sm">¿Qué te pareció tu experiencia?</p>
              <p className="text-xs text-steel mb-3">Tu opinión nos ayuda a seguir mejorando</p>
              {!showFeedback ? (
                <button onClick={() => setShowFeedback(true)} className="btn-primary text-sm py-2.5 px-6">
                  Dejanos tu comentario
                </button>
              ) : (
                <div className="space-y-3">
                  <textarea value={feedbackMsg} onChange={(e) => setFeedbackMsg(e.target.value)}
                    placeholder="Cuéntanos cómo fue tu experiencia..." rows={3} className="input-base resize-none text-sm" />
                  <div className="flex gap-2">
                    <button onClick={handleSendFeedback} className="flex-1 btn-primary text-sm py-2.5">Enviar por WhatsApp</button>
                    <button onClick={() => { setShowFeedback(false); setFeedbackMsg('') }} className="btn-secondary text-sm py-2.5">Cancelar</button>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="flex gap-3">
              <Link to="/" className="flex-1 btn-secondary text-center flex items-center justify-center gap-2">
                <FaHome size={14} /> Inicio
              </Link>
              <Link to="/menu" className="flex-1 btn-primary text-center flex items-center justify-center gap-2">
                <FaUtensils size={14} /> Menú
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
