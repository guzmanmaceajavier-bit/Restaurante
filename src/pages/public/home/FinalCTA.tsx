import { Link } from 'react-router-dom'
import { useScrollAnimate } from '@/hooks/useScrollAnimate'

export default function FinalCTA() {
  const { ref, isVisible } = useScrollAnimate(0.1)

  return (
    <section className="py-20 px-6 bg-olive-500 text-center text-white overflow-hidden relative" ref={ref}>
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 bg-gold-400 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-white rounded-full blur-3xl" />
      </div>
      <div className={`relative max-w-xl mx-auto ${isVisible ? 'animate-slide-up' : 'opacity-0'}`}>
        <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
          ¿Listo para disfrutar?
        </h2>
        <p className="text-white/60 mb-8 text-sm leading-relaxed">
          Haz tu pedido ahora o reserva una mesa. Te esperamos con los brazos abiertos.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link to="/menu" className="group bg-white hover:bg-cream-100 text-olive-700 px-8 py-3.5 rounded-xl font-semibold transition-all shadow-lg flex items-center gap-2">
            Pedir ahora
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>
          <Link to="/reservas" className="bg-white/15 hover:bg-white/25 text-white border border-white/20 px-8 py-3.5 rounded-xl font-semibold transition-all backdrop-blur-sm">
            Reservar mesa
          </Link>
        </div>
      </div>
    </section>
  )
}
