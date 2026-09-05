import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
import { getRestaurantConfig } from '../lib/config'
import { FaArrowLeft, FaShoppingBag, FaSignOutAlt } from 'react-icons/fa'
import { useCartStore } from '../store/useCartStore'

export default function ClientLayout() {
  const { clienteActual, logout } = useAuthStore()
  const navigate = useNavigate()
  const count = useCartStore((s) => s.count)
  const config = getRestaurantConfig()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-cream-50 dark:bg-[#1a1f16] flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white dark:bg-[#1e2518] border-b border-cream-200 dark:border-[#2d3523]">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="p-2 hover:bg-cream-100 dark:hover:bg-[#252e1e] rounded-xl transition-colors">
              <FaArrowLeft size={16} className="text-espresso-600 dark:text-cream-400" />
            </Link>
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-olive-500 rounded-lg flex items-center justify-center text-white font-bold text-xs">
                {config.nombre.charAt(0)}
              </div>
              <span className="text-sm font-display font-bold text-espresso-800 dark:text-cream-200 hidden sm:inline">
                {config.nombre}
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Link to="/menu" className="relative p-2 hover:bg-cream-100 dark:hover:bg-[#252e1e] rounded-xl transition-colors">
              <FaShoppingBag size={16} className="text-espresso-600 dark:text-cream-400" />
              {count > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-olive-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {count}
                </span>
              )}
            </Link>
            {clienteActual ? (
              <button onClick={handleLogout} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors" title="Cerrar sesión">
                <FaSignOutAlt size={16} className="text-steel dark:text-cream-400" />
              </button>
            ) : (
              <Link to="/login" className="px-3 py-1.5 bg-olive-500 hover:bg-olive-600 text-white text-xs font-semibold rounded-xl transition-colors">
                Iniciar sesión
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}
