import { useEffect, useState } from 'react'
import Banner1 from '@/assets/offersBanner/banner_1.webp'
import Banner2 from '@/assets/offersBanner/banner_2.webp'
import Banner3 from '@/assets/offersBanner/banner_3.webp'
import { LuChevronLeft, LuChevronRight } from 'react-icons/lu'

const banners = [Banner1, Banner2, Banner3]

export function BannerSection() {
  const [indexSlide, setIndexSlide] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setIndexSlide((prev) => (prev + 1) % banners.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const handlePrev = () => setIndexSlide((prev) => (prev === 0 ? banners.length - 1 : prev - 1))
  const handleNext = () => setIndexSlide((prev) => (prev + 1) % banners.length)

  return (
    <section className="relative w-full overflow-hidden pt-16 bg-cream-100">
      <div className="relative h-[40vh] md:h-[50vh] overflow-hidden">
        <div
          className="flex h-full transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${indexSlide * 100}%)` }}
        >
          {banners.map((banner, index) => (
            <div key={index} className="min-w-full h-full">
              <img
                src={banner}
                className="w-full h-full object-cover"
                alt={`Banner promocional ${index + 1}`}
                loading="lazy"
              />
            </div>
          ))}
        </div>

        <div className="absolute inset-0 bg-gradient-to-r from-espresso-900/30 via-transparent to-espresso-900/20" />

        <button
          type="button"
          onClick={handlePrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-olive-500 hover:text-white rounded-full p-3 transition-all duration-300 shadow-lg backdrop-blur-sm"
        >
          <LuChevronLeft className="text-xl" />
        </button>
        <button
          type="button"
          onClick={handleNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-olive-500 hover:text-white rounded-full p-3 transition-all duration-300 shadow-lg backdrop-blur-sm"
        >
          <LuChevronRight className="text-xl" />
        </button>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2.5">
          {banners.map((_, i) => (
            <span
              key={i}
              onClick={() => setIndexSlide(i)}
              className={`h-2 rounded-full cursor-pointer transition-all duration-300 ${
                i === indexSlide
                  ? 'bg-olive-500 w-8'
                  : 'bg-white/50 hover:bg-white/80 w-2'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
