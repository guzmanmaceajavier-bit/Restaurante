import { useState, useMemo, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
import { useCartStore } from '../store/useCartStore'
import { storage } from '../lib/storage'
import { getRestaurantConfig } from '../lib/config'
import { toast } from 'sonner'
import { SEO } from '../lib/seo'
import { FaUser, FaShoppingBag, FaCalendarAlt, FaStar, FaSignOutAlt, FaWhatsapp, FaEye, FaArrowRight, FaHeart, FaRedo, FaUtensils, FaGift, FaCog, FaHome, FaTrophy, FaCheckCircle, FaEdit, FaChevronRight, FaBell, FaFire, FaTimes, FaClock } from 'react-icons/fa'
import { useScrollAnimate } from '@/hooks/useScrollAnimate'
import EmptyState from '../components/core/EmptyState'
import ConfirmModal from '../components/core/ConfirmModal'
import { useFavorites } from '../hooks/useFavorites'
import { dataService } from '../lib/dataService'
import type { Order } from '../types/order'
import { numberFormatter } from '../utils/numberFormatter'
import clsx from 'clsx'

const estadoBadge: Record<string, { bg: string; text: string }> = {
  recibido: { bg: 'bg-[#EFF6FF] border-[#BFDBFE]', text: 'text-[#1D4ED8]' },
  preparando: { bg: 'bg-[#FFFBEB] border-[#FDE68A]', text: 'text-[#92400E]' },
  listo: { bg: 'bg-[#ECFDF5] border-[#A7F3D0]', text: 'text-[#065F46]' },
  entregado: { bg: 'bg-[#F8FAFC] border-[#E5E7EB]', text: 'text-[#475569]' },
  cancelado: { bg: 'bg-[#FEF2F2] border-[#FECACA]', text: 'text-[#991B1B]' },
}
const ORDER_STEPS = ['recibido','preparando','listo','entregado']

type Tab = 'inicio' | 'perfil' | 'menu' | 'pedidos' | 'reservas' | 'favoritos' | 'puntos' | 'recompensas' | 'config'

export default function ClientPanel() {
  const { clienteActual, logout, canjearPuntos } = useAuthStore()
  const navigate = useNavigate()
  const addToCart = useCartStore((s) => s.addToCart)
  const [tab, setTab] = useState<Tab>('inicio')
  const [confirmCancel, setConfirmCancel] = useState<string | null>(null)
  const [editingReserva, setEditingReserva] = useState<any>(null)
  const [editFecha, setEditFecha] = useState('')
  const [editHora, setEditHora] = useState('')
  const [editPersonas, setEditPersonas] = useState(2)
  const { ref, isVisible } = useScrollAnimate(0.1)
  const { favorites, toggleFavorite } = useFavorites(clienteActual?.telefono)

  const favoriteProducts = useMemo(() => {
    const all = dataService.getProductos()
    return all.filter(p => favorites.includes(p.id || p.nombre))
  }, [favorites])

  const config = getRestaurantConfig()

  if (!clienteActual) {
    return (
      <section className="py-16 px-6 min-h-[70vh] bg-[#FFFBF5]">
        <div className="max-w-md mx-auto text-center">
          <div className="w-20 h-20 rounded-2xl bg-white border border-[#F1E9D8] shadow-sm flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">🔒</span>
          </div>
          <h1 className="text-2xl font-display font-bold text-[#1C2A0F] mb-2">Inicia sesión primero</h1>
          <p className="text-[#64748B] mb-8 text-sm">Necesitas una cuenta para ver tu rincón en {config.nombre}</p>
          <Link to="/login" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#1C2A0F] text-white text-sm font-medium hover:bg-[#2A3D16] transition-colors">
            Iniciar sesión <FaArrowRight size={12} />
          </Link>
        </div>
      </section>
    )
  }

  const [ordenes, setOrdenes] = useState<Order[]>([])
  const [reservas, setReservas] = useState<any[]>([])
  useEffect(() => {
    if (!clienteActual) return
    const load = () => {
      const allOrdenes = storage.getOrdenes<Order>()
      const allReservas = storage.getReservas() as any[]
      const matchPhone = (a:string,b:string)=> a && b && a.replace(/\D/g,'')===b.replace(/\D/g,'')
      setOrdenes(allOrdenes.filter((o) => clienteActual.historialPedidos.includes(o.id) || matchPhone(o.phone, clienteActual.telefono) || o.email===clienteActual.email).reverse())
      setReservas(allReservas.filter((r: any) => clienteActual.historialReservas.includes(r.id) || matchPhone(r.telefono, clienteActual.telefono) || r.email===clienteActual.email || r.nombre===clienteActual.nombre).reverse())
    }
    load()
    const id = setInterval(load, 2000)
    const onStorage = () => load()
    window.addEventListener('storage', onStorage)
    // Forzar recarga al volver a la pestaña
    const onFocus = () => load()
    window.addEventListener('focus', onFocus)
    return () => { clearInterval(id); window.removeEventListener('storage', onStorage); window.removeEventListener('focus', onFocus) }
  }, [clienteActual])

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
  const handleEditReserva = (r: any) => {
    setEditingReserva(r)
    setEditFecha(r.fecha)
    setEditHora(r.hora)
    setEditPersonas(r.personas)
  }
  const handleSaveEditReserva = () => {
    if (!editingReserva) return
    const reservas = storage.getReservas()
    const updated = reservas.map((res: any) => res.id === editingReserva.id ? { ...res, fecha: editFecha, hora: editHora, personas: editPersonas, estado: 'Pendiente' } : res)
    storage.setReservas(updated)
    setEditingReserva(null)
    toast.success('Reserva modificada — pendiente de confirmación')
  }
  const handleCancelPedido = (order: Order) => {
    const ordenes = storage.getOrdenes<Order>()
    const updated = ordenes.map((o) => o.id === order.id ? { ...o, estado: 'cancelado' } : o) as Order[]
    storage.setOrdenes(updated)
    toast.success('Pedido cancelado')
  }

  const tabs: { id: Tab; icon: any; label: string; count?: number }[] = [
    { id: 'inicio', icon: FaHome, label: 'Inicio' },
    { id: 'perfil', icon: FaUser, label: 'Perfil' },
    { id: 'menu', icon: FaUtensils, label: 'Menú' },
    { id: 'pedidos', icon: FaShoppingBag, label: 'Pedidos', count: ordenes.length },
    { id: 'reservas', icon: FaCalendarAlt, label: 'Reservas', count: reservas.length },
    { id: 'favoritos', icon: FaHeart, label: 'Favoritos', count: favorites.length },
    { id: 'puntos', icon: FaTrophy, label: 'Puntos' },
    { id: 'recompensas', icon: FaGift, label: 'Recompensas' },
    { id: 'config', icon: FaCog, label: 'Ajustes' },
  ]

  return (
    <section className="py-6 sm:py-8 px-4 sm:px-6 min-h-screen bg-[#FFFBF5]">
      <SEO title="Mi cuenta" />
      <div className="max-w-6xl mx-auto" ref={ref}>
        {/* Header premium */}
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 ${isVisible ? 'animate-fade-in' : 'opacity-0'}`}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#667A22] to-[#3A4A14] flex items-center justify-center text-white font-display font-bold shadow-sm">
              {clienteActual.nombre.charAt(0)}
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-display font-bold text-[#1C2A0F] tracking-tight">Hola, {clienteActual.nombre.split(' ')[0]} <span className="inline-block">✦</span></h1>
              <p className="text-[13px] text-[#8A9A5B] font-medium">{config.nombre} · Tu rincón personal</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#F1E9D8] text-xs font-medium text-[#475569]">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" /> {clienteActual.nivel || 'bronce'} · {clienteActual.puntos || 0} pts
            </span>
            <button onClick={handleLogout} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#E5E7EB] text-xs font-medium text-[#64748B] hover:bg-[#FEF2F2] hover:border-[#FECACA] hover:text-[#DC2626] transition-colors">
              <FaSignOutAlt size={11} /> Salir
            </button>
          </div>
        </div>

        {/* Tabs premium — pill, scroll, elegant */}
        <div className={`mb-6 ${isVisible ? 'animate-fade-in' : 'opacity-0'}`} style={{ transitionDelay: '80ms' }}>
          <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
            {tabs.map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={clsx(
                  'inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[13px] font-medium whitespace-nowrap transition-all border',
                  tab === t.id ? 'bg-[#1C2A0F] text-white border-[#1C2A0F] shadow-sm' : 'bg-white text-[#475569] border-[#F1E9D8] hover:border-[#E5E7EB] hover:bg-[#FFFBF5]'
                )}>
                <t.icon size={12} className={tab===t.id ? 'text-[#F5B51B]' : 'text-[#94A3B8]'} /> {t.label}
                {t.count !== undefined && t.count>0 && (
                  <span className={clsx('ml-1 min-w-[18px] h-[18px] px-1 rounded-full text-[11px] font-bold flex items-center justify-center', tab===t.id ? 'bg-white/15 text-white' : 'bg-[#667A22] text-white')}>{t.count}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Inicio / Dashboard */}
        {tab === 'inicio' && (
          <div className="space-y-4">
            <div className="rounded-[20px] overflow-hidden border border-[#F1E9D8] shadow-sm bg-gradient-to-br from-[#1C2A0F] via-[#2A3D16] to-[#667A22] p-6 sm:p-8 text-white relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#F5B51B]/10 rounded-full blur-3xl -translate-y-32 translate-x-32" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl" />
              <div className="relative">
                <p className="text-xs tracking-widest uppercase text-[#B9C98A] font-semibold">Bienvenido de vuelta</p>
                <h2 className="text-2xl sm:text-3xl font-display font-bold mt-1 leading-tight">Qué gusto verte,<br />{clienteActual.nombre.split(' ')[0]}.</h2>
                <div className="flex flex-wrap items-center gap-2 mt-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-medium backdrop-blur">
                    <FaTrophy size={11} className="text-[#F5B51B]" /> {clienteActual.nivel || 'bronce'} · {clienteActual.puntos || 0} puntos
                  </span>
                  <span className="text-xs text-white/70">{ordenes.length} pedidos · {reservas.length} reservas · {favorites.length} favoritos</span>
                </div>
                <div className="flex flex-wrap gap-2 mt-6">
                  <Link to="/menu" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#F5B51B] text-[#1C2A0F] text-sm font-semibold hover:bg-[#FFC93A] transition-colors">Hacer pedido <FaArrowRight size={11} /></Link>
                  <Link to="/reservas" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 border border-white/20 text-white text-sm font-medium hover:bg-white/15 backdrop-blur transition-colors">Reservar mesa</Link>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { label:'Pedidos', value: ordenes.length, icon: FaShoppingBag, sub: 'Historial' },
                { label:'Reservas', value: reservas.length, icon: FaCalendarAlt, sub: 'Próximas' },
                { label:'Favoritos', value: favorites.length, icon: FaHeart, sub: 'Guardados' },
              ].map(s=> (
                <div key={s.label} className="bg-white rounded-2xl border border-[#F1E9D8] p-4 text-center hover:border-[#E5E7EB] transition-colors">
                  <s.icon size={16} className="mx-auto mb-2 text-[#8A9A5B]" />
                  <p className="text-xl font-display font-bold text-[#1C2A0F]">{s.value}</p>
                  <p className="text-xs font-medium tracking-wide uppercase text-[#94A3B8]">{s.label}</p>
                  <p className="text-[11px] text-[#64748B]">{s.sub}</p>
                </div>
              ))}
            </div>

            {ordenes.length > 0 && (
              <div className="bg-white rounded-2xl border border-[#F1E9D8] p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-[#1C2A0F]">Último pedido</h3>
                  <Link to="#" onClick={(e)=>{e.preventDefault(); setTab('pedidos')}} className="text-xs font-medium text-[#667A22] hover:underline">Ver todos →</Link>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#FFFBF5] border border-[#F1E9D8]">
                  <div>
                    <p className="text-sm font-medium text-[#1C2A0F] font-mono text-xs">{ordenes[0].id.slice(0,12)}</p>
                    <p className="text-xs text-[#64748B]">{new Date(ordenes[0].createdAt).toLocaleDateString('es-CO')} · {ordenes[0].items?.length || 0} items</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${estadoBadge[ordenes[0].estado]?.bg || 'bg-[#F8FAFC]'} ${estadoBadge[ordenes[0].estado]?.text || 'text-[#475569]'} border`}>{ordenes[0].estado}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Perfil */}
        {tab === 'perfil' && (
          <div className="space-y-4">
            <div className={`bg-white rounded-[20px] border border-[#F1E9D8] p-6 sm:p-8 shadow-sm ${isVisible ? 'animate-fade-in' : 'opacity-0'}`} style={{ transitionDelay: '60ms' }}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                <div className="w-[72px] h-[72px] rounded-2xl bg-gradient-to-br from-[#1C2A0F] to-[#667A22] flex items-center justify-center text-white text-2xl font-display font-bold shadow-md shrink-0">
                  {clienteActual.nombre.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-display font-bold text-[#1C2A0F] truncate">{clienteActual.nombre}</h2>
                  <p className="text-sm text-[#64748B] truncate">{clienteActual.email} · {clienteActual.telefono}</p>
                  <span className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-full bg-[#FDF6E3] border border-[#FDE68A] text-xs font-medium text-[#92400E]">
                    <FaStar size={10} className="text-[#F59E0B]" /> {clienteActual.nivel || 'bronce'} · {clienteActual.puntos || 0} pts
                  </span>
                </div>
                <button onClick={()=> setTab('config')} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F8FAFC] border border-[#E5E7EB] text-xs font-medium text-[#475569] hover:bg-white">
                  <FaEdit size={11} /> Editar
                </button>
              </div>
              <div className="grid grid-cols-3 gap-3 mt-6">
                <div className="rounded-2xl p-4 text-center bg-gradient-to-br from-[#FFFBEB] to-[#FEF3C7] border border-[#FDE68A]">
                  <FaStar className="mx-auto mb-1.5 text-[#F59E0B]" size={18} />
                  <p className="text-xl font-display font-bold text-[#92400E]">{clienteActual.puntos}</p>
                  <p className="text-[11px] font-semibold tracking-wide uppercase text-[#B45309]">Puntos</p>
                </div>
                <div className="rounded-2xl p-4 text-center bg-white border border-[#F1E9D8]">
                  <FaHeart className="mx-auto mb-1.5 text-[#E11D48]" size={18} />
                  <p className="text-xl font-display font-bold text-[#1C2A0F]">{favorites.length}</p>
                  <p className="text-[11px] font-semibold tracking-wide uppercase text-[#94A3B8]">Favoritos</p>
                </div>
                <div className="rounded-2xl p-4 text-center bg-white border border-[#F1E9D8]">
                  <FaShoppingBag className="mx-auto mb-1.5 text-[#8A9A5B]" size={18} />
                  <p className="text-xl font-display font-bold text-[#1C2A0F]">{ordenes.length}</p>
                  <p className="text-[11px] font-semibold tracking-wide uppercase text-[#94A3B8]">Pedidos</p>
                </div>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <Link to="/menu" className="flex items-center justify-center gap-2 py-3.5 rounded-full bg-[#1C2A0F] text-white text-sm font-medium hover:bg-[#2A3D16] transition-colors">
                Hacer pedido <FaArrowRight size={12} />
              </Link>
              <Link to="/reservas" className="flex items-center justify-center gap-2 py-3.5 rounded-full bg-white border border-[#F1E9D8] text-[#1C2A0F] text-sm font-medium hover:bg-[#FFFBF5] transition-colors">
                Reservar mesa
              </Link>
            </div>
          </div>
        )}

        {tab === 'menu' && <div className="bg-white rounded-2xl border border-[#F1E9D8] p-6"><MenuTab /></div>}

        {tab === 'pedidos' && (
          <div className="space-y-3">
            {ordenes.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[#F1E9D8] p-8"><EmptyState icon={<FaShoppingBag size={24} />} title="Sin pedidos aún" description="Explora nuestro menú y haz tu primer pedido" action={{ label: 'Ver menú', onClick: () => navigate('/menu') }} /></div>
            ) : (
              ordenes.map((o) => {
                const badge = estadoBadge[o.estado] || { bg: 'bg-[#F8FAFC] border-[#E5E7EB]', text: 'text-[#475569]' }
                return (
                  <div key={o.id} className="bg-white rounded-2xl border border-[#F1E9D8] p-5 hover:border-[#E5E7EB] transition-colors">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <p className="font-mono text-[11px] tracking-wide uppercase text-[#94A3B8]">{o.id.slice(0,14)}</p>
                        <p className="text-sm font-medium text-[#1C2A0F]">{new Date(o.createdAt).toLocaleDateString('es-CO', { weekday:'short', day:'2-digit', month:'short' })} · {new Date(o.createdAt).toLocaleTimeString('es-CO', {hour:'2-digit', minute:'2-digit'})}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${badge.bg} ${badge.text}`}>{o.estado}</span>
                        <p className="font-display font-bold text-[#1C2A0F] text-sm mt-1">${Number(o.total).toLocaleString('es-CO')}</p>
                      </div>
                    </div>
                    <div className="rounded-xl bg-[#FFFBF5] border border-[#F1E9D8] p-3 mb-3">
                      {o.items?.map((item: any, j: number) => (
                        <div key={j} className="flex justify-between text-[13px] py-1">
                          <span className="text-[#334155]">{item.nombre} <span className="text-[#94A3B8]">×{item.quantity}</span></span>
                          <span className="text-[#475569] font-medium">${Number(item.precio * item.quantity).toLocaleString('es-CO')}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Link to={`/orden-confirmacion/${o.id}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#E5E7EB] text-xs font-medium text-[#475569] hover:bg-[#F8FAFC]">
                        <FaEye size={11} /> Ver
                      </Link>
                      <button onClick={() => handleRepeatOrder(o)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F4F7EC] border border-[#E5EDCF] text-xs font-medium text-[#30451D] hover:bg-[#EAF0D8]">
                        <FaRedo size={11} /> Repetir
                      </button>
                      <a href={`https://wa.me/${config.whatsapp}?text=${encodeURIComponent(`Seguimiento pedido #${o.id}`)}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-xs font-medium text-[#065F46] hover:bg-[#D1FAE5]">
                        <FaWhatsapp size={11} /> WhatsApp
                      </a>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}

        {tab === 'reservas' && (
          <div className="space-y-3">
            {reservas.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[#F1E9D8] p-8"><EmptyState icon={<FaCalendarAlt size={24} />} title="Sin reservas aún" description="Reserva tu mesa favorita en unos pasos" action={{ label: 'Reservar mesa', onClick: () => navigate('/reservas') }} /></div>
            ) : (
              reservas.map((r: any) => (
                <div key={r.id} className="bg-white rounded-2xl border border-[#F1E9D8] p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <p className="font-mono text-[11px] tracking-wide uppercase text-[#94A3B8]">{r.id.slice(0,12)}</p>
                      <p className="text-sm font-semibold text-[#1C2A0F]">{r.fecha} — {r.hora}</p>
                      <p className="text-xs text-[#64748B]">{r.personas} personas · {r.zona || '—'}</p>
                    </div>
                    <span className={clsx('px-2.5 py-1 rounded-full text-xs font-medium border', r.estado === 'Pendiente' ? 'bg-[#FFFBEB] border-[#FDE68A] text-[#92400E]' : r.estado === 'Cancelada' ? 'bg-[#FEF2F2] border-[#FECACA] text-[#991B1B]' : 'bg-[#ECFDF5] border-[#A7F3D0] text-[#065F46]')}>{r.estado}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {r.estado !== 'Cancelada' && r.estado !== 'confirmada' && (
                      <button onClick={() => handleEditReserva(r)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#E5E7EB] text-xs font-medium text-[#475569] hover:bg-[#F8FAFC]"><FaEdit size={11}/> Modificar</button>
                    )}
                    {r.estado !== 'Cancelada' && (
                      <button onClick={() => setConfirmCancel(r.id)} className="px-3 py-1.5 rounded-full bg-white border border-[#FECACA] text-xs font-medium text-[#DC2626] hover:bg-[#FEF2F2]">Cancelar</button>
                    )}
                    <a href={`https://wa.me/${config.whatsapp}?text=${encodeURIComponent(`Consulta reserva #${r.id} - ${r.fecha} ${r.hora}`)}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-xs font-medium text-[#065F46] hover:bg-[#D1FAE5]"><FaWhatsapp size={11} /> WhatsApp</a>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {editingReserva && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={()=> setEditingReserva(null)}>
            <div className="bg-white rounded-2xl w-full max-w-md p-6" onClick={e=> e.stopPropagation()}>
              <h3 className="font-semibold text-[#1C2A0F] mb-4">Modificar reserva</h3>
              <div className="space-y-3">
                <div><label className="block text-xs font-medium text-[#475569] mb-1">Fecha</label><input type="date" value={editFecha} onChange={e=> setEditFecha(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-[#E5E7EB] text-sm" /></div>
                <div><label className="block text-xs font-medium text-[#475569] mb-1">Hora</label><input type="time" value={editHora} onChange={e=> setEditHora(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-[#E5E7EB] text-sm" /></div>
                <div><label className="block text-xs font-medium text-[#475569] mb-1">Personas</label><input type="number" min={1} max={20} value={editPersonas} onChange={e=> setEditPersonas(Number(e.target.value))} className="w-full px-3 py-2 rounded-xl border border-[#E5E7EB] text-sm" /></div>
              </div>
              <div className="flex gap-2 mt-6">
                <button onClick={()=> setEditingReserva(null)} className="flex-1 py-2.5 rounded-full bg-white border border-[#E5E7EB] text-sm font-medium">Cancelar</button>
                <button onClick={handleSaveEditReserva} className="flex-1 py-2.5 rounded-full bg-[#1C2A0F] text-white text-sm font-medium">Guardar cambios</button>
              </div>
            </div>
          </div>
        )}

        {tab === 'favoritos' && (
          <div>
            {favoriteProducts.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[#F1E9D8] p-8"><EmptyState icon={<FaHeart size={24} />} title="Sin favoritos aún" description="Guarda tus platos favoritos para ordenar rápido" action={{ label: 'Explorar menú', onClick: () => navigate('/menu') }} /></div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                {favoriteProducts.map((p) => (
                  <div key={p.id} className="bg-white rounded-2xl border border-[#F1E9D8] overflow-hidden hover:border-[#E5E7EB] hover:shadow-sm transition-all">
                    <div className="relative aspect-[4/3] overflow-hidden bg-[#F8FAFC]">
                      <img src={p.imagen} alt={p.nombre} className="w-full h-full object-cover" />
                      <button onClick={() => toggleFavorite(p.id || p.nombre)} className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/95 backdrop-blur shadow-sm border border-[#F1E9D8] flex items-center justify-center hover:scale-105 transition-transform">
                        <FaHeart size={12} className="text-[#E11D48] fill-[#E11D48]" />
                      </button>
                    </div>
                    <div className="p-3">
                      <h4 className="text-[13px] font-semibold text-[#1C2A0F] truncate">{p.nombre}</h4>
                      <p className="text-[#667A22] font-bold text-sm mt-1">${numberFormatter(p.precio ?? 0)}</p>
                      <button onClick={() => { addToCart({ nombre: p.nombre, precio: p.precio, quantity: 1, imagen: p.imagen }); toast.success(`${p.nombre} agregado`) }} className="w-full mt-2 py-2 rounded-full bg-[#1C2A0F] text-white text-xs font-medium hover:bg-[#2A3D16] transition-colors">Agregar</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'puntos' && (
          <div className="space-y-4">
            <div className="rounded-[20px] p-6 text-center border border-[#FDE68A] bg-gradient-to-br from-[#FFFBEB] via-[#FEF3C7] to-[#FDE68A] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#F59E0B]/20 rounded-full blur-2xl" />
              <FaTrophy size={28} className="mx-auto mb-3 text-[#B45309]" />
              <p className="text-4xl font-display font-bold text-[#92400E]">{clienteActual.puntos || 0}</p>
              <p className="text-xs font-semibold tracking-widest uppercase text-[#B45309] mt-1">Puntos acumulados</p>
              <div className="mt-4 h-2 rounded-full bg-white/60 border border-[#FDE68A] overflow-hidden p-1">
                <div className="h-full rounded-full bg-gradient-to-r from-[#F59E0B] to-[#F5B51B] transition-all" style={{ width: `${Math.min(((clienteActual.puntos || 0) % 100), 100)}%` }} />
              </div>
              <p className="text-xs text-[#92400E]/70 mt-2">{100 - ((clienteActual.puntos || 0) % 100)} puntos para el siguiente nivel</p>
            </div>
            <div className="bg-white rounded-2xl border border-[#F1E9D8] p-5">
              <h3 className="text-sm font-semibold text-[#1C2A0F] mb-3 flex items-center gap-2"><FaFire size={12} className="text-[#F59E0B]" /> Niveles por puntos</h3>
              <div className="grid grid-cols-3 gap-2">
                {[{ name: 'Bronce', min: 0, color: 'bg-[#92400E]' }, { name: 'Plata', min: 200, color: 'bg-[#94A3B8]' }, { name: 'Oro', min: 500, color: 'bg-[#F59E0B]' }].map(l => {
                  const pts=clienteActual.puntos||0
                  const achieved=pts>=l.min
                  return (
                  <div key={l.name} className={clsx('rounded-xl border p-3 text-center', achieved ? 'bg-[#FFFBF5] border-[#FDE68A]' : 'bg-white border-[#F1E9D8] opacity-60')}>
                    <div className={`w-2 h-2 rounded-full ${l.color} mx-auto mb-1.5`} />
                    <p className="text-xs font-medium text-[#1C2A0F]">{l.name}</p>
                    <p className="text-[11px] text-[#94A3B8]">{l.min} pts</p>
                    {achieved && <FaCheckCircle size={12} className="text-[#10B981] mx-auto mt-1" />}
                  </div>
                )})}
              </div>
              <p className="text-[11px] text-[#94A3B8] mt-2 text-center">Oro 500 pts · Plata 200 pts · Bronce 0 pts</p>
            </div>
            <div className="bg-white rounded-2xl border border-[#F1E9D8] p-5">
              <h3 className="text-sm font-semibold text-[#1C2A0F] mb-2">Cómo ganar</h3>
              {(() => { try{ const cfg=JSON.parse(localStorage.getItem('fidelizacion_cfg')||'null'); const ppp=cfg?.pesosPorPunto||10000; const pc=cfg?.puntosCanje||100; return <p className="text-xs text-[#64748B] leading-relaxed">1 punto por cada ${ppp.toLocaleString('es-CO')} · {pc} puntos = $10.000 de descuento · Configurable en Admin → Fidelización.</p> } catch{ return <p className="text-xs text-[#64748B] leading-relaxed">1 punto por cada $10.000 · 100 puntos = $10.000 de descuento · Sube de nivel con puntos.</p> }})()}
            </div>
          </div>
        )}

        {tab === 'recompensas' && (
          <div className="space-y-3">
            <div className="bg-white rounded-2xl border border-[#F1E9D8] p-4 flex items-center justify-between">
              <span className="text-sm text-[#64748B]">Tienes</span>
              <span className="text-lg font-display font-bold text-[#667A22]">{clienteActual.puntos || 0} puntos</span>
            </div>
            {(() => {
              const stored = (()=>{ try{ const s=JSON.parse(localStorage.getItem('fidelizacion_recompensas')||'[]'); return s.length? s : null } catch{ return null }})()
              const recompensas = stored || [{ name: 'Descuento $10.000', cost: 100, icon: '🏷️', desc: '$10.000 de descuento' }, { name: 'Bebida gratis', cost: 50, icon: '🥤', desc: 'Bebida gratuita' }, { name: 'Postre gratis', cost: 75, icon: '🍰', desc: 'Postre gratis' }, { name: 'Envío gratis', cost: 30, icon: '🚴', desc: 'Envío gratis' }]
              return recompensas.map((r:any) => (
              <div key={r.name || r.nombre} className="bg-white rounded-2xl border border-[#F1E9D8] p-4 flex items-center gap-4">
                <span className="w-10 h-10 rounded-xl bg-[#FFFBF5] border border-[#F1E9D8] flex items-center justify-center text-lg">{r.icon || '🎁'}</span>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-[#1C2A0F]">{r.name || r.nombre}</h4>
                  <p className="text-xs text-[#64748B] truncate">{r.desc || r.descripcion} · <span className="font-medium text-[#667A22]">{r.cost || r.puntos} pts</span></p>
                </div>
                <button onClick={() => {
                  const costo = r.cost || r.puntos
                  const res = canjearPuntos(costo)
                  if(res.ok){ toast.success(`¡${r.name||r.nombre} canjeado! -${costo} pts`)} else toast.error(res.error||'Puntos insuficientes')
                }} disabled={(clienteActual.puntos || 0) < (r.cost || r.puntos)} className="shrink-0 px-4 py-2 rounded-full bg-[#1C2A0F] text-white text-xs font-medium hover:bg-[#2A3D16] disabled:bg-[#F1F5F9] disabled:text-[#94A3B8] disabled:border disabled:border-[#E5E7EB] transition-colors">Canjear</button>
              </div>
            ))})()}
          </div>
        )}

        {tab === 'config' && (
          <div className="bg-white rounded-2xl border border-[#F1E9D8] overflow-hidden">
            <div className="divide-y divide-[#F1E9D8]">
              {[{ label: 'Notificaciones', icon: FaBell, action: () => toast.info('Próximamente') }, { label: 'Privacidad', icon: FaEye, action: () => navigate('/politica-privacidad') }, { label: 'Términos', icon: FaEye, action: () => navigate('/terminos-condiciones') }].map(item => (
                <button key={item.label} onClick={item.action} className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-[#FFFBF5] transition-colors">
                  <span className="w-8 h-8 rounded-full bg-[#F8FAFC] border border-[#F1E9D8] flex items-center justify-center"><item.icon size={12} className="text-[#64748B]" /></span>
                  <span className="flex-1 text-sm font-medium text-[#1C2A0F]">{item.label}</span>
                  <FaChevronRight size={11} className="text-[#CBD5E1]" />
                </button>
              ))}
            </div>
            <div className="p-4 bg-[#FFFBF5] border-t border-[#F1E9D8]">
              <button onClick={handleLogout} className="w-full py-3 rounded-full bg-white border border-[#FECACA] text-[#DC2626] text-sm font-medium hover:bg-[#FEF2F2] flex items-center justify-center gap-2">
                <FaSignOutAlt size={12} /> Cerrar sesión
              </button>
            </div>
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
        message="¿Cancelar esta reserva? No se puede deshacer."
        confirmText="Sí, cancelar"
        cancelText="Mantener"
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
  const [allProducts, setAllProducts] = useState(()=> dataService.getProductos())
  useEffect(()=>{ const id=setInterval(()=> setAllProducts(dataService.getProductos()), 3000); const onStorage=()=> setAllProducts(dataService.getProductos()); window.addEventListener('storage', onStorage); return ()=>{ clearInterval(id); window.removeEventListener('storage', onStorage)}}, [])
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
    if (selectedCategory) result = result.filter(p => (p as any)['categoría'] === selectedCategory)
    if (priceRange) {
      const [min, max] = priceRange.split('-').map(Number)
      result = result.filter(p => { const pr = p.precio ?? 0; return max ? pr >= min && pr <= max : pr >= min })
    }
    if (prepTime) {
      const [min, max] = prepTime.split('-').map(Number)
      result = result.filter(p => { const t = (p as any).tiempoPreparacion || 15; return max ? t >= min && t <= max : t >= min })
    }
    if (spiceLevel > 0) result = result.filter(p => (p as any).nivelPicante === spiceLevel)
    return result
  }, [allProducts, searchQuery, selectedCategory, priceRange, prepTime, spiceLevel])

  const hasActiveFilters = selectedCategory || priceRange || prepTime || spiceLevel > 0

  return (
    <div className="space-y-4">
      <div className={`bg-[#FFFBF5] rounded-2xl border border-[#F1E9D8] p-4 ${isVisible ? 'animate-fade-in' : 'opacity-0'}`}>
        <div className="flex items-center gap-3 bg-white rounded-full px-4 py-2.5 border border-[#E5E7EB] focus-within:border-[#667A22] focus-within:ring-2 focus-within:ring-[#667A22]/10 transition-all">
          <FaUtensils size={13} className="text-[#94A3B8] shrink-0" />
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Buscar platos, bebidas…" className="flex-1 bg-transparent text-sm text-[#1C2A0F] placeholder:text-[#94A3B8] outline-none" />
          {searchQuery && <button onClick={() => setSearchQuery('')} className="text-xs font-medium text-[#667A22] hover:underline">Limpiar</button>}
        </div>
        <div className="flex gap-1.5 mt-3 overflow-x-auto pb-1 scrollbar-hide">
          <button onClick={() => setSelectedCategory(null)} className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium border transition-colors ${!selectedCategory ? 'bg-[#1C2A0F] text-white border-[#1C2A0F]' : 'bg-white text-[#475569] border-[#F1E9D8] hover:bg-[#FFFBF5]'}`}>Todos</button>
          {categorias.map(cat => (
            <button key={cat} onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)} className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium border transition-colors ${selectedCategory === cat ? 'bg-[#1C2A0F] text-white border-[#1C2A0F]' : 'bg-white text-[#475569] border-[#F1E9D8] hover:bg-[#FFFBF5]'}`}>{cat}</button>
          ))}
        </div>
        <button onClick={() => setShowAdvanced(!showAdvanced)} className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-[#667A22] hover:underline">
          <FaStar size={10} /> Filtros avanzados {hasActiveFilters && <span className="w-1.5 h-1.5 bg-[#667A22] rounded-full" />}
        </button>
        {showAdvanced && (
          <div className="mt-3 grid grid-cols-3 gap-2 p-3 bg-white rounded-xl border border-[#F1E9D8]">
            <div>
              <p className="text-[11px] font-medium text-[#64748B] mb-1">Precio</p>
              <div className="space-y-1">{['0-25000', '25000-40000', '40000-'].map(r => (
                <button key={r} onClick={() => setPriceRange(priceRange === r ? null : r)} className={`w-full text-[11px] px-2 py-1 rounded-full border ${priceRange === r ? 'bg-[#1C2A0F] text-white border-[#1C2A0F]' : 'bg-white text-[#475569] border-[#F1E9D8]'}`}>{r === '40000-' ? '$40k+' : `$${Number(r.split('-')[0]).toLocaleString()}`}</button>
              ))}</div>
            </div>
            <div>
              <p className="text-[11px] font-medium text-[#64748B] mb-1">Tiempo</p>
              <div className="space-y-1">{['0-15', '15-30', '30-'].map(r => (
                <button key={r} onClick={() => setPrepTime(prepTime === r ? null : r)} className={`w-full text-[11px] px-2 py-1 rounded-full border ${prepTime === r ? 'bg-[#1C2A0F] text-white border-[#1C2A0F]' : 'bg-white text-[#475569] border-[#F1E9D8]'}`}>{r === '30-' ? '30+ min' : `${r.split('-')[0]}-${r.split('-')[1]} min`}</button>
              ))}</div>
            </div>
            <div>
              <p className="text-[11px] font-medium text-[#64748B] mb-1">Picante {spiceLevel}</p>
              <input type="range" min={0} max={3} value={spiceLevel} onChange={(e) => setSpiceLevel(Number(e.target.value))} className="w-full accent-[#667A22]" />
            </div>
            {hasActiveFilters && <button onClick={() => { setSelectedCategory(null); setPriceRange(null); setPrepTime(null); setSpiceLevel(0) }} className="col-span-3 text-[11px] font-medium text-[#DC2626] hover:underline text-center">Limpiar todo</button>}
          </div>
        )}
      </div>
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium tracking-wide uppercase text-[#94A3B8]">{productosFiltrados.length} platos</p>
        {hasActiveFilters && <span className="inline-flex items-center gap-1 text-xs text-[#667A22]"><span className="w-1.5 h-1.5 bg-[#667A22] rounded-full" /> Filtros activos</span>}
      </div>
      {productosFiltrados.length ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {productosFiltrados.map((p, i) => (
            <div key={p.id || p.nombre} className={`bg-white rounded-2xl border border-[#F1E9D8] overflow-hidden hover:border-[#E5E7EB] hover:shadow-sm transition-all ${isVisible ? 'animate-fade-in' : 'opacity-0'}`} style={{ transitionDelay: `${Math.min(i * 40, 400)}ms` }}>
              <div className="relative aspect-[4/3] overflow-hidden bg-[#F8FAFC]">
                <img src={p.imagen} alt={p.nombre} className="w-full h-full object-cover" />
                {p.destacado && <span className="absolute top-2 left-2 bg-[#1C2A0F] text-white px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide">★ Popular</span>}
                <button onClick={() => toggleFavorite(p.id || p.nombre)} className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/95 backdrop-blur border border-[#F1E9D8] flex items-center justify-center shadow-sm hover:scale-105 transition-transform">
                  <FaHeart size={11} className={favorites.includes(p.id || p.nombre) ? 'text-[#E11D48] fill-[#E11D48]' : 'text-[#CBD5E1]'} />
                </button>
              </div>
              <div className="p-3">
                <h4 className="text-[13px] font-semibold text-[#1C2A0F] truncate">{p.nombre}</h4>
                <p className="text-xs text-[#64748B] line-clamp-2 mt-1 leading-relaxed">{p.descripcion}</p>
                <div className="flex items-center justify-between mt-3">
                  <p className="text-[#1C2A0F] font-bold text-sm">${numberFormatter(p.precio ?? 0)}</p>
                  <button onClick={() => { addToCart({ nombre: p.nombre, precio: p.precio, quantity: 1, imagen: p.imagen }); toast.success(`${p.nombre} agregado`) }} className="w-8 h-8 rounded-full bg-[#1C2A0F] text-white flex items-center justify-center hover:bg-[#2A3D16] transition-colors">
                    <FaShoppingBag size={11} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-2xl border border-[#F1E9D8]">
          <FaUtensils size={28} className="mx-auto mb-2 text-[#CBD5E1]" />
          <p className="text-sm font-medium text-[#1C2A0F]">No se encontraron platos</p>
          <p className="text-xs text-[#64748B]">Prueba otros filtros</p>
        </div>
      )}
    </div>
  )
}
