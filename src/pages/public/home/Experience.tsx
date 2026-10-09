import { Link } from 'react-router-dom'
import { FaLeaf, FaFire, FaUsers } from 'react-icons/fa'
import { useScrollAnimate } from '@/hooks/useScrollAnimate'

const chapters = [
  {
    index: '01',
    icon: FaLeaf,
    title: 'Nuestras raíces',
    desc: 'Nacimos en Sahagún, Córdoba, con las recetas de la abuela y el sazón que solo da la cocina hecha con paciencia.',
    image: '/platos/bandeja_paisa.webp',
    alt: 'Bandeja paisa tradicional',
  },
  {
    index: '02',
    icon: FaFire,
    title: 'Ingredientes del campo',
    desc: 'Del campo a tu mesa: seleccionamos cada ingrediente fresco, de productores locales, para que el sabor llegue intacto al plato.',
    image: '/platos/ajiaco.webp',
    alt: 'Ajiaco colombiano',
  },
  {
    index: '03',
    icon: FaUsers,
    title: 'La mesa que abraza',
    desc: 'Un espacio cálido donde cada visita se siente como volver a casa. Aquí no solo se come: se comparte y se celebra.',
    image: '/platos/carne_llanera.webp',
    alt: 'Carne a la llanera',
  },
]

export default function Experience() {
  const { ref, isVisible } = useScrollAnimate(0.1)

  return (
    <section className="py-20 md:py-28 px-6 bg-cream-50 overflow-hidden">
      <div className="max-w-content mx-auto" ref={ref}>
        <div className={`max-w-xl mb-12 md:mb-16 ${isVisible ? 'animate-fade-in' : 'opacity-0'}`}>
          <p className="kicker text-olive-500 mb-3">Nuestra historia</p>
          <h2 className="font-display font-bold text-espresso-800 text-4xl md:text-5xl display-balance">
            Más que comida, <em className="italic text-olive-600">una experiencia</em>
          </h2>
        </div>

        <div className="space-y-10 md:space-y-14">
          {chapters.map((c, i) => (
            <article
              key={c.index}
              className={`grid md:grid-cols-2 gap-6 md:gap-12 items-center ${isVisible ? 'animate-fade-in' : 'opacity-0'}`}
              style={{ transitionDelay: `${Math.min(i * 120, 360)}ms` }}
            >
              <div className={`relative rounded-[1.75rem] overflow-hidden aspect-[16/10] shadow-soft ${i % 2 === 1 ? 'md:order-2' : ''}`}>
                <img src={c.image} alt={c.alt} loading="lazy" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-espresso-900/35 via-transparent to-transparent" />
                <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-espresso-900/70 backdrop-blur-sm text-cream-100 text-[11px] font-bold tracking-widest">
                  {c.index}
                </span>
              </div>
              <div className={i % 2 === 1 ? 'md:order-1 md:text-right' : ''}>
                <div className={`w-11 h-11 rounded-2xl bg-olive-100 flex items-center justify-center mb-4 ${i % 2 === 1 ? 'md:ml-auto' : ''}`}>
                  <c.icon className="text-olive-600" size={18} />
                </div>
                <h3 className="font-display font-bold text-espresso-800 text-2xl md:text-[1.75rem] mb-2.5">{c.title}</h3>
                <p className={`text-steel leading-relaxed text-sm md:text-[15px] max-w-md ${i % 2 === 1 ? 'md:ml-auto' : ''}`}>{c.desc}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-12 md:mt-16 text-center">
          <Link to="/menu" className="group inline-flex items-center gap-2 bg-espresso-800 hover:bg-espresso-900 text-white px-8 py-3.5 rounded-full font-semibold transition-all duration-300 shadow-lg">
            Probar la historia
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>
      </div>
    </section>
  )
}
