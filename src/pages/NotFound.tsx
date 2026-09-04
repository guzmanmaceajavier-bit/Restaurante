import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <section className="min-h-screen flex items-center justify-center bg-cream-50 px-6">
      <div className="text-center">
        <p className="text-7xl mb-6">🍽️</p>
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
