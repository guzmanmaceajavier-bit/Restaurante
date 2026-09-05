import { Link } from 'react-router-dom'
import { SEO } from '../lib/seo'
import { getRestaurantConfig } from '../lib/config'
import { FaFileContract, FaShoppingCart, FaTag, FaCalendarCheck, FaTruck, FaExchangeAlt, FaCopyright, FaExclamationTriangle, FaGavel } from 'react-icons/fa'

const config = getRestaurantConfig()

const sections = [
  {
    icon: FaFileContract,
    title: '1. Aceptación de términos',
    content: `Al acceder y utilizar el sitio web y los servicios de ${config.nombre}, aceptas estos términos y condiciones en su totalidad. Si no estás de acuerdo con alguno de estos términos, no utilices nuestros servicios.`,
  },
  {
    icon: FaShoppingCart,
    title: '2. Pedidos',
    content: 'Los pedidos están sujetos a las siguientes condiciones:',
    list: [
      'Los pedidos están sujetos a disponibilidad de ingredientes',
      'El tiempo de entrega es estimado y puede variar',
      'El precio final incluye el producto más el costo de domicilio (si aplica)',
      'Nos reservamos el derecho de rechazar pedidos en casos excepcionales',
    ],
  },
  {
    icon: FaTag,
    title: '3. Precios y pagos',
    content: 'Aceptamos pago contra entrega (efectivo) y transferencia bancaria (Nequi, Bancolombia, Daviplata). El pago debe realizarse al momento de recibir el pedido o según lo acordado para transferencias. Los precios mostrados incluyen impuestos cuando aplique.',
  },
  {
    icon: FaCalendarCheck,
    title: '4. Reservas',
    content: 'Las reservas están sujetas a las siguientes condiciones:',
    list: [
      'Las reservas están sujetas a disponibilidad',
      'Se recomienda confirmar la reserva al menos 2 horas antes',
      'El incumplimiento de la reserva puede afectar tu historial',
      'Puedes cancelar o modificar tu reserva hasta 1 hora antes',
    ],
  },
  {
    icon: FaTruck,
    title: '5. Delivery',
    content: 'El servicio de domicilio tiene un costo que se muestra antes de confirmar el pedido. El tiempo de entrega es estimado y puede verse afectado por condiciones climáticas, tráfico u otras circunstancias fuera de nuestro control.',
  },
  {
    icon: FaExchangeAlt,
    title: '6. Devoluciones',
    content: 'Dada la naturaleza de nuestros productos (alimentos), no se aceptan devoluciones una vez entregado el pedido. Si tienes algún inconformidad con tu pedido, contáctanos inmediatamente para buscar una solución.',
  },
  {
    icon: FaCopyright,
    title: '7. Propiedad intelectual',
    content: `Todo el contenido del sitio web (textos, imágenes, logos, diseños) es propiedad de ${config.nombre} y está protegido por las leyes de propiedad intelectual colombianas.`,
  },
  {
    icon: FaExclamationTriangle,
    title: '8. Limitación de responsabilidad',
    content: `${config.nombre} no se responsabiliza por retrasos en entregas debido a condiciones climáticas, tráfico o circunstancias fuera de nuestro control. Nuestra responsabilidad se limita al valor del pedido.`,
  },
  {
    icon: FaGavel,
    title: '9. Ley aplicable',
    content: 'Estos términos se rigen por las leyes de la República de Colombia. Cualquier disputa será sometida a la jurisdicción de los tribunales competentes en Colombia.',
  },
]

export default function TerminosCondiciones() {
  return (
    <section className="pt-8 pb-20 px-6 bg-cream-50 min-h-screen">
      <SEO
        title="Términos y Condiciones"
        description={`Conoce los términos y condiciones de ${config.nombre}`}
      />
      <div className="max-w-3xl mx-auto">
        <Link
          to="/"
          className="text-olive-500 hover:text-olive-600 text-sm font-semibold mb-6 inline-block transition-colors"
        >
          ← Volver al inicio
        </Link>

        <div className="text-center mb-10">
          <h1 className="text-4xl font-display font-bold text-espresso-800 mb-3">
            Términos y Condiciones
          </h1>
          <p className="text-steel text-sm">
            Última actualización: Enero 2026
          </p>
        </div>

        <div className="space-y-5">
          {sections.map((s) => (
            <div
              key={s.title}
              className="bg-white rounded-2xl border border-cream-200 p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-olive-100 rounded-xl flex items-center justify-center shrink-0">
                  <s.icon className="text-olive-500" size={16} />
                </div>
                <h2 className="text-xl font-display font-bold text-espresso-800">
                  {s.title}
                </h2>
              </div>
              <p className="text-steel leading-relaxed text-sm ml-[52px]">
                {s.content}
              </p>
              {s.list && (
                <ul className="mt-3 ml-[52px] space-y-1.5">
                  {s.list.map((item) => (
                    <li
                      key={item}
                      className="text-steel text-sm flex items-start gap-2"
                    >
                      <span className="w-1.5 h-1.5 bg-olive-400 rounded-full mt-1.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 bg-white rounded-2xl border border-cream-200 p-6 text-center">
          <p className="text-sm text-steel">
            Si tienes preguntas, contáctanos al{' '}
            <a
              href={`mailto:${config.email}`}
              className="text-olive-500 hover:text-olive-600 font-medium"
            >
              {config.email}
            </a>
          </p>
        </div>
      </div>
    </section>
  )
}
