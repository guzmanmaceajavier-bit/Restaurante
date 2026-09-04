import { FaWhatsapp } from 'react-icons/fa'
import { CONFIG } from '@/lib/config'

const WHATSAPP_MESSAGE = '¡Hola! Me gustaría hacer un pedido o reservar una mesa. 🍽️'

export default function WhatsAppButton() {
  const whatsappUrl = `https://wa.me/${CONFIG.contacto.whatsapp}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 left-6 z-50 bg-emerald-600 text-white p-4 rounded-full shadow-lg shadow-emerald-600/30 hover:bg-emerald-700 hover:scale-110 active:scale-95 transition-all duration-300 wa-pulse"
      aria-label="Contáctanos por WhatsApp"
    >
      <FaWhatsapp size={26} />
    </a>
  )
}
