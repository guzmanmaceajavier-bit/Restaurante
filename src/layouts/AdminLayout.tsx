import { useEffect, useState, useMemo } from 'react'
import { useNavigate, Link, useLocation, Outlet } from 'react-router-dom'
import { storage } from '../lib/storage'
import { getRestaurantConfig } from '../lib/config'
import { FaHome, FaBox, FaUtensils, FaCalendarAlt, FaThLarge, FaUsers, FaStar, FaComments, FaSignOutAlt, FaBars, FaTimes, FaChevronLeft, FaCog, FaTags, FaTag, FaClipboardList, FaDollarSign, FaChartBar, FaUserFriends, FaHistory, FaDatabase, FaClock, FaCashRegister, FaFileInvoiceDollar, FaTruck, FaShoppingCart, FaTrophy, FaShieldAlt, FaMoneyBillWave, FaChevronDown, FaChevronRight, FaSearch, FaBell, FaQuestionCircle, FaAngleDoubleLeft, FaAngleDoubleRight } from 'react-icons/fa'
import { AdminSkeleton } from '../components/core/LoadingSkeleton'
import { useLoading } from '../hooks/useLoading'
import { CommandPalette } from '../components/admin/CommandPalette'

type Item = { label: string; icon: any; link: string; badgeKey?: string }
type Section = { title: string; items: Item[] }

const sections: Section[] = [
  { title: '', items: [{ label: 'Dashboard', icon: FaHome, link: '/admin-dashboard' }] },
  { title: 'OPERACIÓN', items: [
    { label: 'Pedidos', icon: FaBox, link: '/admin-ordenes', badgeKey: 'pendientes' },
    { label: 'Cocina', icon: FaUtensils, link: '/admin-cocina', badgeKey: 'cocina' },
    { label: 'Reservas', icon: FaCalendarAlt, link: '/admin-reservas' },
    { label: 'Mesas', icon: FaThLarge, link: '/admin-mesas' },
  ]},
  { title: 'MENÚ', items: [
    { label: 'Productos', icon: FaUtensils, link: '/admin-productos' },
    { label: 'Categorías', icon: FaTags, link: '/admin-categorias' },
    { label: 'Promociones', icon: FaTag, link: '/admin-promociones' },
  ]},
  { title: 'CLIENTES Y MARKETING', items: [
    { label: 'Clientes', icon: FaUsers, link: '/admin-clientes' },
    { label: 'Fidelización', icon: FaTrophy, link: '/admin-fidelizacion' },
    { label: 'Reseñas', icon: FaStar, link: '/admin-resenas' },
    { label: 'WhatsApp', icon: FaComments, link: '/admin-whatsapp' },
    { label: 'Segmentación', icon: FaUserFriends, link: '/admin-segmentacion' },
  ]},
  { title: 'INVENTARIO', items: [
    { label: 'Inventario', icon: FaClipboardList, link: '/admin-inventario' },
    { label: 'Proveedores', icon: FaTruck, link: '/admin-proveedores' },
    { label: 'Compras', icon: FaShoppingCart, link: '/admin-compras' },
  ]},
  { title: 'FINANZAS', items: [
    { label: 'Caja', icon: FaCashRegister, link: '/admin-caja' },
    { label: 'Gastos', icon: FaMoneyBillWave, link: '/admin-gastos' },
    { label: 'Facturación', icon: FaFileInvoiceDollar, link: '/admin-facturacion' },
    { label: 'Finanzas', icon: FaDollarSign, link: '/admin-finanzas' },
  ]},
  { title: 'REPORTES', items: [{ label: 'Reportes', icon: FaChartBar, link: '/admin-reportes' }]},
  { title: 'SISTEMA', items: [
    { label: 'Usuarios y Roles', icon: FaShieldAlt, link: '/admin-usuarios' },
    { label: 'Actividad', icon: FaHistory, link: '/admin-actividad' },
    { label: 'Horarios', icon: FaClock, link: '/admin-horarios' },
    { label: 'Configuración', icon: FaCog, link: '/admin-config' },
    { label: 'Backup', icon: FaDatabase, link: '/admin-backup' },
  ]},
]

function useBadges() {
  const [badges, setBadges] = useState<Record<string, number>>({})
  useEffect(() => {
    const load = () => {
      try {
        const ordenes = storage.getOrdenes<any>()
        setBadges({
          pendientes: ordenes.filter((o:any)=> o.estado==='recibido').length,
          cocina: ordenes.filter((o:any)=> o.estado==='preparando').length,
        })
      } catch {}
    }
    load(); const id=setInterval(load, 4000); return ()=> clearInterval(id)
  }, [])
  return badges
}

export default function AdminLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(()=> localStorage.getItem('admin_collapsed')==='1')
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(()=> {
    const init: Record<string, boolean> = {}
    sections.forEach(s=> { if(s.title) init[s.title]=true })
    return init
  })
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const loading = useLoading(300)
  const badges = useBadges()
  const config = getRestaurantConfig()

  useEffect(() => { if (!storage.isAdmin()) navigate('/admin-login') }, [navigate])
  useEffect(()=> localStorage.setItem('admin_collapsed', collapsed ? '1':'0'), [collapsed])
  useEffect(()=> {
    const onKey = (e: KeyboardEvent) => { if((e.ctrlKey||e.metaKey) && e.key.toLowerCase()==='k'){ e.preventDefault(); setPaletteOpen(v=>!v)}}
    window.addEventListener('keydown', onKey); return ()=> window.removeEventListener('keydown', onKey)
  }, [])

  const flat = sections.flatMap(s=> s.items)
  const current = flat.find(n=> location.pathname===n.link || location.pathname.startsWith(n.link+'/'))
  const breadcrumb = useMemo(()=> {
    const sec = sections.find(s=> s.items.some(i=> location.pathname===i.link || location.pathname.startsWith(i.link+'/')))
    return { section: sec?.title || '', label: current?.label || '' }
  }, [location.pathname, current])

  const handleLogout = () => { storage.clearAdmin(); navigate('/admin-login') }
  if (loading) return <AdminSkeleton />

  const sidebarWidth = collapsed ? 'w-[76px]' : 'w-[260px]'
  const contentMargin = collapsed ? 'lg:ml-[76px]' : 'lg:ml-[260px]'

  return (
    <div className="admin min-h-screen bg-[#F8FAFC] flex">
      {/* Desktop sidebar */}
      <aside className={`hidden lg:flex flex-col bg-white border-r border-[#E5E7EB] fixed h-full z-30 transition-all duration-200 ${sidebarWidth}`}>
        <div className="h-[56px] px-3 border-b border-[#E5E7EB] flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-[#667A22] flex items-center justify-center text-white font-bold text-xs shrink-0">{config.nombre.charAt(0)}</div>
          {!collapsed && <div className="min-w-0 flex-1"><p className="text-[13px] font-semibold text-[#0F172A] leading-4 truncate">{config.nombre}</p><p className="text-[11px] text-[#64748B]">Panel administrativo</p></div>}
          <button onClick={()=> setCollapsed(v=>!v)} className="ml-auto w-7 h-7 rounded-lg hover:bg-[#F1F5F9] flex items-center justify-center text-[#94A3B8]">
            {collapsed ? <FaAngleDoubleRight size={12}/> : <FaAngleDoubleLeft size={12}/>}
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1 scrollbar-hide">
          {sections.map(sec=> {
            const isCollapsible = !!sec.title
            const isOpen = sec.title ? openSections[sec.title] !== false : true
            return (
              <div key={sec.title || 'dash'}>
                {sec.title && !collapsed && (
                  <button onClick={()=> setOpenSections(s=> ({...s, [sec.title]: !isOpen}))}
                    className="w-full flex items-center justify-between px-2 py-2 text-[11px] font-semibold tracking-widest text-[#94A3B8] hover:text-[#64748B]">
                    <span>{sec.title}</span>
                    {isCollapsible && (isOpen ? <FaChevronDown size={10}/> : <FaChevronRight size={10}/>)}
                  </button>
                )}
                {sec.title && collapsed && <div className="h-px bg-[#F1F5F9] my-2 mx-2" />}
                {(isOpen || collapsed) && (
                  <div className="space-y-0.5">
                    {sec.items.map(item=> {
                      const active = location.pathname===item.link || location.pathname.startsWith(item.link+'/')
                      const badge = item.badgeKey ? (badges[item.badgeKey]||0) : 0
                      return (
                        <Link key={item.link} to={item.link}
                          title={collapsed ? item.label : undefined}
                          className={`flex items-center gap-3 rounded-lg text-[13px] font-medium transition-colors ${collapsed ? 'justify-center px-2 py-2.5' : 'px-2.5 py-2'} ${active ? 'bg-[#F1F5F9] text-[#0F172A] border border-[#E5E7EB]' : 'text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A]'}`}>
                          <item.icon size={14} className={active ? 'text-[#667A22]' : 'text-[#94A3B8]'} />
                          {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
                          {!collapsed && badge>0 && <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-[#667A22] text-white text-[11px] font-semibold flex items-center justify-center">{badge>99?'99+':badge}</span>}
                          {collapsed && badge>0 && <span className="absolute ml-6 -mt-6 w-2 h-2 bg-[#667A22] rounded-full" />}
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
              <Link to="/" className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-[#475569] hover:bg-[#F8FAFC]"><FaChevronLeft size={12}/> Volver al sitio</Link>
              <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-[#DC2626] hover:bg-[#FEF2F2]"><FaSignOutAlt size={12}/> Cerrar sesión</button>
            </>
          ) : (
            <button onClick={handleLogout} title="Cerrar sesión" className="w-full flex justify-center py-2 text-[#DC2626] hover:bg-[#FEF2F2] rounded-lg"><FaSignOutAlt size={14}/></button>
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
                      const active = location.pathname===item.link || location.pathname.startsWith(item.link+'/')
                      return <Link key={item.link} to={item.link} onClick={()=> setSidebarOpen(false)} className={`flex items-center gap-3 px-2.5 py-2 rounded-lg text-[13px] font-medium ${active ? 'bg-[#F1F5F9] text-[#0F172A] border border-[#E5E7EB]' : 'text-[#475569] hover:bg-[#F8FAFC]'}`}><item.icon size={14} className={active?'text-[#667A22]':'text-[#94A3B8]'}/>{item.label}</Link>
                    })}
                  </div>
                </div>
              ))}
            </nav>
            <div className="p-3 border-t border-[#E5E7EB]"><button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[#DC2626] hover:bg-[#FEF2F2]"><FaSignOutAlt size={12}/> Cerrar sesión</button></div>
          </aside>
        </div>
      )}

      {/* Main */}
      <div className={`flex-1 min-w-0 ${contentMargin} transition-all duration-200`}>
        {/* Topbar */}
        <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-[#E5E7EB] h-[56px] flex items-center gap-3 px-4">
          <button onClick={()=> setSidebarOpen(true)} className="lg:hidden w-8 h-8 rounded-lg hover:bg-[#F1F5F9] flex items-center justify-center"><FaBars size={16} className="text-[#475569]"/></button>
          <div className="hidden sm:flex items-center gap-1.5 text-sm text-[#64748B] min-w-0">
            <span className="hidden lg:inline">Dashboard</span>
            {breadcrumb.section && <><span className="text-[#E5E7EB]">/</span><span>{breadcrumb.section}</span></>}
            {breadcrumb.label && <><span className="text-[#E5E7EB]">/</span><span className="text-[#0F172A] font-medium">{breadcrumb.label}</span></>}
          </div>
          <div className="flex-1" />
          {/* Global search */}
          <button onClick={()=> setPaletteOpen(true)} className="hidden md:flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-lg border border-[#E5E7EB] bg-[#F8FAFC] text-sm text-[#94A3B8] hover:bg-white hover:border-[#CBD5E1] transition-colors">
            <FaSearch size={12}/> <span>Buscar</span> <span className="ml-2 hidden lg:inline-flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded bg-white border border-[#E5E7EB] text-[#64748B]">Ctrl K</span>
          </button>
          <button onClick={()=> setPaletteOpen(true)} className="md:hidden w-8 h-8 rounded-lg hover:bg-[#F1F5F9] flex items-center justify-center text-[#64748B]"><FaSearch size={14}/></button>
          {/* Notifications */}
          <div className="relative">
            <button onClick={()=> setNotifOpen(v=>!v)} className="w-8 h-8 rounded-lg hover:bg-[#F1F5F9] flex items-center justify-center text-[#64748B] relative">
              <FaBell size={14}/>{(badges.pendientes||0) > 0 && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#EF4444] rounded-full border-2 border-white" />}
            </button>
            {notifOpen && (
              <div className="absolute right-0 top-10 w-80 bg-white rounded-xl border border-[#E5E7EB] shadow-lift overflow-hidden z-30">
                <div className="px-4 py-3 border-b border-[#E5E7EB] flex items-center justify-between"><p className="text-sm font-semibold text-[#0F172A]">Notificaciones</p><span className="text-xs px-2 py-0.5 rounded-full bg-[#F1F5F9] border border-[#E5E7EB]">{badges.pendientes||0} pendientes</span></div>
                <div className="p-3 space-y-2 max-h-80 overflow-y-auto">
                  {(badges.pendientes||0)===0 ? <p className="text-sm text-[#94A3B8] text-center py-6">Sin notificaciones</p> : (
                    <Link to="/admin-ordenes" onClick={()=> setNotifOpen(false)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#F8FAFC] border border-transparent hover:border-[#E5E7EB]">
                      <span className="w-8 h-8 rounded-lg bg-[#FEF3C7] flex items-center justify-center text-[#D97706]"><FaBox size={12}/></span>
                      <span className="flex-1"><span className="block text-sm font-medium text-[#0F172A]">{badges.pendientes} pedido{(badges.pendientes||0)!==1?'s':''} pendiente{(badges.pendientes||0)!==1?'s':''}</span><span className="block text-xs text-[#64748B]">Requiere atención en Pedidos</span></span>
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>
          <a href="#" onClick={e=>{e.preventDefault(); alert('Centro de ayuda — contacta a soporte')}} className="w-8 h-8 rounded-lg hover:bg-[#F1F5F9] hidden sm:flex items-center justify-center text-[#64748B]"><FaQuestionCircle size={14}/></a>
          {/* User */}
          <div className="relative">
            <button onClick={()=> setUserMenuOpen(v=>!v)} className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-[#F1F5F9] transition-colors">
              <span className="w-7 h-7 rounded-full bg-[#667A22] flex items-center justify-center text-white text-xs font-semibold">A</span>
              <span className="hidden sm:block text-sm font-medium text-[#0F172A]">Administrador</span>
              <FaChevronDown size={10} className="text-[#94A3B8] hidden sm:block"/>
            </button>
            {userMenuOpen && (
              <div className="absolute right-0 top-10 w-56 bg-white rounded-xl border border-[#E5E7EB] shadow-lift py-1 z-30">
                <div className="px-3 py-2 border-b border-[#F1F5F9]"><p className="text-sm font-medium text-[#0F172A]">Administrador</p><p className="text-xs text-[#64748B]">{config.nombre}</p></div>
                <Link to="/" className="flex items-center gap-2 px-3 py-2 text-sm text-[#334155] hover:bg-[#F8FAFC]"><FaChevronLeft size={12}/> Volver al sitio</Link>
                <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#DC2626] hover:bg-[#FEF2F2]"><FaSignOutAlt size={12}/> Cerrar sesión</button>
              </div>
            )}
          </div>
        </div>
        <div className="p-4 lg:p-6"><Outlet /></div>
      </div>
      <CommandPalette open={paletteOpen} onClose={()=> setPaletteOpen(false)} />
    </div>
  )
}
