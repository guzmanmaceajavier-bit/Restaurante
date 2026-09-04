import { FaLeaf, FaHeart, FaStar, FaUsers } from 'react-icons/fa'
import { useScrollAnimate } from '@/hooks/useScrollAnimate'

const features = [
  { icon: FaLeaf, title: 'Ingredientes frescos', desc: 'Directo del campo a tu mesa. Seleccionamos cada ingrediente con cuidado.' },
  { icon: FaHeart, title: 'Recetas de siempre', desc: 'Platos que han pasado de generación en generación, manteniendo la esencia.' },
  { icon: FaStar, title: 'Calidad garantizada', desc: '4.8 estrellas en Google. Nuestros clientes son nuestra mejor carta.' },
  { icon: FaUsers, title: 'Ambiente familiar', desc: 'Un espacio cálido donde cada visita se siente como volver a casa.' },
]

export default function Experience() {
  const { ref, isVisible } = useScrollAnimate(0.1)

  return (
    <section className="py-20 px-6 bg-olive-500 text-white overflow-hidden">
      <div className="max-w-content mx-auto" ref={ref}>
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className={`${isVisible ? 'animate-fade-in' : 'opacity-0'}`}>
            <span className="text-olive-200 font-semibold text-sm tracking-[0.15em] uppercase">La experiencia</span>
            <h2 className="text-3xl md:text-4xl font-display font-bold mt-3 mb-5">
              Más que comida,<br />
              <span className="text-gold-400">una experiencia</span>
            </h2>
            <p className="text-white/60 leading-relaxed mb-8 max-w-md text-sm">
              En Sabor y Origen no solo servimos platos — servimos momentos. Cada detalle está pensado para que tu visita sea inolvidable.
            </p>
            <div className="grid grid-cols-2 gap-5">
              {features.map((f, i) => (
                <div key={f.title} className={`flex items-start gap-3 ${isVisible ? 'animate-fade-in' : 'opacity-0'}`} style={{ transitionDelay: `${(i + 2) * 100}ms` }}>
                  <div className="w-9 h-9 bg-white/15 rounded-xl flex items-center justify-center shrink-0">
                    <f.icon className="text-gold-400" size={16} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-0.5">{f.title}</h4>
                    <p className="text-xs text-white/50 leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className={`relative ${isVisible ? 'animate-fade-in' : 'opacity-0'}`} style={{ transitionDelay: '200ms' }}>
            <div className="relative rounded-3xl overflow-hidden aspect-[4/5]">
              <img src="/platos/bandeja_paisa.webp" alt="Experiencia Sabor y Origen" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-olive-900/50 to-transparent" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
