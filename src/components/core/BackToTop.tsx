import { useEffect, useState } from 'react'
import { FaArrowUp } from 'react-icons/fa'

export function BackToTop() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 400)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className={`fixed bottom-6 right-6 z-50 w-11 h-11 bg-brick-500 hover:bg-brick-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ${
        show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
      aria-label="Volver arriba"
    >
      <FaArrowUp size={16} />
    </button>
  )
}
