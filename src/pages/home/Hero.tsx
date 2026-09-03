import { Link } from 'react-router-dom'

export default function Hero() {
  return (
    <section className="relative h-[90vh] min-h-[600px] flex items-center bg-ink overflow-hidden pt-16">
      <img
        src="/platos/bandeja_paisa.webp"
        alt=""
        className="absolute inset-0 w-full h-full object-cover opacity-60"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-ink/90 via-ink/60 to-transparent" />

      <div className="relative max-w-content mx-auto px-6 w-full">
        <div className="max-w-xl">
          <p className="text-brick-400 font-medium text-sm tracking-[0.2em] uppercase mb-4">Restaurante colombiano</p>
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-white leading-tight mb-5">
            Sabor y Origen
          </h1>
          <p className="text-lg md:text-xl text-white/60 mb-10 leading-relaxed max-w-lg">
            Tradición colombiana en cada plato. Ingredientes frescos, recetas de siempre y un ambiente que se siente como casa.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              to="/menu"
              className="bg-brick-500 hover:bg-brick-600 text-white px-8 py-3.5 rounded-xl font-semibold transition-all shadow-lg shadow-brick-500/30"
            >
              Ver menú
            </Link>
            <Link
              to="/reservas"
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-8 py-3.5 rounded-xl font-semibold transition-all backdrop-blur-sm"
            >
              Reservar mesa
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
