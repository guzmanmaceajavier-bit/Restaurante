import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useScrollAnimate } from '@/hooks/useScrollAnimate'

const chapters = [
  {
    index: '01',
    title: 'Nuestras raíces',
    desc: 'Nacimos en Sahagún, Córdoba, con las recetas de la abuela y el sazón que solo da la cocina hecha con paciencia. Cada plato cuenta de dónde venimos.',
    image: '/platos/bandeja_paisa.webp',
    alt: 'Bandeja paisa tradicional',
  },
  {
    index: '02',
    title: 'Ingredientes del campo',
    desc: 'Del campo a tu mesa: seleccionamos cada ingrediente fresco, de productores locales, para que el sabor llegue intacto al plato.',
    image: '/platos/ajiaco.webp',
    alt: 'Ajiaco colombiano',
  },
  {
    index: '03',
    title: 'La mesa que abraza',
    desc: 'Un espacio cálido donde cada visita se siente como volver a casa. Aquí no solo se come: se comparte, se celebra y se vuelve.',
    image: '/platos/carne_llanera.webp',
    alt: 'Carne a la llanera',
  },
]

export default function Experience() {
  const { ref, isVisible } = useScrollAnimate(0.1)
  const [active, setActive] = useState(0)
  const chapterRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = chapterRefs.current.indexOf(entry.target as HTMLDivElement)
            if (idx !== -1) setActive(idx)
          }
        })
      },
      { rootMargin: '-40% 0px -50% 0px' }
    )
    chapterRefs.current.forEach((el) => el && observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <section className="py-20 md:py-28 px-6 bg-cream-50 overflow-hidden">
      <div className="max-w-content mx-auto" ref={ref}>
        <div className={`max-w-xl mb-12 md:mb-16 ${isVisible ? 'animate-fade-in' : 'opacity-0'}`}>
          <p className="kicker text-olive-500 mb-3">Nuestra historia</p>
          <h2 className="font-display font-bold text-espresso-800 text-4xl md:text-5xl display-balance">
            Más que comida, <em className="italic text-olive-600">una experiencia</em>
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          {/* Sticky photo (desktop) */}
          <div className="lg:sticky lg:top-24">
            <div className="relative rounded-[2rem] overflow-hidden aspect-[4/5] max-h-[70vh] w-full shadow-soft">
              {chapters.map((c, i) => (
                <img
                  key={c.index}
                  src={c.image}
                  alt={c.alt}
                  loading="lazy"
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${i === active ? 'opacity-100' : 'opacity-0'}`}
                />
              ))}
              <div className="absolute inset-0 bg-gradient-to-t from-espresso-900/50 via-transparent to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 flex items-center gap-2">
                {chapters.map((c, i) => (
                  <span
                    key={c.index}
                    className={`h-1 rounded-full transition-all duration-500 ${i === active ? 'flex-1 bg-gold-400' : 'w-6 bg-white/30'}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Chapters */}
          <div className="flex flex-col">
            {chapters.map((c, i) => (
              <div
                key={c.index}
                ref={(el) => { chapterRefs.current[i] = el }}
                className={`py-10 md:py-16 border-b border-cream-200 last:border-0 transition-opacity duration-500 ${i === active ? 'opacity-100' : 'opacity-40'}`}
              >
                <p className={`font-display font-bold text-5xl md:text-6xl mb-4 transition-colors duration-500 ${i === active ? 'text-gold-400' : 'text-cream-300'}`}>
                  {c.index}
                </p>
                <h3 className="font-display font-bold text-espresso-800 text-2xl md:text-3xl mb-3">{c.title}</h3>
                <p className="text-steel leading-relaxed max-w-md">{c.desc}</p>
              </div>
            ))}
            <div className="pt-8">
              <Link to="/menu" className="group inline-flex items-center gap-2 bg-espresso-800 hover:bg-espresso-900 text-white px-7 py-3 rounded-full font-semibold transition-all duration-300">
                Probar la historia
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
