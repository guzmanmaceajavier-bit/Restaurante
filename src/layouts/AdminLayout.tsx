import { useEffect, useState } from 'react'
import { useNavigate, Link, useLocation, Outlet } from 'react-router-dom'
import { storage } from '../lib/storage'
import { CONFIG } from '../lib/config'
import { FaHome, FaBox, FaUtensils, FaCalendarAlt, FaThLarge, FaUsers, FaStar, FaComments, FaSignOutAlt, FaBars, FaTimes, FaChevronLeft, FaCog } from 'react-icons/fa'
import DarkModeToggle from '../components/core/DarkModeToggle'
import { AdminSkeleton } from '../components/core/LoadingSkeleton'
import { useLoading } from '../hooks/useLoading'

const navItems = [
  { label: 'Dashboard', icon: FaHome, link: '/admin-dashboard' },
  { label: 'Pedidos', icon: FaBox, link: '/admin-ordenes' },
  { label: 'Cocina', icon: FaUtensils, link: '/admin-cocina' },
  { label: 'Reservas', icon: FaCalendarAlt, link: '/admin-reservas' },
  { label: 'Mesas', icon: FaThLarge, link: '/admin-mesas' },
  { label: 'Productos', icon: FaUtensils, link: '/admin-productos' },
  { label: 'Clientes', icon: FaUsers, link: '/admin-clientes' },
  { label: 'Reseñas', icon: FaStar, link: '/admin-resenas' },
  { label: 'WhatsApp', icon: FaComments, link: '/admin-whatsapp' },
  { label: 'Configuración', icon: FaCog, link: '/admin-config' },
]

export default function AdminLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const loading = useLoading(300)

  useEffect(() => {
    if (!storage.isAdmin()) navigate('/admin-login')
  }, [navigate])

  const handleLogout = () => {
    storage.clearAdmin()
    navigate('/admin-login')
  }

  const currentNav = navItems.find(n => location.pathname.startsWith(n.link))

  if (loading) return <AdminSkeleton />

  return (
    <div className="min-h-screen bg-cream-50 dark:bg-[#1a1f16] flex">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-white dark:bg-[#1e2518] border-r border-cream-200 dark:border-[#2d3523] fixed h-full z-30">
        <div className="p-5 border-b border-cream-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-olive-500 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm shadow-olive-500/20">
              {CONFIG.restaurante.nombre.charAt(0)}
            </div>
            <div>
              <h2 className="text-sm font-bold text-espresso-800 dark:text-cream-200">{CONFIG.restaurante.nombre}</h2>
              <p className="text-[10px] text-steel uppercase tracking-wider">Panel Admin</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.link)
            return (
              <Link key={item.link} to={item.link}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-olive-500 text-white shadow-md shadow-olive-500/20'
                    : 'text-espresso-600 dark:text-cream-400 hover:bg-cream-50 dark:hover:bg-[#252e1e] hover:text-olive-600 dark:hover:text-olive-400'
                }`}>
                <item.icon size={16} className={isActive ? 'text-white' : 'text-steel'} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="p-3 border-t border-cream-200 space-y-1">
          <div className="flex items-center justify-between px-4 py-2">
            <span className="text-xs text-steel">Tema</span>
            <DarkModeToggle />
          </div>
          <Link to="/" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-espresso-600 hover:bg-cream-50 transition-all">
            <FaChevronLeft size={14} className="text-steel" /> Volver al sitio
          </Link>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all">
            <FaSignOutAlt size={14} /> Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Sidebar Mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-espresso-900/40 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-white dark:bg-[#1e2518] shadow-2xl flex flex-col">
            <div className="p-5 border-b border-cream-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-olive-500 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                  {CONFIG.restaurante.nombre.charAt(0)}
                </div>
                <div>
                  <h2 className="text-sm font-bold text-espresso-800">{CONFIG.restaurante.nombre}</h2>
                  <p className="text-[10px] text-steel uppercase tracking-wider">Panel Admin</p>
                </div>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="p-2 hover:bg-cream-100 rounded-xl">
                <FaTimes size={16} className="text-steel" />
              </button>
            </div>
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
              {navItems.map((item) => {
                const isActive = location.pathname.startsWith(item.link)
                return (
                  <Link key={item.link} to={item.link} onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive ? 'bg-olive-500 text-white shadow-md' : 'text-espresso-600 dark:text-cream-400 hover:bg-cream-50 dark:hover:bg-[#252e1e]'
                  }`}>
                    <item.icon size={16} className={isActive ? 'text-white' : 'text-steel'} />
                    {item.label}
                  </Link>
                )
              })}
            </nav>
            <div className="p-3 border-t border-cream-200 space-y-1">
              <div className="flex items-center justify-between px-4 py-2">
                <span className="text-xs text-steel">Tema</span>
                <DarkModeToggle />
              </div>
              <Link to="/" onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-espresso-600 hover:bg-cream-50">
                <FaChevronLeft size={14} /> Volver al sitio
              </Link>
              <button onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50">
                <FaSignOutAlt size={14} /> Cerrar sesión
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 lg:ml-64">
        {/* Top bar mobile */}
        <div className="lg:hidden sticky top-0 z-20 bg-white dark:bg-[#1e2518] border-b border-cream-200 dark:border-[#2d3523] px-4 py-3 flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} className="p-2 hover:bg-cream-100 rounded-xl">
            <FaBars size={18} className="text-espresso-600" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-olive-500 rounded-lg flex items-center justify-center text-white font-bold text-xs">
              {CONFIG.restaurante.nombre.charAt(0)}
            </div>
            <span className="text-sm font-semibold text-espresso-800">{currentNav?.label || 'Admin'}</span>
          </div>
        </div>

        <div className="p-4 lg:p-8">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
