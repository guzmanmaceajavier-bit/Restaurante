import { useEffect, useState } from 'react'
import Banner1 from '@/assets/offersBanner/banner_1.webp'
import Banner2 from '@/assets/offersBanner/banner_2.webp'
import Banner3 from '@/assets/offersBanner/banner_3.webp'
import { LuChevronLeft, LuChevronRight } from 'react-icons/lu'

const banners = [Banner1, Banner2, Banner3]

export function BannerSection() {
  const [indexSlide, setIndexSlide] = useState(0)

  // Auto-slide
  useEffect(() => {
    const interval = setInterval(() => {
      setIndexSlide((prev) => (prev + 1) % banners.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  // Manual navigation
  const handlePrev = () => {
    setIndexSlide((prev) => (prev === 0 ? banners.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setIndexSlide((prev) => (prev + 1) % banners.length)
  }

  return (
    <section className="section-page relative w-full overflow-hidden pt-16">
      {/* Contenedor principal */}
      <div
        className="flex transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${indexSlide * 100}%)` }}
      >
        {banners.map((banner, index) => (
          <div
            key={index}
            className="min-w-full max-h-[60vh] flex justify-center items-center overflow-hidden"
          >
            <img
              src={banner}
              className="w-full h-full object-cover"
              alt={`Banner promocional ${index + 1}`}
              loading="lazy"
            />
          </div>
        ))}
      </div>

      {/* Botones laterales */}
      <button
        type="button"
        onClick={handlePrev}
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/60 hover:bg-brick-500 hover:text-white rounded-full p-2 transition-all"
      >
        <LuChevronLeft className="text-2xl" />
      </button>
      <button
        type="button"
        onClick={handleNext}
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/60 hover:bg-brick-500 hover:text-white rounded-full p-2 transition-all"
      >
        <LuChevronRight className="text-2xl" />
      </button>

      {/* Indicadores (puntos) */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {banners.map((_, i) => (
          <span
            key={i}
            onClick={() => setIndexSlide(i)}
            className={`w-3 h-3 rounded-full cursor-pointer transition-all ${
              i === indexSlide
                ? 'bg-brick-500 scale-110'
                : 'bg-smoke hover:bg-brick-300'
            }`}
          ></span>
        ))}
      </div>
    </section>
  )
}
