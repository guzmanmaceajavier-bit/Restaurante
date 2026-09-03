import { Link } from 'react-router-dom'
import menuData from '../../mockData/mock_data.json'
import { ProductCard } from '../../components/core/ProductCard'

export default function FeaturedItems() {
  const items = menuData.filter((p: any) => p.destacado).slice(0, 4)

  if (!items.length) return null

  return (
    <section className="py-20 px-6">
      <div className="max-w-content mx-auto">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-ink">Destacados</h2>
            <p className="text-steel mt-2">Lo más popular de nuestra cocina</p>
          </div>
          <Link to="/menu" className="hidden sm:block text-sm font-medium text-brick-500 hover:text-brick-600 transition-colors">
            Ver todo →
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {items.map((item, i) => (
            <ProductCard key={item.nombre} {...item} id={String(i)} />
          ))}
        </div>
        <div className="mt-8 text-center sm:hidden">
          <Link to="/menu" className="text-sm font-medium text-brick-500">Ver todo el menú →</Link>
        </div>
      </div>
    </section>
  )
}
