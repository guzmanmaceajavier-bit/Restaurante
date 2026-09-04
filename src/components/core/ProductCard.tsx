import { Link, useLocation } from 'react-router-dom'
import { RoutesPath } from '../../routes/routes'
import { TbShoppingBagPlus } from 'react-icons/tb'
import { FaHeart, FaShareAlt, FaClock, FaWhatsapp } from 'react-icons/fa'
import { useCartStore } from '../../store/useCartStore'
import { useAuthStore } from '../../store/useAuthStore'
import { useFavorites } from '../../hooks/useFavorites'
import type { IProduct } from '../../types/product'
import { numberFormatter } from '../../utils/numberFormatter'
import { toast } from 'sonner'
import { useState } from 'react'

interface IProps extends Partial<IProduct> {
  isFinal?: boolean
  id?: string
  stock?: number
  index?: number
}

const badges: { key: keyof IProduct; label: string; color: string }[] = [
  { key: 'destacado', label: 'Destacado', color: 'bg-olive-500' },
  { key: 'masVendido', label: 'Más vendido', color: 'bg-espresso-700' },
  { key: 'recomendado', label: 'Del chef', color: 'bg-sage-600' },
  { key: 'nuevo', label: 'Nuevo', color: 'bg-gold-500' },
]

export function ProductCard({ id, imagen, nombre, precio, isFinal, descripcion, stock, descuento, picante, tiempoPreparacion, calorias, ingredientes, destacado, masVendido, recomendado, nuevo }: IProps) {
  const { pathname } = useLocation()
  const addToCart = useCartStore((s) => s.addToCart)
  const clienteActual = useAuthStore((s) => s.clienteActual)
  const { toggleFavorite, isFavorite } = useFavorites(clienteActual?.telefono)
  const [descExpanded, setDescExpanded] = useState(false)
  const [showShare, setShowShare] = useState(false)
  const url = id ? encodeURIComponent(id) : ''
  const isInMenu = pathname === RoutesPath.menu
  const productId = id || nombre
  const isFav = isFavorite(productId)

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
    toast.success(`${nombre} agregado`, {
      description: 'Tu pedido está en el carrito',
      action: { label: 'Ver carrito', onClick: () => {} },
    })
  }

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!clienteActual) {
      toast.error('Inicia sesión para guardar favoritos', { description: 'Solo necesitas tu teléfono' })
      return
    }
    toggleFavorite(productId)
    toast.success(isFav ? 'Eliminado de favoritos' : 'Agregado a favoritos')
  }

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const text = `🍽️ ¡Mira este plato de Sabor y Origen!\n\n${nombre}\n$${numberFormatter(precio ?? 0)}\n\n${descripcion || ''}`
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`
    window.open(url, '_blank')
    toast.success('Compartido por WhatsApp')
    setShowShare(false)
  }

  const content = (
    <>
      <div className="relative w-full aspect-[4/3] overflow-hidden">
        <img src={imagen} alt={nombre || 'Producto'} className="size-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Badges */}
        {activeBadges.slice(0, 2).map((b, i) => (
          <span key={b.key} className={`absolute top-3 left-3 ${b.color} text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-sm ${i > 0 ? 'mt-8' : ''}`}>{b.label}</span>
        ))}
        {descuento && <span className="absolute top-3 right-3 bg-olive-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">-{descuento}%</span>}
        {stockLevel === 'low' && <span className="absolute bottom-14 left-3 bg-gold-500 text-espresso-900 text-[10px] font-bold px-3 py-1 rounded-full shadow-sm">⚡ Quedan {stock}</span>}

        {/* Favorite button */}
        <button
          onClick={handleFavorite}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md transition-all duration-300 hover:scale-110 active:scale-90"
          title={isFav ? 'Quitar de favoritos' : 'Agregar a favoritos'}
        >
          <FaHeart size={14} className={`transition-colors duration-300 ${isFav ? 'text-red-500 fill-red-500' : 'text-steel/40'}`} />
        </button>

        {/* Share button */}
        {isInMenu && (
          <button
            onClick={handleShare}
            className="absolute top-14 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md text-steel/50 hover:text-olive-500 transition-all duration-300 hover:scale-110 active:scale-90"
            title="Compartir"
          >
            <FaShareAlt size={13} />
          </button>
        )}

        {/* Add to cart */}
        {isInMenu && stockLevel !== 'out' && (
          <button type="button"
            className="absolute bottom-3 right-3 w-10 h-10 bg-olive-500 hover:bg-olive-600 text-white rounded-xl shadow-lg transition-all duration-300 hover:scale-110 active:scale-90 flex items-center justify-center"
            title="Agregar" onClick={handleAddToCart} aria-label={`Agregar ${nombre}`}>
            <TbShoppingBagPlus size={18} />
          </button>
        )}

        {/* Out of stock overlay */}
        {stockLevel === 'out' && (
          <div className="absolute inset-0 bg-espresso-900/60 backdrop-blur-sm flex items-center justify-center">
            <span className="bg-white text-espresso-800 text-sm font-bold px-5 py-2 rounded-full shadow-lg">Agotado</span>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-base font-display font-bold text-espresso-800 group-hover:text-olive-600 transition-colors duration-300">{nombre}</h3>
        <p className={`text-xs text-steel mt-1 ${descExpanded ? '' : 'line-clamp-2'}`}>{descripcion}</p>
        {descripcion && descripcion.length > 80 && (
          <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setDescExpanded(!descExpanded) }}
            className="text-[11px] text-olive-500 hover:text-olive-600 font-medium mt-1 transition-colors">
            {descExpanded ? 'Ver menos' : 'Ver más'}
          </button>
        )}
        <div className="flex items-center gap-2 mt-2.5">
          {descuento ? (
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-display font-bold text-olive-600">${numberFormatter(precio ?? 0)}</span>
              <span className="text-xs text-steel line-through">${numberFormatter(Math.round((precio ?? 0) * 100 / (100 - descuento)))}</span>
            </div>
          ) : (
            <span className="text-xl font-display font-bold text-olive-600">${numberFormatter(precio ?? 0)}</span>
          )}
          {tiempoPreparacion && <span className="flex items-center gap-1 text-[11px] text-steel ml-auto"><FaClock size={10} /> {tiempoPreparacion} min</span>}
        </div>
        {calorias && (
          <div className="flex items-center gap-2 mt-1.5 text-[11px] text-steel">
            <span>{calorias} cal</span>
            {picante !== undefined && picante > 0 && <span>{'🌶️'.repeat(picante)}</span>}
          </div>
        )}
        {ingredientes && ingredientes.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {ingredientes.slice(0, 3).map((ing) => <span key={ing} className="text-[10px] bg-cream-100 text-espresso-600 px-2 py-0.5 rounded-full">{ing}</span>)}
            {ingredientes.length > 3 && <span className="text-[10px] text-steel">+{ingredientes.length - 3}</span>}
          </div>
        )}
      </div>
    </>
  )

  if (isFinal) return (
    <div className="relative w-[90%] sm:w-72 overflow-hidden rounded-2xl bg-white border border-cream-200 shadow-sm hover:shadow-lift transition-all duration-300 group">
      {content}
      <Link to={RoutesPath.menu} className="absolute inset-0 bg-espresso-900/40 backdrop-blur-sm grid place-items-center opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl">
        <span className="text-white text-xl font-display font-bold">Ver más</span>
      </Link>
    </div>
  )

  return (
    <Link to={stockLevel === 'out' ? '#' : RoutesPath.menuDetail(url)}
      className={`block w-full overflow-hidden rounded-2xl bg-white border border-cream-200 shadow-sm hover:shadow-lift transition-all duration-300 group ${stockLevel === 'out' ? 'opacity-70' : ''}`}
      aria-label={`Detalles de ${nombre}`}
      onClick={(e) => stockLevel === 'out' && e.preventDefault()}>
      {content}
    </Link>
  )
}
