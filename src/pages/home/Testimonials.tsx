import { FaStar, FaQuoteLeft } from 'react-icons/fa'
import { useScrollAnimate } from '@/hooks/useScrollAnimate'

const testimonials = [
  { name: 'María G.', text: 'La bandeja paisa es espectacular. Se siente como comer en casa de la abuela. El servicio es increíble.', rating: 5 },
  { name: 'Carlos R.', text: 'Reservé para el cumpleaños de mi hija y fue perfecto. Todo el equipo fue muy atento y la comida deliciosa.', rating: 5 },
  { name: 'Ana L.', text: 'Los patacones con todo son mi debilidad. Siempre voy con la familia y nunca nos decepcionan.', rating: 5 },
]

export default function Testimonials() {
  const { ref, isVisible } = useScrollAnimate(0.1)

  return (
    <section className="py-24 px-6">
      <div className="max-w-content mx-auto" ref={ref}>
        <div className={`text-center mb-14 ${isVisible ? 'animate-fade-in' : 'opacity-0'}`}>
          <span className="text-olive-500 font-semibold text-sm tracking-[0.15em] uppercase">Lo que dicen nuestros clientes</span>
          <h2 className="text-3xl md:text-5xl font-display font-bold text-espresso-800 mt-3">
            Reseñas reales
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div key={t.name} className={`card-base p-8 relative ${isVisible ? 'animate-fade-in' : 'opacity-0'}`} style={{ transitionDelay: `${i * 120}ms` }}>
              <FaQuoteLeft className="text-olive-200 text-3xl mb-4" />
              <p className="text-espresso-700 leading-relaxed mb-6 text-sm">{t.text}</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-espresso-800 text-sm">{t.name}</p>
                  <div className="flex gap-0.5 mt-1">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <FaStar key={j} className="text-gold-400" size={12} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
