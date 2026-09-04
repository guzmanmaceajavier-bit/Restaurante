import { Link, useLocation } from 'react-router-dom'
import { RoutesPath } from '@/routes/routes'
import { useAuthStore } from '@/store/useAuthStore'
import { useCartStore } from '@/store/useCartStore'
import { CONFIG } from '@/lib/config'
import { useState } from 'react'
import { FaHome, FaUtensils, FaCalendarAlt, FaPhone, FaTag, FaImage, FaGlassCheers, FaShoppingBag, FaUser, FaStar, FaClipboardList, FaSignOutAlt } from 'react-icons/fa'
import { BiMenu, BiX } from 'react-icons/bi'
import clsx from 'clsx'

const mainLinks = [
  { label: 'Inicio', path: RoutesPath.home, icon: FaHome },
  { label: 'Menú', path: RoutesPath.menu, icon: FaUtensils },
  { label: 'Reservas', path: RoutesPath.reserve, icon: FaCalendarAlt },
  { label: 'Contacto', path: RoutesPath.contact, icon: FaPhone },
]

const extraLinks = [
  { label: 'Promociones', path: RoutesPath.promociones, icon: FaTag },
  { label: 'Galería', path: RoutesPath.galeria, icon: FaImage },
  { label: 'Eventos', path: RoutesPath.eventos, icon: FaGlassCheers },
  { label: 'Reseñas', path: RoutesPath.resenas, icon: FaStar },
]

const accountLinks = [
  { label: 'Mis pedidos', path: RoutesPath.orderHistory, icon: FaClipboardList },
  { label: 'Mi cuenta', path: RoutesPath.clientPanel, icon: FaUser },
]

interface Props {
  onCartClick: () => void
}

export default function Sidebar({ onCartClick }: Props) {
  const { pathname } = useLocation()
  const { clienteActual, logout } = useAuthStore()
  const count = useCartStore((s) => s.count)
  const [mobileOpen, setMobileOpen] = useState(false)

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/'
    return pathname.startsWith(path)
  }

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-olive-100">
        <Link to={RoutesPath.home} className="flex items-center gap-3">
          <div className="w-11 h-11 bg-olive-500 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-olive-500/30">
            <FaUtensils className="text-white" size={20} />
          </div>
          <div className="min-w-0">
            <p className="font-display font-bold text-espresso-900 text-base leading-tight truncate">Sabor y Origen</p>
            <p className="text-[10px] text-steel uppercase tracking-widest">Restaurante</p>
          </div>
        </Link>
      </div>

      {/* Main Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="px-3 mb-2 text-[10px] font-semibold text-steel uppercase tracking-widest">Menú principal</p>
        {mainLinks.map(l => (
          <Link
            key={l.path}
            to={l.path}
            onClick={() => setMobileOpen(false)}
            className={clsx(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
              isActive(l.path)
                ? 'bg-olive-500 text-white shadow-md shadow-olive-500/20'
                : 'text-espresso-600 hover:bg-olive-50 hover:text-olive-700'
            )}
          >
            <l.icon size={16} />
            {l.label}
          </Link>
        ))}

        <div className="pt-3 pb-1">
          <p className="px-3 mb-2 text-[10px] font-semibold text-steel uppercase tracking-widest">Explorar</p>
        </div>
        {extraLinks.map(l => (
          <Link
            key={l.path}
            to={l.path}
            onClick={() => setMobileOpen(false)}
            className={clsx(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
              isActive(l.path)
                ? 'bg-olive-500 text-white shadow-md shadow-olive-500/20'
                : 'text-espresso-600 hover:bg-olive-50 hover:text-olive-700'
            )}
          >
            <l.icon size={16} />
            {l.label}
          </Link>
        ))}

        {clienteActual && (
          <>
            <div className="pt-3 pb-1">
              <p className="px-3 mb-2 text-[10px] font-semibold text-steel uppercase tracking-widest">Mi cuenta</p>
            </div>
            {accountLinks.map(l => (
              <Link
                key={l.path}
                to={l.path}
                onClick={() => setMobileOpen(false)}
                className={clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                  isActive(l.path)
                    ? 'bg-olive-500 text-white shadow-md shadow-olive-500/20'
                    : 'text-espresso-600 hover:bg-olive-50 hover:text-olive-700'
                )}
              >
                <l.icon size={16} />
                {l.label}
              </Link>
            ))}
          </>
        )}
      </nav>

      {/* Cart + User */}
      <div className="px-3 pb-4 space-y-2 border-t border-olive-100 pt-3">
        <button
          onClick={() => { onCartClick(); setMobileOpen(false) }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-espresso-600 hover:bg-olive-50 hover:text-olive-700 transition-all duration-200"
        >
          <div className="relative">
            <FaShoppingBag size={16} />
            {count > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-olive-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-sm">
                {count}
              </span>
            )}
          </div>
          Carrito {count > 0 && `(${count})`}
        </button>

        {!clienteActual ? (
          <Link
            to={RoutesPath.clientLogin}
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white bg-olive-500 hover:bg-olive-600 transition-all duration-200 shadow-md shadow-olive-500/20"
          >
            <FaUser size={16} />
            Iniciar sesión
          </Link>
        ) : (
          <button
            onClick={() => { logout(); setMobileOpen(false) }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all duration-200"
          >
            <FaSignOutAlt size={16} />
            Cerrar sesión
          </button>
        )}
      </div>

      {/* Restaurant info */}
      <div className="px-5 py-4 border-t border-olive-100 bg-olive-50/50">
        <p className="text-[10px] text-steel uppercase tracking-widest mb-1">Horario</p>
        <p className="text-xs text-espresso-700 font-medium">{CONFIG.contacto.horario}</p>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed top-0 left-0 bottom-0 w-[260px] bg-white border-r border-olive-100 z-40 flex-col shadow-xl shadow-olive-900/5">
        {sidebarContent}
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-olive-500 shadow-lg shadow-olive-500/30">
        <div className="flex items-center justify-between px-4 h-14">
          <Link to={RoutesPath.home} className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
              <FaUtensils className="text-white" size={14} />
            </div>
            <span className="font-display font-bold text-white text-sm">Sabor y Origen</span>
          </Link>
          <div className="flex items-center gap-2">
            <button onClick={onCartClick} className="relative p-2 text-white/90 hover:bg-white/10 rounded-xl transition-colors">
              <FaShoppingBag size={18} />
              {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-gold-500 text-espresso-900 text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-sm">
                  {count}
                </span>
              )}
            </button>
            <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 text-white/90 hover:bg-white/10 rounded-xl transition-colors">
              {mobileOpen ? <BiX size={22} /> : <BiMenu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)}>
          <div className="fixed top-14 left-0 bottom-0 w-[280px] bg-white shadow-2xl animate-fade-in overflow-y-auto" onClick={e => e.stopPropagation()}>
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  )
}
