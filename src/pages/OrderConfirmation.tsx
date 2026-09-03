import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { storage } from '../lib/storage'
import { CONFIG } from '../lib/config'
import { FaCheckCircle, FaWhatsapp, FaHome, FaUtensils } from 'react-icons/fa'
import { SEO } from '../lib/seo'
import type { Order } from '../types/order'

export default function OrderConfirmation() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState<Order | null>(null)

  useEffect(() => {
    if (!id) { navigate('/'); return }
    const ordenes = storage.getOrdenes<Order>()
    const found = ordenes.find((o) => o.id === id)
    if (found) setOrder(found)
  }, [id, navigate])

  if (!order) {
    return (
      <section className="min-h-[60vh] flex items-center justify-center">
        <p className="text-steel">Buscando orden...</p>
      </section>
    )
  }

  const typeLabels: Record<string, string> = {
    onSite: 'Comer aquí',
    takeaway: 'Para llevar',
    atHome: 'A domicilio',
  }

  const message = `Hola, soy ${order.fullName}. Quiero hacer seguimiento a mi pedido #${order.id}`
  const whatsappUrl = `https://wa.me/${CONFIG.contacto.whatsapp}?text=${encodeURIComponent(message)}`

  return (
    <section className="pt-28 pb-12 px-6">
      <SEO title="Pedido confirmado" description="Tu pedido ha sido enviado al restaurante" />
      <div className="max-w-lg mx-auto">
        <div className="bg-white rounded-2xl shadow-card border border-smoke overflow-hidden">
          <div className="bg-emerald-500 text-white p-8 text-center">
            <FaCheckCircle className="text-5xl mx-auto mb-3" />
            <h1 className="text-2xl font-serif font-bold">Pedido confirmado</h1>
            <p className="text-emerald-100 text-sm mt-1">Hemos recibido tu pedido</p>
          </div>

          <div className="p-6 space-y-4">
            <div className="text-center">
              <p className="text-xs text-steel uppercase tracking-wide">Número de pedido</p>
              <p className="text-2xl font-bold text-brick-600 font-mono">{order.id}</p>
            </div>

            <div className="bg-warm rounded-xl p-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-steel">Cliente</span><span className="font-medium">{order.fullName}</span></div>
              <div className="flex justify-between"><span className="text-steel">Tipo</span><span className="font-medium">{typeLabels[order.typeOrder]}</span></div>
              <div className="flex justify-between"><span className="text-steel">Pago</span><span className="font-medium">{CONFIG.metodosPago.find(m => m.id === order.paymentMethod)?.nombre}</span></div>
              <div className="flex justify-between"><span className="text-steel">Total</span><span className="font-bold text-brick-600">${Number(order.total).toLocaleString('es-CO')}</span></div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
              <p className="font-semibold mb-1">📋 ¿Qué sigue?</p>
              <p>Recibirás la confirmación por WhatsApp. Si no recibes respuesta en 15 min, contáctanos.</p>
            </div>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl transition-all"
            >
              <FaWhatsapp size={20} />
              Dar seguimiento por WhatsApp
            </a>

            <div className="flex gap-3">
              <Link to="/" className="flex-1 flex items-center justify-center gap-2 bg-warm text-brick-600 font-medium py-3 rounded-xl hover:bg-brick-50 transition-all">
                <FaHome /> Inicio
              </Link>
              <Link to="/menu" className="flex-1 flex items-center justify-center gap-2 bg-brick-500 hover:bg-brick-600 text-white font-medium py-3 rounded-xl transition-all shadow-lg shadow-brick-500/30">
                <FaUtensils /> Menú
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
