import { useEffect, useState, useMemo, useRef } from 'react'
import { useNavigate, Link, useLocation, Outlet } from 'react-router-dom'
import type { IconType } from 'react-icons'
import { authService } from '../features/auth/auth.service'
import { orderService } from '../features/orders/order.service'
import { settingsStorage } from '../services/storage/settingsStorage'
import { getRestaurantConfig } from '../lib/config'
import { FaHome, FaBox, FaUtensils, FaCalendarAlt, FaThLarge, FaUsers, FaStar, FaComments, FaSignOutAlt, FaBars, FaTimes, FaChevronLeft, FaCog, FaTag, FaClipboardList, FaChartBar, FaHistory, FaCashRegister, FaFileInvoiceDollar, FaShoppingCart, FaTrophy, FaChevronDown, FaChevronRight, FaSearch, FaBell, FaQuestionCircle, FaAngleDoubleLeft, FaAngleDoubleRight, FaGlassCheers, FaWhatsapp, FaPhone, FaEnvelope } from 'react-icons/fa'
import { AdminSkeleton } from '../components/feedback/LoadingSkeleton'
import { useLoading } from '../hooks/useLoading'
import { CommandPalette } from '../components/admin/CommandPalette'
import ConfirmModal from '../components/feedback/ConfirmModal'

type Item = { label: string; icon: IconType; link: string; badgeKey?: string }
type Section = { title: string; items: Item[] }

/** Compara rutas ignorando el fragmento (#inventario) para el estado activo. */
function linkPath(link: string): string {
  return link.split('#')[0]
}
function isActiveLink(link: string, pathname: string): boolean {
  const base = linkPath(link)
  return pathname === base || pathname.startsWith(base + '/')
}

const sections: Section[] = [
  { title: '', items: [{ label: 'Dashboard', icon: FaHome, link: '/admin-dashboard' }] },
  { title: 'OPERACIÓN', items: [
    { label: 'Pedidos', icon: FaBox, link: '/admin-ordenes', badgeKey: 'pendientes' },
    { label: 'Cocina', icon: FaUtensils, link: '/admin-cocina', badgeKey: 'cocina' },
    { label: 'Reservas', icon: FaCalendarAlt, link: '/admin-reservas' },
    { label: 'Mesas', icon: FaThLarge, link: '/admin-mesas' },
  ]},
  { title: 'MENÚ', items: [
    { label: 'Catálogo', icon: FaUtensils, link: '/admin-catalogo' },
    { label: 'Promociones', icon: FaTag, link: '/admin-promociones' },
  ]},
  { title: 'INVENTARIO', items: [
     { label: 'Stock', icon: FaClipboardList, link: '/admin-catalogo#inventario' },
     { label: 'Compras', icon: FaShoppingCart, link: '/admin-compras' },
   ]},
  { title: 'FINANZAS', items: [
    { label: 'Caja', icon: FaCashRegister, link: '/admin-caja' },
    { label: 'Facturación', icon: FaFileInvoiceDollar, link: '/admin-facturacion' },
    { label: 'Analítica', icon: FaChartBar, link: '/admin-finanzas' },
  ]},
  { title: 'CLIENTES Y MARKETING', items: [
    { label: 'Clientes', icon: FaUsers, link: '/admin-clientes' },
    { label: 'Fidelización', icon: FaTrophy, link: '/admin-fidelizacion' },
    { label: 'Reseñas', icon: FaStar, link: '/admin-resenas' },
    { label: 'WhatsApp', icon: FaComments, link: '/admin-whatsapp' },
  ]},
  { title: 'CONTENIDO', items: [
    { label: 'Eventos', icon: FaGlassCheers, link: '/admin-eventos' },
  ]},
  { title: 'SISTEMA', items: [
    { label: 'Actividad', icon: FaHistory, link: '/admin-actividad' },
    { label: 'Configuración', icon: FaCog, link: '/admin-config' },
  ]},
]

function useBadges() {
  const [badges, setBadges] = useState<Record<string, number>>({})
  useEffect(() => {
    const load = () => {
      const ordenes = orderService.getAll()
      setBadges({
        pendientes: ordenes.filter((o)=> o.estado==='recibido').length,
        cocina: ordenes.filter((o)=> o.estado==='preparando').length,
      })
    }
    load(); const id=setInterval(load, 4000); return ()=> clearInterval(id)
  }, [])
  return badges
}

export default function AdminLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(()=> settingsStorage.isSidebarCollapsed())
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(()=> {
    const init: Record<string, boolean> = {}
    sections.forEach(s=> { if(s.title) init[s.title]=true })
    return init
  })
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)
  const userRef = useRef<HTMLDivElement>(null)
  const adminName = authService.getAdminName() || 'Administrador'
  const loading = useLoading(300)
  const badges = useBadges()
  const config = getRestaurantConfig()

  useEffect(() => { if (!authService.isAdmin()) navigate('/admin-login') }, [navigate])
  useEffect(()=> settingsStorage.setSidebarCollapsed(collapsed), [collapsed])
  useEffect(()=> {
    const onKey = (e: KeyboardEvent) => { if((e.ctrlKey||e.metaKey) && e.key.toLowerCase()==='k'){ e.preventDefault(); setPaletteOpen(v=>!v)}}
    window.addEventListener('keydown', onKey); return ()=> window.removeEventListener('keydown', onKey)
  }, [])
  // Cierre unificado de dropdowns: clic fuera, Escape o cambio de ruta
  useEffect(() => {
    const closeAll = () => { setNotifOpen(false); setUserMenuOpen(false) }
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node
      if (notifRef.current?.contains(t)) return
      if (userRef.current?.contains(t)) return
      closeAll()
    }
    const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') closeAll() }
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onEsc)
    return () => { document.removeEventListener('pointerdown', onDown); document.removeEventListener('keydown', onEsc) }
  }, [])
  useEffect(() => { setNotifOpen(false); setUserMenuOpen(false) }, [location.pathname])

  const flat = sections.flatMap(s=> s.items)
  const current = flat.find(n=> isActiveLink(n.link, location.pathname))
  const breadcrumb = useMemo(()=> {
    const sec = sections.find(s=> s.items.some(i=> isActiveLink(i.link, location.pathname)))
    return { section: sec?.title || '', label: current?.label || '' }
  }, [location.pathname, current])

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const handleLogout = () => { authService.logoutAdmin(); navigate('/admin-login') }
  if (loading) return <AdminSkeleton />

  const sidebarWidth = collapsed ? 'w-[76px]' : 'w-[260px]'
  const contentMargin = collapsed ? 'lg:ml-[76px]' : 'lg:ml-[260px]'

  return (
    <div className="admin min-h-screen bg-[#F8FAFC] flex">
      {/* Desktop sidebar */}
      <aside className={`hidden lg:flex flex-col bg-white border-r border-[#E5E7EB] fixed h-full z-30 transition-all duration-150 ${sidebarWidth}`}>
        <div className="h-[52px] px-3 border-b border-[#E5E7EB] flex items-center gap-2 shrink-0 bg-[#FDFCF8]">
          <div className="w-8 h-8 rounded-lg bg-[#667A22] flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-sm">{config.nombre.charAt(0)}</div>
          {!collapsed && <div className="min-w-0 flex-1"><p className="text-[13px] font-semibold text-[#0F172A] leading-4 truncate">{config.nombre}</p><p className="text-[10px] text-[#94A3B8] tracking-wide uppercase">Panel administrativo</p></div>}
          <button onClick={()=> setCollapsed(v=>!v)} className="ml-auto w-6 h-6 rounded-md hover:bg-[#F1F5F9] flex items-center justify-center text-[#94A3B8]">
            {collapsed ? <FaAngleDoubleRight size={11}/> : <FaAngleDoubleLeft size={11}/>}
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-3 scrollbar-hide">
          {sections.map(sec=> {
            const isCollapsible = !!sec.title
            const isOpen = sec.title ? openSections[sec.title] !== false : true
            return (
              <div key={sec.title || 'dash'}>
                {sec.title && !collapsed && (
                  <button onClick={()=> setOpenSections(s=> ({...s, [sec.title]: !isOpen}))} aria-expanded={isOpen}
                    className="w-full flex items-center justify-between px-2 py-1.5 text-[10px] font-medium tracking-widest uppercase text-[#94A3B8] hover:text-[#64748B]">
                    <span>{sec.title}</span>
                    {isCollapsible && (isOpen ? <FaChevronDown size={9}/> : <FaChevronRight size={9}/>)}
                  </button>
                )}
                {sec.title && collapsed && <div className="h-px bg-[#F1F5F9] my-1.5 mx-2" />}
                {(isOpen || collapsed) && (
                  <div className="space-y-px">
                    {sec.items.map(item=> {
                      const active = isActiveLink(item.link, location.pathname)
                      const badge = item.badgeKey ? (badges[item.badgeKey]||0) : 0
                      return (
                        <Link key={item.link} to={item.link}
                          title={collapsed ? item.label : undefined}
                          aria-current={active ? 'page' : undefined}
                          className={`flex items-center gap-2.5 text-[13px] transition-colors ${collapsed ? 'justify-center px-2 py-2 rounded-md' : 'px-2.5 py-2 rounded-md'} ${active ? 'bg-white text-[#0F172A] border-l-2 border-l-[#667A22] border-y border-r border-[#E5E7EB] -ml-px pl-[9px] font-medium shadow-sm' : 'text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A] border border-transparent'}`}>
                          <span className="relative flex items-center justify-center">
                            <item.icon size={13} className={active ? 'text-[#0F172A]' : 'text-[#94A3B8]'} />
                            {collapsed && badge>0 && <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#F59E0B] rounded-full border border-white" />}
                          </span>
                          {!collapsed && <span className="flex-1 truncate leading-5">{item.label}</span>}
                          {!collapsed && badge>0 && <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-[#F59E0B] text-white text-[10px] font-bold flex items-center justify-center">{badge>99?'99+':badge}</span>}
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </nav>
        <div className="p-2 border-t border-[#E5E7EB] space-y-1">
          {!collapsed ? (
            <>
              <Link to="/" className="flex items-center gap-2 px-2 py-1.5 rounded-md text-[13px] text-[#475569] hover:bg-[#F8FAFC]"><FaChevronLeft size={11}/> Volver al sitio</Link>
              <button onClick={()=> setShowLogoutConfirm(true)} className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-[13px] text-[#64748B] hover:bg-[#F8FAFC]"><FaSignOutAlt size={11}/> Cerrar sesión</button>
            </>
          ) : (
            <button onClick={()=> setShowLogoutConfirm(true)} title="Cerrar sesión" className="w-full flex justify-center py-2 text-[#64748B] hover:bg-[#F1F5F9] rounded-md"><FaSignOutAlt size={13}/></button>
          )}
        </div>
      </aside>

      {/* Mobile drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-[#0F172A]/40 backdrop-blur-sm" onClick={()=> setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-2xl flex flex-col">
            <div className="h-[56px] px-4 border-b border-[#E5E7EB] flex items-center justify-between">
              <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-lg bg-[#667A22] flex items-center justify-center text-white font-bold text-xs">{config.nombre.charAt(0)}</div><div><p className="text-sm font-semibold text-[#0F172A]">{config.nombre}</p><p className="text-[11px] text-[#64748B]">Panel administrativo</p></div></div>
              <button onClick={()=> setSidebarOpen(false)} className="w-8 h-8 rounded-lg hover:bg-[#F1F5F9] flex items-center justify-center"><FaTimes size={14} className="text-[#64748B]"/></button>
            </div>
            <nav className="flex-1 overflow-y-auto p-3 space-y-1">
              {sections.map(sec=> (
                <div key={sec.title||'dash'}>
                  {sec.title && <p className="px-2 py-2 text-[11px] font-semibold tracking-widest text-[#94A3B8]">{sec.title}</p>}
                  <div className="space-y-0.5">
                    {sec.items.map(item=> {
                      const active = isActiveLink(item.link, location.pathname)
                      return <Link key={item.link} to={item.link} onClick={()=> setSidebarOpen(false)} aria-current={active ? 'page' : undefined} className={`flex items-center gap-3 px-2.5 py-2 rounded-lg text-[13px] font-medium ${active ? 'bg-[#F1F5F9] text-[#0F172A] border border-[#E5E7EB]' : 'text-[#475569] hover:bg-[#F8FAFC]'}`}><item.icon size={14} className={active?'text-[#667A22]':'text-[#94A3B8]'}/>{item.label}</Link>
                    })}
                  </div>
                </div>
              ))}
            </nav>
            <div className="p-3 border-t border-[#E5E7EB]"><button onClick={()=> setShowLogoutConfirm(true)} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[#DC2626] hover:bg-[#FEF2F2]"><FaSignOutAlt size={12}/> Cerrar sesión</button></div>
          </aside>
        </div>
      )}

      {/* Main */}
      <div className={`flex-1 min-w-0 ${contentMargin} transition-all duration-150`}>
        {/* Topbar */}
        <div className="sticky top-0 z-20 bg-white border-b border-[#E5E7EB] h-[52px] flex items-center gap-3 px-4 shadow-sm">
          <button onClick={()=> setSidebarOpen(true)} className="lg:hidden w-7 h-7 rounded-md hover:bg-[#F1F5F9] flex items-center justify-center"><FaBars size={14} className="text-[#475569]"/></button>
          <div className="hidden sm:flex items-center gap-1 text-[13px] text-[#64748B] min-w-0">
            <span className="text-[#94A3B8]">Sabor y Origen</span>
            {breadcrumb.section && <><span className="text-[#CBD5E1]">/</span><span>{breadcrumb.section}</span></>}
            {breadcrumb.label && <><span className="text-[#CBD5E1]">/</span><span className="text-[#0F172A] font-medium">{breadcrumb.label}</span></>}
          </div>
          <div className="flex-1" />
          {/* Global search */}
          <button onClick={()=> setPaletteOpen(true)} aria-label="Búsqueda global" className="hidden md:flex items-center gap-2 pl-2.5 pr-2 py-1 rounded-md border border-[#E5E7EB] bg-[#F8FAFC] text-[13px] text-[#64748B] hover:bg-white hover:border-[#CBD5E1] transition-colors">
            <FaSearch size={11}/> <span>Buscar</span> <span className="ml-2 hidden lg:inline-flex text-[11px] px-1 py-0.5 rounded bg-white border border-[#E5E7EB] text-[#94A3B8]">Ctrl K</span>
          </button>
          <button onClick={()=> setPaletteOpen(true)} aria-label="Búsqueda global" className="md:hidden w-7 h-7 rounded-md hover:bg-[#F1F5F9] flex items-center justify-center text-[#64748B]"><FaSearch size={13}/></button>
          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button onClick={()=> { setNotifOpen(v=>!v); setUserMenuOpen(false) }} aria-label="Notificaciones" aria-expanded={notifOpen} aria-haspopup="true" className="w-7 h-7 rounded-md hover:bg-[#F1F5F9] flex items-center justify-center text-[#64748B] relative">
              <FaBell size={13}/>{(badges.pendientes||0) > 0 && <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#DC2626] rounded-full border border-white" />}
            </button>
            {notifOpen && (
              <div className="absolute right-0 top-10 w-80 bg-white rounded-md border border-[#E5E7EB] shadow-md overflow-hidden z-30 animate-fade-in">
                <div className="px-3 py-2.5 border-b border-[#E5E7EB] flex items-center justify-between"><p className="text-[13px] font-semibold text-[#0F172A]">Notificaciones</p><span className="text-[11px] px-2 py-0.5 rounded bg-[#F1F5F9] border border-[#E5E7EB] text-[#475569]">{badges.pendientes||0} pendientes</span></div>
                <div className="p-2 space-y-1 max-h-80 overflow-y-auto">
                  {(badges.pendientes||0)===0 ? <p className="text-[13px] text-[#94A3B8] text-center py-6">Sin notificaciones</p> : (
                    <Link to="/admin-ordenes" onClick={()=> setNotifOpen(false)} className="flex items-center gap-3 p-2.5 rounded-md hover:bg-[#F8FAFC] border border-transparent hover:border-[#E5E7EB]">
                      <span className="w-7 h-7 rounded-md bg-[#FEF3C7] flex items-center justify-center text-[#92400E]"><FaBox size={11}/></span>
                      <span className="flex-1"><span className="block text-[13px] font-medium text-[#0F172A]">{badges.pendientes} pendiente{(badges.pendientes||0)!==1?'s':''}</span><span className="block text-xs text-[#64748B]">Pedidos</span></span>
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>
          <button onClick={()=> setHelpOpen(true)} className="w-7 h-7 rounded-md hover:bg-[#F1F5F9] hidden sm:flex items-center justify-center text-[#64748B]" title="Centro de ayuda"><FaQuestionCircle size={13}/></button>
          {/* User */}
          <div className="relative" ref={userRef}>
            <button onClick={()=> { setUserMenuOpen(v=>!v); setNotifOpen(false) }} aria-label="Menú de usuario" aria-expanded={userMenuOpen} aria-haspopup="true" className="flex items-center gap-1.5 pl-1 pr-2 py-1 rounded-md hover:bg-[#F1F5F9] transition-colors">
              <span className="w-6 h-6 rounded-full bg-[#0F172A] flex items-center justify-center text-white text-[11px] font-medium">{adminName.charAt(0).toUpperCase()}</span>
              <span className="hidden sm:block text-[13px] font-medium text-[#0F172A]">{adminName}</span>
              <FaChevronDown size={9} className="text-[#94A3B8] hidden sm:block"/>
            </button>
            {userMenuOpen && (
              <div className="absolute right-0 top-10 w-52 bg-white rounded-md border border-[#E5E7EB] shadow-md py-1 z-30 animate-fade-in">
                <div className="px-3 py-2 border-b border-[#F1F5F9]"><p className="text-[13px] font-medium text-[#0F172A]">{adminName}</p><p className="text-xs text-[#64748B]">{config.nombre}</p></div>
                <Link to="/" className="flex items-center gap-2 px-3 py-2 text-[13px] text-[#334155] hover:bg-[#F8FAFC]"><FaChevronLeft size={11}/> Volver al sitio</Link>
                <button onClick={()=> setShowLogoutConfirm(true)} className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-[#DC2626] hover:bg-[#FEF2F2]"><FaSignOutAlt size={11}/> Cerrar sesión</button>
              </div>
            )}
          </div>
        </div>
        <div className="px-4 lg:px-6 py-4 lg:py-5"><Outlet /></div>
      </div>
      {helpOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-[#0F172A]/40 backdrop-blur-sm" onClick={()=> setHelpOpen(false)} />
          <div className="relative w-96 bg-white h-full shadow-2xl flex flex-col">
            <div className="p-5 border-b border-[#E5E7EB] flex items-center justify-between">
              <h3 className="font-semibold text-[#0F172A]">Centro de ayuda</h3>
              <button onClick={()=> setHelpOpen(false)} className="w-7 h-7 rounded-md hover:bg-[#F1F5F9] flex items-center justify-center text-[#64748B]"><FaTimes size={12}/></button>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-sm text-[#64748B]">¿Necesitas ayuda? Contacta al equipo de {config.nombre}:</p>
              <div className="space-y-2">
                {config.whatsapp ? (
                  <a href={`https://wa.me/${config.whatsapp}?text=${encodeURIComponent('Hola, necesito ayuda con el panel admin')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-lg border border-[#E5E7EB] hover:bg-[#F8FAFC] transition-colors">
                    <FaWhatsapp size={16} className="text-[#10B981]" />
                    <div><p className="text-sm font-medium text-[#0F172A]">WhatsApp Soporte</p><p className="text-xs text-[#64748B]">{config.whatsapp}</p></div>
                  </a>
                ) : null}
                {config.telefono ? (
                  <a href={`tel:${config.telefono}`} className="flex items-center gap-3 p-3 rounded-lg border border-[#E5E7EB] hover:bg-[#F8FAFC] transition-colors">
                    <FaPhone size={16} className="text-[#3B82F6]" />
                    <div><p className="text-sm font-medium text-[#0F172A]">Teléfono</p><p className="text-xs text-[#64748B]">{config.telefono}</p></div>
                  </a>
                ) : null}
                {config.email ? (
                  <a href={`mailto:${config.email}`} className="flex items-center gap-3 p-3 rounded-lg border border-[#E5E7EB] hover:bg-[#F8FAFC] transition-colors">
                    <FaEnvelope size={16} className="text-[#F59E0B]" />
                    <div><p className="text-sm font-medium text-[#0F172A]">Email</p><p className="text-xs text-[#64748B]">{config.email}</p></div>
                  </a>
                ) : null}
                {!config.whatsapp && !config.telefono && !config.email && (
                  <p className="text-xs text-[#94A3B8]">Configura los datos de contacto en Configuración.</p>
                )}
              </div>
              <div className="pt-4 border-t border-[#E5E7EB]">
                <p className="text-xs font-medium text-[#0F172A] mb-2">Atajos</p>
                <p className="text-xs text-[#64748B]"><span className="px-1.5 py-0.5 rounded bg-[#F1F5F9] border border-[#E5E7EB] text-[11px]">Ctrl+K</span> Búsqueda global</p>
              </div>
              <div className="pt-4 border-t border-[#E5E7EB]">
                <p className="text-xs text-[#94A3B8]">Horario: {config.horarioApertura} – {config.horarioCierre} · {config.direccion}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      <CommandPalette open={paletteOpen} onClose={()=> setPaletteOpen(false)} />
      <ConfirmModal open={showLogoutConfirm} onClose={()=> setShowLogoutConfirm(false)} onConfirm={handleLogout} title="Cerrar sesión" message="¿Seguro que quieres cerrar sesión del panel administrativo?" confirmText="Cerrar sesión" cancelText="Cancelar" variant="warning" />
    </div>
  )
}
