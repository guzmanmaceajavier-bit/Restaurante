import { Link } from 'react-router-dom'
import { SEO } from '../lib/seo'
import { CONFIG } from '../lib/config'
import { FaUtensils, FaHeart, FaLeaf, FaUsers, FaArrowRight } from 'react-icons/fa'

const values = [
  { icon: FaUtensils, title: 'Tradición', desc: 'Recetas heredadas de generación en generación, con el sabor auténtico de la cocina colombiana.' },
  { icon: FaHeart, title: 'Pasión', desc: 'Cada plato es preparado con amor y dedicación, como si fuera para nuestra propia familia.' },
  { icon: FaLeaf, title: 'Freshcura', desc: 'Ingredientes frescos y locales, apoyando a productores de la región.' },
  { icon: FaUsers, title: 'Comunidad', desc: 'Un espacio donde las familias y amigos se reúnen a compartir momentos especiales.' },
]

const timeline = [
  { year: '2018', title: 'El comienzo', desc: 'Abrimos nuestras puertas con un sueño: llevar el verdadero sabor colombiano a cada mesa.' },
  { year: '2020', title: 'Crecimiento', desc: 'Expandimos nuestro menú y comenzamos a ofrecer servicio de domicilio.' },
  { year: '2022', title: 'Reconocimiento', desc: 'Fuimos reconocidos como uno de los mejores restaurantes de la región.' },
  { year: '2024', title: 'Innovación', desc: 'Lanzamos nuestra plataforma digital para una mejor experiencia de pedido.' },
]

export default function AboutUs() {
  return (
    <>
      <SEO title="Nosotros" description="Conoce la historia de Sabor y Origen, un restaurante de comida colombiana tradicional" />

      {/* Hero */}
      <section className="relative bg-olive-600 text-white py-20 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/hero.webp')] bg-cover bg-center opacity-20" />
        <div className="max-w-content mx-auto relative text-center">
          <span className="inline-block text-sm font-semibold uppercase tracking-wider text-gold-300 mb-4">Nuestra historia</span>
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">Sabor y Origen</h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">Más que un restaurante, somos un pedazo de Colombia en cada plato</p>
        </div>
      </section>

      {/* Story */}
      <section className="py-16 px-6">
        <div className="max-w-content mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-sm font-semibold text-olive-600 uppercase tracking-wider">Quiénes somos</span>
            <h2 className="text-3xl font-display font-bold text-espresso-800 dark:text-cream-200 mt-2 mb-4">Tradición que se saborea</h2>
            <p className="text-steel dark:text-cream-400 leading-relaxed mb-4">
              {CONFIG.restaurante.nombre} nació del amor por la cocina colombiana y la nostalgia de los sabores de la infancia. Nos dedicamos a preservar las recetas tradicionales mientras innovamos con un toque moderno.
            </p>
            <p className="text-steel dark:text-cream-400 leading-relaxed">
              Nuestro equipo de cocineros apasionados trabaja cada día para ofrecerte una experiencia gastronómica única, donde cada bocado te transporta a los campos y hogares de Colombia.
            </p>
          </div>
          <div className="relative">
            <div className="aspect-[4/3] bg-cream-200 dark:bg-[#252e1e] rounded-3xl overflow-hidden">
              <img src="/fondo-comida.png" alt="Nuestra cocina" className="w-full h-full object-cover" />
            </div>
            <div className="absolute -bottom-4 -left-4 bg-olive-500 text-white p-4 rounded-2xl shadow-lg">
              <p className="text-2xl font-display font-bold">7+</p>
              <p className="text-xs opacity-80">Años de experiencia</p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 px-6 bg-cream-100 dark:bg-[#1e2518]">
        <div className="max-w-content mx-auto text-center">
          <span className="text-sm font-semibold text-olive-600 uppercase tracking-wider">Nuestros valores</span>
          <h2 className="text-3xl font-display font-bold text-espresso-800 dark:text-cream-200 mt-2 mb-10">Lo que nos define</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v) => (
              <div key={v.title} className="bg-white dark:bg-[#252e1e] p-6 rounded-2xl border border-cream-200 dark:border-[#2d3523] hover:shadow-lift transition-all">
                <div className="w-14 h-14 bg-olive-100 dark:bg-olive-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <v.icon size={24} className="text-olive-600" />
                </div>
                <h3 className="font-display font-bold text-espresso-800 dark:text-cream-200 mb-2">{v.title}</h3>
                <p className="text-sm text-steel dark:text-cream-400">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 px-6">
        <div className="max-w-content mx-auto text-center">
          <span className="text-sm font-semibold text-olive-600 uppercase tracking-wider">Nuestro camino</span>
          <h2 className="text-3xl font-display font-bold text-espresso-800 dark:text-cream-200 mt-2 mb-10">Cronología</h2>
          <div className="max-w-2xl mx-auto space-y-8">
            {timeline.map((t, i) => (
              <div key={t.year} className={`flex items-start gap-6 ${i % 2 === 0 ? '' : 'flex-row-reverse text-right'}`}>
                <div className="w-16 h-16 bg-olive-500 text-white rounded-2xl flex items-center justify-center shrink-0 font-display font-bold">
                  {t.year}
                </div>
                <div>
                  <h3 className="font-bold text-espresso-800 dark:text-cream-200">{t.title}</h3>
                  <p className="text-sm text-steel dark:text-cream-400">{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-6 bg-olive-600 text-white">
        <div className="max-w-content mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: '7+', label: 'Años' },
            { value: '15K+', label: 'Pedidos servidos' },
            { value: '4.8', label: 'Calificación promedio' },
            { value: '50+', label: 'Platos en menú' },
          ].map(s => (
            <div key={s.label}>
              <p className="text-3xl font-display font-bold">{s.value}</p>
              <p className="text-sm text-white/70 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 text-center">
        <div className="max-w-content mx-auto">
          <h2 className="text-3xl font-display font-bold text-espresso-800 dark:text-cream-200 mb-4">¿Listo para probar?</h2>
          <p className="text-steel dark:text-cream-400 mb-8 max-w-md mx-auto">Descubre nuestros platos favoritos y vive la experiencia {CONFIG.restaurante.nombre}</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/menu" className="btn-primary inline-flex items-center gap-2">
              Ver menú <FaArrowRight size={14} />
            </Link>
            <Link to="/reservas" className="inline-flex items-center gap-2 px-6 py-3 border-2 border-olive-500 text-olive-600 dark:text-olive-400 dark:border-olive-400 rounded-xl font-semibold hover:bg-olive-50 dark:hover:bg-olive-900/20 transition-colors">
              Reservar mesa
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
