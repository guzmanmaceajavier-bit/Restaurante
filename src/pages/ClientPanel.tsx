import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
import { useCartStore } from '../store/useCartStore'
import { storage } from '../lib/storage'
import { CONFIG } from '../lib/config'
import { toast } from 'sonner'
import { SEO } from '../lib/seo'
import { FaUser, FaShoppingBag, FaCalendarAlt, FaStar, FaSignOutAlt, FaWhatsapp, FaEye, FaArrowRight, FaHeart, FaRedo, FaUtensils, FaGift, FaCog, FaHome, FaTrophy, FaCheckCircle, FaEdit, FaChevronRight, FaBell } from 'react-icons/fa'
import { useScrollAnimate } from '@/hooks/useScrollAnimate'
import EmptyState from '../components/core/EmptyState'
import ConfirmModal from '../components/core/ConfirmModal'
import { useFavorites } from '../hooks/useFavorites'
import { dataService } from '../lib/dataService'
import type { Order } from '../types/order'
import { numberFormatter } from '../utils/numberFormatter'
import clsx from 'clsx'

const estadoBadge: Record<string, { bg: string; text: string }> = {
  recibido: { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700' },
  preparando: { bg: 'bg-gold-50 border-gold-200', text: 'text-gold-700' },
  listo: { bg: 'bg-sage-50 border-sage-200', text: 'text-sage-700' },
  entregado: { bg: 'bg-cream-100 border-cream-200', text: 'text-steel' },
  cancelado: { bg: 'bg-red-50 border-red-200', text: 'text-red-700' },
}

type Tab = 'inicio' | 'perfil' | 'menu' | 'pedidos' | 'reservas' | 'favoritos' | 'puntos' | 'recompensas' | 'config'

export default function ClientPanel() {
  const { clienteActual, logout } = useAuthStore()
  const navigate = useNavigate()
  const addToCart = useCartStore((s) => s.addToCart)
  const [tab, setTab] = useState<Tab>('perfil')
  const [confirmCancel, setConfirmCancel] = useState<string | null>(null)
  const { ref, isVisible } = useScrollAnimate(0.1)
  const { favorites, toggleFavorite } = useFavorites(clienteActual?.telefono)

  const favoriteProducts = useMemo(() => {
    const all = dataService.getProductos()
    return all.filter(p => favorites.includes(p.id || p.nombre))
  }, [favorites])

  if (!clienteActual) {
    return (
      <section className="pt-8 pb-20 px-6 min-h-screen bg-cream-50">
        <div className="max-w-md mx-auto text-center">
          <div className="w-20 h-20 bg-cream-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">🔒</span>
          </div>
          <h1 className="text-2xl font-display font-bold text-espresso-800 mb-2">Inicia sesión primero</h1>
          <p className="text-steel mb-8">Necesitas una cuenta para ver tu panel</p>
          <Link to="/login" className="btn-primary inline-flex items-center gap-2">
            Iniciar sesión <FaArrowRight size={14} />
          </Link>
        </div>
      </section>
    )
  }

  const ordenes = storage.getOrdenes<Order>().filter((o) => clienteActual.historialPedidos.includes(o.id)).reverse()
  const reservas = storage.getReservas().filter((r: any) => clienteActual.historialReservas.includes(r.id)).reverse()

  const handleLogout = () => { logout(); toast.success('Sesión cerrada'); navigate('/') }

  const handleRepeatOrder = (order: Order) => {
    if (!order.items) return
    order.items.forEach((item: any) => {
      addToCart({ nombre: item.nombre, precio: item.precio, quantity: item.quantity, imagen: item.imagen || '' })
    })
    toast.success('Productos agregados al carrito', { description: 'Revisa tu pedido' })
    navigate('/menu')
  }

  const handleCancelReserva = (r: any) => {
    const reservas = storage.getReservas()
    const updated = reservas.map((res: any) => res.id === r.id ? { ...res, estado: 'Cancelada' } : res)
    storage.setReservas(updated)
    setConfirmCancel(null)
    toast.success('Reserva cancelada')
  }

  const tabs: { id: Tab; icon: any; label: string }[] = [
    { id: 'inicio', icon: FaHome, label: 'Inicio' },
    { id: 'perfil', icon: FaUser, label: 'Perfil' },
    { id: 'menu', icon: FaUtensils, label: 'Menú' },
    { id: 'pedidos', icon: FaShoppingBag, label: `Pedidos (${ordenes.length})` },
    { id: 'reservas', icon: FaCalendarAlt, label: `Reservas (${reservas.length})` },
    { id: 'favoritos', icon: FaHeart, label: `Favoritos (${favorites.length})` },
    { id: 'puntos', icon: FaTrophy, label: 'Puntos' },
    { id: 'recompensas', icon: FaGift, label: 'Recompensas' },
    { id: 'config', icon: FaCog, label: 'Config' },
  ]

  return (
    <section className="pt-8 pb-20 px-6 min-h-screen bg-cream-50">
      <SEO title="Mi cuenta" />
      <div className="max-w-4xl mx-auto" ref={ref}>
        <div className={`flex items-center justify-between mb-8 ${isVisible ? 'animate-fade-in' : 'opacity-0'}`}>
          <div>
            <h1 className="text-3xl font-display font-bold text-espresso-800">Hola, {clienteActual.nombre.split(' ')[0]} 👋</h1>
            <p className="text-steel text-sm">Tu panel personal</p>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-steel hover:text-red-500 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:bg-red-50">
            <FaSignOutAlt size={14} /> Salir
          </button>
        </div>

        {/* Tabs */}
        <div className={`flex gap-2 mb-8 overflow-x-auto pb-2 ${isVisible ? 'animate-fade-in' : 'opacity-0'}`} style={{ transitionDelay: '100ms' }}>
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={clsx(
                'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap',
                tab === t.id ? 'bg-olive-500 text-white shadow-md shadow-olive-500/25' : 'bg-white border border-cream-200 text-espresso-600 hover:bg-cream-50'
              )}>
              <t.icon size={14} /> {t.label}
            </button>
          ))}
        </div>

        {/* Inicio / Dashboard */}
        {tab === 'inicio' && (
          <div className="space-y-5">
            <div className="bg-gradient-to-br from-olive-500 to-olive-700 rounded-3xl p-6 text-white">
              <p className="text-sm opacity-80">Bienvenido de vuelta</p>
              <h2 className="text-2xl font-display font-bold mt-1">{clienteActual.nombre.split(' ')[0]} 👋</h2>
              <div className="flex items-center gap-2 mt-3">
                <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-medium">{clienteActual.nivel || 'bronce'}</span>
                <span className="text-sm opacity-80">{clienteActual.puntos || 0} puntos</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-2xl p-5 border border-cream-200 text-center">
                <FaShoppingBag className="text-olive-500 mx-auto mb-2" size={20} />
                <p className="text-2xl font-bold text-espresso-800">{ordenes.length}</p>
                <p className="text-xs text-steel">Pedidos</p>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-cream-200 text-center">
                <FaCalendarAlt className="text-olive-500 mx-auto mb-2" size={20} />
                <p className="text-2xl font-bold text-espresso-800">{reservas.length}</p>
                <p className="text-xs text-steel">Reservas</p>
              </div>
            </div>
            {ordenes.length > 0 && (
              <div className="bg-white rounded-2xl border border-cream-200 p-5">
                <h3 className="font-semibold text-espresso-800 mb-3 text-sm">Último pedido</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-espresso-700">{ordenes[0].id}</p>
                    <p className="text-xs text-steel">{new Date(ordenes[0].createdAt).toLocaleDateString('es-CO')}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${(estadoBadge[ordenes[0].estado] || estadoBadge.recibido).bg} ${(estadoBadge[ordenes[0].estado] || estadoBadge.recibido).text}`}>{ordenes[0].estado}</span>
                </div>
              </div>
            )}
            <div className="flex gap-3">
              <Link to="/menu" className="flex-1 btn-primary text-center flex items-center justify-center gap-2 text-sm">Hacer pedido <FaArrowRight size={12} /></Link>
              <Link to="/reservas" className="flex-1 py-3 bg-white border border-cream-200 text-espresso-700 font-semibold rounded-xl text-center text-sm hover:bg-cream-50 transition-all">Reservar mesa</Link>
            </div>
          </div>
        )}

        {/* Profile */}
        {tab === 'perfil' && (
          <div className="space-y-5">
            <div className={`bg-white rounded-3xl border border-cream-200 p-8 shadow-card ${isVisible ? 'animate-fade-in' : 'opacity-0'}`} style={{ transitionDelay: '200ms' }}>
              <div className="flex items-center gap-5 mb-8">
                <div className="w-[72px] h-[72px] rounded-2xl bg-gradient-to-br from-olive-400 to-olive-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-olive-500/20">
                  {clienteActual.nombre.charAt(0)}
                </div>
                <div>
                  <h2 className="text-xl font-display font-bold text-espresso-800">{clienteActual.nombre}</h2>
                  <p className="text-steel text-sm">{clienteActual.email}</p>
                  <p className="text-steel text-sm">{clienteActual.telefono}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-olive-50 rounded-2xl p-5 text-center border border-olive-100">
                  <FaStar className="text-gold-500 mx-auto mb-2" size={20} />
                  <p className="text-2xl font-display font-bold text-olive-600">{clienteActual.puntos}</p>
                  <p className="text-xs text-steel font-medium">Puntos</p>
                </div>
                <div className="bg-cream-100 rounded-2xl p-5 text-center border border-cream-200">
                  <FaHeart className="text-red-400 mx-auto mb-2" size={20} />
                  <p className="text-2xl font-display font-bold text-espresso-800">{favorites.length}</p>
                  <p className="text-xs text-steel font-medium">Favoritos</p>
                </div>
                <div className="bg-cream-100 rounded-2xl p-5 text-center border border-cream-200">
                  <FaShoppingBag className="text-espresso-400 mx-auto mb-2" size={20} />
                  <p className="text-2xl font-display font-bold text-espresso-800">{ordenes.length}</p>
                  <p className="text-xs text-steel font-medium">Pedidos</p>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Link to="/menu" className="flex-1 btn-primary text-center flex items-center justify-center gap-2">
                Hacer pedido <FaArrowRight size={14} />
              </Link>
              <Link to="/reservas" className="flex-1 btn-secondary text-center">
                Reservar mesa
              </Link>
            </div>
          </div>
        )}

        {/* Menu inside panel */}
        {tab === 'menu' && (
          <MenuTab />
        )}

        {/* Orders */}
        {tab === 'pedidos' && (
          <div className="space-y-3">
            {ordenes.length === 0 ? (
              <EmptyState icon={<FaShoppingBag size={24} />} title="Sin pedidos aún" description="Explora nuestro menú y haz tu primer pedido" action={{ label: 'Ver menú', onClick: () => navigate('/menu') }} />
            ) : (
              ordenes.map((o, i) => {
                const badge = estadoBadge[o.estado] || { bg: 'bg-cream-100', text: 'text-steel' }
                return (
                  <div key={o.id} className={`bg-white rounded-2xl border border-cream-200 p-5 hover:shadow-lift transition-all ${isVisible ? 'animate-fade-in' : 'opacity-0'}`} style={{ transitionDelay: `${Math.min((i + 1) * 60, 400)}ms` }}>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-mono text-xs text-steel">{o.id}</p>
                        <p className="text-sm font-medium text-espresso-800">{new Date(o.createdAt).toLocaleDateString('es-CO')}</p>
                      </div>
                      <div className="text-right">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${badge.bg} ${badge.text}`}>{o.estado}</span>
                        <p className="font-bold text-olive-500 text-sm mt-1">${Number(o.total).toLocaleString('es-CO')}</p>
                      </div>
                    </div>
                    <div className="bg-cream-50 rounded-xl p-3 mb-3 border border-cream-100">
                      {o.items?.map((item: any, j: number) => (
                        <div key={j} className="flex justify-between text-xs py-1">
                          <span className="text-espresso-700">{item.nombre} ×{item.quantity}</span>
                          <span className="text-steel">${Number(item.precio * item.quantity).toLocaleString('es-CO')}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Link to={`/orden-confirmacion/${o.id}`} className="flex items-center justify-center gap-1.5 bg-cream-50 text-espresso-600 py-2 px-3 rounded-xl text-xs font-medium hover:bg-cream-100 transition-all border border-cream-200">
                        <FaEye size={10} /> Ver
                      </Link>
                      <button onClick={() => handleRepeatOrder(o)}
                        className="flex items-center gap-1.5 bg-olive-50 text-olive-600 py-2 px-3 rounded-xl text-xs font-medium hover:bg-olive-100 transition-all border border-olive-200">
                        <FaRedo size={10} /> Repetir
                      </button>
                      <a href={`https://wa.me/${CONFIG.contacto.whatsapp}?text=${encodeURIComponent(`Seguimiento pedido #${o.id}`)}`} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 py-2 px-3 rounded-xl text-xs font-medium hover:bg-emerald-100 transition-all border border-emerald-200">
                        <FaWhatsapp size={10} /> WhatsApp
                      </a>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}

        {/* Reservations */}
        {tab === 'reservas' && (
          <div className="space-y-3">
            {reservas.length === 0 ? (
              <EmptyState icon={<FaCalendarAlt size={24} />} title="Sin reservas aún" description="Reserva tu mesa favorita en unos pasos" action={{ label: 'Reservar mesa', onClick: () => navigate('/reservas') }} />
            ) : (
              reservas.map((r: any, i) => (
                <div key={r.id} className={`bg-white rounded-2xl border border-cream-200 p-5 hover:shadow-lift transition-all ${isVisible ? 'animate-fade-in' : 'opacity-0'}`} style={{ transitionDelay: `${Math.min((i + 1) * 60, 400)}ms` }}>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-mono text-xs text-steel">{r.id}</p>
                      <p className="text-sm font-medium text-espresso-800">{r.fecha} — {r.hora}</p>
                      <p className="text-xs text-steel">{r.personas} personas</p>
                    </div>
                    <span className={clsx(
                      'px-3 py-1 rounded-full text-xs font-semibold border',
                      r.estado === 'Pendiente' ? 'bg-gold-50 border-gold-200 text-gold-700' :
                      r.estado === 'Cancelada' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-sage-50 border-sage-200 text-sage-700'
                    )}>{r.estado}</span>
                  </div>
                  <div className="flex gap-2">
                    {r.estado !== 'Cancelada' && (
                      <button onClick={() => setConfirmCancel(r.id)}
                        className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-600 font-medium px-3 py-1.5 rounded-lg hover:bg-red-50 transition-all">
                        Cancelar
                      </button>
                    )}
                    <a href={`https://wa.me/${CONFIG.contacto.whatsapp}?text=${encodeURIComponent(`Consulta reserva #${r.id} - ${r.fecha} ${r.hora}`)}`}
                      target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs text-emerald-600 hover:text-emerald-700 font-medium px-3 py-1.5 rounded-lg hover:bg-emerald-50 transition-all">
                      <FaWhatsapp size={10} /> WhatsApp
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Favorites */}
        {tab === 'favoritos' && (
          <div className="space-y-3">
            {favoriteProducts.length === 0 ? (
              <EmptyState icon={<FaHeart size={24} />} title="Sin favoritos aún" description="Guarda tus platos favoritos para ordenar rápido" action={{ label: 'Explorar menú', onClick: () => navigate('/menu') }} />
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {favoriteProducts.map((p, i) => (
                  <div key={p.id} className={`bg-white rounded-2xl border border-cream-200 overflow-hidden hover:shadow-lift transition-all ${isVisible ? 'animate-fade-in' : 'opacity-0'}`} style={{ transitionDelay: `${Math.min((i + 1) * 60, 400)}ms` }}>
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img src={p.imagen} alt={p.nombre} className="w-full h-full object-cover" />
                      <button onClick={() => toggleFavorite(p.id || p.nombre)}
                        className="absolute top-2 right-2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-sm hover:scale-110 active:scale-90 transition-all">
                        <FaHeart size={12} className="text-red-500 fill-red-500" />
                      </button>
                    </div>
                    <div className="p-3">
                      <h4 className="text-sm font-semibold text-espresso-800 truncate">{p.nombre}</h4>
                      <p className="text-olive-600 font-bold text-sm mt-1">${numberFormatter(p.precio ?? 0)}</p>
                      <button onClick={() => { addToCart({ nombre: p.nombre, precio: p.precio, quantity: 1, imagen: p.imagen }); toast.success(`${p.nombre} agregado`) }}
                        className="w-full mt-2 py-2 bg-olive-500 hover:bg-olive-600 text-white text-xs font-semibold rounded-xl transition-all active:scale-95">
                        Agregar al carrito
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Puntos */}
        {tab === 'puntos' && (
          <div className="space-y-5">
            <div className="bg-gradient-to-br from-gold-400 to-gold-600 rounded-3xl p-6 text-white text-center">
              <FaTrophy size={32} className="mx-auto mb-3 opacity-80" />
              <p className="text-4xl font-display font-bold">{clienteActual.puntos || 0}</p>
              <p className="text-sm opacity-80 mt-1">Puntos acumulados</p>
              <div className="mt-4 bg-white/20 rounded-full h-2 overflow-hidden">
                <div className="h-full bg-white rounded-full transition-all" style={{ width: `${Math.min(((clienteActual.puntos || 0) % 100), 100)}%` }} />
              </div>
              <p className="text-xs opacity-70 mt-2">{100 - ((clienteActual.puntos || 0) % 100)} puntos para el siguiente nivel</p>
            </div>
            <div className="bg-white rounded-2xl border border-cream-200 p-5">
              <h3 className="font-semibold text-espresso-800 mb-3 text-sm">Nivel actual: {clienteActual.nivel || 'bronce'}</h3>
              <div className="space-y-2">
                {[{ name: 'Bronce', min: 0, color: 'bg-orange-400' }, { name: 'Plata', min: 5, color: 'bg-gray-400' }, { name: 'Oro', min: 10, color: 'bg-gold-400' }, { name: 'Diamante', min: 20, color: 'bg-blue-400' }].map(l => (
                  <div key={l.name} className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${l.color}`} />
                    <span className="text-xs text-espresso-700 flex-1">{l.name} ({l.min}+ pedidos)</span>
                    {(ordenes.length >= l.min) && <FaCheckCircle size={14} className="text-sage-500" />}
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-cream-200 p-5">
              <h3 className="font-semibold text-espresso-800 mb-3 text-sm">Cómo ganar puntos</h3>
              <div className="space-y-2 text-xs text-steel">
                <p>• Gana 1 punto por cada $10.000 gastados</p>
                <p>• 100 puntos = $10.000 de descuento</p>
                <p>• Acumula pedidos para subir de nivel</p>
              </div>
            </div>
          </div>
        )}

        {/* Recompensas */}
        {tab === 'recompensas' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-cream-200 p-5 text-center">
              <p className="text-sm text-steel">Tienes</p>
              <p className="text-3xl font-display font-bold text-olive-600">{clienteActual.puntos || 0} puntos</p>
            </div>
            {[{ name: 'Descuento $10.000', cost: 100, icon: '🏷️', desc: 'Canjea por $10.000 de descuento' }, { name: 'Bebida gratis', cost: 50, icon: '🥤', desc: 'Una bebida gratuita' }, { name: 'Postre gratis', cost: 75, icon: '🍰', desc: 'Un postre del menú gratis' }, { name: 'Envío gratis', cost: 30, icon: '🚴', desc: 'Envío gratis en tu próximo pedido' }].map(r => (
              <div key={r.name} className="bg-white rounded-2xl border border-cream-200 p-5 flex items-center gap-4">
                <span className="text-3xl">{r.icon}</span>
                <div className="flex-1">
                  <h4 className="font-semibold text-espresso-800 text-sm">{r.name}</h4>
                  <p className="text-xs text-steel">{r.desc}</p>
                  <p className="text-xs font-bold text-olive-600 mt-1">{r.cost} puntos</p>
                </div>
                <button onClick={() => { if ((clienteActual.puntos || 0) >= r.cost) toast.success(`¡${r.name} canjeado!`); else toast.error('No tienes suficientes puntos') }}
                  disabled={(clienteActual.puntos || 0) < r.cost}
                  className="px-4 py-2 bg-olive-500 text-white text-xs font-semibold rounded-xl hover:bg-olive-600 disabled:bg-cream-200 disabled:text-steel transition-colors">Canjear</button>
              </div>
            ))}
          </div>
        )}

        {/* Configuración */}
        {tab === 'config' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-cream-200 divide-y divide-cream-200">
              {[{ label: 'Editar perfil', icon: FaEdit, action: () => setTab('perfil') }, { label: 'Notificaciones', icon: FaBell, action: () => toast.info('Próximamente') }, { label: 'Política de privacidad', icon: FaEye, action: () => navigate('/politica-privacidad') }, { label: 'Términos y condiciones', icon: FaEye, action: () => navigate('/terminos-condiciones') }].map(item => (
                <button key={item.label} onClick={item.action} className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-cream-50 transition-colors">
                  <item.icon size={16} className="text-steel" />
                  <span className="flex-1 text-sm font-medium text-espresso-700">{item.label}</span>
                  <FaChevronRight size={12} className="text-steel/40" />
                </button>
              ))}
            </div>
            <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-3 bg-red-50 text-red-600 font-semibold rounded-xl hover:bg-red-100 transition-colors text-sm">
              <FaSignOutAlt size={14} /> Cerrar sesión
            </button>
          </div>
        )}

      </div>

      <ConfirmModal
        open={!!confirmCancel}
        onClose={() => setConfirmCancel(null)}
        onConfirm={() => {
          const r = reservas.find((r: any) => r.id === confirmCancel)
          if (r) handleCancelReserva(r)
        }}
        title="Cancelar reserva"
        message="¿Estás seguro de que quieres cancelar esta reserva? Esta acción no se puede deshacer."
        confirmText="Sí, cancelar"
        cancelText="No, mantener"
      />
    </section>
  )
}

function MenuTab() {
  const addToCart = useCartStore((s) => s.addToCart)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [priceRange, setPriceRange] = useState<string | null>(null)
  const [prepTime, setPrepTime] = useState<string | null>(null)
  const [spiceLevel, setSpiceLevel] = useState(0)
  const { favorites, toggleFavorite } = useFavorites()
  const allProducts = dataService.getProductos()
  const { isVisible } = useScrollAnimate(0.1)

  const categorias = useMemo(() => {
    const cats = new Set(allProducts.map(p => (p as any)['categoría']).filter(Boolean))
    return Array.from(cats) as string[]
  }, [allProducts])

  const productosFiltrados = useMemo(() => {
    let result = [...allProducts]
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(p => p.nombre.toLowerCase().includes(q) || p.descripcion?.toLowerCase().includes(q))
    }
    if (selectedCategory) {
      result = result.filter(p => (p as any)['categoría'] === selectedCategory)
    }
    if (priceRange) {
      const [min, max] = priceRange.split('-').map(Number)
      result = result.filter(p => {
        const precio = p.precio ?? 0
        if (max) return precio >= min && precio <= max
        return precio >= min
      })
    }
    if (prepTime) {
      const [min, max] = prepTime.split('-').map(Number)
      result = result.filter(p => {
        const tiempo = (p as any).tiempoPreparacion || 15
        if (max) return tiempo >= min && tiempo <= max
        return tiempo >= min
      })
    }
    if (spiceLevel > 0) {
      result = result.filter(p => (p as any).nivelPicante === spiceLevel)
    }
    return result
  }, [allProducts, searchQuery, selectedCategory, priceRange, prepTime, spiceLevel])

  const hasActiveFilters = selectedCategory || priceRange || prepTime || spiceLevel > 0

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <div className={`bg-white rounded-2xl border border-cream-200 p-4 ${isVisible ? 'animate-fade-in' : 'opacity-0'}`}>
        <div className="flex items-center gap-3 bg-cream-50 rounded-xl px-4 py-3 border border-cream-200 focus-within:border-olive-400 focus-within:ring-2 focus-within:ring-olive-100 transition-all">
          <FaUtensils size={16} className="text-steel/40 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value) }}
            placeholder="Buscar platos, bebidas..."
            className="flex-1 bg-transparent text-sm text-espresso-800 placeholder:text-steel/50 outline-none"
          />
          {searchQuery && (
            <button onClick={() => { setSearchQuery('') }} className="text-steel hover:text-espresso-600 transition-colors text-xs">
              Limpiar
            </button>
          )}
        </div>

        {/* Categories */}
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
          <button onClick={() => setSelectedCategory(null)}
            className={`shrink-0 px-4 py-2 rounded-xl text-xs font-medium transition-all ${!selectedCategory ? 'bg-olive-500 text-white' : 'bg-cream-100 text-steel hover:bg-cream-200'}`}>
            Todos
          </button>
          {categorias.map(cat => (
            <button key={cat} onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
              className={`shrink-0 px-4 py-2 rounded-xl text-xs font-medium transition-all ${selectedCategory === cat ? 'bg-olive-500 text-white' : 'bg-cream-100 text-steel hover:bg-cream-200'}`}>
              {cat}
            </button>
          ))}
        </div>

        {/* Filters toggle */}
        <button onClick={() => setShowAdvanced(!showAdvanced)} className="mt-3 flex items-center gap-2 text-xs text-olive-600 hover:text-olive-700 font-medium">
          <FaStar size={10} /> Filtros avanzados {hasActiveFilters && <span className="w-2 h-2 bg-olive-500 rounded-full" />}
        </button>

        {showAdvanced && (
          <div className="mt-3 grid grid-cols-3 gap-3 p-3 bg-cream-50 rounded-xl border border-cream-200">
            <div>
              <p className="text-[10px] text-steel mb-1.5">Precio</p>
              <div className="flex flex-col gap-1">
                {['0-25000', '25000-40000', '40000-'].map(r => (
                  <button key={r} onClick={() => setPriceRange(priceRange === r ? null : r)}
                    className={`text-[10px] px-2 py-1 rounded-lg transition-all ${priceRange === r ? 'bg-olive-500 text-white' : 'bg-white text-steel border border-cream-200'}`}>
                    {r === '40000-' ? '$40,000+' : `$${Number(r.split('-')[0]).toLocaleString()}`}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] text-steel mb-1.5">Tiempo</p>
              <div className="flex flex-col gap-1">
                {['0-15', '15-30', '30-'].map(r => (
                  <button key={r} onClick={() => setPrepTime(prepTime === r ? null : r)}
                    className={`text-[10px] px-2 py-1 rounded-lg transition-all ${prepTime === r ? 'bg-olive-500 text-white' : 'bg-white text-steel border border-cream-200'}`}>
                    {r === '30-' ? '30+ min' : `${r.split('-')[0]}-${r.split('-')[1]} min`}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] text-steel mb-1.5">Picante: {spiceLevel}</p>
              <input type="range" min="0" max="3" value={spiceLevel} onChange={(e) => setSpiceLevel(Number(e.target.value))}
                className="w-full h-1 bg-cream-200 rounded-lg appearance-none cursor-pointer accent-olive-500" />
              <div className="flex justify-between text-[8px] text-steel/50 mt-0.5">
                <span>Suave</span><span>Fuerte</span>
              </div>
            </div>
            {hasActiveFilters && (
              <button onClick={() => { setSelectedCategory(null); setPriceRange(null); setPrepTime(null); setSpiceLevel(0) }}
                className="col-span-3 text-[10px] text-red-500 hover:text-red-600 font-medium text-center">
                Limpiar todo
              </button>
            )}
          </div>
        )}
      </div>

      {/* Products count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-steel">{productosFiltrados.length} plato{productosFiltrados.length !== 1 ? 's' : ''}</p>
        {hasActiveFilters && <span className="text-xs text-olive-600 flex items-center gap-1"><span className="w-2 h-2 bg-olive-500 rounded-full" /> Filtros activos</span>}
      </div>

      {/* Products grid */}
      {productosFiltrados.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {productosFiltrados.map((p, i) => (
            <div key={p.id || p.nombre} className={`bg-white rounded-2xl border border-cream-200 overflow-hidden hover:shadow-lift transition-all ${isVisible ? 'animate-fade-in' : 'opacity-0'}`} style={{ transitionDelay: `${Math.min(i * 60, 480)}ms` }}>
              <div className="relative aspect-[4/3] overflow-hidden">
                <img src={p.imagen} alt={p.nombre} className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="absolute top-2 left-2 flex gap-1.5">
                  {p.destacado && <span className="bg-gold-400 text-espresso-900 px-2 py-0.5 rounded-full text-[10px] font-bold">⭐ Popular</span>}
                </div>
                <button onClick={() => toggleFavorite(p.id || p.nombre)}
                  className="absolute top-2 right-2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-sm hover:scale-110 active:scale-90 transition-all">
                  <FaHeart size={12} className={favorites.includes(p.id || p.nombre) ? 'text-red-500 fill-red-500' : 'text-steel/40'} />
                </button>
              </div>
              <div className="p-3">
                <h4 className="text-sm font-semibold text-espresso-800 truncate">{p.nombre}</h4>
                <p className="text-xs text-steel line-clamp-2 mt-1">{p.descripcion}</p>
                <div className="flex items-center justify-between mt-3">
                  <p className="text-olive-600 font-bold">${numberFormatter(p.precio ?? 0)}</p>
                  <button onClick={() => { addToCart({ nombre: p.nombre, precio: p.precio, quantity: 1, imagen: p.imagen }); toast.success(`${p.nombre} agregado`) }}
                    className="w-9 h-9 bg-olive-500 hover:bg-olive-600 text-white rounded-xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-sm shadow-olive-500/20">
                    <FaShoppingBag size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl border border-cream-200">
          <FaUtensils className="text-steel/20 mx-auto mb-3" size={40} />
          <p className="text-lg font-display font-bold text-espresso-800 mb-1">No se encontraron platos</p>
          <p className="text-sm text-steel">Intenta con otros filtros o términos de búsqueda</p>
        </div>
      )}
    </div>
  )
}
