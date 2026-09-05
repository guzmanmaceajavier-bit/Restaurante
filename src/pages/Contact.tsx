import { useState } from 'react'
import { toast } from 'sonner'
import { getRestaurantConfig, CONFIG } from '../lib/config'
import { SEO } from '../lib/seo'
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaStar, FaInstagram, FaFacebook, FaWhatsapp, FaInfoCircle, FaPaperPlane } from 'react-icons/fa'
import { useScrollAnimate } from '@/hooks/useScrollAnimate'

const config = getRestaurantConfig()

const defaultReviews = [
  { name: 'María López', text: 'La mejor comida colombiana que he probado fuera de casa. La bandeja paisa es espectacular.', rating: 5 },
  { name: 'Carlos Gómez', text: 'El ambiente es increíble, perfecto para celebraciones familiares.', rating: 5 },
  { name: 'Ana Martínez', text: 'El servicio es excelente y los precios son justos. Recomiendo la cazuela de mariscos.', rating: 5 },
]

const contactInfo = [
  { icon: FaMapMarkerAlt, label: 'Dirección', value: CONFIG.contacto.direccion, href: CONFIG.contacto.mapaUrl },
  { icon: FaPhone, label: 'Teléfono', value: CONFIG.contacto.telefono, href: `tel:${CONFIG.contacto.telefono}` },
  { icon: FaEnvelope, label: 'Email', value: CONFIG.contacto.email, href: `mailto:${CONFIG.contacto.email}` },
]

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          className="transition-transform hover:scale-110"
        >
          <FaStar
            size={20}
            className={
              star <= (hover || value)
                ? 'text-gold-400'
                : 'text-cream-300'
            }
          />
        </button>
      ))}
    </div>
  )
}

export default function Contact() {
  const { ref, isVisible } = useScrollAnimate(0.1)

  const [reviewName, setReviewName] = useState('')
  const [reviewEmail, setReviewEmail] = useState('')
  const [reviewRating, setReviewRating] = useState(0)
  const [reviewComment, setReviewComment] = useState('')

  const [allReviews, setAllReviews] = useState<{ name: string; rating: number; text: string }[]>(() => {
    try {
      const stored = localStorage.getItem('contact-reviews')
      return stored ? JSON.parse(stored) : defaultReviews
    } catch {
      return defaultReviews
    }
  })

  const handleSubmitReview = () => {
    if (!reviewName.trim() || !reviewComment.trim()) {
      toast.error('Por favor completa nombre y comentario')
      return
    }
    if (reviewRating === 0) {
      toast.error('Por favor selecciona una calificación')
      return
    }
    const newReview = {
      name: reviewName.trim(),
      text: reviewComment.trim(),
      rating: reviewRating,
    }
    const updated = [newReview, ...allReviews]
    setAllReviews(updated)
    localStorage.setItem('contact-reviews', JSON.stringify(updated))
    setReviewName('')
    setReviewEmail('')
    setReviewRating(0)
    setReviewComment('')
    toast.success('¡Gracias por tu reseña!')
  }

  return (
    <>
      <SEO title="Contacto" description={`Contacta con ${config.nombre}`} />

      <section className="relative py-20 px-6 bg-gradient-to-br from-olive-600 to-olive-700 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-40 h-40 bg-gold-400 rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-10 w-60 h-60 bg-white rounded-full blur-3xl" />
        </div>
        <div className="max-w-content mx-auto relative text-center">
          <span className="inline-block text-olive-200 font-semibold text-sm uppercase tracking-[0.2em] mb-3">Contacto</span>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-white leading-tight mb-4">
            Estamos aquí para ti
          </h1>
          <p className="text-olive-100/80 max-w-md mx-auto text-sm">
            Visítanos, llámanos o escríbenos. Resolvemos cualquier duda.
          </p>
        </div>
      </section>

      <section className="px-6 -mt-8 relative z-10" ref={ref}>
        <div className="max-w-content mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {contactInfo.map((item, i) => (
              <div key={item.label} className={`bg-white rounded-2xl shadow-card border border-cream-200 p-5 text-center hover:shadow-lift transition-all duration-300 ${isVisible ? 'animate-fade-in' : 'opacity-0'}`} style={{ transitionDelay: `${i * 80}ms` }}>
                <div className="w-12 h-12 bg-olive-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <item.icon className="text-olive-500" size={18} />
                </div>
                <p className="font-semibold text-xs text-espresso-800 mb-1">{item.label}</p>
                <a href={item.href} target="_blank" rel="noopener noreferrer" className="text-xs text-olive-600 hover:text-olive-700 transition-colors leading-tight block">{item.value}</a>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-6">
        <div className="max-w-content mx-auto">
          <div className="grid lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3 space-y-8">
              <div className={`bg-white rounded-2xl shadow-card border border-cream-200 overflow-hidden ${isVisible ? 'animate-fade-in' : 'opacity-0'}`}>
                <div className="p-5 border-b border-cream-100">
                  <h2 className="text-lg font-display font-bold text-espresso-800">Encuéntranos</h2>
                </div>
                <div className="h-[280px]">
                  <iframe src={CONFIG.contacto.mapaUrl} width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" title="Ubicación" />
                </div>
              </div>

              <div className={`bg-white rounded-2xl shadow-card border border-cream-200 overflow-hidden ${isVisible ? 'animate-fade-in' : 'opacity-0'}`} style={{ transitionDelay: '50ms' }}>
                <div className="p-5 border-b border-cream-100 flex items-center gap-3">
                  <div className="w-10 h-10 bg-olive-100 rounded-xl flex items-center justify-center">
                    <FaInfoCircle className="text-olive-500" size={16} />
                  </div>
                  <div>
                    <h2 className="text-lg font-display font-bold text-espresso-800">Sobre nosotros</h2>
                    <p className="text-xs text-steel">{config.nombre}</p>
                  </div>
                </div>
                <div className="p-5">
                  <p className="text-sm text-steel leading-relaxed">{config.descripcion}</p>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="bg-cream-50 rounded-xl p-3 border border-cream-200">
                      <p className="text-xs font-semibold text-espresso-800">Horario</p>
                      <p className="text-xs text-steel mt-1">{config.horarioApertura} - {config.horarioCierre}</p>
                    </div>
                    <div className="bg-cream-50 rounded-xl p-3 border border-cream-200">
                      <p className="text-xs font-semibold text-espresso-800">Dirección</p>
                      <p className="text-xs text-steel mt-1">{config.direccion}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className={`bg-white rounded-2xl shadow-card border border-cream-200 p-6 ${isVisible ? 'animate-fade-in' : 'opacity-0'}`} style={{ transitionDelay: '100ms' }}>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 bg-gold-100 rounded-xl flex items-center justify-center">
                    <FaStar className="text-gold-500" size={16} />
                  </div>
                  <div>
                    <h2 className="text-lg font-display font-bold text-espresso-800">Opiniones</h2>
                    <p className="text-xs text-steel">Lo que dicen nuestros clientes</p>
                  </div>
                </div>
                <div className="grid sm:grid-cols-3 gap-4">
                  {allReviews.slice(0, 6).map((r, i) => (
                    <div key={`${r.name}-${i}`} className={`bg-cream-50 rounded-xl p-4 border border-cream-200 hover:shadow-lift transition-all duration-300 ${isVisible ? 'animate-fade-in' : 'opacity-0'}`} style={{ transitionDelay: `${(i + 1) * 100}ms` }}>
                      <div className="flex gap-0.5 text-gold-400 mb-2">{Array.from({ length: r.rating }).map((_, j) => <FaStar key={j} size={11} />)}</div>
                      <p className="text-xs text-steel leading-relaxed italic">"{r.text}"</p>
                      <p className="text-xs font-semibold text-espresso-800 mt-3 flex items-center gap-2">
                        <span className="w-6 h-6 bg-olive-100 rounded-full flex items-center justify-center text-[10px] text-olive-600 font-bold">{r.name[0]}</span>
                        {r.name}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <div className={`bg-white rounded-2xl shadow-card border border-cream-200 p-6 ${isVisible ? 'animate-fade-in' : 'opacity-0'}`} style={{ transitionDelay: '150ms' }}>
                <h2 className="text-lg font-display font-bold text-espresso-800 mb-4">Síguenos</h2>
                <div className="flex flex-col gap-2.5">
                  {[
                    { icon: FaInstagram, label: 'Instagram', url: CONFIG.redes[0].url, color: 'hover:text-pink-500 hover:bg-pink-50' },
                    { icon: FaFacebook, label: 'Facebook', url: CONFIG.redes[1].url, color: 'hover:text-blue-500 hover:bg-blue-50' },
                    { icon: FaWhatsapp, label: 'WhatsApp', url: CONFIG.redes[2].url, color: 'hover:text-emerald-500 hover:bg-emerald-50' },
                  ].map(s => (
                    <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer"
                      className={`flex items-center gap-3 bg-cream-50 ${s.color} text-steel px-4 py-3 rounded-xl font-medium transition-all duration-200 border border-cream-200 hover:border-current/20 hover:shadow-sm`}>
                      <s.icon size={18} />
                      <span className="text-sm">{s.label}</span>
                      <span className="ml-auto text-xs opacity-40">→</span>
                    </a>
                  ))}
                </div>
              </div>

              <div className={`bg-white rounded-2xl shadow-card border border-cream-200 p-6 ${isVisible ? 'animate-fade-in' : 'opacity-0'}`} style={{ transitionDelay: '200ms' }}>
                <h2 className="text-lg font-display font-bold text-espresso-800 mb-4">Pregúntanos lo que quieras</h2>
                <p className="text-sm text-steel mb-4">Resolvemos dudas sobre menú, reservas, eventos especiales o pedidos grandes.</p>
                <a href={`https://wa.me/${CONFIG.contacto.whatsapp}?text=${encodeURIComponent('Hola! Tengo una consulta sobre...')}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-3 rounded-xl font-medium hover:bg-emerald-100 transition-all border border-emerald-200">
                  <FaWhatsapp size={16} /> Escribir por WhatsApp
                </a>
              </div>

              <div className={`bg-white rounded-2xl shadow-card border border-cream-200 p-6 ${isVisible ? 'animate-fade-in' : 'opacity-0'}`} style={{ transitionDelay: '250ms' }}>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 bg-olive-100 rounded-xl flex items-center justify-center">
                    <FaPaperPlane className="text-olive-500" size={16} />
                  </div>
                  <div>
                    <h2 className="text-lg font-display font-bold text-espresso-800">Deja tu reseña</h2>
                    <p className="text-xs text-steel">Comparte tu experiencia</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <input
                    value={reviewName}
                    onChange={(e) => setReviewName(e.target.value)}
                    placeholder="Tu nombre"
                    className="w-full px-4 py-2.5 bg-cream-50 border border-cream-200 rounded-xl text-sm text-espresso-800 focus:outline-none focus:ring-2 focus:ring-olive-500/30 focus:border-olive-500 transition-all"
                  />
                  <input
                    value={reviewEmail}
                    onChange={(e) => setReviewEmail(e.target.value)}
                    placeholder="Tu email (opcional)"
                    className="w-full px-4 py-2.5 bg-cream-50 border border-cream-200 rounded-xl text-sm text-espresso-800 focus:outline-none focus:ring-2 focus:ring-olive-500/30 focus:border-olive-500 transition-all"
                  />
                  <div>
                    <p className="text-xs font-semibold text-espresso-700 mb-1.5">Calificación</p>
                    <StarRating value={reviewRating} onChange={setReviewRating} />
                  </div>
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Cuéntanos sobre tu experiencia..."
                    rows={3}
                    className="w-full px-4 py-2.5 bg-cream-50 border border-cream-200 rounded-xl text-sm text-espresso-800 focus:outline-none focus:ring-2 focus:ring-olive-500/30 focus:border-olive-500 transition-all resize-none"
                  />
                  <button
                    onClick={handleSubmitReview}
                    className="w-full flex items-center justify-center gap-2 bg-olive-500 hover:bg-olive-600 text-white px-4 py-3 rounded-xl text-sm font-semibold transition-all shadow-sm shadow-olive-500/20"
                  >
                    <FaPaperPlane size={14} /> Enviar reseña
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
