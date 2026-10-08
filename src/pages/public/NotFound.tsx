import { Link } from 'react-router-dom'
import { FaUtensils } from 'react-icons/fa'

export default function NotFound() {
  return (
    <section className="min-h-screen flex items-center justify-center bg-cream-50 px-6">
      <div className="text-center">
        <div className="w-20 h-20 bg-cream-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <FaUtensils className="text-steel/40" size={32} />
        </div>
        <h1 className="text-3xl font-display font-bold text-espresso-800 mb-3">Página no encontrada</h1>
        <p className="text-steel mb-8">Lo sentimos, lo que buscas no existe o fue movido.</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link to="/" className="btn-primary">
            Volver al inicio
          </Link>
          <Link to="/menu" className="btn-secondary">
            Ver menú
          </Link>
        </div>
      </div>
    </section>
  )
}
