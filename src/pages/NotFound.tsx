import { Link } from 'react-router-dom'
import { SEO } from '../lib/seo'

export default function NotFound() {
  return (
    <>
      <SEO title="Página no encontrada" />
      <section className="pt-28 pb-20 px-6 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-8xl font-serif font-bold text-smoke mb-4">404</div>
          <h1 className="text-2xl font-serif font-bold text-ink mb-3">Página no encontrada</h1>
          <p className="text-steel mb-8">La página que buscas no existe o ha sido movida.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/"
              className="bg-brick-500 hover:bg-brick-600 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-brick-500/30"
            >
              Volver al inicio
            </Link>
            <Link
              to="/menu"
              className="bg-white text-brick-600 border border-smoke px-6 py-3 rounded-xl font-semibold hover:bg-warm transition-all"
            >
              Ver menú
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
