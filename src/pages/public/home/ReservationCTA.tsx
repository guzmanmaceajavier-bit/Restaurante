import { Link } from 'react-router-dom'
import { FaCalendarAlt, FaUsers, FaConciergeBell, FaGlassCheers } from 'react-icons/fa'
import { useScrollAnimate } from '@/hooks/useScrollAnimate'

export default function ReservationCTA() {
  const { ref, isVisible } = useScrollAnimate(0.1)

  return (
    <section className="py-20 px-6 bg-cream-50">
      <div className="max-w-content mx-auto" ref={ref}>
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className={`${isVisible ? 'animate-fade-in' : 'opacity-0'}`}>
            <span className="text-olive-500 font-semibold text-sm tracking-[0.15em] uppercase">Reservas</span>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-espresso-800 mt-2 mb-5">
              Reserva tu mesa<br />
              <span className="text-olive-500">y vive la experiencia</span>
            </h2>
            <p className="text-steel leading-relaxed mb-8 max-w-md text-sm">
              Ya sea una cena romántica, un almuerzo familiar o una celebración especial, tenemos el espacio perfecto para ti.
            </p>
            <div className="grid grid-cols-2 gap-4 mb-8">
              {[
                { icon: FaCalendarAlt, text: 'Elige fecha y hora' },
                { icon: FaUsers, text: 'Hasta 20 personas' },
                { icon: FaConciergeBell, text: 'Servicio personalizado' },
                { icon: FaGlassCheers, text: 'Decoración disponible' },
              ].map((f, i) => (
                <div key={f.text} className={`flex items-center gap-2.5 ${isVisible ? 'animate-fade-in' : 'opacity-0'}`} style={{ transitionDelay: `${(i + 1) * 100}ms` }}>
                  <div className="w-8 h-8 bg-olive-100 rounded-lg flex items-center justify-center shrink-0">
                    <f.icon className="text-olive-500" size={14} />
                  </div>
                  <span className="text-xs font-medium text-espresso-700">{f.text}</span>
                </div>
              ))}
            </div>
            <Link to="/reservas" className="inline-flex items-center gap-2 btn-primary text-sm">
              Reservar ahora <span>→</span>
            </Link>
          </div>
          <div className={`relative ${isVisible ? 'animate-fade-in' : 'opacity-0'}`} style={{ transitionDelay: '200ms' }}>
            <div className="relative rounded-2xl overflow-hidden aspect-[4/5]">
              <img src="/platos/patacones.webp" alt="Reserva tu mesa" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-espresso-900/40 to-transparent" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
