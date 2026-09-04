import { Link } from 'react-router-dom'
import { SEO } from '../lib/seo'

export default function TerminosCondiciones() {
  return (
    <section className="pt-8 pb-20 px-6">
      <SEO title="Términos y Condiciones" description="Conoce los términos y condiciones de Sabor y Origen" />
      <div className="max-w-3xl mx-auto">
        <Link to="/" className="text-olive-500 hover:text-olive-600 text-sm font-semibold mb-6 inline-block transition-colors">← Volver al inicio</Link>
        <h1 className="text-4xl font-display font-bold text-espresso-800 mb-8">Términos y Condiciones</h1>
        <div className="prose max-w-none space-y-8">
          {[
            { title: '1. Acceptance of Terms', text: 'Al acceder y utilizar el sitio web y los servicios de Sabor y Origen, aceptas estos términos y condiciones en su totalidad. Si no estás de acuerdo con alguno de estos términos, no utilices nuestros servicios.' },
            { title: '2. Servicios', text: 'Sabor y Origen ofrece servicios de pedidos de comida en línea, reservas de mesas y programa de fidelidad. Los pedidos se procesan a través de WhatsApp y el pago se realiza contra entrega o por transferencia bancaria.' },
            { title: '3. Pedidos', list: ['Los pedidos están sujetos a disponibilidad de ingredientes', 'El tiempo de entrega es estimado y puede variar', 'El precio final incluye el producto más el costo de domicilio (si aplica)', 'Nos reservamos el derecho de rechazar pedidos en casos excepcionales'] },
            { title: '4. Pagos', text: 'Aceptamos pago contra entrega (efectivo) y transferencia bancaria (Nequi, Bancolombia). El pago debe realizarse al momento de recibir el pedido o según lo acordado para transferencias.' },
            { title: '5. Reservas', list: ['Las reservas están sujetas a disponibilidad', 'Se recomienda confirmar la reserva al menos 2 horas antes', 'El incumplimiento de la reserva puede afectar tu historial', 'Puedes cancelar o modificar tu reserva hasta 1 hora antes'] },
            { title: '6. Programa de Fidelidad', list: ['Los puntos se acumulan automáticamente con cada compra', 'Los puntos no son transferibles ni canjeables por efectivo', 'Los niveles de fidelidad se revisan periódicamente', 'Sabor y Origen se reserva el derecho de modificar las condiciones del programa'] },
            { title: '7. Limitación de Responsabilidad', text: 'Sabor y Origen no se responsabiliza por retrasos en entregas debido a condiciones climáticas, tráfico o circunstancias fuera de nuestro control. Nuestra responsabilidad se limita al valor del pedido.' },
            { title: '8. Propiedad Intelectual', text: 'Todo el contenido del sitio web (textos, imágenes, logos, diseños) es propiedad de Sabor y Origen y está protegido por las leyes de propiedad intelectual colombianas.' },
            { title: '9. Ley Aplicable', text: 'Estos términos se rigen por las leyes de la República de Colombia. Cualquier disputa será sometida a la jurisdicción de los tribunales competentes en Bogotá, Colombia.' },
          ].map((s) => (
            <div key={s.title}>
              <h2 className="text-2xl font-display font-bold text-espresso-800 mb-3">{s.title}</h2>
              {s.text && <p className="text-steel leading-relaxed">{s.text}</p>}
              {s.list && <ul className="list-disc list-inside text-steel space-y-1">{s.list.map((l) => <li key={l}>{l}</li>)}</ul>}
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
