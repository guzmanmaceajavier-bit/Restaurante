import { FaBirthdayCake, FaBriefcase, FaUsers, FaGlassCheers, FaPhone, FaArrowRight } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import { SEO } from '../lib/seo'
import { CONFIG } from '../lib/config'

const events = [
  { icon: FaBirthdayCake, title: 'Cumpleaños', desc: 'Celebra tu día especial con nosotros. Menú personalizado, decoración y pastel incluido.', features: ['Menú especial', 'Decoración temática', 'Pastel de cortesía', 'Música ambiental'], color: 'from-pink-500 to-rose-500', bg: 'bg-pink-50', iconColor: 'text-pink-500' },
  { icon: FaBriefcase, title: 'Eventos Empresariales', desc: 'Reuniones de negocios, almuerzos corporativos y cenas de empresa.', features: ['Salón privado', 'Equipo audiovisual', 'Menú ejecutivo', 'Atención personalizada'], color: 'from-blue-500 to-indigo-500', bg: 'bg-blue-50', iconColor: 'text-blue-500' },
  { icon: FaUsers, title: 'Reuniones Familiares', desc: 'Espacio perfecto para compartir en familia con un ambiente acogedor.', features: ['Menú infantil', 'Zona privada', 'Precios especiales', 'Estacionamiento'], color: 'from-olive-500 to-olive-600', bg: 'bg-olive-50', iconColor: 'text-olive-500' },
  { icon: FaGlassCheers, title: 'Catering para Eventos', desc: 'Llevamos nuestros sabores a tus eventos. Bodas, fiestas y más.', features: ['Menú personalizado', 'Buffet o servicio a la mesa', 'Bebidas incluidas', 'Transporte'], color: 'from-amber-500 to-orange-500', bg: 'bg-amber-50', iconColor: 'text-amber-500' },
]

export default function Events() {
  return (
    <>
      <SEO title="Eventos" description="Eventos empresariales, cumpleaños, reuniones y catering en Sabor y Origen" />

      <section className="relative py-20 px-6 bg-gradient-to-br from-olive-600 via-olive-700 to-espresso-800 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-40 h-40 bg-gold-400 rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-10 w-60 h-60 bg-white rounded-full blur-3xl" />
        </div>
        <div className="max-w-content mx-auto relative text-center">
          <span className="inline-block text-olive-200 font-semibold text-sm uppercase tracking-[0.2em] mb-3">Eventos</span>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-white leading-tight mb-4">Eventos y Catering</h1>
          <p className="text-olive-100/80 max-w-xl mx-auto text-sm">En Sabor y Origen hacemos de tu evento una experiencia inolvidable. Contáctanos para crear un menú personalizado.</p>
        </div>
      </section>

      <section className="py-16 px-6">
        <div className="max-w-content mx-auto">
          <div className="grid md:grid-cols-2 gap-6">
            {events.map((event, i) => (
              <div
                key={event.title}
                className="group bg-white border border-cream-200 rounded-2xl p-6 hover:shadow-lift hover:-translate-y-1 transition-all duration-300 ease-out"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-12 h-12 ${event.bg} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <event.icon className={`${event.iconColor} text-xl`} />
                  </div>
                  <h2 className="text-xl font-bold text-espresso-800 group-hover:text-olive-600 transition-colors">{event.title}</h2>
                </div>
                <p className="text-steel text-sm mb-4 leading-relaxed">{event.desc}</p>
                <ul className="space-y-2">
                  {event.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-espresso-700">
                      <span className={`w-1.5 h-1.5 bg-gradient-to-r ${event.color} rounded-full`} />{f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-12 relative bg-gradient-to-br from-olive-600 via-olive-700 to-espresso-800 rounded-2xl p-10 text-white overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-40 h-40 bg-gold-400 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-60 h-60 bg-white rounded-full blur-3xl" />
            </div>
            <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                <h2 className="text-2xl font-display font-bold mb-2">¿Tienes un evento en mente?</h2>
                <p className="text-olive-100/80 text-sm">Contáctanos y te armamos un plan a tu medida.</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  to="/contacto"
                  className="inline-flex items-center justify-center gap-2 bg-white text-olive-700 px-6 py-3 rounded-xl font-semibold hover:bg-cream-50 hover:scale-105 transition-all shadow-lg"
                >
                  <FaPhone size={14} /> Solicitar cotización
                </Link>
                <a
                  href={`https://wa.me/${CONFIG.contacto.whatsapp}?text=${encodeURIComponent('Hola! Me interesa cotizar un evento...')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-emerald-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-emerald-600 hover:scale-105 transition-all shadow-lg"
                >
                  WhatsApp <FaArrowRight size={14} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
