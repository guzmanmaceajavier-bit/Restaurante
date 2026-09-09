import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
import { getRestaurantConfig } from '../lib/config'
import { FaArrowLeft, FaShoppingBag, FaSignOutAlt, FaUser } from 'react-icons/fa'
import { useCartStore } from '../store/useCartStore'

export default function ClientLayout() {
  const { clienteActual, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const count = useCartStore((s) => s.count)
  const config = getRestaurantConfig()
  const isPortal = location.pathname === '/mi-cuenta'

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-[#FFFBF5] flex flex-col">
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#F1E9D8]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-[64px] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link to="/" className="w-8 h-8 rounded-full border border-[#E5E7EB] flex items-center justify-center hover:bg-[#F8FAFC] transition-colors">
              <FaArrowLeft size={12} className="text-[#475569]" />
            </Link>
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#667A22] to-[#4A5A18] flex items-center justify-center text-white font-display font-bold text-sm shadow-sm">
                {config.nombre.charAt(0)}
              </div>
              <div className="hidden sm:block leading-tight">
                <p className="text-sm font-display font-bold text-[#1C2A0F] tracking-tight">{config.nombre}</p>
                <p className="text-[11px] tracking-widest uppercase text-[#8A9A5B] font-medium">{config.slogan}</p>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Link to="/menu" className="relative w-9 h-9 rounded-full bg-[#F8FAFC] border border-[#E5E7EB] flex items-center justify-center hover:bg-white hover:border-[#CBD5E1] transition-colors">
              <FaShoppingBag size={14} className="text-[#475569]" />
              {count > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-[#667A22] text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                  {count}
                </span>
              )}
            </Link>
            {clienteActual ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-2 pl-2 pr-3 py-1 rounded-full bg-[#F8FAFC] border border-[#E5E7EB]">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#F5B51B] to-[#E09D0A] flex items-center justify-center text-white text-xs font-bold">
                    {clienteActual.nombre.charAt(0)}
                  </div>
                  <span className="text-sm font-medium text-[#1C2A0F] max-w-[120px] truncate">{clienteActual.nombre.split(' ')[0]}</span>
                </div>
                <button onClick={handleLogout} className="w-9 h-9 rounded-full border border-[#E5E7EB] flex items-center justify-center hover:bg-[#FEF2F2] hover:border-[#FECACA] hover:text-[#DC2626] text-[#64748B] transition-colors" title="Cerrar sesión">
                  <FaSignOutAlt size={13} />
                </button>
              </div>
            ) : (
              <Link to="/login" className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1C2A0F] text-white text-sm font-medium hover:bg-[#2A3D16] transition-colors">
                <FaUser size={11} /> Iniciar sesión
              </Link>
            )}
          </div>
        </div>
        {isPortal && <div className="h-px bg-gradient-to-r from-transparent via-[#F5B51B]/30 to-transparent" />}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-[#F1E9D8] bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#94A3B8]">
          <span>© {new Date().getFullYear()} {config.nombre} · {config.direccion}</span>
          <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" /> Atención {config.horarioApertura} – {config.horarioCierre}</span>
        </div>
      </footer>
    </div>
  )
}
