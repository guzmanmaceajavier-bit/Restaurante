import { FaWhatsapp } from 'react-icons/fa'
import { CONFIG } from '@/lib/config'

const WHATSAPP_MESSAGE = '¡Hola! Quiero hacer un pedido o reserva.'

export default function WhatsAppButton() {
  const whatsappUrl = `https://wa.me/${CONFIG.contacto.whatsapp}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 left-6 z-50 bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 hover:scale-110 active:scale-95 transition-all duration-300"
      aria-label="Contáctanos por WhatsApp"
    >
      <FaWhatsapp size={28} />
    </a>
  )
}
