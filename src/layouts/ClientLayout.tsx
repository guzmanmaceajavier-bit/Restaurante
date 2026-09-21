import { useState, useEffect } from 'react'
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
import { getRestaurantConfig } from '../lib/config'
import { FaShoppingBag, FaSignOutAlt, FaHome, FaUtensils, FaCalendarAlt, FaHeart, FaTrophy, FaMapMarkerAlt, FaShieldAlt } from 'react-icons/fa'
import { useCartStore } from '../store/useCartStore'
import ConfirmModal from '../components/core/ConfirmModal'

const navItems = [
  { label: 'Resumen', icon: FaHome, path: '/mi-cuenta#inicio' },
  { label: 'Pedidos', icon: FaShoppingBag, path: '/mi-cuenta#pedidos' },
  { label: 'Reservas', icon: FaCalendarAlt, path: '/mi-cuenta#reservas' },
  { label: 'Favoritos', icon: FaHeart, path: '/mi-cuenta#favoritos' },
  { label: 'Direcciones', icon: FaMapMarkerAlt, path: '/mi-cuenta#direcciones' },
  { label: 'Fidelidad', icon: FaTrophy, path: '/mi-cuenta#fidelidad' },
  { label: 'Cuenta', icon: FaShieldAlt, path: '/mi-cuenta#cuenta' },
  { label: 'Menú', icon: FaUtensils, path: '/menu' },
]

export default function ClientLayout() {
  const { clienteActual, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const count = useCartStore((s) => s.count)
  const config = getRestaurantConfig()
  const isPortal = location.pathname === '/mi-cuenta'
  const getHash = () => (typeof window !== 'undefined' ? window.location.hash.replace('#','') || 'inicio' : 'inicio')
  const [activeHash, setActiveHash] = useState(getHash)
  useEffect(()=>{ const onHash=()=> setActiveHash(getHash()); window.addEventListener('hashchange', onHash); return ()=> window.removeEventListener('hashchange', onHash)}, [])
  useEffect(()=>{ setActiveHash(getHash()) }, [location])

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const handleLogout = () => {
    logout()
    navigate('/')
  }

  // Para /login y /registro, header simple sin sidebar
  if (!isPortal) {
    return (
      <div className="min-h-screen bg-[#FFFBF5] flex flex-col">
        <header className="h-[56px] bg-white border-b border-[#F1E9D8] flex items-center px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#1C2A0F] flex items-center justify-center text-white font-bold text-xs">{config.nombre.charAt(0)}</div>
            <span className="hidden sm:block text-sm font-display font-bold text-[#1C2A0F]">{config.nombre}</span>
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <Link to="/menu" className="relative w-8 h-8 rounded-full border border-[#E5E7EB] flex items-center justify-center hover:bg-white">
              <FaShoppingBag size={13} className="text-[#475569]" />
              {count>0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#F59E0B] text-white text-[10px] font-bold rounded-full flex items-center justify-center">{count}</span>}
            </Link>
          </div>
        </header>
        <main className="flex-1"><Outlet /></main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FFFBF5] flex">
      {/* Sidebar desktop */}
      <aside className="hidden lg:flex flex-col w-[240px] bg-white border-r border-[#F1E9D8] fixed h-full">
        <div className="h-[64px] px-4 border-b border-[#F1E9D8] flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#1C2A0F] flex items-center justify-center text-white font-bold text-sm">{config.nombre.charAt(0)}</div>
          <div>
            <p className="text-sm font-display font-bold text-[#1C2A0F] leading-4">{config.nombre}</p>
            <p className="text-[11px] text-[#F59E0B] font-semibold tracking-widest uppercase">Mi cuenta</p>
          </div>
        </div>
        <div className="p-3 flex-1 overflow-y-auto">
          <p className="px-2 py-2 text-[11px] font-semibold tracking-widest uppercase text-[#94A3B8]">Navegación</p>
          <nav className="space-y-1">
            {navItems.map(item=> {
              const isHash = item.path.includes('#')
              const itemHash = isHash ? item.path.split('#')[1] : ''
              const isActive = isHash ? (location.pathname==='/mi-cuenta' && activeHash===itemHash) : location.pathname===item.path
              return (
              <Link key={item.label} to={item.path} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${isActive ? 'bg-[#1C2A0F] text-white' : 'text-[#475569] hover:bg-[#FFFBF5] hover:text-[#1C2A0F]'}`}>
                <item.icon size={13} className={isActive ? 'text-[#F5B51B]' : 'text-[#94A3B8]'} />
                {item.label}
              </Link>
            )})}
          </nav>
          {clienteActual && (
            <div className="mt-6 p-3 rounded-xl bg-gradient-to-br from-[#1C2A0F] to-[#2A3D16] text-white">
              <p className="text-xs text-[#B9C98A]">Puntos</p>
              <p className="text-xl font-bold">{clienteActual.puntos||0}</p>
              <p className="text-[11px] text-white/70">{clienteActual.nivel||'bronce'} · {clienteActual.puntos||0} pts</p>
            </div>
          )}
        </div>
        <div className="p-3 border-t border-[#F1E9D8]">
          <Link to="/" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[#475569] hover:bg-[#F8FAFC]"><FaHome size={12}/> Volver al sitio</Link>
          {clienteActual && <button onClick={()=> setShowLogoutConfirm(true)} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[#DC2626] hover:bg-[#FEF2F2] mt-1"><FaSignOutAlt size={12}/> Salir</button>}
        </div>
      </aside>

      {/* Main + mobile bottom nav */}
      <div className="flex-1 lg:ml-[240px] flex flex-col min-h-screen">
        <header className="h-[56px] bg-white border-b border-[#F1E9D8] flex items-center px-4 lg:px-6 gap-3 sticky top-0 z-20">
          <Link to="/" className="lg:hidden flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#1C2A0F] flex items-center justify-center text-white font-bold text-xs">{config.nombre.charAt(0)}</div>
            <span className="text-sm font-bold text-[#1C2A0F]">Mi cuenta</span>
          </Link>
          <div className="hidden lg:block text-sm font-medium text-[#1C2A0F]">Mi cuenta · {clienteActual?.nombre || 'Invitado'}</div>
          <div className="ml-auto flex items-center gap-2">
            <Link to="/menu" className="relative w-8 h-8 rounded-full border border-[#E5E7EB] flex items-center justify-center hover:bg-white">
              <FaShoppingBag size={13} className="text-[#475569]" />
              {count>0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#F59E0B] text-white text-[10px] font-bold rounded-full flex items-center justify-center">{count}</span>}
            </Link>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FDF6E3] border border-[#FDE68A] text-xs font-medium text-[#92400E]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" /> {clienteActual?.puntos||0} pts
            </span>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-6 pb-20 lg:pb-6"><Outlet /></main>

        {/* Bottom nav mobile — 5 primarios */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#F1E9D8] flex justify-around py-2 px-1 z-20">
          {[
            navItems[0], navItems[1], navItems[2], navItems[3], navItems[6]
          ].map(item=> {
            const itemHash = item.path.split('#')[1] || ''
            const isActive = location.pathname==='/mi-cuenta' && activeHash===itemHash
            return (
            <Link key={item.label} to={item.path} className={`flex flex-col items-center gap-1 px-2 py-1 rounded-lg transition-colors ${isActive ? 'bg-[#1C2A0F] text-white' : 'hover:bg-[#FFFBF5] text-[#64748B]'}`}>
              <item.icon size={14} className={isActive ? 'text-[#F5B51B]' : ''} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          )})}
        </nav>
      </div>
      <ConfirmModal open={showLogoutConfirm} onClose={()=> setShowLogoutConfirm(false)} onConfirm={handleLogout} title="Cerrar sesión" message="¿Seguro que quieres cerrar sesión?" confirmText="Cerrar sesión" cancelText="Cancelar" variant="warning" />
    </div>
  )
}
