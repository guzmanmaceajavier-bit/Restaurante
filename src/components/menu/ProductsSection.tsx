import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import menuData from '../../mockData/mock_data.json'
import { ProductCard } from '../core/ProductCard'
import { FaSearch } from 'react-icons/fa'

export function ProductsSection() {
  const [searchParams] = useSearchParams()
  const categoriaUrl = searchParams.get('categoria')

  const categorias = useMemo(
    () => Array.from(new Set(menuData.map((item) => item.categoría || 'Otros'))),
    []
  )

  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string>(
    categoriaUrl || 'Todos'
  )
  const [busqueda, setBusqueda] = useState('')
  const [isFading, setIsFading] = useState(false)

  useEffect(() => {
    if (categoriaUrl) setCategoriaSeleccionada(categoriaUrl)
  }, [categoriaUrl])

  const productosFiltrados = useMemo(() => {
    let filtrados = menuData
    if (categoriaSeleccionada !== 'Todos') {
      filtrados = filtrados.filter((item) => item.categoría === categoriaSeleccionada)
    }
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase().trim()
      filtrados = filtrados.filter(
        (item) =>
          item.nombre.toLowerCase().includes(q) ||
          item.descripcion.toLowerCase().includes(q)
      )
    }
    return filtrados
  }, [categoriaSeleccionada, busqueda])

  return (
    <section className="py-10 px-6 max-w-content mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-ink">Nuestro Menú</h2>
        <p className="text-steel text-sm md:text-base mt-1">
          Explora nuestras deliciosas opciones disponibles
        </p>
      </div>

      <div className="max-w-md mx-auto mb-8 relative">
        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-steel" />
        <input
          type="text"
          placeholder="Buscar platos..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-xl border border-smoke focus:ring-2 focus:ring-brick-500/30 focus:border-brick-500 outline-none bg-white text-ink placeholder:text-steel/50 transition-all"
        />
        {busqueda && (
          <button
            onClick={() => setBusqueda('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-steel hover:text-ink"
          >
            ✕
          </button>
        )}
      </div>

      <div className="flex flex-wrap justify-center gap-3 mb-10">
        <button
          onClick={() => setCategoriaSeleccionada('Todos')}
          className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
            categoriaSeleccionada === 'Todos'
              ? 'bg-brick-500 text-white shadow-md shadow-brick-500/30'
              : 'bg-smoke text-steel hover:bg-smoke/80'
          }`}
        >
          Todos
        </button>
        {categorias.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoriaSeleccionada(cat)}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
              categoriaSeleccionada === cat
                ? 'bg-brick-500 text-white shadow-md shadow-brick-500/30'
                : 'bg-smoke text-steel hover:bg-smoke/80'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid content-center justify-items-center gap-5 w-full sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 transition-all duration-500">
        {productosFiltrados.length > 0 ? (
          productosFiltrados.map((item) => (
            <ProductCard key={item.nombre} {...item} id={item.nombre} stock={item.stock} />
          ))
        ) : (
          <p className="text-steel text-center col-span-full py-12">
            {busqueda ? `No encontramos "${busqueda}" en esta categoría` : 'No hay productos en esta categoría.'}
          </p>
        )}
      </div>
    </section>
  )
}
