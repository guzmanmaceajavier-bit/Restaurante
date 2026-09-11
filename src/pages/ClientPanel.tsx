import { useState, useMemo, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
import { useCartStore } from '../store/useCartStore'
import { storage } from '../lib/storage'
import { getRestaurantConfig } from '../lib/config'
import { toast } from 'sonner'
import { SEO } from '../lib/seo'
import { FaShoppingBag, FaCalendarAlt, FaStar, FaWhatsapp, FaEye, FaArrowRight, FaHeart, FaRedo, FaUtensils, FaGift, FaCog, FaHome, FaTrophy, FaCheckCircle, FaEdit, FaChevronRight, FaBell, FaFire, FaUser } from 'react-icons/fa'
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

type Tab = 'inicio' | 'perfil' | 'menu' | 'pedidos' | 'reservas' | 'favoritos' | 'puntos' | 'recompensas' | 'config'

export default function ClientPanel() {
  const { clienteActual, logout, canjearPuntos, updateProfile } = useAuthStore()
  const navigate = useNavigate()
  const addToCart = useCartStore((s) => s.addToCart)
  const [tab, setTab] = useState<Tab>('inicio')
  const [confirmCancel, setConfirmCancel] = useState<string | null>(null)
  const [editingReserva, setEditingReserva] = useState<any>(null)
  const [editFecha, setEditFecha] = useState('')
  const [editHora, setEditHora] = useState('')
  const [editPersonas, setEditPersonas] = useState(2)
  const [editingProfile, setEditingProfile] = useState(false)
  const [editNombre, setEditNombre] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [editTelefono, setEditTelefono] = useState('')
  const [editPassword, setEditPassword] = useState('')
  const { favorites, toggleFavorite } = useFavorites(clienteActual?.telefono)

  const favoriteProducts = useMemo(() => {
    const all = dataService.getProductos()
    return all.filter(p => favorites.includes(p.id || p.nombre))
  }, [favorites])

  const config = getRestaurantConfig()

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
    const onFocus = () => load()
    window.addEventListener('storage', onStorage)
    window.addEventListener('focus', onFocus)
    return () => { clearInterval(id); window.removeEventListener('storage', onStorage); window.removeEventListener('focus', onFocus) }
  }, [clienteActual])

  useEffect(() => {
    const h = window.location.hash.replace('#','') as Tab
    if (h && ['inicio','perfil','menu','pedidos','reservas','favoritos','puntos','recompensas','config'].includes(h)) setTab(h)
    const onHash = () => { const v = window.location.hash.replace('#','') as Tab; if (v) setTab(v) }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  if (!clienteActual) {
    return (
      <div className="max-w-md mx-auto text-center py-16">
        <div className="w-16 h-16 rounded-2xl bg-white border border-[#F1E9D8] flex items-center justify-center mx-auto mb-4 text-xl">🔒</div>
        <h1 className="text-xl font-bold text-[#1C2A0F]">Inicia sesión primero</h1>
        <p className="text-sm text-[#64748B] mt-1">Necesitas una cuenta para ver tu rincón</p>
        <Link to="/login" className="inline-flex mt-6 px-6 py-2.5 rounded-full bg-[#1C2A0F] text-white text-sm font-medium">Iniciar sesión <FaArrowRight size={11} className="ml-2"/></Link>
      </div>
    )
  }

  const handleLogout = () => { logout(); toast.success('Sesión cerrada'); navigate('/') }
  const handleRepeatOrder = (order: Order) => {
    if (!order.items) return
    order.items.forEach((item: any) => addToCart({ nombre: item.nombre, precio: item.precio, quantity: item.quantity, imagen: item.imagen || '' }))
    toast.success('Productos al carrito')
    navigate('/menu')
  }
  const handleCancelReserva = (r: any) => {
    storage.setReservas((storage.getReservas() as any[]).map((x:any)=> x.id===r.id?{...x, estado:'Cancelada'}:x))
    setConfirmCancel(null); toast.success('Reserva cancelada')
  }
  const handleEditReserva = (r: any) => { setEditingReserva(r); setEditFecha(r.fecha); setEditHora(r.hora); setEditPersonas(r.personas)}
  const handleSaveEditReserva = () => {
    if (!editingReserva) return
    storage.setReservas((storage.getReservas() as any[]).map((x:any)=> x.id===editingReserva.id?{...x, fecha:editFecha, hora:editHora, personas:editPersonas, estado:'Pendiente'}:x))
    setEditingReserva(null); toast.success('Reserva modificada — pendiente de confirmación')
  }

  const tabs: { id: Tab; icon: any; label: string; count?: number }[] = [
    { id: 'inicio', icon: FaHome, label: 'Resumen' },
    { id: 'pedidos', icon: FaShoppingBag, label: 'Pedidos', count: ordenes.length },
    { id: 'reservas', icon: FaCalendarAlt, label: 'Reservas', count: reservas.length },
    { id: 'menu', icon: FaUtensils, label: 'Menú' },
    { id: 'favoritos', icon: FaHeart, label: 'Favoritos', count: favorites.length },
    { id: 'puntos', icon: FaTrophy, label: 'Puntos' },
    { id: 'recompensas', icon: FaGift, label: 'Recompensas' },
    { id: 'perfil', icon: FaUser, label: 'Perfil' },
    { id: 'config', icon: FaCog, label: 'Ajustes' },
  ]

  const proximaReserva = reservas.find((r:any)=> r.estado!=='Cancelada') || null
  const pedidoActivo = ordenes.find(o=> ['recibido','preparando','listo'].includes(o.estado)) || null

  return (
    <div className="max-w-[980px] mx-auto">
      <SEO title="Mi cuenta" />
      {/* Encabezado integrado con layout */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-4">
        <div>
          <h1 className="text-[11px] font-semibold tracking-widest uppercase text-[#F59E0B]">Mi cuenta</h1>
          <p className="text-xl font-display font-bold text-[#1C2A0F] leading-5">Hola, {clienteActual.nombre.split(' ')[0]} <span className="text-[#F59E0B]">·</span> {clienteActual.puntos||0} pts</p>
          <p className="text-xs text-[#64748B]">{clienteActual.nivel||'bronce'} · {ordenes.length} pedidos · {reservas.length} reservas</p>
        </div>
        <div className="flex gap-2">
          <Link to="/menu" className="px-4 py-2 rounded-full bg-[#1C2A0F] text-white text-xs font-medium hover:bg-[#2A3D16]">Pedir ahora</Link>
          <Link to="/reservas" className="px-4 py-2 rounded-full bg-white border border-[#F1E9D8] text-xs font-medium text-[#1C2A0F]">Reservar</Link>
        </div>
      </div>

      {/* Tabs secundarias — nuevo estilo gold */}
      <div className="flex gap-1.5 overflow-x-auto pb-3 -mx-1 px-1 scrollbar-hide">
        {tabs.map(t=> (
          <button key={t.id} onClick={()=>{ setTab(t.id); window.location.hash=t.id}}
            className={clsx('inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium whitespace-nowrap border transition-all',
              tab===t.id ? 'bg-[#1C2A0F] text-white border-[#1C2A0F] shadow-sm' : 'bg-white text-[#475569] border-[#E5E7EB] hover:border-[#F1E9D8]')}>
            <t.icon size={11} className={tab===t.id?'text-[#F5B51B]':'text-[#94A3B8]'} /> {t.label}
            {t.count!==undefined && t.count>0 && <span className={clsx('ml-1 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold flex items-center justify-center', tab===t.id?'bg-white/15 text-white':'bg-[#F59E0B] text-white')}>{t.count}</span>}
          </button>
        ))}
      </div>

      {/* INICIO — dashboard nuevo: próximareserva + pedido activo + stats */}
      {tab==='inicio' && (
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-3">
            <div className="bg-white rounded-2xl border border-[#F1E9D8] p-4">
              <p className="text-[11px] font-semibold tracking-widest uppercase text-[#94A3B8]">Pedido en curso</p>
              {!pedidoActivo ? <p className="text-sm text-[#64748B] mt-2">Sin pedidos activos. <Link to="/menu" className="text-[#F59E0B] font-medium hover:underline">Ir al menú →</Link></p> : (
                <div className="mt-2">
                  <p className="font-mono text-xs text-[#94A3B8]">{pedidoActivo.id.slice(0,14)}</p>
                  <p className="text-sm font-semibold text-[#1C2A0F] capitalize">{pedidoActivo.estado} · ${Number(pedidoActivo.total).toLocaleString('es-CO')}</p>
                  <div className="flex gap-1.5 mt-2">{['recibido','preparando','listo','entregado'].map(s=> <span key={s} className={clsx('h-1.5 flex-1 rounded-full', ['recibido','preparando','listo','entregado'].indexOf(pedidoActivo.estado)>=['recibido','preparando','listo','entregado'].indexOf(s) ? 'bg-[#F59E0B]':'bg-[#F1F5F9]')} />)}</div>
                  <Link to={`/orden-confirmacion/${pedidoActivo.id}`} className="inline-flex mt-2 text-xs font-medium text-[#1C2A0F] border border-[#F1E9D8] px-3 py-1.5 rounded-full hover:bg-[#FFFBF5]"><FaEye size={11} className="mr-1.5"/> Ver seguimiento</Link>
                </div>
              )}
            </div>
            <div className="bg-white rounded-2xl border border-[#F1E9D8] p-4">
              <p className="text-[11px] font-semibold tracking-widest uppercase text-[#94A3B8]">Próxima reserva</p>
              {!proximaReserva ? <p className="text-sm text-[#64748B] mt-2">Sin reservas. <Link to="/reservas" className="text-[#F59E0B] font-medium hover:underline">Reservar mesa →</Link></p> : (
                <div className="mt-2">
                  <p className="text-sm font-semibold text-[#1C2A0F]">{proximaReserva.fecha} · {proximaReserva.hora} · {proximaReserva.personas} pers.</p>
                  <p className="text-xs text-[#64748B]">{proximaReserva.zona||'—'} · <span className={clsx('px-2 py-0.5 rounded-full text-[11px] font-medium border', proximaReserva.estado==='Pendiente'?'bg-[#FFFBEB] border-[#FDE68A] text-[#92400E]': proximaReserva.estado==='Cancelada'?'bg-[#FEF2F2] border-[#FECACA] text-[#991B1B]':'bg-[#ECFDF5] border-[#A7F3D0] text-[#065F46]')}>{proximaReserva.estado}</span></p>
                  <button onClick={()=> setTab('reservas')} className="mt-2 text-xs font-medium text-[#1C2A0F] border border-[#F1E9D8] px-3 py-1.5 rounded-full hover:bg-[#FFFBF5]">Gestionar</button>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[{label:'Pedidos', value:ordenes.length, icon:FaShoppingBag},{label:'Reservas', value:reservas.length, icon:FaCalendarAlt},{label:'Favoritos', value:favorites.length, icon:FaHeart}].map(s=> (
              <div key={s.label} className="bg-white rounded-2xl border border-[#F1E9D8] p-4 text-center">
                <s.icon size={14} className="mx-auto text-[#F59E0B] mb-1"/>
                <p className="text-lg font-bold text-[#1C2A0F]">{s.value}</p>
                <p className="text-[11px] tracking-widest uppercase font-semibold text-[#94A3B8]">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="bg-[#1C2A0F] rounded-2xl p-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-xs tracking-widest uppercase text-[#F5B51B] font-semibold">Fidelidad</p>
              <p className="text-lg font-bold">{clienteActual.puntos||0} puntos · {clienteActual.nivel||'bronce'}</p>
              <p className="text-xs text-white/70">{100 - ((clienteActual.puntos||0)%100)} pts para siguiente nivel</p>
            </div>
            <button onClick={()=> setTab('recompensas')} className="px-4 py-2 rounded-full bg-[#F5B51B] text-[#1C2A0F] text-xs font-semibold hover:bg-[#FFC93A]">Ver recompensas</button>
          </div>
        </div>
      )}

      {tab==='perfil' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-[#F1E9D8] p-6 flex gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#1C2A0F] flex items-center justify-center text-white font-bold text-lg shrink-0">{clienteActual.nombre.charAt(0)}</div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-[#1C2A0F] truncate">{clienteActual.nombre}</p>
              <p className="text-xs text-[#64748B] truncate">{clienteActual.email} · {clienteActual.telefono}</p>
              <span className="inline-flex mt-2 px-2.5 py-1 rounded-full bg-[#FFFBEB] border border-[#FDE68A] text-xs font-medium text-[#92400E]"><FaStar size={10} className="mr-1 text-[#F59E0B]"/>{clienteActual.nivel||'bronce'} · {clienteActual.puntos||0} pts</span>
            </div>
            <button onClick={()=>{ setEditNombre(clienteActual.nombre); setEditEmail(clienteActual.email); setEditTelefono(clienteActual.telefono); setEditPassword(clienteActual.password||''); setEditingProfile(true)}} className="h-8 px-3 rounded-full bg-[#F8FAFC] border border-[#E5E7EB] text-xs font-medium text-[#475569]"><FaEdit size={10} className="inline mr-1"/> Editar</button>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <Link to="/menu" className="py-3 rounded-full bg-[#1C2A0F] text-white text-sm font-medium text-center">Hacer pedido <FaArrowRight size={11} className="inline ml-1"/></Link>
            <Link to="/reservas" className="py-3 rounded-full bg-white border border-[#F1E9D8] text-sm font-medium text-center text-[#1C2A0F]">Reservar mesa</Link>
          </div>
        </div>
      )}

      {tab==='menu' && <div className="bg-white rounded-2xl border border-[#F1E9D8] p-4"><MenuTab /></div>}

      {tab==='pedidos' && (
        <div className="space-y-3">
          {ordenes.length===0 ? <div className="bg-white rounded-2xl border border-[#F1E9D8] p-8"><EmptyState icon={<FaShoppingBag size={22}/>} title="Sin pedidos" description="Haz tu primer pedido" action={{label:'Ver menú', onClick:()=> navigate('/menu')}}/></div> :
            ordenes.map(o=>{
              const badge = estadoBadge[o.estado] || { bg:'bg-[#F8FAFC] border-[#E5E7EB]', text:'text-[#475569]'}
              return (
                <div key={o.id} className="bg-white rounded-2xl border border-[#F1E9D8] p-4">
                  <div className="flex justify-between gap-3">
                    <div>
                      <p className="font-mono text-[11px] tracking-wide uppercase text-[#94A3B8]">{o.id.slice(0,14)}</p>
                      <p className="text-xs text-[#64748B]">{new Date(o.createdAt).toLocaleDateString('es-CO')} · {o.items?.length||0} items</p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${badge.bg} ${badge.text}`}>{o.estado}</span>
                      <p className="text-sm font-bold text-[#1C2A0F] mt-1">${Number(o.total).toLocaleString('es-CO')}</p>
                    </div>
                  </div>
                  <div className="mt-3 rounded-xl bg-[#FFFBF5] border border-[#F1E9D8] p-3">
                    {o.items?.map((it:any,j:number)=> <div key={j} className="flex justify-between text-xs py-1"><span className="text-[#334155]">{it.nombre} <span className="text-[#94A3B8]">×{it.quantity}</span></span><span className="font-medium">${Number(it.precio*it.quantity).toLocaleString('es-CO')}</span></div>)}
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    <Link to={`/orden-confirmacion/${o.id}`} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white border border-[#E5E7EB] text-xs font-medium text-[#475569]"><FaEye size={11}/> Ver</Link>
                    <button onClick={()=> handleRepeatOrder(o)} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#FFFBEB] border border-[#FDE68A] text-xs font-medium text-[#92400E]"><FaRedo size={11}/> Repetir</button>
                    <a href={`https://wa.me/${config.whatsapp}?text=${encodeURIComponent(`Seguimiento pedido #${o.id}`)}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-xs font-medium text-[#065F46]"><FaWhatsapp size={11}/> WhatsApp</a>
                    {o.estado==='recibido' && <button onClick={()=> handleCancelReserva({id:o.id} as any)} className="px-3 py-1.5 rounded-full bg-white border border-[#FECACA] text-xs font-medium text-[#DC2626]">Cancelar</button>}
                  </div>
                </div>
              )
            })}
        </div>
      )}

      {tab==='reservas' && (
        <div className="space-y-3">
          {reservas.length===0 ? <div className="bg-white rounded-2xl border border-[#F1E9D8] p-8"><EmptyState icon={<FaCalendarAlt size={22}/>} title="Sin reservas" description="Reserva tu mesa" action={{label:'Reservar', onClick:()=> navigate('/reservas')}}/></div> :
            reservas.map((r:any)=> (
              <div key={r.id} className="bg-white rounded-2xl border border-[#F1E9D8] p-4">
                <div className="flex justify-between gap-3">
                  <div>
                    <p className="font-mono text-[11px] uppercase text-[#94A3B8]">{r.id.slice(0,12)}</p>
                    <p className="text-sm font-semibold text-[#1C2A0F]">{r.fecha} — {r.hora}</p>
                    <p className="text-xs text-[#64748B]">{r.personas} pers. · {r.zona||'—'}</p>
                  </div>
                  <span className={clsx('h-6 px-2.5 py-1 rounded-full text-xs font-medium border', r.estado==='Pendiente'?'bg-[#FFFBEB] border-[#FDE68A] text-[#92400E]': r.estado==='Cancelada'?'bg-[#FEF2F2] border-[#FECACA] text-[#991B1B]':'bg-[#ECFDF5] border-[#A7F3D0] text-[#065F46]')}>{r.estado}</span>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {r.estado!=='Cancelada' && r.estado!=='confirmada' && <button onClick={()=> handleEditReserva(r)} className="px-3 py-1.5 rounded-full bg-white border border-[#E5E7EB] text-xs font-medium text-[#475569]"><FaEdit size={11} className="inline mr-1"/> Modificar</button>}
                  {r.estado!=='Cancelada' && <button onClick={()=> setConfirmCancel(r.id)} className="px-3 py-1.5 rounded-full bg-white border border-[#FECACA] text-xs font-medium text-[#DC2626]">Cancelar</button>}
                  <a href={`https://wa.me/${config.whatsapp}?text=${encodeURIComponent(`Reserva #${r.id} ${r.fecha} ${r.hora}`)}`} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-xs font-medium text-[#065F46] inline-flex items-center gap-1"><FaWhatsapp size={11}/> WhatsApp</a>
                </div>
              </div>
            ))}
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
              <button onClick={handleSaveEditReserva} className="flex-1 py-2.5 rounded-full bg-[#1C2A0F] text-white text-sm font-medium">Guardar</button>
            </div>
          </div>
        </div>
      )}
      {editingProfile && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={()=> setEditingProfile(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6" onClick={e=> e.stopPropagation()}>
            <h3 className="font-semibold text-[#1C2A0F] mb-1">Editar datos personales</h3>
            <p className="text-xs text-[#64748B] mb-4">Actualiza tu nombre, email, teléfono o contraseña</p>
            <div className="space-y-3">
              <div><label className="block text-xs font-medium text-[#475569] mb-1">Nombre</label><input value={editNombre} onChange={e=> setEditNombre(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-[#E5E7EB] text-sm" placeholder="Tu nombre" /></div>
              <div><label className="block text-xs font-medium text-[#475569] mb-1">Email</label><input type="email" value={editEmail} onChange={e=> setEditEmail(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-[#E5E7EB] text-sm" placeholder="correo@ejemplo.com" /></div>
              <div><label className="block text-xs font-medium text-[#475569] mb-1">Teléfono</label><input value={editTelefono} onChange={e=> setEditTelefono(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-[#E5E7EB] text-sm" placeholder="300 123 4567" /></div>
              <div><label className="block text-xs font-medium text-[#475569] mb-1">Contraseña</label><input type="password" value={editPassword} onChange={e=> setEditPassword(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-[#E5E7EB] text-sm" placeholder="Nueva contraseña" /></div>
            </div>
            <div className="flex gap-2 mt-6">
              <button onClick={()=> setEditingProfile(false)} className="flex-1 py-2.5 rounded-full bg-white border border-[#E5E7EB] text-sm font-medium">Cancelar</button>
              <button onClick={()=>{
                const res = updateProfile({ nombre: editNombre.trim(), email: editEmail.trim(), telefono: editTelefono.trim(), password: editPassword })
                if(!res.ok) toast.error(res.error)
                else { toast.success('Datos actualizados'); setEditingProfile(false) }
              }} className="flex-1 py-2.5 rounded-full bg-[#1C2A0F] text-white text-sm font-medium">Guardar</button>
            </div>
          </div>
        </div>
      )}

      {tab==='favoritos' && (
        <div>
          {favoriteProducts.length===0 ? <div className="bg-white rounded-2xl border border-[#F1E9D8] p-8"><EmptyState icon={<FaHeart size={22}/>} title="Sin favoritos" description="Guarda tus platos" action={{label:'Explorar menú', onClick:()=> navigate('/menu')}}/></div> :
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {favoriteProducts.map(p=> (
                <div key={p.id} className="bg-white rounded-2xl border border-[#F1E9D8] overflow-hidden">
                  <div className="relative aspect-[4/3] bg-[#F8FAFC]"><img src={p.imagen} alt={p.nombre} className="w-full h-full object-cover"/><button onClick={()=> toggleFavorite(p.id||p.nombre)} className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/95 border border-[#F1E9D8] flex items-center justify-center"><FaHeart size={12} className="text-[#E11D48] fill-[#E11D48]"/></button></div>
                  <div className="p-3"><h4 className="text-xs font-semibold text-[#1C2A0F] truncate">{p.nombre}</h4><p className="text-[#F59E0B] font-bold text-sm mt-1">${numberFormatter(p.precio??0)}</p><button onClick={()=>{ addToCart({nombre:p.nombre, precio:p.precio, quantity:1, imagen:p.imagen}); toast.success(`${p.nombre} agregado`)}} className="w-full mt-2 py-2 rounded-full bg-[#1C2A0F] text-white text-xs font-medium">Agregar</button></div>
                </div>
              ))}
            </div>}
        </div>
      )}

      {tab==='puntos' && (
        <div className="space-y-4">
          <div className="rounded-2xl p-6 text-center border border-[#FDE68A] bg-gradient-to-br from-[#FFFBEB] via-[#FEF3C7] to-[#FDE68A]">
            <FaTrophy size={26} className="mx-auto mb-2 text-[#B45309]"/>
            <p className="text-3xl font-bold text-[#92400E]">{clienteActual.puntos||0}</p>
            <p className="text-xs tracking-widest uppercase font-semibold text-[#B45309]">Puntos</p>
            <div className="mt-3 h-2 rounded-full bg-white/60 border border-[#FDE68A] p-0.5"><div className="h-full rounded-full bg-[#F59E0B] transition-all" style={{width:`${Math.min(((clienteActual.puntos||0)%100),100)}%`}}/></div>
            <p className="text-xs text-[#92400E]/70 mt-1">{100 - ((clienteActual.puntos||0)%100)} para siguiente nivel</p>
          </div>
          <div className="bg-white rounded-2xl border border-[#F1E9D8] p-4">
            <h3 className="text-sm font-semibold text-[#1C2A0F] mb-2 flex items-center gap-1.5"><FaFire size={11} className="text-[#F59E0B]"/> Niveles</h3>
            <div className="grid grid-cols-3 gap-2">{[{name:'Bronce',min:0},{name:'Plata',min:200},{name:'Oro',min:500}].map(l=>{ const a=(clienteActual.puntos||0)>=l.min; return <div key={l.name} className={clsx('rounded-xl border p-3 text-center', a?'bg-[#FFFBF5] border-[#FDE68A]':'bg-white border-[#F1E9D8] opacity-60')}><p className="text-xs font-medium text-[#1C2A0F]">{l.name}</p><p className="text-[11px] text-[#94A3B8]">{l.min} pts</p>{a&&<FaCheckCircle size={11} className="text-[#10B981] mx-auto mt-1"/>}</div>})}</div>
          </div>
        </div>
      )}

      {tab==='recompensas' && (
        <div className="space-y-3">
          <div className="bg-white rounded-2xl border border-[#F1E9D8] p-4 flex justify-between items-center"><span className="text-sm text-[#64748B]">Tienes</span><span className="text-lg font-bold text-[#1C2A0F]">{clienteActual.puntos||0} pts</span></div>
          {(() => {
            const stored = (()=>{ try{ const s=JSON.parse(localStorage.getItem('fidelizacion_recompensas')||'[]'); return s.length? s : null } catch{ return null }})()
            const recompensas = stored || [{ name: 'Descuento $10.000', cost: 100, icon: '🏷️', desc: '$10.000' }, { name: 'Bebida gratis', cost: 50, icon: '🥤', desc: 'Bebida' }, { name: 'Postre gratis', cost: 75, icon: '🍰', desc: 'Postre' }, { name: 'Envío gratis', cost: 30, icon: '🚴', desc: 'Envío' }]
            return recompensas.map((r:any) => (
            <div key={r.name||r.nombre} className="bg-white rounded-2xl border border-[#F1E9D8] p-4 flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-[#FFFBF5] border border-[#F1E9D8] flex items-center justify-center text-lg">{r.icon||'🎁'}</span>
              <div className="flex-1 min-w-0"><h4 className="text-sm font-semibold text-[#1C2A0F]">{r.name||r.nombre}</h4><p className="text-xs text-[#64748B]">{r.desc||r.descripcion} · <span className="text-[#F59E0B] font-medium">{r.cost||r.puntos} pts</span></p></div>
              <button onClick={()=>{ const c=r.cost||r.puntos; const res=canjearPuntos(c); if(res.ok) toast.success(`¡${r.name||r.nombre} canjeado!`); else toast.error(res.error||'Puntos insuficientes')}} disabled={(clienteActual.puntos||0) < (r.cost||r.puntos)} className="px-4 py-2 rounded-full bg-[#1C2A0F] text-white text-xs font-medium disabled:bg-[#F1F5F9] disabled:text-[#94A3B8] disabled:border">Canjear</button>
            </div>
          ))})()}
        </div>
      )}

      {tab==='config' && (
        <div className="bg-white rounded-2xl border border-[#F1E9D8] overflow-hidden">
          <div className="divide-y divide-[#F1E9D8]">
            {[{label:'Notificaciones', icon:FaBell, action:()=> toast.info('Próximamente')},{label:'Privacidad', icon:FaEye, action:()=> navigate('/politica-privacidad')},{label:'Términos', icon:FaEye, action:()=> navigate('/terminos-condiciones')}].map(it=> (
              <button key={it.label} onClick={it.action} className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-[#FFFBF5]"><span className="w-8 h-8 rounded-full bg-[#F8FAFC] border border-[#F1E9D8] flex items-center justify-center"><it.icon size={11} className="text-[#64748B]"/></span><span className="flex-1 text-sm font-medium text-[#1C2A0F]">{it.label}</span><FaChevronRight size={11} className="text-[#CBD5E1]"/></button>
            ))}
          </div>
          <div className="p-4 bg-[#FFFBF5] border-t border-[#F1E9D8]"><button onClick={handleLogout} className="w-full py-3 rounded-full bg-white border border-[#FECACA] text-[#DC2626] text-sm font-medium">Cerrar sesión</button></div>
        </div>
      )}

      <ConfirmModal open={!!confirmCancel} onClose={()=> setConfirmCancel(null)} onConfirm={()=>{ const r=reservas.find((x:any)=> x.id===confirmCancel); if(r) handleCancelReserva(r)}} title="Cancelar reserva" message="¿Cancelar esta reserva?" confirmText="Sí, cancelar" cancelText="Mantener" />
    </div>
  )
}

function MenuTab() {
  const addToCart = useCartStore((s) => s.addToCart)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [priceRange, setPriceRange] = useState<string | null>(null)
  const { favorites, toggleFavorite } = useFavorites()
  const [allProducts, setAllProducts] = useState(()=> dataService.getProductos())
  useEffect(()=>{ const id=setInterval(()=> setAllProducts(dataService.getProductos()), 3000); const onStorage=()=> setAllProducts(dataService.getProductos()); window.addEventListener('storage', onStorage); return ()=>{ clearInterval(id); window.removeEventListener('storage', onStorage)}}, [])
  const categorias = useMemo(() => Array.from(new Set(allProducts.map(p => (p as any)['categoría']).filter(Boolean))) as string[], [allProducts])
  const productosFiltrados = useMemo(() => {
    let r=[...allProducts]
    if(searchQuery.trim()){ const q=searchQuery.toLowerCase(); r=r.filter(p=> p.nombre.toLowerCase().includes(q) || p.descripcion?.toLowerCase().includes(q))}
    if(selectedCategory) r=r.filter(p=> (p as any)['categoría']===selectedCategory)
    if(priceRange){ const [min,max]=priceRange.split('-').map(Number); r=r.filter(p=>{ const pr=p.precio??0; return max? pr>=min && pr<=max : pr>=min})}
    return r
  }, [allProducts, searchQuery, selectedCategory, priceRange])
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 bg-[#FFFBF5] border border-[#F1E9D8] rounded-full px-4 py-2">
        <FaUtensils size={11} className="text-[#94A3B8]"/><input value={searchQuery} onChange={e=> setSearchQuery(e.target.value)} placeholder="Buscar platos…" className="flex-1 bg-transparent text-sm outline-none placeholder:text-[#94A3B8]"/>{searchQuery && <button onClick={()=> setSearchQuery('')} className="text-xs text-[#F59E0B] font-medium">Limpiar</button>}
      </div>
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide"><button onClick={()=> setSelectedCategory(null)} className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border ${!selectedCategory?'bg-[#1C2A0F] text-white border-[#1C2A0F]':'bg-white text-[#475569] border-[#F1E9D8]'}`}>Todos</button>{categorias.map(c=> <button key={c} onClick={()=> setSelectedCategory(selectedCategory===c?null:c)} className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border ${selectedCategory===c?'bg-[#1C2A0F] text-white border-[#1C2A0F]':'bg-white text-[#475569] border-[#F1E9D8]'}`}>{c}</button>)}</div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">{productosFiltrados.map(p=> <div key={p.id||p.nombre} className="bg-white rounded-2xl border border-[#F1E9D8] overflow-hidden"><div className="relative aspect-[4/3] bg-[#F8FAFC]"><img src={p.imagen} alt={p.nombre} className="w-full h-full object-cover"/><button onClick={()=> toggleFavorite(p.id||p.nombre)} className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/95 border border-[#F1E9D8] flex items-center justify-center"><FaHeart size={11} className={favorites.includes(p.id||p.nombre)?'text-[#E11D48] fill-[#E11D48]':'text-[#CBD5E1]'}/></button></div><div className="p-3"><h4 className="text-xs font-semibold text-[#1C2A0F] truncate">{p.nombre}</h4><p className="text-xs text-[#64748B] line-clamp-2 mt-1">{p.descripcion}</p><div className="flex justify-between items-center mt-2"><p className="text-sm font-bold text-[#1C2A0F]">${numberFormatter(p.precio??0)}</p><button onClick={()=>{ addToCart({nombre:p.nombre, precio:p.precio, quantity:1, imagen:p.imagen}); toast.success(`${p.nombre} agregado`)}} className="w-7 h-7 rounded-full bg-[#1C2A0F] text-white flex items-center justify-center"><FaShoppingBag size={11}/></button></div></div></div>)}</div>
    </div>
  )
}
