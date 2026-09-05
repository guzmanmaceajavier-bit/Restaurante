import { useEffect, useState } from 'react'
import { useNavigate, Link, useLocation, Outlet } from 'react-router-dom'
import { storage } from '../lib/storage'
import { getRestaurantConfig } from '../lib/config'
import { FaHome, FaBox, FaUtensils, FaCalendarAlt, FaThLarge, FaUsers, FaStar, FaComments, FaSignOutAlt, FaBars, FaTimes, FaChevronLeft, FaCog, FaTags, FaTag, FaClipboardList, FaDollarSign, FaChartBar, FaUserFriends, FaHistory, FaDatabase, FaClock, FaCashRegister, FaFileInvoiceDollar, FaTruck, FaShoppingCart, FaTrophy, FaShieldAlt, FaMoneyBillWave } from 'react-icons/fa'
import { AdminSkeleton } from '../components/core/LoadingSkeleton'
import { useLoading } from '../hooks/useLoading'

type Section = { title: string; items: { label: string; icon: any; link: string }[] }

const sections: Section[] = [
  { title: '', items: [{ label: 'Dashboard', icon: FaHome, link: '/admin-dashboard' }] },
  { title: 'OPERACIÓN', items: [
    { label: 'Pedidos', icon: FaBox, link: '/admin-ordenes' },
    { label: 'Cocina', icon: FaUtensils, link: '/admin-cocina' },
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
  { title: 'REPORTES', items: [
    { label: 'Reportes', icon: FaChartBar, link: '/admin-reportes' },
  ]},
  { title: 'SISTEMA', items: [
    { label: 'Usuarios y Roles', icon: FaShieldAlt, link: '/admin-usuarios' },
    { label: 'Actividad', icon: FaHistory, link: '/admin-actividad' },
    { label: 'Horarios', icon: FaClock, link: '/admin-horarios' },
    { label: 'Configuración', icon: FaCog, link: '/admin-config' },
    { label: 'Backup', icon: FaDatabase, link: '/admin-backup' },
  ]},
]

function NavContent({ onNavigate }: { onNavigate?: () => void }) {
  const location = useLocation()
  return (
    <>
      {sections.map((sec) => (
        <div key={sec.title || 'top'} className={sec.title ? 'pt-3' : ''}>
          {sec.title && <p className="px-4 mb-1.5 text-[10px] font-bold tracking-[0.12em] text-steel/60">{sec.title}</p>}
          <div className="space-y-0.5">
            {sec.items.map((item) => {
              const isActive = location.pathname === item.link || location.pathname.startsWith(item.link + '/')
              return (
                <Link key={item.link} to={item.link} onClick={onNavigate}
                  className={`flex items-center gap-3 px-4 py-2 rounded-xl text-[13px] font-medium transition-all duration-200 ${isActive ? 'bg-olive-500 text-white shadow-md shadow-olive-500/20' : 'text-espresso-600 hover:bg-cream-50 hover:text-olive-600'}`}>
                  <item.icon size={14} className={isActive ? 'text-white' : 'text-steel/70'} />
                  {item.label}
                </Link>
              )
            })}
          </div>
        </div>
      ))}
    </>
  )
}

export default function AdminLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const loading = useLoading(300)
  useEffect(() => { if (!storage.isAdmin()) navigate('/admin-login') }, [navigate])
  const handleLogout = () => { storage.clearAdmin(); navigate('/admin-login') }
  const flatItems = sections.flatMap(s => s.items)
  const currentNav = flatItems.find(n => location.pathname === n.link || location.pathname.startsWith(n.link + '/'))
  const config = getRestaurantConfig()
  if (loading) return <AdminSkeleton />
  return (
    <div className="min-h-screen bg-cream-50 flex">
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-cream-200 fixed h-full z-30">
        <div className="p-5 border-b border-cream-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-olive-500 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm shadow-olive-500/20">{config.nombre.charAt(0)}</div>
            <div><h2 className="text-sm font-bold text-espresso-800">{config.nombre}</h2><p className="text-[10px] text-steel uppercase tracking-wider">Panel Admin</p></div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <NavContent />
        </nav>
        <div className="p-3 border-t border-cream-200 space-y-1">
          <Link to="/" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-espresso-600 hover:bg-cream-50 transition-all"><FaChevronLeft size={14} className="text-steel" /> Volver al sitio</Link>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all"><FaSignOutAlt size={14} /> Cerrar sesión</button>
        </div>
      </aside>
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-espresso-900/40 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-2xl flex flex-col">
            <div className="p-5 border-b border-cream-200 flex items-center justify-between">
              <div className="flex items-center gap-3"><div className="w-10 h-10 bg-olive-500 rounded-xl flex items-center justify-center text-white font-bold text-sm">{config.nombre.charAt(0)}</div><div><h2 className="text-sm font-bold text-espresso-800">{config.nombre}</h2><p className="text-[10px] text-steel uppercase tracking-wider">Panel Admin</p></div></div>
              <button onClick={() => setSidebarOpen(false)} className="p-2 hover:bg-cream-100 rounded-xl"><FaTimes size={16} className="text-steel" /></button>
            </div>
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto"><NavContent onNavigate={() => setSidebarOpen(false)} /></nav>
            <div className="p-3 border-t border-cream-200 space-y-1">
              <Link to="/" onClick={() => setSidebarOpen(false)} className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-espresso-600 hover:bg-cream-50"><FaChevronLeft size={14} /> Volver al sitio</Link>
              <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50"><FaSignOutAlt size={14} /> Cerrar sesión</button>
            </div>
          </aside>
        </div>
      )}
      <div className="flex-1 lg:ml-64">
        <div className="lg:hidden sticky top-0 z-20 bg-white border-b border-cream-200 px-4 py-3 flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} className="p-2 hover:bg-cream-100 rounded-xl"><FaBars size={18} className="text-espresso-600" /></button>
          <div className="flex items-center gap-2"><div className="w-8 h-8 bg-olive-500 rounded-lg flex items-center justify-center text-white font-bold text-xs">{config.nombre.charAt(0)}</div><span className="text-sm font-semibold text-espresso-800">{currentNav?.label || 'Admin'}</span></div>
        </div>
        <div className="p-4 lg:p-8"><Outlet /></div>
      </div>
    </div>
  )
}
