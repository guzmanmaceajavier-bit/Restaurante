import { useRef, useState, useEffect } from 'react'
import { LuChevronLeft, LuChevronRight } from 'react-icons/lu'
import { ProductCard } from '../core/ProductCard'
import type { IProduct } from '../../types/product'

interface IProps {
  productsData: IProduct[]
  title: string
  seeMore?: boolean
}

export default function ProductsSlider({ productsData, title, seeMore }: IProps) {
  const cardWidth = 288 + 16
  const containerRef = useRef<HTMLDivElement>(null)
  const sliderRef = useRef<HTMLDivElement>(null)
  const [pixels, setPixels] = useState(0)
  const [currentPage, setCurrentPage] = useState(0)
  const [pages, setPages] = useState(1)

  useEffect(() => {
    if (sliderRef.current && containerRef.current) {
      const totalWidth = sliderRef.current.scrollWidth
      const visibleWidth = containerRef.current.clientWidth
      const numPages = Math.ceil(totalWidth / visibleWidth)
      setPages(numPages)
    }
  }, [productsData])

  const handleClick = (value: number) => {
    const sliderWidth = sliderRef.current?.scrollWidth ?? 0
    const containerWidth = containerRef.current?.clientWidth ?? 0
    const maxScroll = sliderWidth - containerWidth

    let newPixels = pixels + value
    if (newPixels > 0) newPixels = 0
    else if (newPixels < -maxScroll) newPixels = -maxScroll
    setPixels(newPixels)

    const current = Math.round(Math.abs(newPixels) / containerWidth)
    setCurrentPage(current)
  }

  return (
    <section className="py-12 px-6 bg-warm">
      <div className="relative w-full flex flex-col items-center gap-10">
        {title && (
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-ink tracking-tight text-center">
            {title}
          </h2>
        )}

        <div ref={containerRef} className="relative flex w-11/12 max-w-6xl overflow-hidden rounded-lg">
          <div
            ref={sliderRef}
            className="flex gap-5 transition-transform duration-500 ease-in-out p-3"
            style={{ transform: `translateX(${pixels}px)` }}
          >
            {productsData.map((item, index) => (
              <ProductCard
                key={index.toString() + item.nombre}
                {...item}
                id={item.nombre}
                isFinal={index === productsData.length - 1 && seeMore}
              />
            ))}
          </div>
        </div>

        <div className="absolute inset-0 flex justify-between items-center px-4 pointer-events-none">
          <button
            type="button"
            onClick={() => handleClick(cardWidth)}
            className="bg-white/80 hover:bg-brick-500 hover:text-white text-steel rounded-full p-3 shadow-md transition-all pointer-events-auto"
            aria-label="Anterior"
          >
            <LuChevronLeft className="text-2xl" />
          </button>
          <button
            type="button"
            onClick={() => handleClick(-cardWidth)}
            className="bg-white/80 hover:bg-brick-500 hover:text-white text-steel rounded-full p-3 shadow-md transition-all pointer-events-auto"
            aria-label="Siguiente"
          >
            <LuChevronRight className="text-2xl" />
          </button>
        </div>

        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: pages }).map((_, index) => (
            <span
              key={index}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentPage
                  ? 'bg-brick-500 scale-110'
                  : 'bg-smoke hover:bg-brick-300'
              }`}
            ></span>
          ))}
        </div>
      </div>
    </section>
  )
}
