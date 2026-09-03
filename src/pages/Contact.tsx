import { CONFIG } from '../lib/config'
import { SEO } from '../lib/seo'
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock, FaInstagram, FaFacebook, FaWhatsapp, FaStar } from 'react-icons/fa'

const reviews = [
  { name: 'María López', text: 'La mejor comida colombiana que he probado fuera de casa. La bandeja paisa es espectacular.', rating: 5 },
  { name: 'Carlos Gómez', text: 'El ambiente es increíble, perfecto para celebraciones familiares.', rating: 5 },
  { name: 'Ana Martínez', text: 'El servicio es excelente y los precios son justos. Recomiendo la cazuela de mariscos.', rating: 5 },
]

export default function Contact() {
  return (
    <>
      <SEO title="Contacto" description="Contacta con Sabor y Origen" />

      <section className="pt-32 pb-6 px-6">
        <div className="max-w-content mx-auto">
          <div className="max-w-xl">
            <span className="text-brick-500 font-semibold text-sm uppercase tracking-[0.2em]">Contacto</span>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-ink mt-3 leading-tight">Estamos aquí para ti</h1>
            <p className="text-steel mt-3">Visítanos, llámanos o escríbenos.</p>
          </div>
        </div>
      </section>

      <section className="pb-20 px-6">
        <div className="max-w-content mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white rounded-2xl shadow-card border border-smoke overflow-hidden">
                <div className="h-[320px]">
                  <iframe src={CONFIG.contacto.mapaUrl} width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" title="Ubicación" />
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow-card border border-smoke p-8">
                <h2 className="text-2xl font-serif font-bold text-ink mb-6">Lo que dicen nuestros clientes</h2>
                <div className="grid sm:grid-cols-3 gap-4">
                  {reviews.map(r => (
                    <div key={r.name} className="bg-warm rounded-xl p-5">
                      <div className="flex gap-1 text-amber-400 mb-3">{Array.from({ length: r.rating }).map((_, i) => <FaStar key={i} size={14} />)}</div>
                      <p className="text-sm text-steel leading-relaxed">"{r.text}"</p>
                      <p className="text-sm font-semibold text-ink mt-3">— {r.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-card border border-smoke p-8">
                <h2 className="text-lg font-serif font-bold text-ink mb-6">Información</h2>
                <div className="space-y-5">
                  {[
                    { icon: FaMapMarkerAlt, label: 'Dirección', value: CONFIG.contacto.direccion },
                    { icon: FaPhone, label: 'Teléfono', value: CONFIG.contacto.telefono, href: `tel:${CONFIG.contacto.telefono}` },
                    { icon: FaEnvelope, label: 'Email', value: CONFIG.contacto.email, href: `mailto:${CONFIG.contacto.email}` },
                    { icon: FaClock, label: 'Horario', value: CONFIG.contacto.horario },
                  ].map(item => (
                    <div key={item.label} className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-warm rounded-xl flex items-center justify-center shrink-0">
                        <item.icon className="text-brick-500" size={16} />
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-ink">{item.label}</p>
                        {'href' in item && item.href ? (
                          <a href={item.href} className="text-sm text-brick-500 hover:text-brick-600 mt-0.5 block transition-colors">
                            {item.value}
                          </a>
                        ) : (
                          <p className="text-sm text-steel mt-0.5">{item.value}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-card border border-smoke p-8">
                <h2 className="text-lg font-serif font-bold text-ink mb-6">Síguenos</h2>
                <div className="flex flex-col gap-3">
                  <a href={CONFIG.redes[0].url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 bg-warm hover:bg-brick-50 text-steel hover:text-brick-600 px-5 py-3 rounded-xl font-medium transition-all duration-200">
                    <FaInstagram size={18} /> Instagram
                  </a>
                  <a href={CONFIG.redes[1].url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 bg-warm hover:bg-brick-50 text-steel hover:text-brick-600 px-5 py-3 rounded-xl font-medium transition-all duration-200">
                    <FaFacebook size={18} /> Facebook
                  </a>
                  <a href={CONFIG.redes[2].url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 bg-warm hover:bg-brick-50 text-steel hover:text-brick-600 px-5 py-3 rounded-xl font-medium transition-all duration-200">
                    <FaWhatsapp size={18} /> WhatsApp
                  </a>
                </div>
              </div>

              <div className="bg-ink rounded-2xl p-8 text-center border border-white/5">
                <FaWhatsapp size={36} className="mx-auto mb-4 text-brick-400" />
                <h3 className="text-lg font-serif font-bold text-white mb-2">¿Prefieres escribirnos?</h3>
                <p className="text-white/40 text-sm mb-6">Respuesta inmediata por WhatsApp</p>
                <a href={`https://wa.me/${CONFIG.contacto.whatsapp}`} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-brick-500 hover:bg-brick-600 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-brick-500/30">
                  <FaWhatsapp size={18} /> Escribir ahora
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
