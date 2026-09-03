import { MdDeliveryDining } from 'react-icons/md'
import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useProducts } from '../../hooks/useProducts'
import { useCart } from '../../hooks/useCart'
import { numberFormatter } from '../../utils/numberFormatter'

import { Quantity } from '../cart/Quantity'
import { ButtonCart } from '../cart/ButtonCart'
import ProductsSlider from '../home/ProductsSlider'

import LogoEfectivo from '../../assets/efectivo.avif'
import LogoBancolombia from '../../assets/logo-bancolombia.png'
import LogoNequi from '../../assets/nequi _logo.webp'
import type { IProduct } from '../../types/product'
import { FaClock, FaFire, FaLeaf } from 'react-icons/fa'

const picanteLabels = ['', '🌶️ Poco picante', '🌶️🌶️ Picante', '🌶️🌶️🌶️ Muy picante']

export function DetailView() {
  const { id: productId } = useParams()
  const { productById, filterProducts } = useProducts({ productId })
  const { addToCart } = useCart()
  const navigate = useNavigate()

  const [quantity, setQuantity] = useState(1)
  const [productsFiltered, setProductsFiltered] = useState<IProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)

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
      <section className="pt-28 text-center px-6">
        <p className="text-steel text-lg">Producto no encontrado.</p>
      </section>
    )

  return (
    <section className="pt-28 pb-10 px-6">
      <div className="max-w-content mx-auto">
        <button
          onClick={() => navigate('/menu')}
          className="bg-brick-500 text-white px-5 py-2 rounded-xl font-medium hover:bg-brick-600 transition-all mb-8"
        >
          ← Volver al menú
        </button>

        <div className={`transition-all duration-500 ${isLoading ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
          <div className="flex flex-col md:flex-row gap-10 rounded-2xl shadow-card border border-smoke bg-white p-6 md:p-8">
            <div className="w-full md:w-1/2 aspect-square overflow-hidden rounded-xl">
              <img
                src={productById.imagen}
                alt={productById.nombre}
                className="size-full object-cover transition-transform duration-500 hover:scale-105"
              />
            </div>

            <div className="flex flex-col gap-5 md:w-1/2">
              <div>
                <div className="flex flex-wrap gap-2 mb-3">
                  {productById.destacado && <span className="bg-brick-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">Destacado</span>}
                  {productById.masVendido && <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">Más vendido</span>}
                  {productById.recomendado && <span className="bg-brick-700 text-white text-xs font-bold px-2 py-0.5 rounded-full">Recomendado</span>}
                  {productById.nuevo && <span className="bg-emerald-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">Nuevo</span>}
                </div>
                <h1 className="text-4xl font-serif font-bold text-ink">{productById.nombre}</h1>
                <p className="mt-3 text-steel leading-relaxed">{productById.descripcion}</p>

                <div className="flex flex-wrap gap-3 mt-4">
                  {productById.tiempoPreparacion && (
                    <span className="flex items-center gap-1 bg-warm rounded-lg px-3 py-1.5 text-sm text-steel">
                      <FaClock className="text-brick-500" /> {productById.tiempoPreparacion} min
                    </span>
                  )}
                  {productById.calorias && (
                    <span className="flex items-center gap-1 bg-warm rounded-lg px-3 py-1.5 text-sm text-steel">
                      <FaFire className="text-red-500" /> {productById.calorias} cal
                    </span>
                  )}
                  {productById.picante !== undefined && productById.picante > 0 && (
                    <span className="flex items-center gap-1 bg-warm rounded-lg px-3 py-1.5 text-sm text-steel">
                      {picanteLabels[productById.picante]}
                    </span>
                  )}
                </div>

                {productById.ingredientes && productById.ingredientes.length > 0 && (
                  <div className="mt-4">
                    <p className="font-medium text-ink mb-1 flex items-center gap-1"><FaLeaf className="text-emerald-500" /> Ingredientes</p>
                    <div className="flex flex-wrap gap-1">
                      {productById.ingredientes.map((ing) => (
                        <span key={ing} className="bg-warm text-steel text-xs px-2 py-1 rounded-full">{ing}</span>
                      ))}
                    </div>
                  </div>
                )}

                {productById.alergenos && productById.alergenos.length > 0 && (
                  <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-xs font-semibold text-amber-700">⚠️ Contiene: {productById.alergenos.join(', ')}</p>
                  </div>
                )}

                <p className="text-3xl font-bold text-brick-600 mt-5">
                  $ {numberFormatter(productById.precio ?? 0)}
                </p>
                {productById.descuento && (
                  <p className="text-emerald-600 font-semibold text-sm mt-1">
                    {productById.descuento}% de descuento
                  </p>
                )}
              </div>

              <div>
                <p className="font-medium text-ink">Métodos de pago:</p>
                <div className="flex flex-wrap items-center gap-4 mt-2">
                  <img src={LogoNequi} className="h-10" alt="Logo Nequi" />
                  <img src={LogoBancolombia} className="h-10" alt="Logo Bancolombia" />
                  <div className="flex flex-col items-center text-ink">
                    <img src={LogoEfectivo} className="h-10" alt="Logo Efectivo" />
                    <p className="text-xs">Efectivo</p>
                  </div>
                </div>
              </div>

              <p className="inline-flex items-center gap-2 text-emerald-600 font-medium">
                <MdDeliveryDining className="text-3xl" /> Envío gratis
              </p>

              <div className="flex flex-col gap-4">
                <Quantity
                  quantity={quantity}
                  increment={() => setQuantity(quantity + 1)}
                  decrement={() => setQuantity(quantity - 1 <= 0 ? 1 : quantity - 1)}
                />
                <ButtonCart
                  text="Añadir al carrito"
                  handleClick={() =>
                    addToCart({
                      descripcion: productById.descripcion,
                      nombre: productById.nombre,
                      precio: productById.precio,
                      imagen: productById.imagen,
                      quantity,
                    })
                  }
                />
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
