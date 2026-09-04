import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { FaSave, FaStore, FaClock, FaMapMarkerAlt, FaPhone, FaEnvelope, FaWhatsapp, FaGlobe, FaTruck, FaCalendarAlt, FaImage } from 'react-icons/fa'

interface Config {
  nombre: string; slogan: string; direccion: string; telefono: string; email: string; whatsapp: string
  horarioApertura: string; horarioCierre: string; diasAtencion: string[]
  maxReservasPorDia: number; tiempoMinimoReserva: number; politicaReserva: string
  envioGratisMinimo: number; costoDomicilio: number; radioDomicilio: number
  moneda: string; impuesto: number; servicioMesa: number
  mapaUrl: string; logoUrl: string; bannerUrl: string
  redes: { instagram: string; facebook: string; tiktok: string }
  metodosPago: string[]
}

const defaultConfig: Config = {
  nombre: 'Sabor y Origen', slogan: 'Tradición y sabor colombiano', direccion: 'Calle 45 #12-34, Medellín',
  telefono: '+57 300 123 4567', email: 'info@saboryorigen.com', whatsapp: '573001234567',
  horarioApertura: '10:00', horarioCierre: '22:00', diasAtencion: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'],
  maxReservasPorDia: 20, tiempoMinimoReserva: 60, politicaReserva: 'La reserva se mantiene por 15 minutos después de la hora acordada.',
  envioGratisMinimo: 50000, costoDomicilio: 5000, radioDomicilio: 5,
  moneda: 'COP', impuesto: 0, servicioMesa: 0,
  mapaUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.123456789!2d-75.5678901!3d6.2478901!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNsKwMTQnNTIuNCJOIDc1wrAzNCcwNC40Ilc!5e0!3m2!1ses!2sco!4v1234567890',
  logoUrl: '', bannerUrl: '',
  redes: { instagram: '', facebook: '', tiktok: '' },
  metodosPago: ['Efectivo', 'Tarjeta débito', 'Tarjeta crédito', 'Nequi', 'Daviplata']
}

const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

export default function AdminConfig() {
  const [config, setConfig] = useState<Config>(defaultConfig)
  const [activeTab, setActiveTab] = useState('general')

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('restaurant-config') || '{}')
      if (Object.keys(stored).length > 0) setConfig({ ...defaultConfig, ...stored })
    } catch {}
  }, [])

  const save = () => {
    localStorage.setItem('restaurant-config', JSON.stringify(config))
    toast.success('Configuración guardada')
  }

  const update = (field: keyof Config, value: any) => setConfig({ ...config, [field]: value })

  const tabs = [
    { id: 'general', label: 'General', icon: FaStore },
    { id: 'horario', label: 'Horario', icon: FaClock },
    { id: 'delivery', label: 'Delivery', icon: FaTruck },
    { id: 'reservas', label: 'Reservas', icon: FaCalendarAlt },
    { id: 'pagos', label: 'Pagos', icon: FaGlobe },
    { id: 'media', label: 'Media', icon: FaImage },
  ]

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-espresso-800">Configuración</h1>
          <p className="text-steel text-sm mt-1">Administra la información de tu restaurante</p>
        </div>
        <button onClick={save} className="flex items-center gap-2 bg-olive-500 hover:bg-olive-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm shadow-olive-500/20">
          <FaSave size={14} /> Guardar cambios
        </button>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${activeTab === t.id ? 'bg-olive-500 text-white shadow-md shadow-olive-500/25' : 'bg-white border border-cream-200 text-espresso-600 hover:bg-cream-50'}`}>
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-cream-200 p-6">
        {activeTab === 'general' && (
          <div className="space-y-6">
            <h3 className="font-display font-bold text-espresso-800 text-lg">Información general</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div><label className="text-xs font-semibold text-espresso-700 mb-1.5 block">Nombre del restaurante</label>
                <div className="relative"><FaStore className="absolute left-4 top-1/2 -translate-y-1/2 text-steel/40" size={14} />
                  <input value={config.nombre} onChange={(e) => update('nombre', e.target.value)} className="input-base pl-11" /></div></div>
              <div><label className="text-xs font-semibold text-espresso-700 mb-1.5 block">Slogan</label>
                <input value={config.slogan} onChange={(e) => update('slogan', e.target.value)} className="input-base" /></div>
              <div><label className="text-xs font-semibold text-espresso-700 mb-1.5 block">Dirección</label>
                <div className="relative"><FaMapMarkerAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-steel/40" size={14} />
                  <input value={config.direccion} onChange={(e) => update('direccion', e.target.value)} className="input-base pl-11" /></div></div>
              <div><label className="text-xs font-semibold text-espresso-700 mb-1.5 block">Teléfono</label>
                <div className="relative"><FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-steel/40" size={14} />
                  <input value={config.telefono} onChange={(e) => update('telefono', e.target.value)} className="input-base pl-11" /></div></div>
              <div><label className="text-xs font-semibold text-espresso-700 mb-1.5 block">Email</label>
                <div className="relative"><FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-steel/40" size={14} />
                  <input value={config.email} onChange={(e) => update('email', e.target.value)} className="input-base pl-11" /></div></div>
              <div><label className="text-xs font-semibold text-espresso-700 mb-1.5 block">WhatsApp (número)</label>
                <div className="relative"><FaWhatsapp className="absolute left-4 top-1/2 -translate-y-1/2 text-steel/40" size={14} />
                  <input value={config.whatsapp} onChange={(e) => update('whatsapp', e.target.value)} className="input-base pl-11" placeholder="573001234567" /></div></div>
            </div>
            <div>
              <label className="text-xs font-semibold text-espresso-700 mb-1.5 block">URL del mapa (Google Maps embed)</label>
              <input value={config.mapaUrl} onChange={(e) => update('mapaUrl', e.target.value)} className="input-base" placeholder="https://www.google.com/maps/embed?..." />
            </div>
          </div>
        )}

        {activeTab === 'horario' && (
          <div className="space-y-6">
            <h3 className="font-display font-bold text-espresso-800 text-lg">Horario de atención</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div><label className="text-xs font-semibold text-espresso-700 mb-1.5 block">Hora de apertura</label>
                <div className="relative"><FaClock className="absolute left-4 top-1/2 -translate-y-1/2 text-steel/40" size={14} />
                  <input type="time" value={config.horarioApertura} onChange={(e) => update('horarioApertura', e.target.value)} className="input-base pl-11" /></div></div>
              <div><label className="text-xs font-semibold text-espresso-700 mb-1.5 block">Hora de cierre</label>
                <div className="relative"><FaClock className="absolute left-4 top-1/2 -translate-y-1/2 text-steel/40" size={14} />
                  <input type="time" value={config.horarioCierre} onChange={(e) => update('horarioCierre', e.target.value)} className="input-base pl-11" /></div></div>
            </div>
            <div>
              <label className="text-xs font-semibold text-espresso-700 mb-2 block">Días de atención</label>
              <div className="flex flex-wrap gap-2">
                {diasSemana.map((d) => (
                  <button key={d} onClick={() => {
                    const dias = config.diasAtencion.includes(d) ? config.diasAtencion.filter(x => x !== d) : [...config.diasAtencion, d]
                    update('diasAtencion', dias)
                  }} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${config.diasAtencion.includes(d) ? 'bg-olive-500 text-white border-olive-500' : 'bg-white text-steel border-cream-200 hover:bg-cream-50'}`}>
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'delivery' && (
          <div className="space-y-6">
            <h3 className="font-display font-bold text-espresso-800 text-lg">Configuración de domicilios</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div><label className="text-xs font-semibold text-espresso-700 mb-1.5 block">Envío gratis desde ($)</label>
                <input type="number" value={config.envioGratisMinimo} onChange={(e) => update('envioGratisMinimo', Number(e.target.value))} className="input-base" /></div>
              <div><label className="text-xs font-semibold text-espresso-700 mb-1.5 block">Costo domicilio ($)</label>
                <input type="number" value={config.costoDomicilio} onChange={(e) => update('costoDomicilio', Number(e.target.value))} className="input-base" /></div>
              <div><label className="text-xs font-semibold text-espresso-700 mb-1.5 block">Radio de cobertura (km)</label>
                <input type="number" value={config.radioDomicilio} onChange={(e) => update('radioDomicilio', Number(e.target.value))} className="input-base" /></div>
            </div>
          </div>
        )}

        {activeTab === 'reservas' && (
          <div className="space-y-6">
            <h3 className="font-display font-bold text-espresso-800 text-lg">Configuración de reservas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div><label className="text-xs font-semibold text-espresso-700 mb-1.5 block">Máximo reservas por día</label>
                <input type="number" value={config.maxReservasPorDia} onChange={(e) => update('maxReservasPorDia', Number(e.target.value))} className="input-base" /></div>
              <div><label className="text-xs font-semibold text-espresso-700 mb-1.5 block">Tiempo mínimo anticipación (min)</label>
                <input type="number" value={config.tiempoMinimoReserva} onChange={(e) => update('tiempoMinimoReserva', Number(e.target.value))} className="input-base" /></div>
            </div>
            <div><label className="text-xs font-semibold text-espresso-700 mb-1.5 block">Política de reservas</label>
              <textarea value={config.politicaReserva} onChange={(e) => update('politicaReserva', e.target.value)} className="input-base resize-none" rows={3} /></div>
          </div>
        )}

        {activeTab === 'pagos' && (
          <div className="space-y-6">
            <h3 className="font-display font-bold text-espresso-800 text-lg">Métodos de pago y impuestos</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div><label className="text-xs font-semibold text-espresso-700 mb-1.5 block">Impuesto (%)</label>
                <input type="number" value={config.impuesto} onChange={(e) => update('impuesto', Number(e.target.value))} className="input-base" /></div>
              <div><label className="text-xs font-semibold text-espresso-700 mb-1.5 block">Servicio de mesa ($)</label>
                <input type="number" value={config.servicioMesa} onChange={(e) => update('servicioMesa', Number(e.target.value))} className="input-base" /></div>
              <div><label className="text-xs font-semibold text-espresso-700 mb-1.5 block">Moneda</label>
                <select value={config.moneda} onChange={(e) => update('moneda', e.target.value)} className="input-base">
                  <option value="COP">COP - Peso colombiano</option>
                  <option value="USD">USD - Dólar</option>
                  <option value="EUR">EUR - Euro</option>
                </select></div>
            </div>
            <div>
              <label className="text-xs font-semibold text-espresso-700 mb-2 block">Métodos de pago aceptados</label>
              <div className="flex flex-wrap gap-2">
                {['Efectivo', 'Tarjeta débito', 'Tarjeta crédito', 'Nequi', 'Daviplata', 'PSE', 'Bitcoin'].map((m) => (
                  <button key={m} onClick={() => {
                    const mp = config.metodosPago.includes(m) ? config.metodosPago.filter(x => x !== m) : [...config.metodosPago, m]
                    update('metodosPago', mp)
                  }} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${config.metodosPago.includes(m) ? 'bg-olive-500 text-white border-olive-500' : 'bg-white text-steel border-cream-200 hover:bg-cream-50'}`}>
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'media' && (
          <div className="space-y-6">
            <h3 className="font-display font-bold text-espresso-800 text-lg">Redes sociales y media</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div><label className="text-xs font-semibold text-espresso-700 mb-1.5 block">Instagram URL</label>
                <input value={config.redes.instagram} onChange={(e) => update('redes', { ...config.redes, instagram: e.target.value })} className="input-base" placeholder="https://instagram.com/..." /></div>
              <div><label className="text-xs font-semibold text-espresso-700 mb-1.5 block">Facebook URL</label>
                <input value={config.redes.facebook} onChange={(e) => update('redes', { ...config.redes, facebook: e.target.value })} className="input-base" placeholder="https://facebook.com/..." /></div>
              <div><label className="text-xs font-semibold text-espresso-700 mb-1.5 block">TikTok URL</label>
                <input value={config.redes.tiktok} onChange={(e) => update('redes', { ...config.redes, tiktok: e.target.value })} className="input-base" placeholder="https://tiktok.com/..." /></div>
              <div><label className="text-xs font-semibold text-espresso-700 mb-1.5 block">URL del logo</label>
                <input value={config.logoUrl} onChange={(e) => update('logoUrl', e.target.value)} className="input-base" placeholder="https://..." /></div>
              <div className="md:col-span-2"><label className="text-xs font-semibold text-espresso-700 mb-1.5 block">URL del banner</label>
                <input value={config.bannerUrl} onChange={(e) => update('bannerUrl', e.target.value)} className="input-base" placeholder="https://..." /></div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
