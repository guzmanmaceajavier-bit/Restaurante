import { useState, useEffect, useMemo, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { dataService } from '../../lib/dataService'
import { ProductCard } from '../core/ProductCard'
import { FaSearch, FaSlidersH, FaTimes } from 'react-icons/fa'
import { useScrollAnimate } from '@/hooks/useScrollAnimate'
import { useLoading } from '@/hooks/useLoading'
import { MenuSkeleton } from '../core/LoadingSkeleton'
import clsx from 'clsx'

const ITEMS_PER_PAGE = 8

const priceRanges = [
  { label: 'Todos', min: 0, max: Infinity },
  { label: 'Menos de $20.000', min: 0, max: 20000 },
  { label: '$20.000 - $40.000', min: 20000, max: 40000 },
  { label: 'Más de $40.000', min: 40000, max: Infinity },
]

const timeRanges = [
  { label: 'Todos', min: 0, max: Infinity },
  { label: 'Rápido (< 15 min)', min: 0, max: 15 },
  { label: '15-30 min', min: 15, max: 30 },
  { label: 'Más de 30 min', min: 30, max: Infinity },
]

export function ProductsSection() {
  const [searchParams] = useSearchParams()
  const categoriaUrl = searchParams.get('categoria')
  const buscarUrl = searchParams.get('buscar')
  const allProducts = dataService.getProductos()
  const searchInputRef = useRef<HTMLInputElement>(null)
  const loading = useLoading(400)

  if (loading) return <MenuSkeleton />

  const categorias = useMemo(
    () => ['Todos', ...Array.from(new Set(allProducts.map((item) => item.categoría || 'Otros')))],
    [allProducts]
  )

  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string>(categoriaUrl || 'Todos')
  const [busqueda, setBusqueda] = useState(buscarUrl || '')
  const [paginaActual, setPaginaActual] = useState(1)
  const [showFilters, setShowFilters] = useState(false)
  const [searchExpanded, setSearchExpanded] = useState(!!buscarUrl)
  const [priceRange, setPriceRange] = useState(0)
  const [timeRange, setTimeRange] = useState(0)
  const [maxPicante, setMaxPicante] = useState(3)
  const { ref, isVisible } = useScrollAnimate(0.05)

  useEffect(() => { if (categoriaUrl) setCategoriaSeleccionada(categoriaUrl) }, [categoriaUrl])
  useEffect(() => { if (buscarUrl) { setBusqueda(buscarUrl); setSearchExpanded(true) } }, [buscarUrl])
  useEffect(() => { setPaginaActual(1) }, [categoriaSeleccionada, busqueda, priceRange, timeRange, maxPicante])

  useEffect(() => {
    if (searchExpanded && searchInputRef.current) searchInputRef.current.focus()
  }, [searchExpanded])

  const searchSuggestions = useMemo(() => {
    if (!busqueda.trim() || busqueda.length < 2) return []
    const q = busqueda.toLowerCase().trim()
    return allProducts
      .filter(p => p.nombre.toLowerCase().includes(q) || p.descripcion?.toLowerCase().includes(q))
      .slice(0, 6)
  }, [busqueda, allProducts])

  const productosFiltrados = useMemo(() => {
    let filtrados = allProducts
    if (categoriaSeleccionada !== 'Todos') filtrados = filtrados.filter((item) => item.categoría === categoriaSeleccionada)
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase().trim()
      filtrados = filtrados.filter((item) => item.nombre.toLowerCase().includes(q) || item.descripcion?.toLowerCase().includes(q))
    }
    const pr = priceRanges[priceRange]
    filtrados = filtrados.filter((item) => (item.precio ?? 0) >= pr.min && (item.precio ?? 0) < pr.max)
    const tr = timeRanges[timeRange]
    filtrados = filtrados.filter((item) => (item.tiempoPreparacion ?? 0) >= tr.min && (item.tiempoPreparacion ?? 0) < tr.max)
    filtrados = filtrados.filter((item) => (item.picante ?? 0) <= maxPicante)
    return filtrados
  }, [categoriaSeleccionada, busqueda, allProducts, priceRange, timeRange, maxPicante])

  const totalPaginas = Math.ceil(productosFiltrados.length / ITEMS_PER_PAGE)
  const productosPagina = productosFiltrados.slice((paginaActual - 1) * ITEMS_PER_PAGE, paginaActual * ITEMS_PER_PAGE)
  const hasActiveFilters = priceRange > 0 || timeRange > 0 || maxPicante < 3

  return (
    <section className="py-12 px-6" ref={ref}>
      <div className="max-w-content mx-auto">
        {/* Search icon / expanded bar */}
        <div className={`mb-8 ${isVisible ? 'animate-fade-in' : 'opacity-0'}`}>
          <div className="relative max-w-xl mx-auto">
            {!searchExpanded ? (
              <div className="flex justify-center">
                <button onClick={() => setSearchExpanded(true)}
                  className="flex items-center gap-3 bg-white rounded-2xl border-2 border-cream-200 px-6 py-3.5 hover:border-olive-300 hover:shadow-md transition-all duration-300 group">
                  <FaSearch size={18} className="text-olive-500 group-hover:scale-110 transition-transform" />
                  <span className="text-sm text-steel">Buscar platos, ingredientes...</span>
                </button>
              </div>
            ) : (
              <div className="animate-fade-in">
                <div className="flex items-center gap-3 bg-white rounded-2xl border-2 border-olive-400 shadow-lg shadow-olive-500/10 px-5 py-3.5">
                  <FaSearch size={18} className="text-olive-500 shrink-0" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    placeholder="Buscar platos, ingredientes..."
                    className="flex-1 bg-transparent text-sm text-espresso-800 placeholder:text-steel/50 outline-none"
                  />
                  {busqueda && (
                    <button onClick={() => setBusqueda('')} className="text-steel hover:text-espresso-600 transition-colors">
                      <FaTimes size={14} />
                    </button>
                  )}
                  <button onClick={() => { setSearchExpanded(false); setBusqueda('') }}
                    className="text-steel hover:text-espresso-600 text-xs font-medium ml-1">
                    Cerrar
                  </button>
                </div>

                {/* Live results */}
                {searchSuggestions.length > 0 && (
                  <div className="mt-2 bg-white rounded-2xl shadow-lift border border-cream-200 overflow-hidden">
                    {searchSuggestions.map(p => (
                      <button key={p.id}
                        onClick={() => { setBusqueda(p.nombre); setSearchExpanded(false) }}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-cream-50 transition-colors text-left border-b border-cream-100 last:border-0">
                        <img src={p.imagen} alt="" className="w-10 h-10 rounded-lg object-cover" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-espresso-800 truncate">{p.nombre}</p>
                          <p className="text-xs text-steel truncate">{p.descripcion}</p>
                        </div>
                        <span className="text-sm font-bold text-olive-600 shrink-0">${(p.precio ?? 0).toLocaleString('es-CO')}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Quick suggestions */}
                {!busqueda && (
                  <div className="mt-3 flex flex-wrap gap-2 justify-center">
                    {['Bandeja paisa', 'Arepa', 'Limonada', 'Seco', 'Patacones'].map(s => (
                      <button key={s} onClick={() => { setBusqueda(s); setSearchExpanded(false) }}
                        className="text-xs bg-cream-100 hover:bg-olive-100 text-espresso-600 px-3 py-1.5 rounded-full transition-colors">
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Filter toggle */}
        <div className="flex justify-end mb-4">
          <button onClick={() => setShowFilters(!showFilters)}
            className={clsx('flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all border',
              showFilters || hasActiveFilters ? 'bg-olive-500 text-white border-olive-500' : 'bg-white text-espresso-600 border-cream-200 hover:border-olive-300')}>
            <FaSlidersH size={14} /> Filtros {hasActiveFilters && '(activos)'}
          </button>
        </div>

        {/* Advanced filters */}
        {showFilters && (
          <div className="mb-8 bg-white rounded-2xl border border-cream-200 p-6 shadow-sm animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-espresso-800">Filtros avanzados</h3>
              {hasActiveFilters && (
                <button onClick={() => { setPriceRange(0); setTimeRange(0); setMaxPicante(3) }}
                  className="text-xs text-olive-500 hover:text-olive-600 font-medium">Limpiar todo</button>
              )}
            </div>
            <div className="grid sm:grid-cols-3 gap-5">
              <div>
                <label className="text-xs font-semibold text-espresso-700 mb-2 block">Precio</label>
                <div className="flex flex-wrap gap-1.5">
                  {priceRanges.map((r, i) => (
                    <button key={r.label} onClick={() => setPriceRange(i)}
                      className={clsx('text-[11px] px-3 py-1.5 rounded-full border transition-all font-medium',
                        priceRange === i ? 'bg-olive-500 text-white border-olive-500' : 'border-cream-200 text-espresso-600 hover:border-olive-300')}>
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-espresso-700 mb-2 block">Tiempo</label>
                <div className="flex flex-wrap gap-1.5">
                  {timeRanges.map((r, i) => (
                    <button key={r.label} onClick={() => setTimeRange(i)}
                      className={clsx('text-[11px] px-3 py-1.5 rounded-full border transition-all font-medium',
                        timeRange === i ? 'bg-olive-500 text-white border-olive-500' : 'border-cream-200 text-espresso-600 hover:border-olive-300')}>
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-espresso-700 mb-2 block">Picante (máx {maxPicante} 🌶️)</label>
                <input type="range" min={0} max={3} value={maxPicante} onChange={(e) => setMaxPicante(Number(e.target.value))}
                  className="w-full accent-olive-500" />
              </div>
            </div>
          </div>
        )}

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-8 pb-2">
          {categorias.map((cat) => (
            <button key={cat} onClick={() => setCategoriaSeleccionada(cat)}
              className={clsx('px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 shrink-0',
                categoriaSeleccionada === cat ? 'bg-olive-500 text-white shadow-md shadow-olive-500/20' : 'bg-white text-espresso-600 border border-cream-200 hover:border-olive-300 hover:text-olive-600')}>
              {cat}
            </button>
          ))}
        </div>

        {/* Results */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-steel">{productosFiltrados.length} plato{productosFiltrados.length !== 1 ? 's' : ''}</p>
          {hasActiveFilters && <span className="text-xs text-olive-600 flex items-center gap-1"><span className="w-2 h-2 bg-olive-500 rounded-full" /> Filtros activos</span>}
        </div>

        {/* Products grid */}
        {productosPagina.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {productosPagina.map((p, i) => (
              <div key={p.id || p.nombre || i} className={isVisible ? 'animate-fade-in' : 'opacity-0'} style={{ transitionDelay: `${Math.min(i * 60, 480)}ms` }}>
                <ProductCard {...p} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-cream-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <FaSearch className="text-steel/30" size={28} />
            </div>
            <p className="text-espresso-800 font-display font-bold text-lg">No encontramos resultados</p>
            <p className="text-sm text-steel mt-1">Intenta con otros filtros</p>
            <button onClick={() => { setBusqueda(''); setCategoriaSeleccionada('Todos'); setPriceRange(0); setTimeRange(0); setMaxPicante(3) }}
              className="btn-primary text-sm mt-4 py-2.5 px-6">Limpiar filtros</button>
          </div>
        )}

        {/* Pagination */}
        {totalPaginas > 1 && (
          <div className="flex justify-center gap-2 mt-10">
            {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(page => (
              <button key={page} onClick={() => { setPaginaActual(page); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                className={clsx('w-10 h-10 rounded-xl text-sm font-medium transition-all duration-200',
                  paginaActual === page ? 'bg-olive-500 text-white shadow-md shadow-olive-500/20' : 'bg-white text-espresso-600 border border-cream-200 hover:border-olive-300')}>
                {page}
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
