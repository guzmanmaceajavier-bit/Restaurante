import { Link } from 'react-router-dom'
import { CONFIG, type Promocion, type Combo } from '../lib/config'
import { SEO } from '../lib/seo'
import { FaTag, FaPercent, FaBox, FaArrowRight, FaFire } from 'react-icons/fa'

const promosMock: Promocion[] = CONFIG.promociones
const combosMock: Combo[] = CONFIG.combos

export default function Promociones() {
  return (
    <>
      <SEO title="Promociones y Combos" description="Aprovecha nuestras promociones" />

      <section className="pt-28 pb-6 px-6">
        <div className="max-w-content mx-auto">
          <div className="max-w-xl">
            <span className="text-brick-500 font-semibold text-sm uppercase tracking-[0.2em]">Ofertas</span>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-ink mt-3 leading-tight">Promociones y Combos</h1>
            <p className="text-steel mt-3">Aprovecha nuestras ofertas especiales</p>
          </div>
        </div>
      </section>

      <section className="pb-20 px-6">
        <div className="max-w-content mx-auto space-y-8">
          {promosMock.length > 0 && (
            <div className="bg-white rounded-2xl shadow-card border border-smoke p-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-warm rounded-2xl flex items-center justify-center">
                  <FaTag className="text-brick-500 text-xl" />
                </div>
                <div>
                  <h2 className="text-2xl font-serif font-bold text-ink">Promociones vigentes</h2>
                  <p className="text-sm text-steel">No dejes pasar estas ofertas</p>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {promosMock.map((p, i) => (
                  <div key={p.id} className="relative bg-warm border border-smoke rounded-2xl p-6 hover:shadow-lift transition-all group">
                    {i === 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-lg">
                        <FaFire /> HOT
                      </span>
                    )}
                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <FaPercent className="text-brick-500 text-2xl" />
                    </div>
                    <h3 className="text-lg font-bold text-ink">{p.titulo}</h3>
                    <p className="text-steel text-sm mt-2 leading-relaxed">{p.descripcion}</p>
                    {p.codigo && (
                      <div className="mt-4 bg-white border border-smoke rounded-xl px-4 py-2.5 inline-flex items-center gap-2">
                        <span className="text-xs text-steel">Código:</span>
                        <span className="font-bold text-brick-600 font-mono tracking-wider">{p.codigo}</span>
                      </div>
                    )}
                    {p.descuento > 0 && (
                      <div className="mt-3">
                        <span className="inline-block bg-emerald-100 text-emerald-700 text-sm font-bold px-3 py-1 rounded-full">
                          {p.descuento}% OFF
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {combosMock.length > 0 && (
            <div className="bg-white rounded-2xl shadow-card border border-smoke p-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-warm rounded-2xl flex items-center justify-center">
                  <FaBox className="text-brick-500 text-xl" />
                </div>
                <div>
                  <h2 className="text-2xl font-serif font-bold text-ink">Combos especiales</h2>
                  <p className="text-sm text-steel">Pensados para compartir</p>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-6">
                {combosMock.map((c) => {
                  const desc = Math.round((1 - c.precio / c.precioOriginal) * 100)
                  return (
                    <div key={c.id} className="bg-warm border border-smoke rounded-2xl p-6 hover:shadow-lift transition-all">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shrink-0">
                          <FaBox className="text-brick-500 text-2xl" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="text-xl font-bold text-ink">{c.nombre}</h3>
                            <span className="bg-emerald-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shrink-0">
                              -{desc}%
                            </span>
                          </div>
                          <p className="text-steel text-sm mt-2">{c.descripcion}</p>
                          {c.paraCompartir && (
                            <span className="inline-block mt-2 bg-white text-brick-600 text-xs font-semibold px-2.5 py-1 rounded-full">
                              👥 Para compartir
                            </span>
                          )}
                          <div className="mt-3">
                            <span className="text-2xl font-bold text-brick-600">
                              ${c.precio.toLocaleString('es-CO')}
                            </span>
                            <span className="text-sm text-steel line-through ml-2">
                              ${c.precioOriginal.toLocaleString('es-CO')}
                            </span>
                          </div>
                          <div className="mt-3">
                            <p className="text-xs text-steel mb-1.5 font-semibold uppercase tracking-wide">Incluye:</p>
                            <ul className="space-y-1">
                              {c.productos.map(p => (
                                <li key={p} className="text-sm text-steel flex items-center gap-2">
                                  <span className="w-1.5 h-1.5 bg-brick-500 rounded-full shrink-0" />
                                  {p}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <Link
                            to="/menu"
                            className="mt-4 inline-flex items-center gap-2 bg-brick-500 hover:bg-brick-600 text-white px-6 py-2.5 rounded-xl font-semibold transition-all text-sm shadow-lg shadow-brick-500/30"
                          >
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

          <div className="bg-ink rounded-2xl p-10 text-white text-center border border-white/5">
            <h2 className="text-3xl font-serif font-bold mb-3">¿Listo para disfrutar?</h2>
            <p className="text-white/40 mb-6 max-w-md mx-auto">Aprovecha nuestras promociones y haz tu pedido ahora</p>
            <Link
              to="/menu"
              className="inline-flex items-center gap-2 bg-brick-500 hover:bg-brick-600 text-white px-8 py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-brick-500/30"
            >
              Ir al menú <FaArrowRight />
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
