import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useProductStore } from '../../../store/useProductStore'
import { ProductCard } from '../../../components/ui/ProductCard'
import { useScrollAnimate } from '@/hooks/useScrollAnimate'

export default function FeaturedItems() {
  const allProducts = useProductStore((s) => s.productos)
  useEffect(() => { useProductStore.getState().loadProductos() }, [])
  const items = allProducts.filter((p) => p.destacado || p.masVendido).slice(0, 6)
  const { ref, isVisible } = useScrollAnimate(0.1)

  if (!items.length) return null

  return (
    <section className="py-20 md:py-24 px-6">
      <div className="max-w-content mx-auto" ref={ref}>
        <div className={`flex items-end justify-between gap-4 mb-10 ${isVisible ? 'animate-fade-in' : 'opacity-0'}`}>
          <div>
            <p className="kicker text-olive-500 mb-2">Lo más popular</p>
            <h2 className="font-display font-bold text-espresso-800 text-3xl md:text-4xl display-balance">Destacados de la casa</h2>
            <p className="text-steel text-sm mt-2">Los favoritos de nuestros clientes</p>
          </div>
          <Link to="/menu" className="hidden sm:inline-flex items-center gap-2 text-sm font-semibold text-olive-500 hover:text-olive-600 transition-colors group shrink-0">
            Ver todo <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-5 md:gap-7">
          {items.map((item, i) => (
            <div key={item.id} className={isVisible ? 'animate-fade-in' : 'opacity-0'} style={{ transitionDelay: `${Math.min(i * 80, 400)}ms` }}>
              <ProductCard {...item} id={item.id} />
            </div>
          ))}
        </div>
        <div className="mt-10 text-center sm:hidden">
          <Link to="/menu" className="inline-flex items-center gap-2 btn-primary text-sm">
            Ver todo el menú <span>→</span>
          </Link>
        </div>
      </div>
    </section>
  )
}
