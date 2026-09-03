import { Link } from 'react-router-dom'
import { RoutesPath } from '@/routes/routes'
import { CONFIG } from '@/lib/config'
import { FaInstagram, FaWhatsapp, FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock } from 'react-icons/fa'

const mainLinks = [
  { label: 'Inicio', path: RoutesPath.home },
  { label: 'Menú', path: RoutesPath.menu },
  { label: 'Reservas', path: RoutesPath.reserve },
  { label: 'Contacto', path: RoutesPath.contact },
]

const extraLinks = [
  { label: 'Promociones', path: RoutesPath.promociones },
  { label: 'Galería', path: RoutesPath.galeria },
  { label: 'Eventos', path: RoutesPath.eventos },
  { label: 'Mis pedidos', path: RoutesPath.orderHistory },
  { label: 'Gestionar reserva', path: RoutesPath.gestionReserva },
]

export default function Footer() {
  return (
    <footer className="bg-ink">
      <div className="max-w-content mx-auto px-6">
        <div className="py-16 border-b border-white/5">
          <div className="grid md:grid-cols-4 gap-10">
            <div className="md:col-span-1">
              <Link to={RoutesPath.home} className="text-2xl font-serif font-bold text-white tracking-tight">
                Sabor y Origen
              </Link>
              <p className="text-sm text-white/40 mt-4 leading-relaxed max-w-xs">
                {CONFIG.restaurante.descripcion}
              </p>
              <div className="flex gap-3 mt-6">
                <a href={CONFIG.redes[0].url} target="_blank" rel="noopener noreferrer"
                  className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center hover:bg-brick-500 hover:text-white text-white/40 transition-all duration-300">
                  <FaInstagram size={16} />
                </a>
                <a href={CONFIG.redes[2].url} target="_blank" rel="noopener noreferrer"
                  className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center hover:bg-brick-500 hover:text-white text-white/40 transition-all duration-300">
                  <FaWhatsapp size={16} />
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-white/60 uppercase tracking-[0.15em] mb-5">Principal</h4>
              <ul className="space-y-3">
                {mainLinks.map(l => (
                  <li key={l.path}>
                    <Link to={l.path} className="text-sm text-white/70 hover:text-white transition-colors duration-200">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-white/60 uppercase tracking-[0.15em] mb-5">Más</h4>
              <ul className="space-y-3">
                {extraLinks.map(l => (
                  <li key={l.path}>
                    <Link to={l.path} className="text-sm text-white/70 hover:text-white transition-colors duration-200">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-white/60 uppercase tracking-[0.15em] mb-5">Contacto</h4>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <FaMapMarkerAlt className="text-white/30 mt-0.5 shrink-0" size={14} />
                  <span className="text-sm text-white/70">{CONFIG.contacto.direccion}</span>
                </li>
                <li className="flex items-center gap-3">
                  <FaPhone className="text-white/30 shrink-0" size={14} />
                  <a href={`tel:${CONFIG.contacto.telefono}`} className="text-sm text-white/70 hover:text-white transition-colors">
                    {CONFIG.contacto.telefono}
                  </a>
                </li>
                <li className="flex items-center gap-3">
                  <FaEnvelope className="text-white/30 shrink-0" size={14} />
                  <a href={`mailto:${CONFIG.contacto.email}`} className="text-sm text-white/70 hover:text-white transition-colors">
                    {CONFIG.contacto.email}
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <FaClock className="text-white/30 mt-0.5 shrink-0" size={14} />
                  <span className="text-sm text-white/50">{CONFIG.contacto.horario}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between py-6 gap-4">
          <p className="text-sm text-white/30">
            &copy; {new Date().getFullYear()} {CONFIG.restaurante.nombre}. Todos los derechos reservados.
          </p>
          <p className="text-xs text-white/20">
            Hecho con amor por Sabor y Origen
          </p>
        </div>
      </div>
    </footer>
  )
}
