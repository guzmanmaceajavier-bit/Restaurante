import { Link } from 'react-router-dom'

const categories = [
  { name: 'Platos fuertes', slug: 'Plato fuerte', image: '/platos/bandeja_paisa.webp', count: 10 },
  { name: 'Entradas', slug: 'Entrada', image: '/platos/empanadas_rellenas.webp', count: 5 },
  { name: 'Postres', slug: 'Postres', image: '/platos/torta_tres_leches.webp', count: 5 },
  { name: 'Bebidas', slug: 'Bebidas', image: '/platos/limonada_de_coco.webp', count: 5 },
]

export default function Categories() {
  return (
    <section className="py-20 px-6 bg-warm">
      <div className="max-w-content mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-ink">Nuestro menú</h2>
          <p className="text-steel mt-3">Explora nuestras categorías</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map(cat => (
            <Link
              key={cat.slug}
              to={`/menu?categoria=${encodeURIComponent(cat.slug)}`}
              className="group relative aspect-square overflow-hidden rounded-2xl bg-white shadow-card hover:shadow-lift transition-all duration-500"
            >
              <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <h3 className="text-lg font-serif font-bold text-white">{cat.name}</h3>
                <p className="text-sm text-white/70">{cat.count} platos</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
