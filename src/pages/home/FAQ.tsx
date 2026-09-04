import { useState } from 'react'
import { FaChevronDown } from 'react-icons/fa'
import { useScrollAnimate } from '@/hooks/useScrollAnimate'
import clsx from 'clsx'

const faqs = [
  {
    q: '¿Hacen domicilios?',
    a: 'Sí, realizamos domicilios en todo el municipio de Sahagún. El tiempo de entrega es de 30 a 45 minutos dependiendo de la zona.',
  },
  {
    q: '¿Cómo acumulo puntos?',
    a: 'Por cada $10.000 en compras acumulas 1 punto. Los puntos se reflejan automáticamente en tu cuenta y subes de nivel según tu acumulado.',
  },
  {
    q: '¿Puedo reservar para eventos grandes?',
    a: 'Claro, manejamos eventos hasta para 20 personas. Contáctanos con anticipación para personalizar tu menú y espacio.',
  },
  {
    q: '¿Tienen opciones vegetarianas?',
    a: 'Sí, contamos con platos vegetarianos como ensaladas, patacones, arroz con vegetales y más. Consulta nuestro menú completo.',
  },
  {
    q: '¿Aceptan tarjeta de crédito?',
    a: 'Aceptamos efectivo, Nequi, Daviplata y transferencia bancaria. Próximamente acceptaremos tarjetas de crédito y débito.',
  },
]

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(null)
  const { ref, isVisible } = useScrollAnimate(0.1)

  return (
    <section className="py-20 px-6 bg-white" ref={ref}>
      <div className="max-w-2xl mx-auto">
        <div className={`text-center mb-10 ${isVisible ? 'animate-fade-in' : 'opacity-0'}`}>
          <span className="text-olive-500 font-semibold text-sm tracking-[0.15em] uppercase">Preguntas frecuentes</span>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-espresso-800 mt-3">¿Tienes dudas?</h2>
        </div>

        <div className="space-y-3">
          {faqs.map((f, i) => (
            <div
              key={i}
              className={clsx(
                'border border-cream-200 rounded-2xl overflow-hidden transition-all duration-300',
                open === i ? 'shadow-card bg-cream-50/50' : 'bg-white hover:border-cream-300',
                isVisible ? 'animate-fade-in' : 'opacity-0'
              )}
              style={{ transitionDelay: `${i * 60}ms` }}
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-4 text-left"
              >
                <span className="text-sm font-semibold text-espresso-800 pr-4">{f.q}</span>
                <FaChevronDown
                  size={14}
                  className={clsx(
                    'text-steel shrink-0 transition-transform duration-300',
                    open === i && 'rotate-180 text-olive-500'
                  )}
                />
              </button>
              <div
                className={clsx(
                  'overflow-hidden transition-all duration-300',
                  open === i ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
                )}
              >
                <p className="px-6 pb-4 text-sm text-steel leading-relaxed">{f.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
