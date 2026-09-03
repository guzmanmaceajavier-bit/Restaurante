import { Link, useLocation } from 'react-router-dom'
import { RoutesPath } from '../../routes/routes'
import { TbShoppingBagPlus } from 'react-icons/tb'
import { useCartStore } from '../../store/useCartStore'
import type { IProduct } from '../../types/product'
import { numberFormatter } from '../../utils/numberFormatter'
import { toast } from 'sonner'
import { FaClock } from 'react-icons/fa'

interface IProps extends Partial<IProduct> {
  isFinal?: boolean
  id?: string
  stock?: number
  index?: number
}

const badges: { key: keyof IProduct; label: string; color: string }[] = [
  { key: 'destacado', label: 'Destacado', color: 'bg-brick-500' },
  { key: 'masVendido', label: 'Más vendido', color: 'bg-red-600' },
  { key: 'recomendado', label: 'Del chef', color: 'bg-brick-700' },
  { key: 'nuevo', label: 'Nuevo', color: 'bg-emerald-600' },
]

export function ProductCard({ imagen, nombre, precio, isFinal, id, descripcion, stock, descuento, picante, tiempoPreparacion, calorias, ingredientes, destacado, masVendido, recomendado, nuevo }: IProps) {
  const { pathname } = useLocation()
  const addToCart = useCartStore((s) => s.addToCart)
  const url = id ? encodeURIComponent(id) : ''
  const isInMenu = pathname === RoutesPath.menu
  const stockLevel = stock !== undefined
    ? stock > 5 ? 'high' : stock > 0 ? 'low' : 'out'
    : 'high'

  const activeBadges = badges.filter((b) => {
    if (b.key === 'destacado') return destacado
    if (b.key === 'masVendido') return masVendido
    if (b.key === 'recomendado') return recomendado
    if (b.key === 'nuevo') return nuevo
    return false
  })

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (stockLevel === 'out') { toast.error(`${nombre} agotado`); return }
    addToCart({ nombre, descripcion, precio, quantity: 1, imagen })
    toast.success(`${nombre} agregado`)
  }

  const content = (
    <>
      <div className="relative w-full aspect-[4/3] overflow-hidden bg-warm">
        <img src={imagen} alt={nombre || 'Producto'} className="size-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
        {activeBadges.slice(0, 2).map((b, i) => (
          <span key={b.key} className={`absolute top-3 left-3 ${b.color} text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm ${i > 0 ? 'mt-8' : ''}`}>{b.label}</span>
        ))}
        {descuento && <span className="absolute top-3 right-3 bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">-{descuento}%</span>}
        {stockLevel === 'low' && <span className="absolute bottom-3 left-3 bg-amber-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm">⚡ Quedan {stock}</span>}
        {stockLevel === 'out' && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="bg-white text-ink text-sm font-bold px-4 py-2 rounded-full">Agotado</span>
          </div>
        )}
        {isInMenu && stockLevel !== 'out' && (
          <button type="button"
            className="absolute bottom-3 right-3 p-2.5 bg-white/90 hover:bg-white text-brick-600 rounded-xl shadow-lg transition-all duration-300 hover:scale-110 active:scale-95 backdrop-blur-sm"
            title="Agregar" onClick={handleAddToCart} aria-label={`Agregar ${nombre}`}>
            <TbShoppingBagPlus className="text-xl" />
          </button>
        )}
      </div>
      <div className="p-5">
        <h3 className="text-lg font-bold text-ink">{nombre}</h3>
        <p className="text-sm text-steel mt-1 line-clamp-2">{descripcion}</p>
        <div className="flex items-center gap-3 mt-3">
          {descuento ? (
            <><span className="text-2xl font-bold text-brick-600">${numberFormatter(precio ?? 0)}</span><span className="text-sm text-steel line-through">${numberFormatter(Math.round((precio ?? 0) * 100 / (100 - descuento)))}</span></>
          ) : (
            <span className="text-2xl font-bold text-brick-600">${numberFormatter(precio ?? 0)}</span>
          )}
          {tiempoPreparacion && <span className="flex items-center gap-1 text-xs text-steel ml-auto"><FaClock size={10} /> {tiempoPreparacion} min</span>}
        </div>
        {calorias && (
          <div className="flex items-center gap-2 mt-2 text-xs text-steel">
            <span>{calorias} cal</span>
            {picante !== undefined && picante > 0 && <span>{'🌶️'.repeat(picante)}</span>}
          </div>
        )}
        {ingredientes && ingredientes.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {ingredientes.slice(0, 4).map((ing) => <span key={ing} className="text-[10px] bg-warm text-steel px-2 py-0.5 rounded-full">{ing}</span>)}
            {ingredientes.length > 4 && <span className="text-[10px] text-steel">+{ingredientes.length - 4}</span>}
          </div>
        )}
        <div className="mt-3">
          {stockLevel === 'high' && <span className="text-[11px] text-emerald-600 font-medium">✅ Disponible</span>}
          {stockLevel === 'low' && <span className="text-[11px] text-amber-600 font-medium">⚠️ Quedan {stock}</span>}
        </div>
      </div>
    </>
  )

  if (isFinal) return (
    <div className="relative w-[90%] sm:w-72 overflow-hidden rounded-2xl shadow-card hover:shadow-lift transition-all duration-300 bg-white group">
      {content}
      <Link to={RoutesPath.menu} className="absolute inset-0 bg-black/40 backdrop-blur-sm grid place-items-center opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-white text-xl font-bold">Ver más</span>
      </Link>
    </div>
  )

  return (
    <Link to={stockLevel === 'out' ? '#' : RoutesPath.menuDetail(url)}
      className={`block w-[90%] sm:w-72 overflow-hidden rounded-2xl shadow-card hover:shadow-lift transition-all duration-300 bg-white group ${stockLevel === 'out' ? 'opacity-70' : ''}`}
      aria-label={`Detalles de ${nombre}`}
      onClick={(e) => stockLevel === 'out' && e.preventDefault()}>
      {content}
    </Link>
  )
}
