import { useState } from 'react'
import { SEO } from '../lib/seo'
import { useClientStore } from '../store/useClientStore'
import { puntosParaSiguienteNivel, FIDELIDAD_CONFIG } from '../lib/fidelidad'
import { storage } from '../lib/storage'
import type { Order } from '../types/order'
import { Link } from 'react-router-dom'

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
    <section className="pt-28 pb-20 px-6">
      <SEO title="Mi Perfil" description="Consulta tus puntos y historial de pedidos" />
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-serif font-bold text-ink mb-2">Mi perfil</h1>
        <p className="text-steel mb-10">Consulta tus puntos, nivel y historial de pedidos</p>

        <div className="bg-white rounded-2xl shadow-card border border-smoke p-6 mb-6">
          <label className="block text-sm font-medium text-ink mb-1.5">Ingresa tu teléfono para buscar tu perfil</label>
          <div className="flex gap-3">
            <input
              type="tel"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              placeholder="300 123 4567"
              className="flex-1 px-4 py-3 rounded-xl border border-smoke bg-white text-ink placeholder:text-steel/50 focus:outline-none focus:ring-2 focus:ring-brick-500/30 focus:border-brick-500 transition-all"
            />
            <button onClick={buscarCliente}
              className="bg-brick-500 hover:bg-brick-600 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-brick-500/30">
              Buscar
            </button>
          </div>
        </div>

        {buscado && !clienteActual && (
          <div className="bg-warm border border-smoke rounded-2xl p-8 text-center">
            <p className="text-4xl mb-4">👤</p>
            <p className="text-xl text-ink mb-2">No se encontró perfil</p>
            <p className="text-steel mb-6">Realiza un pedido para acumular puntos automáticamente</p>
            <Link to="/menu" className="bg-brick-500 hover:bg-brick-600 text-white px-8 py-3 rounded-xl font-semibold transition-all inline-block shadow-lg shadow-brick-500/30">
              Ver menú
            </Link>
          </div>
        )}

        {clienteActual && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-card border border-smoke p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-brick-100 flex items-center justify-center text-brick-600 text-2xl font-bold">
                  {clienteActual.nombre.charAt(0)}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-ink">{clienteActual.nombre}</h2>
                  <p className="text-steel text-sm">{clienteActual.telefono}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-brick-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-brick-600">{clienteActual.puntos}</p>
                  <p className="text-xs text-steel">Puntos</p>
                </div>
                <div className="bg-warm rounded-xl p-4 text-center">
                  <p className={`text-2xl font-bold capitalize ${clienteActual.nivel === 'oro' ? 'text-yellow-600' : clienteActual.nivel === 'plata' ? 'text-gray-500' : 'text-amber-700'}`}>
                    {clienteActual.nivel}
                  </p>
                  <p className="text-xs text-steel">Nivel</p>
                </div>
                <div className="bg-warm rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-ink">{ordenes.length}</p>
                  <p className="text-xs text-steel">Pedidos</p>
                </div>
              </div>

              {siguienteNivel && (
                <div className="bg-warm rounded-xl p-4">
                  <p className="text-sm text-steel mb-2">Progreso hacia nivel {siguienteNivel.siguiente}</p>
                  <div className="w-full bg-smoke rounded-full h-3">
                    <div
                      className="bg-brick-500 h-3 rounded-full transition-all"
                      style={{ width: `${Math.min(100, ((FIDELIDAD_CONFIG.umbralesNivel[siguienteNivel.siguiente] - siguienteNivel.faltan) / FIDELIDAD_CONFIG.umbralesNivel[siguienteNivel.siguiente]) * 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-steel mt-1">Te faltan {siguienteNivel.faltan} puntos</p>
                </div>
              )}

              <div className="mt-4 bg-brick-50 rounded-xl p-4">
                <p className="text-sm font-medium text-brick-700">⭐ Beneficios de fidelidad</p>
                <ul className="text-xs text-steel mt-2 space-y-1">
                  <li>• Acumula 1 punto por cada ${FIDELIDAD_CONFIG.pesosPorPunto.toLocaleString()} en compras</li>
                  <li>• Canjea {FIDELIDAD_CONFIG.puntosCanje} puntos por $5,000 de descuento</li>
                  <li>• Nivel Plata: 5% de descuento adicional</li>
                  <li>• Nivel Oro: 10% de descuento adicional</li>
                </ul>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-card border border-smoke p-6">
              <h3 className="font-bold text-ink mb-4">Historial de pedidos</h3>
              {ordenes.length === 0 ? (
                <p className="text-steel text-sm text-center py-4">Aún no tienes pedidos registrados</p>
              ) : (
                <div className="space-y-3">
                  {ordenes.slice(0, 10).map((o) => (
                    <div key={o.id} className="flex items-center justify-between bg-warm rounded-xl p-3">
                      <div>
                        <p className="font-mono text-xs text-steel">{o.id}</p>
                        <p className="text-sm font-medium text-ink">{new Date(o.createdAt).toLocaleDateString('es-CO')}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-brick-600">${Number(o.total).toLocaleString('es-CO')}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${o.estado === 'entregado' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
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
