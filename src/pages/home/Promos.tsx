import { Link } from 'react-router-dom'
import { CONFIG } from '@/lib/config'
import { useScrollAnimate } from '@/hooks/useScrollAnimate'
import { FaTag, FaGift, FaPercent, FaArrowRight } from 'react-icons/fa'

const promoIcons = [FaTag, FaGift, FaPercent]

export default function Promos() {
  const vigentes = CONFIG.promociones.filter(p => p.vigente).slice(0, 3)
  const { ref, isVisible } = useScrollAnimate(0.1)

  if (!vigentes.length) return null

  return (
    <section className="py-20 px-6 bg-cream-50 overflow-hidden">
      <div className="max-w-content mx-auto" ref={ref}>
        <div className={`text-center mb-12 ${isVisible ? 'animate-fade-in' : 'opacity-0'}`}>
          <span className="text-olive-500 font-semibold text-sm tracking-[0.15em] uppercase">Ofertas especiales</span>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-espresso-800 mt-2">Promociones vigentes</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {vigentes.map((promo, i) => {
            const Icon = promoIcons[i % promoIcons.length]
            return (
              <div key={promo.id} className={`group relative bg-white rounded-2xl border border-cream-200 p-6 hover:shadow-lift hover:border-olive-200 transition-all duration-300 hover:-translate-y-1 ${isVisible ? 'animate-fade-in' : 'opacity-0'}`} style={{ transitionDelay: `${i * 100}ms` }}>
                <div className="absolute top-0 right-0 w-20 h-20 bg-olive-50 rounded-bl-[3rem] transition-all duration-300 group-hover:bg-olive-100" />
                <div className="relative">
                  <div className="w-12 h-12 bg-olive-100 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-olive-200 transition-colors">
                    <Icon className="text-olive-600" size={20} />
                  </div>
                  {promo.descuento > 0 && (
                    <span className="inline-block bg-gold-100 text-gold-700 px-3 py-1 rounded-full text-xs font-bold mb-3">
                      {promo.descuento}% OFF
                    </span>
                  )}
                  <h3 className="text-lg font-display font-bold text-espresso-800 mb-2">{promo.titulo}</h3>
                  <p className="text-sm text-steel leading-relaxed mb-4">{promo.descripcion}</p>
                  {promo.codigo && (
                    <div className="inline-flex items-center gap-2 bg-cream-100 border border-cream-200 px-4 py-2 rounded-xl">
                      <span className="text-xs text-steel">Código:</span>
                      <span className="font-mono font-bold text-olive-600">{promo.codigo}</span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
        <div className={`text-center mt-10 ${isVisible ? 'animate-fade-in' : 'opacity-0'}`} style={{ transitionDelay: '400ms' }}>
          <Link to="/promociones" className="inline-flex items-center gap-2 text-sm font-semibold text-olive-500 hover:text-olive-600 transition-colors group">
            Ver todas las promociones <FaArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  )
}
