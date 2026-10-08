import { Link } from 'react-router-dom'
import { FaStar, FaClock, FaUtensils } from 'react-icons/fa'
import { useScrollAnimate } from '@/hooks/useScrollAnimate'

export default function Hero() {
  const { ref, isVisible } = useScrollAnimate(0.1)

  return (
    <section className="relative min-h-[92vh] flex items-center overflow-hidden bg-espresso-900">
      <img
        src="/platos/bandeja_paisa.webp"
        alt="Bandeja paisa tradicional"
        className="absolute inset-0 w-full h-full object-cover hero-zoom"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-espresso-900/90 via-espresso-900/55 to-espresso-900/15" />
      <div className="absolute inset-0 bg-gradient-to-t from-espresso-900/70 via-transparent to-espresso-900/20" />

      <div ref={ref} className={`relative max-w-content mx-auto px-6 w-full py-28 ${isVisible ? 'animate-slide-up' : 'opacity-0'}`}>
        <div className="max-w-2xl">
          <p className="kicker text-gold-300 mb-5 flex items-center gap-3">
            <span className="inline-block w-8 h-px bg-gold-400" />
            Cocina colombiana · Sahagún, Córdoba
          </p>

          <h1 className="font-display font-bold text-white text-6xl md:text-7xl leading-[1.02] mb-6 display-balance">
            Tradición que se <em className="italic text-gold-300">sabe</em> en cada plato
          </h1>

          <p className="text-base md:text-lg text-white/70 mb-9 leading-relaxed max-w-lg">
            Ingredientes frescos del campo, recetas que han pasado de generación en generación, y un ambiente que te hace sentir en casa.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Link to="/menu" className="group bg-olive-500 hover:bg-olive-600 text-white px-8 py-3.5 rounded-full font-semibold transition-all duration-300 shadow-lg shadow-olive-500/30 hover:shadow-xl hover:shadow-olive-500/40 flex items-center gap-2">
              Explorar menú
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
            <Link to="/reservas" className="text-white/85 hover:text-white border-b border-white/30 hover:border-gold-300 pb-0.5 px-1 py-3.5 font-medium transition-all duration-300">
              Reservar mesa
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-10 text-white/60 text-xs">
            <span className="inline-flex items-center gap-1.5"><FaStar size={11} className="text-gold-400" /> 4.9 · 200+ reseñas</span>
            <span className="inline-flex items-center gap-1.5"><FaUtensils size={11} className="text-gold-400" /> 25 platos de la casa</span>
            <span className="inline-flex items-center gap-1.5"><FaClock size={11} className="text-gold-400" /> Hoy 10:00 – 22:00</span>
          </div>
        </div>
      </div>
    </section>
  )
}
