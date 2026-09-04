import { Link } from 'react-router-dom'
import { RoutesPath } from '@/routes/routes'
import { getRestaurantConfig } from '@/lib/config'
import { FaInstagram, FaWhatsapp, FaMapMarkerAlt, FaPhone, FaClock } from 'react-icons/fa'

export default function Footer() {
  const config = getRestaurantConfig()
  return (
    <footer className="bg-espresso-900 text-white/60">
      <div className="max-w-content mx-auto px-6">
        <div className="py-10 grid grid-cols-2 md:grid-cols-4 gap-8 border-b border-white/10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to={RoutesPath.home} className="text-lg font-display font-bold text-white">Sabor y Origen</Link>
            <p className="text-xs mt-2 leading-relaxed">{config.descripcion}</p>
            <div className="flex gap-2 mt-3">
              <a href={config.redes?.instagram || '#'} target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-white/8 rounded-lg flex items-center justify-center hover:bg-olive-500 hover:text-white transition-all">
                <FaInstagram size={13} />
              </a>
              <a href={`https://wa.me/${config.whatsapp}`} target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-white/8 rounded-lg flex items-center justify-center hover:bg-sage-500 hover:text-white transition-all">
                <FaWhatsapp size={13} />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-3">Navegación</h4>
            <ul className="space-y-2">
              {[{ l: 'Inicio', p: RoutesPath.home }, { l: 'Menú', p: RoutesPath.menu }, { l: 'Reservas', p: RoutesPath.reserve }, { l: 'Contacto', p: RoutesPath.contact }].map(x => (
                <li key={x.p}><Link to={x.p} className="text-xs hover:text-olive-300 transition-colors">{x.l}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-3">Explorar</h4>
            <ul className="space-y-2">
              {[{ l: 'Promociones', p: RoutesPath.promociones }, { l: 'Galería', p: RoutesPath.galeria }, { l: 'Eventos', p: RoutesPath.eventos }, { l: 'Reseñas', p: RoutesPath.resenas }].map(x => (
                <li key={x.p}><Link to={x.p} className="text-xs hover:text-olive-300 transition-colors">{x.l}</Link></li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-3">Contacto</h4>
            <ul className="space-y-2.5">
              <li className="flex items-start gap-2"><FaMapMarkerAlt className="text-olive-400 mt-0.5 shrink-0" size={11} /><span className="text-xs">{config.direccion}</span></li>
              <li className="flex items-center gap-2"><FaPhone className="text-olive-400 shrink-0" size={11} /><a href={`tel:${config.telefono}`} className="text-xs hover:text-white transition-colors">{config.telefono}</a></li>
              <li className="flex items-center gap-2"><FaClock className="text-olive-400 shrink-0" size={11} /><span className="text-xs">{`${config.horarioApertura} - ${config.horarioCierre}`}</span></li>
            </ul>
          </div>
        </div>

        <div className="py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-[11px] text-white/20">&copy; {new Date().getFullYear()} {config.nombre}</p>
          <div className="flex gap-4">
            <Link to={RoutesPath.politicaPrivacidad} className="text-[11px] text-white/20 hover:text-white/40 transition-colors">Privacidad</Link>
            <Link to={RoutesPath.terminosCondiciones} className="text-[11px] text-white/20 hover:text-white/40 transition-colors">Términos</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
