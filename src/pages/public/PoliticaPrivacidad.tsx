import { Link } from 'react-router-dom'
import { SEO } from '../../lib/seo'
import { getRestaurantConfig } from '../../lib/config'
import { FaShieldAlt, FaDatabase, FaCookieBite, FaLock, FaUserShield, FaEnvelope, FaFileContract, FaChild, FaHistory } from 'react-icons/fa'

const config = getRestaurantConfig()

const sections = [
  {
    icon: FaFileContract,
    title: '1. Responsable del tratamiento',
    content: `${config.nombre} es responsable del tratamiento de tus datos personales:`,
    list: [
      `Email: ${config.email}`,
      `Teléfono: ${config.telefono}`,
      `Dirección: ${config.direccion}`,
    ],
  },
  {
    icon: FaDatabase,
    title: '2. Datos que recopilamos',
    content: `Recopilamos únicamente la información necesaria para procesar tus pedidos y reservas:`,
    list: [
      'Nombre completo',
      'Número de teléfono',
      'Correo electrónico',
      'Dirección de entrega (para domicilios)',
      'Credenciales de acceso a tu cuenta',
      'Historial de pedidos, reservas y puntos de fidelidad',
    ],
  },
  {
    icon: FaShieldAlt,
    title: '3. Finalidades y consentimiento',
    content: 'Al registrarte o hacer un pedido aceptas el tratamiento de tus datos exclusivamente para:',
    list: [
      'Procesar y entregar tus pedidos',
      'Confirmar y gestionar tus reservas',
      'Enviarte confirmaciones por WhatsApp',
      'Gestionar tu cuenta, tu programa de fidelidad y tus puntos',
      'Atender tus solicitudes, quejas y reclamos',
    ],
  },
  {
    icon: FaDatabase,
    title: '4. Dónde se almacenan tus datos',
    content:
      'Actualmente tu información se guarda únicamente en tu propio navegador (almacenamiento local del dispositivo) y no se transmite a servidores externos, salvo los casos del punto 5. Si migramos a servidores propios, actualizaremos esta política antes del cambio.',
  },
  {
    icon: FaEnvelope,
    title: '5. Terceros',
    content: 'Compartimos datos con terceros solo en estos casos:',
    list: [
      'WhatsApp (Meta): si haces clic en botones de WhatsApp, tu número y mensaje se comparten con Meta según sus propias políticas.',
      'Google Maps: el mapa de contacto carga contenido de Google, que puede registrar tu visita según sus políticas.',
      'No vendemos ni cedemos tus datos con fines publicitarios.',
    ],
  },
  {
    icon: FaCookieBite,
    title: '6. Cookies',
    content:
      'Este sitio no utiliza cookies de terceros. La información se almacena localmente en tu navegador para recordar tus preferencias, tu carrito y tu sesión. No utilizamos cookies de rastreo, publicidad ni análisis.',
  },
  {
    icon: FaLock,
    title: '7. Seguridad y conservación',
    content: '',
    list: [
      'Tus credenciales se guardan localmente en tu dispositivo: no compartas tu contraseña ni uses equipos públicos sin cerrar sesión.',
      'Conservamos tus datos mientras tu cuenta exista. Al eliminar tu cuenta desde Mi cuenta se borran tu perfil, direcciones y preferencias.',
      'Los pedidos y reservas ya procesados se conservan con fines contables y operativos.',
    ],
  },
  {
    icon: FaChild,
    title: '8. Menores de edad',
    content:
      'El registro está dirigido a mayores de edad. Si eres menor, debes usar el sitio con la supervisión de un padre o acudiente.',
  },
  {
    icon: FaUserShield,
    title: '9. Tus derechos',
    content: 'Puedes ejercer tus derechos de acceso, actualización, rectificación, supresión y revocatoria de la autorización:',
    list: [
      `Escríbenos a ${config.email} o llámanos al ${config.telefono} indicando tu nombre y tu solicitud.`,
      'Respondemos consultas en un máximo de 10 días hábiles y reclamos en 15 días hábiles.',
      'Desde Mi cuenta puedes descargar tus datos y eliminar tu cuenta en cualquier momento.',
    ],
  },
  {
    icon: FaHistory,
    title: '10. Cambios a esta política',
    content:
      'Podemos actualizar esta política. La fecha de última actualización siempre aparece al inicio de esta página y los cambios importantes se anunciarán en el sitio.',
  },
]

export default function PoliticaPrivacidad() {
  return (
    <section className="pt-24 pb-20 px-6 bg-cream-50 min-h-screen">
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
            Última actualización: Octubre 2026
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
