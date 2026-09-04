import { MdDeliveryDining } from 'react-icons/md'
import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState, useMemo } from 'react'
import { useProducts } from '../../hooks/useProducts'
import { useCart } from '../../hooks/useCart'
import { numberFormatter } from '../../utils/numberFormatter'
import { Quantity } from '../cart/Quantity'
import { CONFIG } from '../../lib/config'
import ProductsSlider from '../home/ProductsSlider'
import LogoEfectivo from '../../assets/efectivo.avif'
import LogoBancolombia from '../../assets/logo-bancolombia.png'
import LogoNequi from '../../assets/nequi _logo.webp'
import type { IProduct, Adicional } from '../../types/product'
import { FaClock, FaFire, FaLeaf, FaArrowLeft, FaCheck, FaHeart, FaShareAlt, FaStar } from 'react-icons/fa'
import { useScrollAnimate } from '@/hooks/useScrollAnimate'
import { useFavorites } from '@/hooks/useFavorites'
import { storage } from '../../lib/storage'
import { toast } from 'sonner'

interface ResenaLocal { id: number; nombre: string; estrellas: number; comentario: string; fecha: string }

const picanteLabels = ['', '🌶️ Poco picante', '🌶️🌶️ Picante', '🌶️🌶️🌶️ Muy picante']

export function DetailView() {
  const { id: productId } = useParams()
  const { productById, filterProducts } = useProducts({ productId })
  const { addToCart } = useCart()
  const navigate = useNavigate()

  const [quantity, setQuantity] = useState(1)
  const [productsFiltered, setProductsFiltered] = useState<IProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedAdicionales, setSelectedAdicionales] = useState<Adicional[]>([])
  const [addedToCart, setAddedToCart] = useState(false)
  const { ref } = useScrollAnimate(0.1)
  const { isFavorite, toggleFavorite } = useFavorites()

  const reviews = useMemo(() => {
    const all = storage.getResenas<ResenaLocal>()
    return all.filter((r) => r.nombre?.toLowerCase().includes(productById?.nombre?.toLowerCase() || ''))
  }, [productById])

  const avgRating = useMemo(() => {
    if (reviews.length === 0) return 0
    return reviews.reduce((s, r) => s + r.estrellas, 0) / reviews.length
  }, [reviews])

  useEffect(() => {
    if (!productById) return
    setIsLoading(true)
    const filteredProducts = filterProducts(productById.categoría)
    setProductsFiltered(filteredProducts)
    const timeout = setTimeout(() => setIsLoading(false), 250)
    return () => clearTimeout(timeout)
  }, [productById])

  if (!productById)
    return (
      <section className="pt-8 text-center px-6">
        <p className="text-steel text-lg">Producto no encontrado.</p>
      </section>
    )

  const handleAddToCart = () => {
    addToCart({
      descripcion: productById.descripcion,
      nombre: productById.nombre,
      precio: productById.precio,
      imagen: productById.imagen,
      quantity,
      adicionales: selectedAdicionales,
    })
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 2000)
  }

  const toggleAdicional = (adicional: Adicional) => {
    setSelectedAdicionales((prev) =>
      prev.some((a) => a.nombre === adicional.nombre)
        ? prev.filter((a) => a.nombre !== adicional.nombre)
        : [...prev, adicional]
    )
  }

  const totalPrice = (productById.precio ?? 0) + selectedAdicionales.reduce((sum, a) => sum + a.precio, 0)

  return (
    <section className="pt-8 pb-16 px-6">
      <div className="max-w-content mx-auto" ref={ref}>
        <button
          onClick={() => navigate('/menu')}
          className="flex items-center gap-2 text-espresso-600 hover:text-olive-500 font-medium transition-colors mb-8 group"
        >
          <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" size={14} />
          Volver al menú
        </button>

        <div className={`transition-all duration-500 ${isLoading ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
          <div className="grid md:grid-cols-2 gap-0 bg-white rounded-3xl overflow-hidden shadow-card border border-cream-200">
            <div className="relative aspect-square md:aspect-auto md:min-h-[500px] overflow-hidden">
              <img
                src={productById.imagen}
                alt={productById.nombre}
                className="size-full object-cover hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-espresso-900/30 via-transparent to-transparent" />

              {productById.descuento && productById.descuento > 0 && (
                <div className="absolute top-4 left-4 bg-olive-500 text-white text-sm font-bold px-4 py-1.5 rounded-full shadow-lg animate-scale-in">
                  -{productById.descuento}% OFF
                </div>
              )}

              <div className="absolute bottom-4 left-4 flex gap-2">
                {productById.destacado && <span className="bg-olive-500 text-white text-xs font-bold px-3 py-1 rounded-full">Destacado</span>}
                {productById.masVendido && <span className="bg-espresso-700 text-white text-xs font-bold px-3 py-1 rounded-full">Más vendido</span>}
                {productById.recomendado && <span className="bg-sage-600 text-white text-xs font-bold px-3 py-1 rounded-full">Del chef</span>}
                {productById.nuevo && <span className="bg-gold-500 text-espresso-900 text-xs font-bold px-3 py-1 rounded-full">Nuevo</span>}
              </div>

              {/* Favorite & Share buttons */}
              <div className="absolute top-4 right-4 flex gap-2">
                <button onClick={() => toggleFavorite(productById.id)} className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-lg ${isFavorite(productById.id) ? 'bg-red-500 text-white' : 'bg-white/90 text-espresso-600 hover:bg-white hover:text-red-500'}`}>
                  <FaHeart size={16} fill={isFavorite(productById.id) ? 'currentColor' : 'none'} />
                </button>
                <button onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Enlace copiado') }} className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center text-espresso-600 hover:bg-white hover:text-olive-600 transition-all shadow-lg">
                  <FaShareAlt size={16} />
                </button>
              </div>
            </div>

            <div className="flex flex-col p-8 md:p-10">
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-display font-bold text-espresso-800">{productById.nombre}</h1>
                <p className="mt-3 text-steel leading-relaxed">{productById.descripcion}</p>

                <div className="flex flex-wrap gap-2.5 mt-5">
                  {productById.tiempoPreparacion && (
                    <span className="flex items-center gap-1.5 bg-cream-100 rounded-xl px-3.5 py-2 text-sm text-espresso-600 font-medium">
                      <FaClock className="text-olive-500" size={13} /> {productById.tiempoPreparacion} min
                    </span>
                  )}
                  {productById.calorias && (
                    <span className="flex items-center gap-1.5 bg-cream-100 rounded-xl px-3.5 py-2 text-sm text-espresso-600 font-medium">
                      <FaFire className="text-olive-400" size={13} /> {productById.calorias} cal
                    </span>
                  )}
                  {productById.picante !== undefined && productById.picante > 0 && (
                    <span className="flex items-center gap-1.5 bg-cream-100 rounded-xl px-3.5 py-2 text-sm text-espresso-600 font-medium">
                      {picanteLabels[productById.picante]}
                    </span>
                  )}
                </div>

                {productById.ingredientes && productById.ingredientes.length > 0 && (
                  <div className="mt-5">
                    <p className="font-semibold text-espresso-800 mb-2 flex items-center gap-1.5 text-sm">
                      <FaLeaf className="text-sage-500" size={13} /> Ingredientes
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {productById.ingredientes.map((ing) => (
                        <span key={ing} className="bg-cream-100 text-espresso-600 text-xs px-3 py-1 rounded-full">{ing}</span>
                      ))}
                    </div>
                  </div>
                )}

                {productById.alergenos && productById.alergenos.length > 0 && (
                  <div className="mt-4 p-3 bg-gold-50 border border-gold-200 rounded-xl">
                    <p className="text-xs font-semibold text-gold-700">⚠️ Contiene: {productById.alergenos.join(', ')}</p>
                  </div>
                )}

                {/* Ratings summary */}
                {reviews.length > 0 && (
                  <div className="mt-5 p-4 bg-cream-50 rounded-xl border border-cream-200">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map(s => (
                          <FaStar key={s} size={14} className={s <= Math.round(avgRating) ? 'text-gold-400' : 'text-cream-300'} fill={s <= Math.round(avgRating) ? 'currentColor' : 'none'} />
                        ))}
                      </div>
                      <span className="text-sm font-bold text-espresso-700">{avgRating.toFixed(1)}</span>
                      <span className="text-xs text-steel">({reviews.length} reseña{reviews.length !== 1 ? 's' : ''})</span>
                    </div>
                  </div>
                )}

                {productById.adicionales && productById.adicionales.length > 0 && (
                  <div className="mt-6">
                    <p className="font-semibold text-espresso-800 mb-3 text-sm">Adicionales (opcional)</p>
                    <div className="space-y-2">
                      {productById.adicionales.map((adicional) => {
                        const isSelected = selectedAdicionales.some((a) => a.nombre === adicional.nombre)
                        return (
                          <button
                            key={adicional.nombre}
                            type="button"
                            onClick={() => toggleAdicional(adicional)}
                            className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-left transition-all duration-200 border ${
                              isSelected
                                ? 'bg-olive-50 border-olive-300'
                                : 'bg-cream-50 border-cream-200 hover:border-olive-200 hover:bg-olive-50/50'
                            }`}
                          >
                            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                              isSelected ? 'bg-olive-500 border-olive-500' : 'border-cream-300'
                            }`}>
                              {isSelected && <FaCheck className="text-white" size={10} />}
                            </div>
                            <span className="flex-1 text-sm font-medium text-espresso-700">{adicional.nombre}</span>
                            <span className="text-sm font-semibold text-olive-500">+${numberFormatter(adicional.precio)}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-8 pt-6 border-t border-cream-200">
                <div className="flex items-end gap-3 mb-5">
                  <span className="text-3xl font-display font-bold text-olive-500">
                    ${numberFormatter(totalPrice)}
                  </span>
                  {productById.descuento && productById.descuento > 0 && (
                    <span className="text-sm text-steel line-through mb-1">
                      ${numberFormatter(Math.round((productById.precio ?? 0) * 100 / (100 - productById.descuento)))}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-sm text-sage-600 font-medium mb-5">
                  <MdDeliveryDining size={18} />
                  Envío gratis en pedidos mayores a ${numberFormatter(CONFIG?.delivery?.minimoGratis ?? 25000)}
                </div>

                <div className="flex items-center gap-4 mb-5">
                  <img src={LogoNequi} className="h-7 opacity-60" alt="Nequi" />
                  <img src={LogoBancolombia} className="h-7 opacity-60" alt="Bancolombia" />
                  <img src={LogoEfectivo} className="h-7 opacity-60" alt="Efectivo" />
                </div>

                <div className="flex items-center gap-4">
                  <Quantity
                    quantity={quantity}
                    increment={() => setQuantity(quantity + 1)}
                    decrement={() => setQuantity(quantity - 1 <= 0 ? 1 : quantity - 1)}
                  />
                  <button
                    onClick={handleAddToCart}
                    className={`flex-1 py-3.5 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                      addedToCart
                        ? 'bg-sage-500 text-white shadow-lg shadow-sage-500/25'
                        : 'bg-olive-500 hover:bg-olive-600 text-white shadow-lg shadow-olive-500/25 hover:shadow-xl'
                    }`}
                  >
                    {addedToCart ? (
                      <><FaCheck size={16} /> Agregado</>
                    ) : (
                      'Añadir al carrito'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {productsFiltered.length > 0 && (
            <ProductsSlider productsData={productsFiltered} title="Platos similares" />
          )}
        </div>
      </div>
    </section>
  )
}
