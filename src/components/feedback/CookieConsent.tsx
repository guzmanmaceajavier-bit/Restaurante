import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaCookieBite, FaTimes } from 'react-icons/fa'

const COOKIE_KEY = 'cookie-consent-accepted'

export default function CookieConsent() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const accepted = localStorage.getItem(COOKIE_KEY)
    if (!accepted) {
      const t = setTimeout(() => setShow(true), 1500)
      return () => clearTimeout(t)
    }
  }, [])

  const accept = () => { localStorage.setItem(COOKIE_KEY, 'true'); setShow(false) }
  const reject = () => { localStorage.setItem(COOKIE_KEY, 'rejected'); setShow(false) }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', damping: 24, stiffness: 260, mass: 0.8 }}
          className="fixed bottom-0 left-0 right-0 z-[90] p-4 sm:p-6"
        >
          <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl border border-cream-200 p-5 sm:p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-olive-100 flex items-center justify-center shrink-0">
                <FaCookieBite className="text-olive-600" size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-espresso-800 mb-1">Privacidad y almacenamiento</h3>
                <p className="text-xs text-steel leading-relaxed mb-4">
                  Este sitio utiliza <strong>localStorage</strong> para recordar tus preferencias, carrito de compras y sesión.
                  No utilizamos cookies de rastreo, publicidad ni análisis. Los datos se almacenan únicamente en tu navegador.
                </p>
                <div className="flex flex-wrap gap-2">
                  <button onClick={accept}
                    className="px-4 py-2 bg-olive-600 hover:bg-olive-700 text-white text-xs font-semibold rounded-lg transition-colors">
                    Aceptar
                  </button>
                  <button onClick={reject}
                    className="px-4 py-2 bg-white hover:bg-cream-50 text-espresso-600 text-xs font-medium rounded-lg border border-cream-200 transition-colors">
                    Rechazar
                  </button>
                </div>
              </div>
              <button onClick={reject} className="p-1.5 hover:bg-cream-100 rounded-lg transition-colors shrink-0">
                <FaTimes size={12} className="text-steel" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
