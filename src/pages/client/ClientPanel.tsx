import { useState, useMemo, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/useAuthStore'
import { useCartStore } from '../../store/useCartStore'
import { storage } from '../../lib/storage'
import { getRestaurantConfig } from '../../lib/config'
import { toast } from 'sonner'
import { SEO } from '../../lib/seo'
import { FaShoppingBag, FaCalendarAlt, FaWhatsapp, FaEye, FaArrowRight, FaHeart, FaRedo, FaGift, FaTrophy, FaCheckCircle, FaEdit, FaTrash, FaMapMarkerAlt, FaShieldAlt, FaHeadset, FaPlus } from 'react-icons/fa'
import EmptyState from '../../components/feedback/EmptyState'
import ConfirmModal from '../../components/feedback/ConfirmModal'
import { useFavorites } from '../../hooks/useFavorites'
import { dataService } from '../../lib/dataService'
import type { Order } from '../../features/orders/types'
import { numberFormatter } from '../../utils/numberFormatter'
import clsx from 'clsx'
import { motion, AnimatePresence } from 'framer-motion'
import { FIDELIDAD_CONFIG } from '../../features/loyalty/fidelidad'
import * as Yup from 'yup'
import { Formik, Form, Field, ErrorMessage } from 'formik'

const estadoBadge: Record<string, { bg: string; text: string }> = {
  recibido: { bg: 'bg-[#EFF6FF] border-[#BFDBFE]', text: 'text-[#1D4ED8]' },
  preparando: { bg: 'bg-[#FFFBEB] border-[#FDE68A]', text: 'text-[#92400E]' },
  listo: { bg: 'bg-[#ECFDF5] border-[#A7F3D0]', text: 'text-[#065F46]' },
  entregado: { bg: 'bg-[#F8FAFC] border-[#E5E7EB]', text: 'text-[#475569]' },
  cancelado: { bg: 'bg-[#FEF2F2] border-[#FECACA]', text: 'text-[#991B1B]' },
}

type Tab = 'inicio' | 'pedidos' | 'reservas' | 'favoritos' | 'direcciones' | 'fidelidad' | 'cuenta'

export default function ClientPanel() {
  const { clienteActual, logout, canjearPuntos, updateProfile, addDireccion, updateDireccion, deleteDireccion, deleteAccount } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const addToCart = useCartStore((s) => s.addToCart)
  const [tab, setTab] = useState<Tab>(() => {
    const h = (typeof window !== 'undefined' ? window.location.hash.replace('#','') : '') as Tab
    return (['inicio','pedidos','reservas','favoritos','direcciones','fidelidad','cuenta'] as Tab[]).includes(h as Tab) ? h : 'inicio'
  })
  const [confirmCancel, setConfirmCancel] = useState<string | null>(null)
  const [confirmCancelPedido, setConfirmCancelPedido] = useState<string | null>(null)
  const [confirmFav, setConfirmFav] = useState<string | null>(null)
  const [confirmDeleteDir, setConfirmDeleteDir] = useState<string | null>(null)
  const [confirmDeleteAccount, setConfirmDeleteAccount] = useState(false)
  const [editingReserva, setEditingReserva] = useState<any>(null)
  const [editFecha, setEditFecha] = useState('')
  const [editHora, setEditHora] = useState('')
  const [editPersonas, setEditPersonas] = useState(2)
  const [editingProfile, setEditingProfile] = useState(false)
  const [editNombre, setEditNombre] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [editTelefono, setEditTelefono] = useState('')
  const [editPassword, setEditPassword] = useState('')
  const [editingDir, setEditingDir] = useState<any>(null)
  const [dirAlias, setDirAlias] = useState('')
  const [dirDireccion, setDirDireccion] = useState('')
  const [dirIndicaciones, setDirIndicaciones] = useState('')
  const [showDirForm, setShowDirForm] = useState(false)
  const [prefs, setPrefs] = useState(()=> {
    try{ const k=clienteActual? `prefs_${clienteActual.id}`: 'prefs_guest'; return JSON.parse(localStorage.getItem(k)||'{"whatsapp":true,"email":true,"promos":true}') } catch{ return {whatsapp:true,email:true,promos:true}}
  })
  useEffect(()=>{ if(clienteActual){ const k=`prefs_${clienteActual.id}`; localStorage.setItem(k, JSON.stringify(prefs)) }}, [prefs, clienteActual])
  const { favorites, toggleFavorite } = useFavorites(clienteActual?.telefono)

  const favoriteProducts = useMemo(() => {
    const all = dataService.getProductos()
    return all.filter(p => favorites.includes(p.id || p.nombre))
  }, [favorites])

  const config = getRestaurantConfig()

  const [ordenes, setOrdenes] = useState<Order[]>([])
  const [reservas, setReservas] = useState<any[]>([])
  const [showVincular, setShowVincular] = useState(false)
  const [loading, setLoading] = useState(true)
  const [storageError, setStorageError] = useState<string | null>(null)
  useEffect(() => {
    if (!clienteActual) return
    setLoading(true); setStorageError(null)
    const load = () => {
      try{
        const allOrdenes = storage.getOrdenes<Order>()
        const allReservas = storage.getReservas() as any[]
        setOrdenes(allOrdenes.filter((o) => clienteActual.historialPedidos.includes(o.id)).reverse())
        setReservas(allReservas.filter((r: any) => clienteActual.historialReservas.includes(r.id)).reverse())
        const matchPhone = (a:string,b:string)=> a && b && a.replace(/\D/g,'')===b.replace(/\D/g,'')
        const huérfanosOrdenes = allOrdenes.filter(o=> !clienteActual.historialPedidos.includes(o.id) && (matchPhone((o as any).phone, clienteActual.telefono) || (o as any).email===clienteActual.email)).length
        const huérfanosReservas = allReservas.filter((r:any)=> !clienteActual.historialReservas.includes(r.id) && (matchPhone(r.telefono, clienteActual.telefono) || r.email===clienteActual.email)).length
        setShowVincular(huérfanosOrdenes>0 || huérfanosReservas>0)
        setStorageError(null)
      }catch(e:any){ setStorageError(e?.message || 'Error al leer datos locales')}
    }
    load()
    const t=setTimeout(()=> setLoading(false), 600)
    const id = setInterval(load, 2000)
    const onStorage = () => load()
    const onFocus = () => load()
    window.addEventListener('storage', onStorage)
    window.addEventListener('focus', onFocus)
    return () => { clearTimeout(t); clearInterval(id); window.removeEventListener('storage', onStorage); window.removeEventListener('focus', onFocus) }
  }, [clienteActual])

  // Sincroniza tab con hash sin necesidad de recarga (React Router Link + hashchange)
  useEffect(() => {
    const h = location.hash.replace('#','') as Tab
    if (h && (['inicio','pedidos','reservas','favoritos','direcciones','fidelidad','cuenta'] as string[]).includes(h)) setTab(h as Tab)
    else if (!h) setTab('inicio')
  }, [location.hash])
  useEffect(() => {
    const onHash = () => { const v = window.location.hash.replace('#','') as Tab; if (v && (['inicio','pedidos','reservas','favoritos','direcciones','fidelidad','cuenta'] as string[]).includes(v)) setTab(v as Tab) }
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

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
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
  const vincularPasados = () => {
    const allOrdenes = storage.getOrdenes<Order>()
    const allReservas = storage.getReservas() as any[]
    const matchPhone = (a:string,b:string)=> a && b && a.replace(/\D/g,'')===b.replace(/\D/g,'')
    let c=0
    allOrdenes.forEach((o:any)=> { if(!clienteActual.historialPedidos.includes(o.id) && (matchPhone(o.phone, clienteActual.telefono) || o.email===clienteActual.email)){ useAuthStore.getState().addOrderToHistory(o.id); c++ } })
    allReservas.forEach((r:any)=> { if(!clienteActual.historialReservas.includes(r.id) && (matchPhone(r.telefono, clienteActual.telefono) || r.email===clienteActual.email)){ useAuthStore.getState().addReservaToHistory(r.id); c++ } })
    toast.success(c? `${c} registros vinculados a tu cuenta (aislamiento por historial)` : 'Nada para vincular')
    setShowVincular(false)
  }

  const proximaReserva = reservas.find((r:any)=> r.estado!=='Cancelada') || null
  const pedidoActivo = ordenes.find(o=> ['recibido','preparando','listo'].includes(o.estado)) || null
  const tabTitle: Record<Tab, string> = { inicio:'Resumen', pedidos:'Mis pedidos', reservas:'Mis reservas', favoritos:'Favoritos', direcciones:'Direcciones', fidelidad:'Fidelidad', cuenta:'Cuenta' }

  return (
    <div className="max-w-[980px] mx-auto">
      <SEO title="Mi cuenta" />
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-4">
        <div>
          <h1 className="text-[11px] font-semibold tracking-widest uppercase text-[#F59E0B]">{tabTitle[tab]}</h1>
          <p className="text-xl font-display font-bold text-[#1C2A0F] leading-5">Hola, {clienteActual.nombre.split(' ')[0]} <span className="text-[#F59E0B]">·</span> {clienteActual.puntos||0} pts · {clienteActual.nivel||'bronce'}</p>
          <p className="text-xs text-[#64748B]">{ordenes.length} pedidos · {reservas.length} reservas · {(clienteActual.direcciones||[]).length} direcciones</p>
        </div>
        <div className="hidden sm:flex gap-2">
          <Link to="/menu" className="px-4 py-2 rounded-full bg-[#1C2A0F] text-white text-xs font-medium hover:bg-[#2A3D16]">Pedir ahora</Link>
          <Link to="/reservas" className="px-4 py-2 rounded-full bg-white border border-[#F1E9D8] text-xs font-medium text-[#1C2A0F]">Reservar</Link>
        </div>
      </div>
      {showVincular && (
        <div className="mb-3 flex items-center justify-between gap-3 bg-[#FFFBEB] border border-[#FDE68A] rounded-xl px-4 py-2.5">
          <p className="text-xs text-[#92400E] leading-relaxed">Detectamos pedidos/reservas con tu teléfono/email no vinculados. <span className="font-semibold">Aislamiento por historial</span> — vincula solo si son tuyos.</p>
          <button onClick={vincularPasados} className="shrink-0 px-3 py-1.5 rounded-full bg-[#92400E] text-white text-xs font-medium hover:bg-[#7C3D11]">Vincular</button>
        </div>
      )}
      {storageError && <div className="mb-3 bg-[#FEF2F2] border border-[#FECACA] rounded-xl px-4 py-2.5 text-xs text-[#991B1B]">Error localStorage: {storageError} — recarga o limpia datos.</div>}

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
                  <button onClick={()=> { setTab('reservas'); window.location.hash='reservas'}} className="mt-2 text-xs font-medium text-[#1C2A0F] border border-[#F1E9D8] px-3 py-1.5 rounded-full hover:bg-[#FFFBF5]">Gestionar</button>
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
            <button onClick={()=> { setTab('fidelidad'); window.location.hash='fidelidad'}} className="px-4 py-2 rounded-full bg-[#F5B51B] text-[#1C2A0F] text-xs font-semibold hover:bg-[#FFC93A]">Ver recompensas</button>
          </div>
        </div>
      )}

      {tab==='pedidos' && (
        <motion.div initial="hidden" animate="visible" variants={{hidden:{}, visible:{transition:{staggerChildren:0.04}}}} className="space-y-3">
          {loading ? <div className="space-y-3">{[1,2,3].map(i=> <div key={i} className="bg-white rounded-2xl border border-[#F1E9D8] p-4 animate-pulse"><div className="h-3 bg-[#F1F5F9] rounded w-1/3 mb-2"/><div className="h-4 bg-[#F1F5F9] rounded w-2/3 mb-2"/><div className="h-2 bg-[#F1F5F9] rounded w-full"/></div>)}</div> : ordenes.length===0 ? <div className="bg-white rounded-2xl border border-[#F1E9D8] p-8"><EmptyState icon={<FaShoppingBag size={22}/>} title="Sin pedidos" description="Haz tu primer pedido" action={{label:'Ver menú', onClick:()=> navigate('/menu')}}/></div> :
            ordenes.map(o=>{
              const badge = estadoBadge[o.estado] || { bg:'bg-[#F8FAFC] border-[#E5E7EB]', text:'text-[#475569]'}
              const puedeCancelar = o.estado==='recibido'
              return (
                <motion.div key={o.id} variants={{hidden:{opacity:0, y:8}, visible:{opacity:1, y:0, transition:{type:'spring', damping:24, stiffness:260}}}} whileHover={{y:-2}} className="bg-white rounded-2xl border border-[#F1E9D8] p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between gap-3">
                    <div>
                      <p className="font-mono text-[11px] tracking-wide uppercase text-[#94A3B8]">{o.id.slice(0,14)}</p>
                      <p className="text-xs text-[#64748B]">{new Date(o.createdAt).toLocaleDateString('es-CO')} · {o.items?.length||0} items · {o.typeOrder||'domicilio'}</p>
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
                    <a href={`https://wa.me/${config.whatsapp}?text=${encodeURIComponent(`Seguimiento pedido #${o.id}`)}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-xs font-medium text-[#065F46]"><FaWhatsapp size={11}/> Soporte</a>
                    {puedeCancelar && <button onClick={()=> setConfirmCancelPedido(o.id)} className="px-3 py-1.5 rounded-full bg-white border border-[#FECACA] text-xs font-medium text-[#DC2626] flex items-center gap-1"><FaTrash size={10}/> Cancelar</button>}
                  </div>
                </motion.div>
              )
            })}
        </motion.div>
      )}

      {tab==='reservas' && (
        <motion.div initial="hidden" animate="visible" variants={{hidden:{}, visible:{transition:{staggerChildren:0.05}}}} className="space-y-3">
          <div className="flex justify-between items-center">
            <p className="text-xs font-medium tracking-widest uppercase text-[#94A3B8]">{loading ? '—' : `${reservas.length} reservas`}</p>
            <Link to="/reservas" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1C2A0F] text-white text-xs font-medium"><FaPlus size={10}/> Nueva</Link>
          </div>
          {loading ? <div className="space-y-3">{[1,2].map(i=> <div key={i} className="bg-white rounded-2xl border border-[#F1E9D8] p-4 animate-pulse"><div className="h-3 bg-[#F1F5F9] rounded w-1/4 mb-2"/><div className="h-4 bg-[#F1F5F9] rounded w-1/2"/></div>)}</div> : reservas.length===0 ? <div className="bg-white rounded-2xl border border-[#F1E9D8] p-8"><EmptyState icon={<FaCalendarAlt size={22}/>} title="Sin reservas" description="Reserva tu mesa" action={{label:'Reservar', onClick:()=> navigate('/reservas')}}/></div> :
            reservas.map((r:any)=> (
              <motion.div key={r.id} variants={{hidden:{opacity:0, y:8}, visible:{opacity:1, y:0, transition:{type:'spring', damping:24, stiffness:260}}}} whileHover={{y:-2}} className="bg-white rounded-2xl border border-[#F1E9D8] p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between gap-3">
                  <div>
                    <p className="font-mono text-[11px] uppercase text-[#94A3B8]">{r.id.slice(0,12)}</p>
                    <p className="text-sm font-semibold text-[#1C2A0F]">{r.fecha} — {r.hora}</p>
                    <p className="text-xs text-[#64748B]">{r.personas} pers. · {r.zona||'—'} · Mesa {r.mesa||'—'}</p>
                  </div>
                  <span className={clsx('h-6 px-2.5 py-1 rounded-full text-xs font-medium border', r.estado==='Pendiente'?'bg-[#FFFBEB] border-[#FDE68A] text-[#92400E]': r.estado==='Cancelada'?'bg-[#FEF2F2] border-[#FECACA] text-[#991B1B]':'bg-[#ECFDF5] border-[#A7F3D0] text-[#065F46]')}>{r.estado}</span>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {r.estado!=='Cancelada' && r.estado!=='confirmada' && <button onClick={()=> handleEditReserva(r)} className="px-3 py-1.5 rounded-full bg-white border border-[#E5E7EB] text-xs font-medium text-[#475569]"><FaEdit size={11} className="inline mr-1"/> Modificar</button>}
                  {r.estado!=='Cancelada' && <button onClick={()=> setConfirmCancel(r.id)} className="px-3 py-1.5 rounded-full bg-white border border-[#FECACA] text-xs font-medium text-[#DC2626]">Cancelar</button>}
                  <a href={`https://wa.me/${config.whatsapp}?text=${encodeURIComponent(`Reserva #${r.id} ${r.fecha} ${r.hora}`)}`} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-xs font-medium text-[#065F46] inline-flex items-center gap-1"><FaWhatsapp size={11}/> Ayuda</a>
                </div>
              </motion.div>
            ))}
        </motion.div>
      )}

      <AnimatePresence>
      {editingReserva && (
        <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={()=> setEditingReserva(null)}>
          <motion.div initial={{scale:0.98, opacity:0}} animate={{scale:1, opacity:1}} exit={{scale:0.98, opacity:0}} transition={{type:'spring', damping:24, stiffness:260}} className="bg-white rounded-2xl w-full max-w-md p-6" onClick={e=> e.stopPropagation()}>
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
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>
      <AnimatePresence>
      {editingProfile && (
        <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={()=> setEditingProfile(false)}>
          <motion.div initial={{scale:0.98, opacity:0}} animate={{scale:1, opacity:1}} exit={{scale:0.98, opacity:0}} transition={{type:'spring', damping:24, stiffness:260}} className="bg-white rounded-2xl w-full max-w-md p-6" onClick={e=> e.stopPropagation()}>
            <h3 className="font-semibold text-[#1C2A0F] mb-1">Editar datos personales</h3>
            <p className="text-xs text-[#64748B] mb-4">Validación con Formik/Yup</p>
            <Formik initialValues={{nombre:editNombre, email:editEmail, telefono:editTelefono, password:editPassword}} enableReinitialize validationSchema={Yup.object({nombre:Yup.string().min(3,'Mínimo 3 caracteres').required('Requerido'), email:Yup.string().email('Email inválido').required('Requerido'), telefono:Yup.string().matches(/^\d[\d\s]*$/,'Teléfono inválido').min(10,'Mínimo 10 dígitos').required('Requerido'), password:Yup.string().min(6,'Mínimo 6 caracteres')})} onSubmit={(values,{setSubmitting})=>{ const res=updateProfile({nombre:values.nombre.trim(), email:values.email.trim(), telefono:values.telefono.trim(), password:values.password}); if(!res.ok) toast.error(res.error); else { toast.success('Datos actualizados'); setEditingProfile(false)}; setSubmitting(false)}}>
              {({isSubmitting})=> (
              <Form className="space-y-3">
                <div><label className="block text-xs font-medium text-[#475569] mb-1">Nombre</label><Field name="nombre" className="w-full px-3 py-2 rounded-xl border border-[#E5E7EB] text-sm" placeholder="Tu nombre" /><ErrorMessage name="nombre" component="p" className="text-xs text-[#DC2626] mt-1" /></div>
                <div><label className="block text-xs font-medium text-[#475569] mb-1">Email</label><Field name="email" type="email" className="w-full px-3 py-2 rounded-xl border border-[#E5E7EB] text-sm" placeholder="correo@ejemplo.com" /><ErrorMessage name="email" component="p" className="text-xs text-[#DC2626] mt-1" /></div>
                <div><label className="block text-xs font-medium text-[#475569] mb-1">Teléfono</label><Field name="telefono" className="w-full px-3 py-2 rounded-xl border border-[#E5E7EB] text-sm" placeholder="300 123 4567" /><ErrorMessage name="telefono" component="p" className="text-xs text-[#DC2626] mt-1" /></div>
                <div><label className="block text-xs font-medium text-[#475569] mb-1">Contraseña</label><Field name="password" type="password" className="w-full px-3 py-2 rounded-xl border border-[#E5E7EB] text-sm" placeholder="Nueva contraseña" /><ErrorMessage name="password" component="p" className="text-xs text-[#DC2626] mt-1" /></div>
                <div className="flex gap-2 mt-6">
                  <button type="button" onClick={()=> setEditingProfile(false)} className="flex-1 py-2.5 rounded-full bg-white border border-[#E5E7EB] text-sm font-medium">Cancelar</button>
                  <button type="submit" disabled={isSubmitting} className="flex-1 py-2.5 rounded-full bg-[#1C2A0F] text-white text-sm font-medium disabled:opacity-60">Guardar</button>
                </div>
              </Form>
              )}
            </Formik>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>

      {tab==='favoritos' && (
        <div>
          {favoriteProducts.length===0 ? <div className="bg-white rounded-2xl border border-[#F1E9D8] p-8"><EmptyState icon={<FaHeart size={22}/>} title="Sin favoritos" description="Guarda tus platos para pedir más rápido" action={{label:'Explorar menú', onClick:()=> navigate('/menu')}}/></div> :
            <motion.div initial="hidden" animate="visible" variants={{hidden:{}, visible:{transition:{staggerChildren:0.06}}}} className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {favoriteProducts.map(p=> (
                <motion.div key={p.id} variants={{hidden:{opacity:0, scale:0.98}, visible:{opacity:1, scale:1, transition:{type:'spring', damping:22, stiffness:280}}}} whileHover={{y:-3, scale:1.01}} className="bg-white rounded-2xl border border-[#F1E9D8] overflow-hidden group hover:shadow-md transition-shadow">
                  <div className="relative aspect-[4/3] bg-[#F8FAFC]"><img src={p.imagen} alt={p.nombre} onError={(e)=>{ (e.currentTarget as HTMLImageElement).src='https://via.placeholder.com/400x300?text=Sin+imagen'; (e.currentTarget as HTMLImageElement).onerror=null}} className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform"/><button onClick={()=> { toggleFavorite(p.id||p.nombre); toast.success('Eliminado de favoritos')}} className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/95 border border-[#F1E9D8] flex items-center justify-center"><FaHeart size={12} className="text-[#E11D48] fill-[#E11D48]"/></button></div>
                  <div className="p-3"><h4 className="text-xs font-semibold text-[#1C2A0F] truncate">{p.nombre}</h4><p className="text-[#F59E0B] font-bold text-sm mt-1">${numberFormatter(p.precio??0)}</p>
                    <div className="flex gap-1.5 mt-2"><button onClick={()=>{ addToCart({nombre:p.nombre, precio:p.precio, quantity:1, imagen:p.imagen}); toast.success(`${p.nombre} agregado`)}} className="flex-1 py-2 rounded-full bg-[#1C2A0F] text-white text-xs font-medium">Agregar</button><button onClick={()=> setConfirmFav(p.id||p.nombre)} className="px-3 py-2 rounded-full bg-white border border-[#FECACA] text-[#DC2626] text-xs"><FaTrash size={10}/></button></div>
                  </div>
                </motion.div>
              ))}
            </motion.div>}
        </div>
      )}

      {tab==='direcciones' && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <p className="text-xs font-medium tracking-widest uppercase text-[#94A3B8]">Tus direcciones · entrega a domicilio</p>
            <button onClick={()=>{ setEditingDir(null); setDirAlias(''); setDirDireccion(''); setDirIndicaciones(''); setShowDirForm(true)}} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1C2A0F] text-white text-xs font-medium"><FaPlus size={10}/> Agregar</button>
          </div>
          {(clienteActual.direcciones||[]).length===0 ? <div className="bg-white rounded-2xl border border-dashed border-[#E5E7EB] p-8 text-center"><FaMapMarkerAlt size={22} className="mx-auto text-[#CBD5E1] mb-2"/><p className="text-sm font-medium text-[#1C2A0F]">Sin direcciones</p><p className="text-xs text-[#64748B]">Agrega tu casa u oficina para pedir más rápido</p><button onClick={()=> setShowDirForm(true)} className="mt-3 px-4 py-2 rounded-full bg-[#1C2A0F] text-white text-xs font-medium">Agregar dirección</button></div> :
            <motion.div initial="hidden" animate="visible" variants={{hidden:{}, visible:{transition:{staggerChildren:0.05}}}} className="grid sm:grid-cols-2 gap-3">
              {(clienteActual.direcciones||[]).map(d=> (
                <motion.div key={d.id} variants={{hidden:{opacity:0, y:8}, visible:{opacity:1, y:0, transition:{type:'spring', damping:24, stiffness:260}}}} whileHover={{y:-2}} className="bg-white rounded-2xl border border-[#F1E9D8] p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between gap-2">
                    <div className="flex gap-2.5">
                      <span className="w-8 h-8 rounded-full bg-[#FFFBEB] border border-[#FDE68A] flex items-center justify-center shrink-0"><FaMapMarkerAlt size={12} className="text-[#B45309]"/></span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#1C2A0F]">{d.alias}</p>
                        <p className="text-xs text-[#475569] leading-relaxed break-words">{d.direccion}</p>
                        {d.indicaciones && <p className="text-[11px] text-[#94A3B8] mt-1">↳ {d.indicaciones}</p>}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1.5 mt-3">
                    <button onClick={()=>{ setEditingDir(d); setDirAlias(d.alias); setDirDireccion(d.direccion); setDirIndicaciones(d.indicaciones||''); setShowDirForm(true)}} className="flex-1 py-1.5 rounded-full bg-white border border-[#E5E7EB] text-xs font-medium text-[#475569]"><FaEdit size={10} className="inline mr-1"/> Editar</button>
                    <button onClick={()=> setConfirmDeleteDir(d.id)} className="flex-1 py-1.5 rounded-full bg-white border border-[#FECACA] text-xs font-medium text-[#DC2626]"><FaTrash size={10} className="inline mr-1"/> Eliminar</button>
                  </div>
                </motion.div>
              ))}
            </motion.div>}
          <AnimatePresence>
          {showDirForm && (
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={()=> setShowDirForm(false)}>
              <motion.div initial={{scale:0.98, opacity:0}} animate={{scale:1, opacity:1}} exit={{scale:0.98, opacity:0}} transition={{type:'spring', damping:24, stiffness:260}} className="bg-white rounded-2xl w-full max-w-md p-6" onClick={e=> e.stopPropagation()}>
                <h3 className="font-semibold text-[#1C2A0F] mb-4">{editingDir? 'Editar dirección':'Nueva dirección'}</h3>
                <Formik initialValues={{alias:dirAlias, direccion:dirDireccion, indicaciones:dirIndicaciones}} enableReinitialize validationSchema={Yup.object({alias:Yup.string().min(2,'Mínimo 2 caracteres').required('Requerido'), direccion:Yup.string().min(5,'Mínimo 5 caracteres').required('Requerido')})} onSubmit={(values,{setSubmitting})=>{ const v=values as any; if(editingDir){ updateDireccion(editingDir.id, {alias:v.alias.trim(), direccion:v.direccion.trim(), indicaciones:v.indicaciones.trim()}); toast.success('Dirección actualizada')} else { addDireccion({alias:v.alias.trim(), direccion:v.direccion.trim(), indicaciones:v.indicaciones.trim()}); toast.success('Dirección agregada')}; setShowDirForm(false); setEditingDir(null); setDirAlias(''); setDirDireccion(''); setDirIndicaciones(''); setSubmitting(false)}}>
                  {({isSubmitting})=> (
                  <Form className="space-y-3">
                    <div><label className="block text-xs font-medium text-[#475569] mb-1">Alias *</label><Field name="alias" placeholder="Casa, Trabajo..." className="w-full px-3 py-2 rounded-xl border border-[#E5E7EB] text-sm" /><ErrorMessage name="alias" component="p" className="text-xs text-[#DC2626] mt-1" /></div>
                    <div><label className="block text-xs font-medium text-[#475569] mb-1">Dirección *</label><Field name="direccion" placeholder="Calle 123 #45-67, barrio" className="w-full px-3 py-2 rounded-xl border border-[#E5E7EB] text-sm" /><ErrorMessage name="direccion" component="p" className="text-xs text-[#DC2626] mt-1" /></div>
                    <div><label className="block text-xs font-medium text-[#475569] mb-1">Indicaciones</label><Field name="indicaciones" placeholder="Portería, apto, referencia" className="w-full px-3 py-2 rounded-xl border border-[#E5E7EB] text-sm" /></div>
                    <div className="flex gap-2 mt-6">
                      <button type="button" onClick={()=> setShowDirForm(false)} className="flex-1 py-2.5 rounded-full bg-white border border-[#E5E7EB] text-sm font-medium">Cancelar</button>
                      <button type="submit" disabled={isSubmitting} className="flex-1 py-2.5 rounded-full bg-[#1C2A0F] text-white text-sm font-medium disabled:opacity-60">{editingDir? 'Guardar':'Agregar'}</button>
                    </div>
                  </Form>
                  )}
                </Formik>
              </motion.div>
            </motion.div>
          )}
          </AnimatePresence>
        </div>
      )}

      {tab==='fidelidad' && (
        <div className="space-y-4">
          {(() => {
            const pts=clienteActual.puntos||0
            const next = pts<200? {name:'Plata', need:200-pts, progress: pts/200*100} : pts<500? {name:'Oro', need:500-pts, progress:(pts-200)/300*100} : null
            return (
          <div className="rounded-2xl p-6 text-center border border-[#FDE68A] bg-gradient-to-br from-[#FFFBEB] via-[#FEF3C7] to-[#FDE68A]">
            <FaTrophy size={26} className="mx-auto mb-2 text-[#B45309]"/>
            <p className="text-3xl font-bold text-[#92400E]">{pts}</p>
            <p className="text-xs tracking-widest uppercase font-semibold text-[#B45309]">Puntos acumulados</p>
            <div className="mt-3 h-2 rounded-full bg-white/60 border border-[#FDE68A] p-0.5"><div className="h-full rounded-full bg-[#F59E0B] transition-all" style={{width:`${next? Math.min(next.progress,100):100}%`}}/></div>
            <p className="text-xs text-[#92400E]/70 mt-1">{next? `${next.need} pts para ${next.name} · 1 pto / $${FIDELIDAD_CONFIG.pesosPorPunto.toLocaleString('es-CO')}` : '¡Nivel máximo Oro alcanzado! · 1 pto / $'+FIDELIDAD_CONFIG.pesosPorPunto.toLocaleString('es-CO')}</p>
          </div>
            )})()}
          <div className="bg-white rounded-2xl border border-[#F1E9D8] p-4">
            <h3 className="text-sm font-semibold text-[#1C2A0F] mb-2">Niveles</h3>
            <div className="grid grid-cols-3 gap-2">{[{name:'Bronce',min:0},{name:'Plata',min:200},{name:'Oro',min:500}].map(l=>{ const a=(clienteActual.puntos||0)>=l.min; return <div key={l.name} className={clsx('rounded-xl border p-3 text-center', a?'bg-[#FFFBF5] border-[#FDE68A]':'bg-white border-[#F1E9D8] opacity-60')}><p className="text-xs font-medium text-[#1C2A0F]">{l.name}</p><p className="text-[11px] text-[#94A3B8]">{l.min} pts</p>{a&&<FaCheckCircle size={11} className="text-[#10B981] mx-auto mt-1"/>}</div>})}</div>
          </div>
          <div className="bg-white rounded-2xl border border-[#F1E9D8] p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-semibold text-[#1C2A0F] flex items-center gap-1.5"><FaGift size={12} className="text-[#F59E0B]"/> Recompensas</h3>
              <span className="text-xs font-medium text-[#F59E0B]">{clienteActual.puntos||0} pts</span>
            </div>
            {(() => {
              const stored = (()=>{ try{ const s=JSON.parse(localStorage.getItem('fidelizacion_recompensas')||'[]'); return s.length? s : null } catch{ return null }})()
              const recompensas = stored || [{ name: 'Descuento $10.000', cost: 100, icon: '🏷️', desc: '$10.000' }, { name: 'Bebida gratis', cost: 50, icon: '🥤', desc: 'Bebida' }, { name: 'Postre gratis', cost: 75, icon: '🍰', desc: 'Postre' }, { name: 'Envío gratis', cost: 30, icon: '🚴', desc: 'Envío' }]
              return <div className="space-y-2">{recompensas.map((r:any) => (
              <div key={r.name||r.nombre} className="flex items-center gap-3 p-3 rounded-xl border border-[#F1E9D8] hover:border-[#FDE68A] transition-colors">
                <span className="w-9 h-9 rounded-xl bg-[#FFFBF5] border border-[#F1E9D8] flex items-center justify-center text-lg">{r.icon||'🎁'}</span>
                <div className="flex-1 min-w-0"><h4 className="text-sm font-semibold text-[#1C2A0F]">{r.name||r.nombre}</h4><p className="text-xs text-[#64748B]">{r.desc||r.descripcion} · <span className="text-[#F59E0B] font-medium">{r.cost||r.puntos} pts</span></p></div>
                <button onClick={()=>{ const c=r.cost||r.puntos; const res=canjearPuntos(c); if(res.ok){ try{ const k=`fidelidad_historial_${clienteActual.id}`; const h=JSON.parse(localStorage.getItem(k)||'[]'); h.unshift({id:`canje-${Date.now()}`, nombre:r.name||r.nombre, costo:c, fecha:new Date().toISOString()}); localStorage.setItem(k, JSON.stringify(h.slice(0,20)))}catch{}; toast.success(`¡${r.name||r.nombre} canjeado!`)} else toast.error(res.error||'Puntos insuficientes')}} disabled={(clienteActual.puntos||0) < (r.cost||r.puntos)} className="px-4 py-2 rounded-full bg-[#1C2A0F] text-white text-xs font-medium disabled:bg-[#F1F5F9] disabled:text-[#94A3B8] disabled:border">Canjear</button>
              </div>
            ))}</div>})()}
          </div>
          <div className="bg-white rounded-2xl border border-[#F1E9D8] p-4">
            <h3 className="text-sm font-semibold text-[#1C2A0F] mb-3">Historial de canjes</h3>
            {(() => { try{ const k=`fidelidad_historial_${clienteActual.id}`; const h=JSON.parse(localStorage.getItem(k)||'[]') as any[]; if(!h.length) return <p className="text-xs text-[#94A3B8] text-center py-4">Aún no has canjeado recompensas</p>; return <div className="space-y-2">{h.map((e:any)=> <div key={e.id} className="flex justify-between items-center p-2.5 rounded-xl bg-[#FFFBF5] border border-[#F1E9D8]"><div><p className="text-xs font-medium text-[#1C2A0F]">{e.nombre}</p><p className="text-[11px] text-[#94A3B8]">{new Date(e.fecha).toLocaleDateString('es-CO')} {new Date(e.fecha).toLocaleTimeString('es-CO',{hour:'2-digit',minute:'2-digit'})}</p></div><span className="text-xs font-bold text-[#92400E]">-{e.costo} pts</span></div>)}</div> } catch{ return <p className="text-xs text-[#94A3B8]">Error al cargar historial</p> } })()}
          </div>
        </div>
      )}

      {tab==='cuenta' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-[#F1E9D8] p-5 flex gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#1C2A0F] flex items-center justify-center text-white font-bold shrink-0">{clienteActual.nombre.charAt(0)}</div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-[#1C2A0F] truncate">{clienteActual.nombre}</p>
              <p className="text-xs text-[#64748B] truncate">{clienteActual.email} · {clienteActual.telefono}</p>
              <p className="text-[11px] text-[#94A3B8]">Miembro desde {new Date(clienteActual.createdAt).toLocaleDateString('es-CO')}</p>
            </div>
            <button onClick={()=>{ setEditNombre(clienteActual.nombre); setEditEmail(clienteActual.email); setEditTelefono(clienteActual.telefono); setEditPassword(clienteActual.password||''); setEditingProfile(true)}} className="h-8 px-3 rounded-full bg-[#F8FAFC] border border-[#E5E7EB] text-xs font-medium text-[#475569]"><FaEdit size={10} className="inline mr-1"/> Editar</button>
          </div>

          <div className="bg-white rounded-2xl border border-[#F1E9D8] overflow-hidden">
            <div className="px-5 py-3 border-b border-[#F1E9D8] flex items-center gap-2">
              <FaShieldAlt size={12} className="text-[#F59E0B]"/><h3 className="text-sm font-semibold text-[#1C2A0F]">Preferencias</h3>
            </div>
            <div className="divide-y divide-[#F1E9D8]">
              {[{k:'whatsapp', label:'WhatsApp — estado de pedidos y reservas', desc:'Recibir por WhatsApp'},{k:'email', label:'Email — comprobantes y facturas', desc:'Recibir por correo'},{k:'promos', label:'Promos y novedades', desc:'Ofertas y eventos'}].map(it=> (
                <label key={it.k} className="flex items-center justify-between px-5 py-3.5 cursor-pointer hover:bg-[#FFFBF5]">
                  <div>
                    <p className="text-sm font-medium text-[#1C2A0F]">{it.label}</p>
                    <p className="text-xs text-[#94A3B8]">{it.desc}</p>
                  </div>
                  <input type="checkbox" checked={(prefs as any)[it.k]} onChange={e=> setPrefs((p:any)=> ({...p, [it.k]: e.target.checked}))} className="w-4 h-4 accent-[#1C2A0F]" />
                </label>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#F1E9D8] overflow-hidden">
            <div className="px-5 py-3 border-b border-[#F1E9D8] flex items-center gap-2">
              <FaHeadset size={12} className="text-[#F59E0B]"/><h3 className="text-sm font-semibold text-[#1C2A0F]">Ayuda</h3>
            </div>
            <div className="divide-y divide-[#F1E9D8]">
              <a href={`https://wa.me/${config.whatsapp}?text=${encodeURIComponent('Hola, necesito ayuda con mi cuenta')}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between px-5 py-3.5 hover:bg-[#FFFBF5]">
                <div><p className="text-sm font-medium text-[#1C2A0F]">Contactar por WhatsApp</p><p className="text-xs text-[#94A3B8]">Respuesta en minutos</p></div>
                <FaWhatsapp size={14} className="text-[#10B981]"/>
              </a>
              <Link to="/contacto" className="flex items-center justify-between px-5 py-3.5 hover:bg-[#FFFBF5]">
                <div><p className="text-sm font-medium text-[#1C2A0F]">Ir a Contacto</p><p className="text-xs text-[#94A3B8]">Formulario, horarios y mapa</p></div>
                <FaEye size={12} className="text-[#94A3B8]"/>
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#F1E9D8] p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#1C2A0F]">Descargar mis datos</p>
              <p className="text-xs text-[#94A3B8]">JSON con perfil, direcciones, pedidos, reservas y canjes</p>
            </div>
            <button onClick={()=>{
              try{
                const data={
                  perfil: clienteActual,
                  direcciones: clienteActual.direcciones||[],
                  pedidos: ordenes,
                  reservas,
                  favoritos: favoriteProducts.map(p=> ({id:p.id, nombre:p.nombre, precio:p.precio})),
                  historialCanjes: JSON.parse(localStorage.getItem(`fidelidad_historial_${clienteActual.id}`)||'[]'),
                  preferencias: prefs,
                  exportado: new Date().toISOString()
                }
                const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'})
                const url=URL.createObjectURL(blob)
                const a=document.createElement('a'); a.href=url; a.download=`sabor-origen-${clienteActual.id}.json`; a.click(); URL.revokeObjectURL(url)
                toast.success('Datos descargados')
              } catch{ toast.error('Error al exportar')}
            }} className="px-4 py-2 rounded-full bg-white border border-[#E5E7EB] text-xs font-medium text-[#1C2A0F] hover:bg-[#F8FAFC]">Descargar JSON</button>
          </div>

          <div className="bg-white rounded-2xl border border-[#FECACA] overflow-hidden">
            <div className="px-5 py-3 border-b border-[#FECACA] bg-[#FEF2F2]"><h3 className="text-sm font-semibold text-[#991B1B]">Zona de peligro</h3></div>
            <div className="p-4 flex flex-col sm:flex-row gap-2">
              <button onClick={()=> setShowLogoutConfirm(true)} className="flex-1 py-2.5 rounded-full bg-white border border-[#E5E7EB] text-sm font-medium text-[#475569]">Cerrar sesión</button>
              <button onClick={()=> setConfirmDeleteAccount(true)} className="flex-1 py-2.5 rounded-full bg-[#DC2626] text-white text-sm font-medium hover:bg-[#B91C1C]">Eliminar cuenta</button>
            </div>
            <p className="px-5 pb-3 text-[11px] text-[#94A3B8]">Eliminar borra tu perfil, direcciones y desvincula pedidos/reservas de tu cuenta.</p>
          </div>
        </div>
      )}

      <ConfirmModal open={!!confirmCancelPedido} onClose={()=> setConfirmCancelPedido(null)} onConfirm={()=>{ if(confirmCancelPedido){ const all=storage.getOrdenes<Order>(); storage.setOrdenes(all.map(x=> x.id===confirmCancelPedido?{...x, estado:'cancelado'}:x) as Order[]); toast.success('Pedido cancelado'); setConfirmCancelPedido(null)} }} title="Cancelar pedido" message="¿Cancelar este pedido? Solo pedidos en estado recibido pueden cancelarse." confirmText="Sí, cancelar" cancelText="Mantener" />
      <ConfirmModal open={!!confirmFav} onClose={()=> setConfirmFav(null)} onConfirm={()=>{ if(confirmFav){ toggleFavorite(confirmFav); toast.success('Eliminado de favoritos'); setConfirmFav(null)} }} title="Quitar favorito" message="¿Quitar este plato de tus favoritos?" confirmText="Quitar" cancelText="Mantener" />
      <ConfirmModal open={!!confirmCancel} onClose={()=> setConfirmCancel(null)} onConfirm={()=>{ const r=reservas.find((x:any)=> x.id===confirmCancel); if(r) handleCancelReserva(r)}} title="Cancelar reserva" message="¿Cancelar esta reserva?" confirmText="Sí, cancelar" cancelText="Mantener" />
      <ConfirmModal open={!!confirmDeleteDir} onClose={()=> setConfirmDeleteDir(null)} onConfirm={()=>{ if(confirmDeleteDir) deleteDireccion(confirmDeleteDir); setConfirmDeleteDir(null); toast.success('Dirección eliminada')}} title="Eliminar dirección" message="¿Eliminar esta dirección? No se puede deshacer." confirmText="Eliminar" cancelText="Cancelar" />
      <ConfirmModal open={confirmDeleteAccount} onClose={()=> setConfirmDeleteAccount(false)} onConfirm={()=>{ deleteAccount(); toast.success('Cuenta eliminada'); navigate('/')}} title="Eliminar cuenta" message="¿Seguro que quieres eliminar tu cuenta? Se borrarán tus datos y direcciones." confirmText="Sí, eliminar" cancelText="Cancelar" />
      <ConfirmModal open={showLogoutConfirm} onClose={()=> setShowLogoutConfirm(false)} onConfirm={handleLogout} title="Cerrar sesión" message="¿Seguro que quieres cerrar sesión?" confirmText="Cerrar sesión" cancelText="Cancelar" variant="warning" />
    </div>
  )
}
