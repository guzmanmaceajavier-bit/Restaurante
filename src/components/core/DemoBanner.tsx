import { Link, useLocation } from 'react-router-dom'
import { FaRocket } from 'react-icons/fa'

export default function DemoBanner() {
  const location = useLocation()
  if (location.pathname === '/demo') return null

  return (
    <div className="bg-gradient-to-r from-olive-600 to-olive-700 text-white text-center py-2 px-4 text-xs font-medium sticky top-0 z-50 shadow-sm">
      <div className="flex items-center justify-center gap-2">
        <FaRocket size={10} />
        <span>Esta es una demo del sistema</span>
        <span className="text-white/40 mx-1">·</span>
        <Link to="/demo" className="underline underline-offset-2 hover:text-white/80 transition-colors">
          Explorar todas las interfaces
        </Link>
      </div>
    </div>
  )
}
