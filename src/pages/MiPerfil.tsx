import { useState } from 'react'
import { SEO } from '../lib/seo'
import { useClientStore } from '../store/useClientStore'
import { puntosParaSiguienteNivel, FIDELIDAD_CONFIG } from '../lib/fidelidad'
import { storage } from '../lib/storage'
import type { Order } from '../types/order'
import { Link } from 'react-router-dom'
import { FaStar, FaArrowRight } from 'react-icons/fa'

export default function MiPerfil() {
  const [telefono, setTelefono] = useState('')
  const [buscado, setBuscado] = useState(false)
  const { findCliente, clienteActual, setClienteActual } = useClientStore()

  const buscarCliente = () => {
    if (!telefono.trim()) return
    const cliente = findCliente(telefono)
    setClienteActual(cliente || null)
    setBuscado(true)
  }

  const ordenes = clienteActual
    ? storage.getOrdenes<Order>().filter((o) => clienteActual.historialPedidos.includes(o.id))
    : []

  const siguienteNivel = clienteActual ? puntosParaSiguienteNivel(clienteActual.puntos) : null

  return (
    <section className="pt-8 pb-20 px-6">
      <SEO title="Mi Perfil" description="Consulta tus puntos y historial de pedidos" />
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <span className="text-olive-500 font-semibold text-sm tracking-[0.15em] uppercase">Tu perfil</span>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-espresso-800 mt-2">Mi perfil</h1>
          <p className="text-steel mt-2">Consulta tus puntos, nivel y historial de pedidos</p>
        </div>

        <div className="bg-white rounded-3xl shadow-card border border-cream-200 p-8 mb-6">
          <label className="block text-sm font-medium text-espresso-700 mb-2">Ingresa tu teléfono para buscar tu perfil</label>
          <div className="flex gap-3">
            <input
              type="tel" value={telefono} onChange={(e) => setTelefono(e.target.value)}
              placeholder="300 123 4567"
              className="input-base flex-1"
              onKeyDown={(e) => e.key === 'Enter' && buscarCliente()}
            />
            <button onClick={buscarCliente} className="btn-primary shrink-0">
              Buscar
            </button>
          </div>
        </div>

        {buscado && !clienteActual && (
          <div className="bg-cream-50 border border-cream-200 rounded-3xl p-10 text-center">
            <div className="w-16 h-16 bg-cream-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">👤</span>
            </div>
            <p className="text-xl font-display font-bold text-espresso-800 mb-2">No se encontró perfil</p>
            <p className="text-steel mb-6">Realiza un pedido para acumular puntos automáticamente</p>
            <Link to="/menu" className="btn-primary inline-flex items-center gap-2">
              Ver menú <FaArrowRight size={14} />
            </Link>
          </div>
        )}

        {clienteActual && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl shadow-card border border-cream-200 p-8">
              <div className="flex items-center gap-5 mb-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-olive-400 to-olive-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  {clienteActual.nombre.charAt(0)}
                </div>
                <div>
                  <h2 className="text-xl font-display font-bold text-espresso-800">{clienteActual.nombre}</h2>
                  <p className="text-steel text-sm">{clienteActual.telefono}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-olive-50 rounded-2xl p-5 text-center border border-olive-100">
                  <FaStar className="text-gold-500 mx-auto mb-2" size={18} />
                  <p className="text-2xl font-display font-bold text-olive-600">{clienteActual.puntos}</p>
                  <p className="text-xs text-steel font-medium">Puntos</p>
                </div>
                <div className="bg-cream-100 rounded-2xl p-5 text-center border border-cream-200">
                  <p className={`text-lg font-display font-bold capitalize ${clienteActual.nivel === 'oro' ? 'text-gold-500' : clienteActual.nivel === 'plata' ? 'text-steel' : 'text-espresso-500'}`}>
                    {clienteActual.nivel}
                  </p>
                  <p className="text-xs text-steel font-medium">Nivel</p>
                </div>
                <div className="bg-cream-100 rounded-2xl p-5 text-center border border-cream-200">
                  <p className="text-2xl font-display font-bold text-espresso-800">{ordenes.length}</p>
                  <p className="text-xs text-steel font-medium">Pedidos</p>
                </div>
              </div>

              {siguienteNivel && (
                <div className="bg-cream-50 rounded-2xl p-5 mb-6 border border-cream-200">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium text-espresso-700">Progreso hacia nivel {siguienteNivel.siguiente}</p>
                    <p className="text-xs text-olive-500 font-bold">{siguienteNivel.faltan} puntos restantes</p>
                  </div>
                  <div className="w-full bg-cream-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-olive-400 to-olive-600 h-3 rounded-full transition-all shadow-sm"
                      style={{ width: `${Math.min(100, ((FIDELIDAD_CONFIG.umbralesNivel[siguienteNivel.siguiente] - siguienteNivel.faltan) / FIDELIDAD_CONFIG.umbralesNivel[siguienteNivel.siguiente]) * 100)}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="bg-gold-50 rounded-2xl p-5 border border-gold-200">
                <p className="text-sm font-semibold text-gold-700 flex items-center gap-2 mb-2">
                  <FaStar size={14} /> Beneficios de fidelidad
                </p>
                <ul className="text-xs text-espresso-600 space-y-1.5">
                  <li>• Acumula 1 punto por cada ${FIDELIDAD_CONFIG.pesosPorPunto.toLocaleString()} en compras</li>
                  <li>• Canjea {FIDELIDAD_CONFIG.puntosCanje} puntos por $5,000 de descuento</li>
                  <li>• Nivel Plata: 5% de descuento adicional</li>
                  <li>• Nivel Oro: 10% de descuento adicional</li>
                </ul>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-card border border-cream-200 p-8">
              <h3 className="font-display font-bold text-espresso-800 mb-5">Historial de pedidos</h3>
              {ordenes.length === 0 ? (
                <p className="text-steel text-sm text-center py-6">Aún no tienes pedidos registrados</p>
              ) : (
                <div className="space-y-3">
                  {ordenes.slice(0, 10).map((o) => (
                    <div key={o.id} className="flex items-center justify-between bg-cream-50 rounded-2xl p-4 border border-cream-200">
                      <div>
                        <p className="font-mono text-xs text-steel">{o.id}</p>
                        <p className="text-sm font-medium text-espresso-800">{new Date(o.createdAt).toLocaleDateString('es-CO')}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-olive-500">${Number(o.total).toLocaleString('es-CO')}</p>
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-cream-100 text-steel border border-cream-200">
                          {o.estado}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
