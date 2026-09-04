import { Link } from 'react-router-dom'
import { dataService } from '../../lib/dataService'
import { ProductCard } from '../../components/core/ProductCard'
import { useScrollAnimate } from '@/hooks/useScrollAnimate'

export default function FeaturedItems() {
  const allProducts = dataService.getProductos()
  const items = allProducts.filter((p) => p.destacado || p.masVendido).slice(0, 6)
  const { ref, isVisible } = useScrollAnimate(0.1)

  if (!items.length) return null

  const tripled = [...items, ...items, ...items]

  return (
    <section className="py-20 px-6 overflow-hidden">
      <div className="max-w-content mx-auto" ref={ref}>
        <div className={`flex items-end justify-between mb-10 ${isVisible ? 'animate-fade-in' : 'opacity-0'}`}>
          <div>
            <span className="text-olive-500 font-semibold text-sm tracking-[0.15em] uppercase">Lo más popular</span>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-espresso-800 mt-2">Destacados</h2>
            <p className="text-steel text-sm mt-1">Los favoritos de nuestros clientes</p>
          </div>
          <Link to="/menu" className="hidden sm:flex items-center gap-2 text-sm font-semibold text-olive-500 hover:text-olive-600 transition-colors group">
            Ver todo <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>
      </div>

      <div className="relative group/slider">
        <div className="flex animate-marquee group-hover/slider:[animation-play-state:paused] w-max">
          {tripled.map((item, i) => (
            <div key={`${item.id}-${i}`} className="w-[280px] mx-2.5 shrink-0">
              <ProductCard {...item} id={item.id} />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 text-center sm:hidden">
        <Link to="/menu" className="inline-flex items-center gap-2 btn-primary text-sm">
          Ver todo el menú <span>→</span>
        </Link>
      </div>
    </section>
  )
}
