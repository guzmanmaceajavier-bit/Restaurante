import { Link } from 'react-router-dom'
import { SEO } from '../lib/seo'

export default function PoliticaPrivacidad() {
  return (
    <section className="pt-8 pb-20 px-6">
      <SEO title="Política de Privacidad" description="Conoce cómo Sabor y Origen protege tus datos personales" />
      <div className="max-w-3xl mx-auto">
        <Link to="/" className="text-olive-500 hover:text-olive-600 text-sm font-semibold mb-6 inline-block transition-colors">← Volver al inicio</Link>
        <h1 className="text-4xl font-display font-bold text-espresso-800 mb-8">Política de Privacidad</h1>
        <div className="prose max-w-none space-y-8">
          {[
            { title: '1. Información que recopilamos', text: 'En Sabor y Origen recopilamos únicamente la información necesaria para procesar tus pedidos y reservas:', list: ['Nombre completo', 'Número de teléfono', 'Correo electrónico (opcional)', 'Dirección de entrega (para domicilios)', 'Historial de pedidos y reservas'] },
            { title: '2. Uso de la información', text: 'Utilizamos tu información exclusivamente para:', list: ['Procesar y entregar tus pedidos', 'Confirmar y gestionar tus reservas', 'Enviarte confirmaciones por WhatsApp', 'Mejorar nuestro servicio de atención al cliente', 'Gestionar tu programa de fidelidad y puntos'] },
            { title: '3. Protección de datos', text: 'Tu información se almacena únicamente en tu navegador (localStorage) y no se transmite a servidores externos. No compartimos, vendemos ni cedemos tus datos personales a terceros.' },
            { title: '4. WhatsApp', text: 'Al utilizar nuestro servicio, aceptas que nos comuniquemos contigo a través de WhatsApp para confirmaciones de pedido, actualizaciones de estado y mensajes relacionados con tu servicio. Puedes solicitar que dejemos de contactarte en cualquier momento.' },
            { title: '5. Tus derechos', text: 'Tienes derecho a:', list: ['Solicitar acceso a tus datos personales', 'Solicitar la eliminación de tus datos', 'Oponerte al procesamiento de tus datos', 'Solicitar la rectificación de datos inexactos'] },
            { title: '6. Cookies', text: 'Este sitio no utiliza cookies de terceros. La información se almacena localmente en tu navegador para recordar tus preferencias y datos de sesión.' },
            { title: '7. Cambios en esta política', text: 'Nos reservamos el derecho de actualizar esta política de privacidad en cualquier momento. Los cambios serán publicados en esta página con la fecha de última actualización.' },
          ].map((s) => (
            <div key={s.title}>
              <h2 className="text-2xl font-display font-bold text-espresso-800 mb-3">{s.title}</h2>
              <p className="text-steel leading-relaxed">{s.text}</p>
              {s.list && <ul className="list-disc list-inside text-steel mt-2 space-y-1">{s.list.map((l) => <li key={l}>{l}</li>)}</ul>}
            </div>
          ))}
          <div className="border-t border-cream-200 pt-6">
            <p className="text-sm text-steel"><strong>Última actualización:</strong> Enero 2026</p>
            <p className="text-sm text-steel mt-1">Si tienes preguntas, contáctanos al <a href="mailto:info@saboryorigen.com" className="text-olive-500 hover:text-olive-600 font-medium">info@saboryorigen.com</a></p>
          </div>
        </div>
      </div>
    </section>
  )
}
