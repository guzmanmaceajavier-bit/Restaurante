import { Link } from 'react-router-dom'
import { SEO } from '../lib/seo'
import { getRestaurantConfig } from '../lib/config'
import { FaShieldAlt, FaDatabase, FaCookieBite, FaLock, FaUserShield, FaEnvelope } from 'react-icons/fa'

const config = getRestaurantConfig()

const sections = [
  {
    icon: FaDatabase,
    title: '1. Datos que recopilamos',
    content: `En ${config.nombre} recopilamos únicamente la información necesaria para procesar tus pedidos y reservas:`,
    list: [
      'Nombre completo',
      'Número de teléfono',
      'Correo electrónico (opcional)',
      'Dirección de entrega (para domicilios)',
      'Historial de pedidos y reservas',
    ],
  },
  {
    icon: FaShieldAlt,
    title: '2. Cómo usamos tus datos',
    content: 'Utilizamos tu información exclusivamente para:',
    list: [
      'Procesar y entregar tus pedidos',
      'Confirmar y gestionar tus reservas',
      'Enviarte confirmaciones por WhatsApp',
      'Mejorar nuestro servicio de atención al cliente',
      'Gestionar tu programa de fidelidad y puntos',
    ],
  },
  {
    icon: FaCookieBite,
    title: '3. Cookies',
    content:
      'Este sitio no utiliza cookies de terceros. La información se almacena localmente en tu navegador (localStorage) para recordar tus preferencias y datos de sesión. No utilizamos cookies de rastreo, publicidad ni análisis.',
  },
  {
    icon: FaLock,
    title: '4. Seguridad',
    content:
      'Tu información se almacena únicamente en tu navegador y no se transmite a servidores externos. No compartimos, vendemos ni cedemos tus datos personales a terceros. Implementamos medidas de seguridad razonables para proteger la información almacenada.',
  },
  {
    icon: FaUserShield,
    title: '5. Derechos del usuario',
    content: 'Tienes derecho a:',
    list: [
      'Solicitar acceso a tus datos personales',
      'Solicitar la eliminación de tus datos',
      'Oponerte al procesamiento de tus datos',
      'Solicitar la rectificación de datos inexactos',
    ],
  },
  {
    icon: FaEnvelope,
    title: '6. Contacto',
    content: `Si tienes preguntas sobre esta política de privacidad, puedes contactarnos:`,
    list: [
      `Email: ${config.email}`,
      `Teléfono: ${config.telefono}`,
      `Dirección: ${config.direccion}`,
    ],
  },
]

export default function PoliticaPrivacidad() {
  return (
    <section className="pt-8 pb-20 px-6 bg-cream-50 min-h-screen">
      <SEO
        title="Política de Privacidad"
        description={`Conoce cómo ${config.nombre} protege tus datos personales`}
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
            Política de Privacidad
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
