import { Link } from 'react-router-dom'
import { CONFIG } from '../lib/config'
import { SEO } from '../lib/seo'
import { FaTag, FaPercent, FaBox, FaArrowRight, FaFire } from 'react-icons/fa'

export default function Promociones() {
  return (
    <>
      <SEO title="Promociones y Combos" description="Aprovecha nuestras promociones" />
      <section className="pt-8 pb-6 px-6">
        <div className="max-w-content mx-auto">
          <div className="max-w-xl">
            <span className="text-olive-500 font-semibold text-sm uppercase tracking-[0.2em]">Ofertas</span>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-espresso-800 mt-3 leading-tight">Promociones y Combos</h1>
            <p className="text-steel mt-3">Aprovecha nuestras ofertas especiales</p>
          </div>
        </div>
      </section>

      <section className="pb-20 px-6">
        <div className="max-w-content mx-auto space-y-8">
          {CONFIG.promociones.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-olive-100 rounded-xl flex items-center justify-center">
                  <FaTag className="text-olive-500" />
                </div>
                <div>
                  <h2 className="text-xl font-display font-bold text-espresso-800">Promociones vigentes</h2>
                  <p className="text-xs text-steel">No dejes pasar estas ofertas</p>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {CONFIG.promociones.map((p, i) => (
                  <div
                    key={p.id}
                    className="group relative bg-white border border-cream-200 rounded-2xl p-6 hover:shadow-lift hover:-translate-y-1 transition-all duration-300 ease-out"
                    style={{ animationDelay: `${i * 100}ms` }}
                  >
                    {i === 0 && (
                      <span className="absolute -top-2.5 -right-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-lg animate-pulse">
                        <FaFire /> HOT
                      </span>
                    )}
                    <div className="w-12 h-12 bg-olive-50 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-olive-100 transition-all duration-300">
                      <FaPercent className="text-olive-500 text-xl group-hover:rotate-12 transition-transform duration-300" />
                    </div>
                    <h3 className="text-lg font-bold text-espresso-800 group-hover:text-olive-600 transition-colors">{p.titulo}</h3>
                    <p className="text-steel text-sm mt-2 leading-relaxed">{p.descripcion}</p>
                    {p.codigo && (
                      <div className="mt-4 bg-cream-50 border border-cream-200 rounded-lg px-3 py-2 inline-flex items-center gap-2 group-hover:bg-olive-50 group-hover:border-olive-200 transition-all">
                        <span className="text-xs text-steel">Código:</span>
                        <span className="font-bold text-olive-600 font-mono tracking-wider text-sm">{p.codigo}</span>
                      </div>
                    )}
                    {p.descuento > 0 && (
                      <div className="mt-3">
                        <span className="inline-block bg-gradient-to-r from-olive-500 to-olive-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                          {p.descuento}% OFF
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {CONFIG.combos.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gold-100 rounded-xl flex items-center justify-center">
                  <FaBox className="text-gold-600" />
                </div>
                <div>
                  <h2 className="text-xl font-display font-bold text-espresso-800">Combos especiales</h2>
                  <p className="text-xs text-steel">Pensados para compartir</p>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-5">
                {CONFIG.combos.map((c) => {
                  const desc = Math.round((1 - c.precio / c.precioOriginal) * 100)
                  return (
                    <div key={c.id} className="group bg-white border border-cream-200 rounded-2xl p-6 hover:shadow-lift hover:-translate-y-1 transition-all duration-300 ease-out">
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 bg-gold-50 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-gold-100 transition-all duration-300">
                          <FaBox className="text-gold-500 text-xl group-hover:rotate-12 transition-transform duration-300" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="text-lg font-bold text-espresso-800 group-hover:text-olive-600 transition-colors">{c.nombre}</h3>
                            <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shrink-0 shadow-sm">-{desc}%</span>
                          </div>
                          <p className="text-steel text-sm mt-2">{c.descripcion}</p>
                          {c.paraCompartir && (
                            <span className="inline-block mt-2 bg-cream-100 text-olive-600 text-xs font-semibold px-2.5 py-1 rounded-full border border-cream-200">👥 Para compartir</span>
                          )}
                          <div className="mt-3">
                            <span className="text-2xl font-bold text-olive-600">${c.precio.toLocaleString('es-CO')}</span>
                            <span className="text-sm text-steel line-through ml-2">${c.precioOriginal.toLocaleString('es-CO')}</span>
                          </div>
                          <div className="mt-3">
                            <p className="text-xs text-steel mb-1.5 font-semibold uppercase tracking-wide">Incluye:</p>
                            <ul className="space-y-1">
                              {c.productos.map(p => (
                                <li key={p} className="text-sm text-steel flex items-center gap-2">
                                  <span className="w-1.5 h-1.5 bg-olive-500 rounded-full shrink-0" />{p}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <Link to="/menu" className="mt-4 btn-primary text-sm py-2.5 px-6 inline-flex items-center gap-2">
                            Pedir combo <FaArrowRight size={12} />
                          </Link>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          <div className="relative bg-gradient-to-br from-olive-600 via-olive-700 to-espresso-800 rounded-2xl p-10 text-white text-center overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-40 h-40 bg-gold-400 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-60 h-60 bg-white rounded-full blur-3xl" />
            </div>
            <div className="relative">
              <h2 className="text-3xl font-display font-bold mb-3">¿Listo para disfrutar?</h2>
              <p className="text-olive-100/80 mb-6 max-w-md mx-auto">Aprovecha nuestras promociones y haz tu pedido ahora</p>
              <Link to="/menu" className="inline-flex items-center gap-2 bg-white text-olive-700 px-8 py-3.5 rounded-xl font-bold transition-all hover:bg-cream-50 hover:scale-105 shadow-lg">
                Ir al menú <FaArrowRight />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
