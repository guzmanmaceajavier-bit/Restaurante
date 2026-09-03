import { FaBirthdayCake, FaBriefcase, FaUsers, FaGlassCheers } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import { SEO } from '../lib/seo'

const events = [
  {
    icon: FaBirthdayCake,
    title: 'Cumpleaños',
    desc: 'Celebra tu día especial con nosotros. Menú personalizado, decoración y pastel incluido.',
    features: ['Menú especial', 'Decoración temática', 'Pastel de cortesía', 'Música ambiental'],
  },
  {
    icon: FaBriefcase,
    title: 'Eventos Empresariales',
    desc: 'Reuniones de negocios, almuerzos corporativos y cenas de empresa.',
    features: ['Salón privado', 'Equipo audiovisual', 'Menú ejecutivo', 'Atención personalizada'],
  },
  {
    icon: FaUsers,
    title: 'Reuniones Familiares',
    desc: 'Espacio perfecto para compartir en familia con un ambiente acogedor.',
    features: ['Menú infantil', 'Zona privada', 'Precios especiales', 'Estacionamiento'],
  },
  {
    icon: FaGlassCheers,
    title: 'Catering para Eventos',
    desc: 'Llevamos nuestros sabores a tus eventos. Bodas, fiestas y más.',
    features: ['Menú personalizado', 'Buffet o servicio a la mesa', 'Bebidas incluidas', 'Transporte'],
  },
]

export default function Events() {
  return (
    <>
      <SEO title="Eventos" description="Eventos empresariales, cumpleaños, reuniones y catering en Sabor y Origen" />
      <section className="min-h-screen bg-white py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h1 className="text-4xl font-bold text-orange-700 mb-4">Eventos y Catering</h1>
          <div className="w-24 h-1 bg-orange-500 mx-auto rounded-full mb-6" />
          <p className="text-gray-600 max-w-2xl mx-auto">
            En Sabor y Origen hacemos de tu evento una experiencia inolvidable.
            Contáctanos para crear un menú personalizado.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {events.map((event) => (
            <div
              key={event.title}
              className="bg-orange-50 border border-orange-100 rounded-2xl p-8 hover:shadow-xl transition-all hover:-translate-y-1"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-orange-200 rounded-xl flex items-center justify-center">
                  <event.icon className="text-orange-700 text-2xl" />
                </div>
                <h2 className="text-2xl font-bold text-orange-800">{event.title}</h2>
              </div>
              <p className="text-gray-600 mb-4">{event.desc}</p>
              <ul className="space-y-2">
                {event.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="text-center mt-16 bg-gradient-to-r from-orange-500 to-orange-700 rounded-2xl p-10 text-white">
          <h2 className="text-3xl font-bold mb-4">¿Tienes un evento en mente?</h2>
          <p className="mb-6 text-orange-100">Contáctanos y te armamos un plan a tu medida.</p>
          <Link
            to="/contacto"
            className="inline-block bg-white text-orange-700 px-8 py-3 rounded-xl font-semibold hover:bg-orange-50 transition-all"
          >
            Solicitar cotización
          </Link>
        </div>
      </div>
    </section>
    </>
  )
}
