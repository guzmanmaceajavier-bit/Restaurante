import { Link } from 'react-router-dom'

const categories = [
  { name: 'Platos fuertes', slug: 'Plato fuerte', image: '/platos/bandeja_paisa.webp', desc: 'Sazón colombiana tradicional', overlay: 'from-olive-900/80 via-olive-900/20' },
  { name: 'Entradas', slug: 'Entrada', image: '/platos/empanadas_rellenas.webp', desc: 'Para compartir y empezar', overlay: 'from-amber-900/80 via-amber-900/20' },
  { name: 'Postres', slug: 'Postres', image: '/platos/torta_tres_leches.webp', desc: 'Dulce tentación casera', overlay: 'from-rose-900/80 via-rose-900/20' },
  { name: 'Bebidas', slug: 'Bebidas', image: '/platos/limonada_de_coco.webp', desc: 'Frescas y naturales', overlay: 'from-cyan-900/80 via-cyan-900/20' },
]

const allCategories = [...categories, ...categories, ...categories]

export default function Categories() {
  return (
    <section className="py-16 overflow-hidden">
      <div className="max-w-content mx-auto px-6 mb-8">
        <span className="text-olive-500 font-semibold text-sm tracking-[0.15em] uppercase">Nuestro menú</span>
        <h2 className="text-3xl md:text-4xl font-display font-bold text-espresso-800 mt-2">
          Explora por categoría
        </h2>
      </div>

      <div className="relative group/slider">
        <div className="flex animate-marquee group-hover/slider:[animation-play-state:paused] w-max">
          {allCategories.map((cat, i) => (
            <Link
              key={`${cat.slug}-${i}`}
              to={`/menu?categoria=${encodeURIComponent(cat.slug)}`}
              className="group relative w-[260px] h-[340px] mx-3 overflow-hidden rounded-2xl bg-white shadow-card hover:shadow-lift transition-all duration-300 shrink-0"
            >
              <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              <div className={`absolute inset-0 bg-gradient-to-t ${cat.overlay} to-transparent`} />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <h3 className="text-lg font-display font-bold text-white">{cat.name}</h3>
                <p className="text-xs text-white/60 mt-0.5">{cat.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="text-center mt-8">
        <Link to="/menu" className="inline-flex items-center gap-2 btn-primary text-sm">
          Ver todo el menú <span>→</span>
        </Link>
      </div>
    </section>
  )
}
