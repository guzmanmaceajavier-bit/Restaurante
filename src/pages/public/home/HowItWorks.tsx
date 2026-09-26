import { useState } from 'react'
import { FaUtensils, FaCheckCircle, FaRocket, FaHeart } from 'react-icons/fa'
import { useScrollAnimate } from '@/hooks/useScrollAnimate'

const steps = [
  { icon: FaUtensils, num: '01', title: 'Explora', desc: 'Navega nuestro menú y encuentra tu plato favorito entre más de 30 opciones.' },
  { icon: FaCheckCircle, num: '02', title: 'Elige', desc: 'Personaliza tu pedido: adicionales, cantidad, tipo de entrega o recogida.' },
  { icon: FaRocket, num: '03', title: 'Recibe', desc: 'Preparamos tu pedido con cariño y te lo llevamos o lo tienes listo para recoger.' },
  { icon: FaHeart, num: '04', title: 'Disfruta', desc: 'Saborea la tradición colombiana en cada bocado. ¡Repite cuando quieras!' },
]

export default function HowItWorks() {
  const { ref, isVisible } = useScrollAnimate(0.1)
  const [active, setActive] = useState<number | null>(null)

  return (
    <section className="py-20 px-6 bg-cream-100">
      <div className="max-w-content mx-auto" ref={ref}>
        <div className={`text-center mb-12 ${isVisible ? 'animate-fade-in' : 'opacity-0'}`}>
          <span className="text-olive-500 font-semibold text-sm tracking-[0.15em] uppercase">Fácil y rápido</span>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-espresso-800 mt-2">
            ¿Cómo funciona?
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          <div className="hidden lg:block absolute top-12 left-[12%] right-[12%] h-px bg-gradient-to-r from-olive-200 via-olive-400 to-olive-200" />
          {steps.map((s, i) => (
            <div
              key={s.num}
              className={`relative text-center cursor-pointer ${isVisible ? 'animate-fade-in' : 'opacity-0'}`}
              style={{ transitionDelay: `${i * 120}ms` }}
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive(null)}
              onClick={() => setActive(active === i ? null : i)}
            >
              <div className="relative inline-flex mb-5">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                  active === i
                    ? 'bg-olive-600 shadow-lg shadow-olive-500/40 scale-110'
                    : 'bg-olive-500 shadow-lg shadow-olive-500/20'
                }`}>
                  <s.icon className="text-white" size={20} />
                </div>
                <span className={`absolute -top-1.5 -right-1.5 w-6 h-6 text-white text-[10px] font-bold rounded-full flex items-center justify-center transition-all duration-300 ${
                  active === i ? 'bg-gold-400 text-espresso-900 scale-125' : 'bg-espresso-800'
                }`}>
                  {s.num}
                </span>
              </div>
              <h3 className={`text-base font-display font-bold mb-1.5 transition-colors duration-300 ${
                active === i ? 'text-olive-700' : 'text-espresso-800'
              }`}>{s.title}</h3>
              <p className={`text-xs leading-relaxed max-w-xs mx-auto transition-all duration-300 ${
                active === i ? 'text-espresso-600 max-h-20 opacity-100' : 'text-steel max-h-10 opacity-70'
              }`}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
