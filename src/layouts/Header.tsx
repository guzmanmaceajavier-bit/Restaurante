import { Link, useLocation, useNavigate } from 'react-router-dom'
import { RoutesPath } from '@/routes/routes'
import { useAuthStore } from '@/store/useAuthStore'
import { useCartStore } from '../store/useCartStore'
import { getRestaurantConfig } from '@/lib/config'
import { useState, useEffect, useRef } from 'react'
import { FaShoppingBag, FaUser, FaSignOutAlt, FaSearch } from 'react-icons/fa'
import { BiMenu, BiX } from 'react-icons/bi'
import clsx from 'clsx'
import DarkModeToggle from '../components/core/DarkModeToggle'

const navLinks = [
  { label: 'Inicio', path: RoutesPath.home },
  { label: 'Menú', path: RoutesPath.menu },
  { label: 'Reservas', path: RoutesPath.reserve },
  { label: 'Contacto', path: RoutesPath.contact },
]

interface Props {
  onCartClick: () => void
}

export default function Header({ onCartClick }: Props) {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { clienteActual, logout } = useAuthStore()
  const count = useCartStore((s) => s.count)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [cartBump, setCartBump] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const searchRef = useRef<HTMLInputElement>(null)
  const prevCount = useRef(count)
  const config = getRestaurantConfig()

  useEffect(() => {
    if (count > prevCount.current) {
      setCartBump(true)
      const t = setTimeout(() => setCartBump(false), 400)
      prevCount.current = count
      return () => clearTimeout(t)
    }
    prevCount.current = count
  }, [count])

  useEffect(() => {
    if (searchOpen && searchRef.current) searchRef.current.focus()
  }, [searchOpen])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/menu?buscar=${encodeURIComponent(searchQuery.trim())}`)
      setSearchOpen(false)
      setSearchQuery('')
    }
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/'
    return pathname.startsWith(path)
  }

  return (
    <>
      {/* Desktop header */}
      <header className={`hidden lg:block fixed top-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#1a1f16]/95 backdrop-blur-md border-b border-cream-200 dark:border-[#2d3523] transition-all duration-300 ${scrolled ? 'navbar-scrolled' : ''}`}>
        <div className="max-w-content mx-auto px-6 h-[72px] flex items-center justify-between">
          {/* Logo */}
          <Link to={RoutesPath.home} className="flex items-center gap-3 shrink-0 group">
            <div className="w-10 h-10 bg-olive-600 rounded-xl flex items-center justify-center group-hover:bg-olive-700 transition-colors">
              <span className="text-white font-display font-bold text-lg">S</span>
            </div>
            <div className="leading-none">
              <p className="font-display font-bold text-espresso-900 text-[17px]">Sabor y Origen</p>
              <p className="text-[10px] text-steel uppercase tracking-[0.15em] mt-0.5">Restaurante</p>
            </div>
          </Link>

          {/* Nav */}
          <nav className="flex items-center gap-1">
            {navLinks.map(l => {
              const active = isActive(l.path)
              return (
                <Link
                  key={l.path}
                  to={l.path}
                  className={clsx(
                    'relative px-4 py-2 text-[15px] font-medium transition-colors duration-200',
                    active
                      ? 'text-olive-700 dark:text-olive-400'
                      : 'text-espresso-500 dark:text-cream-400 hover:text-espresso-800 dark:hover:text-cream-200'
                  )}
                >
                  {l.label}
                  {active && (
                    <span className="absolute bottom-0 left-4 right-4 h-[2px] bg-olive-600 rounded-full" />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Dark Mode Toggle */}
            <DarkModeToggle />

            {/* Search */}
            <div className="relative">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2.5 text-espresso-500 hover:text-olive-600 hover:bg-olive-50 rounded-xl transition-all duration-200"
              >
                <FaSearch size={16} />
              </button>
              {searchOpen && (
                <form onSubmit={handleSearch} className="absolute top-full right-0 mt-2 w-72 bg-white rounded-2xl shadow-lift border border-cream-200 p-2 z-50 animate-fade-in">
                  <div className="flex items-center gap-2 bg-cream-50 rounded-xl px-3 py-2 border border-cream-200 focus-within:border-olive-400 focus-within:ring-2 focus-within:ring-olive-100 transition-all">
                    <FaSearch size={14} className="text-steel shrink-0" />
                    <input
                      ref={searchRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Buscar platos, bebidas..."
                      className="flex-1 bg-transparent text-sm text-espresso-800 placeholder:text-steel/50 outline-none"
                    />
                  </div>
                </form>
              )}
            </div>

            <button
              onClick={onCartClick}
              className={`relative p-2.5 text-espresso-500 hover:text-olive-600 hover:bg-olive-50 rounded-xl transition-all duration-200 ${cartBump ? 'cart-bump' : ''}`}
            >
              <FaShoppingBag size={18} />
              {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-olive-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 shadow-sm cart-badge-bump">
                  {count}
                </span>
              )}
            </button>

            <div className="w-px h-6 bg-cream-200" />

            {!clienteActual ? (
              <Link
                to={RoutesPath.clientLogin}
                className="flex items-center gap-2 px-5 py-2.5 bg-olive-600 hover:bg-olive-700 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-sm shadow-olive-600/20 hover:shadow-md hover:shadow-olive-600/30"
              >
                <FaUser size={13} />
                Iniciar sesión
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to={RoutesPath.clientPanel}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-espresso-600 hover:text-olive-700 hover:bg-olive-50 rounded-xl transition-all duration-200"
                >
                  <div className="w-7 h-7 bg-olive-100 rounded-lg flex items-center justify-center">
                    <FaUser size={11} className="text-olive-600" />
                  </div>
                  Mi cuenta
                </Link>
                <button
                  onClick={() => { logout(); navigate(RoutesPath.home); }}
                  className="p-2.5 text-steel hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200"
                  title="Cerrar sesión"
                >
                  <FaSignOutAlt size={14} />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white dark:bg-[#1a1f16] border-b border-cream-200 dark:border-[#2d3523] shadow-sm">
        <div className="flex items-center justify-between px-4 h-14">
          <Link to={RoutesPath.home} className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-olive-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-display font-bold text-sm">S</span>
            </div>
            <span className="font-display font-bold text-espresso-900 text-sm">Sabor y Origen</span>
          </Link>
          <div className="flex items-center gap-1">
            {/* Dark Mode Toggle Mobile */}
            <DarkModeToggle className="lg:hidden" />

            {/* Mobile search */}
            <div className="relative">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2.5 text-espresso-500 hover:bg-olive-50 rounded-xl transition-colors"
              >
                <FaSearch size={16} />
              </button>
              {searchOpen && (
                <form onSubmit={handleSearch} className="absolute top-full right-0 mt-2 w-64 bg-white rounded-2xl shadow-lift border border-cream-200 p-2 z-50 animate-fade-in">
                  <div className="flex items-center gap-2 bg-cream-50 rounded-xl px-3 py-2 border border-cream-200 focus-within:border-olive-400 transition-all">
                    <FaSearch size={12} className="text-steel shrink-0" />
                    <input
                      ref={searchRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Buscar..."
                      className="flex-1 bg-transparent text-sm text-espresso-800 placeholder:text-steel/50 outline-none"
                    />
                  </div>
                  <div className="mt-2 px-1 pb-1">
                    <div className="flex flex-wrap gap-1">
                      {['Bandeja paisa', 'Arepa', 'Limonada'].map(s => (
                        <button key={s} type="button"
                          onClick={() => { navigate(`/menu?buscar=${encodeURIComponent(s)}`); setSearchOpen(false); setSearchQuery('') }}
                          className="text-[10px] bg-cream-100 hover:bg-olive-100 text-espresso-600 px-2 py-0.5 rounded-full transition-colors">
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </form>
              )}
            </div>

            <button
              onClick={onCartClick}
              className={`relative p-2.5 text-espresso-500 hover:bg-olive-50 rounded-xl transition-colors ${cartBump ? 'cart-bump' : ''}`}
            >
              <FaShoppingBag size={17} />
              {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] bg-olive-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1 cart-badge-bump">
                  {count}
                </span>
              )}
            </button>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2.5 text-espresso-500 hover:bg-olive-50 rounded-xl transition-colors"
            >
              {mobileOpen ? <BiX size={20} /> : <BiMenu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" onClick={() => setMobileOpen(false)}>
          <div
            className="absolute top-14 left-0 right-0 bg-white border-b border-cream-200 shadow-xl animate-fade-in"
            onClick={e => e.stopPropagation()}
          >
            <nav className="py-2">
              {navLinks.map(l => (
                <Link
                  key={l.path}
                  to={l.path}
                  onClick={() => setMobileOpen(false)}
                  className={clsx(
                    'block px-6 py-3.5 text-[15px] font-medium transition-colors',
                    isActive(l.path)
                      ? 'text-olive-700 bg-olive-50 border-l-[3px] border-olive-600'
                      : 'text-espresso-600 hover:bg-cream-50 border-l-[3px] border-transparent'
                  )}
                >
                  {l.label}
                </Link>
              ))}
            </nav>

            <div className="border-t border-cream-200 px-6 py-4">
              {!clienteActual ? (
                <Link
                  to={RoutesPath.clientLogin}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-3 bg-olive-600 hover:bg-olive-700 text-white text-sm font-semibold rounded-xl transition-all shadow-sm"
                >
                  <FaUser size={13} />
                  Iniciar sesión
                </Link>
              ) : (
                <div className="space-y-2">
                  <Link
                    to={RoutesPath.clientPanel}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-espresso-600 hover:bg-olive-50 transition-colors"
                  >
                    <div className="w-8 h-8 bg-olive-100 rounded-lg flex items-center justify-center">
                      <FaUser size={12} className="text-olive-600" />
                    </div>
                    Mi cuenta
                  </Link>
                  <button
                    onClick={() => { logout(); setMobileOpen(false); navigate(RoutesPath.home); }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <FaSignOutAlt size={14} />
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>

            <div className="border-t border-cream-200 px-6 py-3 bg-cream-50/50">
              <p className="text-[10px] text-steel uppercase tracking-widest">Horario</p>
              <p className="text-xs text-espresso-700 font-medium mt-0.5">{`${config.horarioApertura} - ${config.horarioCierre}`}</p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
