import { Link } from 'react-router-dom'
import { useScrollAnimate } from '@/hooks/useScrollAnimate'

export default function Hero() {
  const { ref, isVisible } = useScrollAnimate(0.1)

  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden">
      <img
        src="/platos/bandeja_paisa.webp"
        alt="Bandeja paisa tradicional"
        className="absolute inset-0 w-full h-full object-cover hero-zoom"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-espresso-900/85 via-espresso-900/60 to-olive-900/50" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

      <div ref={ref} className={`relative max-w-content mx-auto px-6 w-full py-24 ${isVisible ? 'animate-slide-up' : 'opacity-0'}`}>
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/15 rounded-full px-4 py-1.5 mb-5">
            <span className="w-2 h-2 bg-gold-400 rounded-full animate-pulse" />
            <span className="text-white/90 text-xs font-medium">Restaurante colombiano · Sahagún, Córdoba</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-display font-bold text-white leading-[1.1] mb-5">
            Tradición que se <span className="text-gold-400">sabe</span> en cada plato
          </h1>

          <p className="text-base md:text-lg text-white/60 mb-8 leading-relaxed max-w-lg">
            Ingredientes frescos del campo, recetas que han pasado de generación en generación, y un ambiente que te hace sentir en casa.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link to="/menu" className="group bg-olive-500 hover:bg-olive-600 text-white px-7 py-3.5 rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-olive-500/30 hover:shadow-xl hover:shadow-olive-500/40 flex items-center gap-2">
              Explorar menú
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
            <Link to="/reservas" className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-7 py-3.5 rounded-xl font-semibold transition-all duration-300 backdrop-blur-sm">
              Reservar mesa
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
