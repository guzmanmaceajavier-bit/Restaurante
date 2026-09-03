import Hero from './home/Hero'
import Categories from './home/Categories'
import FeaturedItems from './home/FeaturedItems'
import { SEO } from '../lib/seo'
import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <>
      <SEO title="Inicio" description="Sabor y Origen - Comida colombiana tradicional" />
      <Hero />
      <Categories />
      <FeaturedItems />

      <section className="py-24 px-6 bg-ink text-center text-white">
        <div className="max-w-xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">¿Listo para disfrutar?</h2>
          <p className="text-white/60 mb-8">Haz tu pedido o reserva una mesa. Te esperamos.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/menu" className="bg-brick-500 hover:bg-brick-600 text-white px-8 py-3.5 rounded-xl font-semibold transition-all shadow-lg shadow-brick-500/30">Pedir ahora</Link>
            <Link to="/reservas" className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-8 py-3.5 rounded-xl font-semibold transition-all backdrop-blur-sm">Reservar mesa</Link>
          </div>
        </div>
      </section>
    </>
  )
}
