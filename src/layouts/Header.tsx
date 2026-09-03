import { Link, useLocation } from 'react-router-dom'
import { RoutesPath } from '@/routes/routes'
import { FaShoppingBag } from 'react-icons/fa'
import { BiMenu, BiX } from 'react-icons/bi'
import { useState, useEffect } from 'react'
import clsx from 'clsx'

const links = [
  { label: 'Inicio', path: RoutesPath.home },
  { label: 'Menú', path: RoutesPath.menu },
  { label: 'Reservas', path: RoutesPath.reserve },
  { label: 'Contacto', path: RoutesPath.contact },
]

interface Props {
  cartCount: number
  onCartClick: () => void
}

export default function Header({ cartCount, onCartClick }: Props) {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  const isAdmin = pathname.startsWith('/admin')

  useEffect(() => { setOpen(false) }, [pathname])

  if (isAdmin) return null

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-ink shadow-lg">
      <div className="max-w-content mx-auto flex items-center justify-between px-6 h-16">
        <Link to={RoutesPath.home} className="text-xl font-serif font-bold text-white tracking-tight">
          Sabor y Origen
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {links.map(l => (
            <Link
              key={l.path}
              to={l.path}
              className={clsx(
                'px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200',
                pathname === l.path
                  ? 'text-white bg-white/15'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              )}
            >
              {l.label}
            </Link>
          ))}
          <div className="w-px h-5 bg-white/10 mx-2" />
          <button
            onClick={onCartClick}
            className="relative p-2.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200"
          >
            <FaShoppingBag size={17} />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-brick-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-sm">
                {cartCount}
              </span>
            )}
          </button>
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          <button onClick={onCartClick} className="relative p-2.5 text-white/70">
            <FaShoppingBag size={18} />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-brick-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
          <button onClick={() => setOpen(!open)} className="p-2.5 text-white/70 hover:text-white" aria-label="Menú">
            {open ? <BiX size={22} /> : <BiMenu size={22} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden bg-ink border-t border-white/10 animate-fade-in">
          <div className="px-6 py-3 space-y-1">
            {links.map(l => (
              <Link
                key={l.path}
                to={l.path}
                onClick={() => setOpen(false)}
                className={clsx(
                  'block py-2.5 px-3 rounded-lg text-sm font-medium transition-colors',
                  pathname === l.path ? 'text-white bg-white/15' : 'text-white/70 hover:text-white hover:bg-white/10'
                )}
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  )
}
