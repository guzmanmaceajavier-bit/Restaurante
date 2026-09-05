import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { getRestaurantConfig, saveRestaurantConfig, type RestaurantConfig } from '../lib/config'
import { FaSave, FaStore, FaMapMarkerAlt, FaPhone, FaEnvelope, FaWhatsapp, FaGlobe, FaTruck, FaCalendarAlt, FaImage, FaUpload, FaTimes, FaPalette, FaUser, FaCreditCard, FaFileAlt } from 'react-icons/fa'

const defaultConfig: RestaurantConfig = getRestaurantConfig()

export default function AdminConfig() {
  const [config, setConfig] = useState<RestaurantConfig>(defaultConfig)
  const [activeTab, setActiveTab] = useState('general')
  const [politicaPrivacidad, setPoliticaPrivacidad] = useState('')
  const [terminosCondiciones, setTerminosCondiciones] = useState('')

  useEffect(() => {
    setConfig(getRestaurantConfig())
    setPoliticaPrivacidad(localStorage.getItem('politica-privacidad-text') || '')
    setTerminosCondiciones(localStorage.getItem('terminos-condiciones-text') || '')
  }, [])

  const save = () => {
    saveRestaurantConfig(config)
    localStorage.setItem('politica-privacidad-text', politicaPrivacidad)
    localStorage.setItem('terminos-condiciones-text', terminosCondiciones)
    toast.success('Configuración guardada')
  }

  const update = (field: keyof RestaurantConfig, value: any) => setConfig({ ...config, [field]: value })

  const handleImageUpload = (field: keyof RestaurantConfig, file: File) => {
    if (file.size > 2 * 1024 * 1024) {
      toast.error('La imagen debe ser menor a 2MB')
      return
    }
    const reader = new FileReader()
    reader.onload = (e) => {
      update(field, e.target?.result as string)
      toast.success('Imagen cargada')
    }
    reader.readAsDataURL(file)
  }

  const tabs = [
    { id: 'general', label: 'General', icon: FaStore },
    { id: 'imagenes', label: 'Imágenes', icon: FaImage },
    { id: 'delivery', label: 'Delivery', icon: FaTruck },
    { id: 'reservas', label: 'Reservas', icon: FaCalendarAlt },
    { id: 'pagos', label: 'Pagos', icon: FaCreditCard },
    { id: 'redes', label: 'Redes', icon: FaGlobe },
    { id: 'tema', label: 'Tema', icon: FaPalette },
    { id: 'textos-legales', label: 'Textos Legales', icon: FaFileAlt },
  ]

  const inputClass = 'w-full px-4 py-3 bg-cream-50 border border-cream-200 rounded-xl text-sm text-espresso-800 focus:outline-none focus:ring-2 focus:ring-olive-500/30 focus:border-olive-500 transition-all'

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-espresso-800">Configuración</h1>
          <p className="text-steel text-sm mt-1">Administra todo el restaurante desde aquí</p>
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
        {/* GENERAL */}
        {activeTab === 'general' && (
          <div className="space-y-6">
            <h3 className="font-display font-bold text-espresso-800 text-lg">Información del restaurante</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="text-xs font-semibold text-espresso-700 mb-1.5 block">Nombre del restaurante</label>
                <div className="relative"><FaStore className="absolute left-4 top-1/2 -translate-y-1/2 text-steel/40" size={14} />
                  <input value={config.nombre} onChange={(e) => update('nombre', e.target.value)} className={`${inputClass} pl-11`} /></div>
              </div>
              <div>
                <label className="text-xs font-semibold text-espresso-700 mb-1.5 block">Slogan</label>
                <input value={config.slogan} onChange={(e) => update('slogan', e.target.value)} className={inputClass} />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-espresso-700 mb-1.5 block">Descripción</label>
                <textarea value={config.descripcion} onChange={(e) => update('descripcion', e.target.value)} className={`${inputClass} resize-none`} rows={3} />
              </div>
              <div>
                <label className="text-xs font-semibold text-espresso-700 mb-1.5 block">Dirección</label>
                <div className="relative"><FaMapMarkerAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-steel/40" size={14} />
                  <input value={config.direccion} onChange={(e) => update('direccion', e.target.value)} className={`${inputClass} pl-11`} /></div>
              </div>
              <div>
                <label className="text-xs font-semibold text-espresso-700 mb-1.5 block">Teléfono</label>
                <div className="relative"><FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-steel/40" size={14} />
                  <input value={config.telefono} onChange={(e) => update('telefono', e.target.value)} className={`${inputClass} pl-11`} /></div>
              </div>
              <div>
                <label className="text-xs font-semibold text-espresso-700 mb-1.5 block">Email</label>
                <div className="relative"><FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-steel/40" size={14} />
                  <input value={config.email} onChange={(e) => update('email', e.target.value)} className={`${inputClass} pl-11`} /></div>
              </div>
              <div>
                <label className="text-xs font-semibold text-espresso-700 mb-1.5 block">WhatsApp (número con código país)</label>
                <div className="relative"><FaWhatsapp className="absolute left-4 top-1/2 -translate-y-1/2 text-steel/40" size={14} />
                  <input value={config.whatsapp} onChange={(e) => update('whatsapp', e.target.value)} className={`${inputClass} pl-11`} placeholder="573001234567" /></div>
              </div>
              <div>
                <label className="text-xs font-semibold text-espresso-700 mb-1.5 block">Nombre del administrador</label>
                <div className="relative"><FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-steel/40" size={14} />
                  <input value={config.adminNombre} onChange={(e) => update('adminNombre', e.target.value)} className={`${inputClass} pl-11`} /></div>
              </div>
              <div>
                <label className="text-xs font-semibold text-espresso-700 mb-1.5 block">Símbolo de moneda</label>
                <input value={config.monedaSimbolo} onChange={(e) => update('monedaSimbolo', e.target.value)} className={inputClass} placeholder="$" />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-espresso-700 mb-1.5 block">URL del mapa (Google Maps embed)</label>
              <input value={config.mapaUrl} onChange={(e) => update('mapaUrl', e.target.value)} className={inputClass} placeholder="https://www.google.com/maps/embed?..." />
            </div>
          </div>
        )}

        {/* IMÁGENES */}
        {activeTab === 'imagenes' && (
          <div className="space-y-6">
            <h3 className="font-display font-bold text-espresso-800 text-lg">Imágenes del restaurante</h3>
            <p className="text-sm text-steel">Sube imágenes para personalizar tu sitio. Se guardan en tu navegador.</p>

            {([
              { key: 'logoUrl' as const, label: 'Logo del restaurante', desc: 'Se muestra en el header y sidebar. Recomendado: 200x200px', aspect: 'aspect-square' },
              { key: 'bannerUrl' as const, label: 'Banner principal', desc: 'Se muestra en el hero del inicio. Recomendado: 1200x400px', aspect: 'aspect-[3/1]' },
              { key: 'faviconUrl' as const, label: 'Favicon', desc: 'Icono de la pestaña del navegador. Recomendado: 32x32px', aspect: 'aspect-square max-w-[80px]' },
            ]).map(({ key, label, desc, aspect }) => (
              <div key={key} className="border border-cream-200 rounded-2xl p-5">
                <div className="flex items-start gap-5">
                  <div className={`w-32 ${aspect} bg-cream-50 rounded-xl border-2 border-dashed border-cream-300 flex items-center justify-center overflow-hidden shrink-0`}>
                    {config[key] ? (
                      <div className="relative w-full h-full">
                        <img src={config[key] as string} alt={label} className="w-full h-full object-cover" />
                        <button onClick={() => update(key, '')} className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] hover:bg-red-600">
                          <FaTimes size={8} />
                        </button>
                      </div>
                    ) : (
                      <FaImage size={24} className="text-steel/20" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-espresso-800">{label}</h4>
                    <p className="text-xs text-steel mt-1">{desc}</p>
                    <label className="mt-3 inline-flex items-center gap-2 bg-olive-50 text-olive-600 px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer hover:bg-olive-100 transition-colors border border-olive-200">
                      <FaUpload size={12} /> Subir imagen
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleImageUpload(key, file)
                      }} />
                    </label>
                    {config[key] && (
                      <button onClick={() => update(key, '')} className="ml-2 text-xs text-red-500 hover:text-red-600 font-medium">
                        Eliminar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* DELIVERY */}
        {activeTab === 'delivery' && (
          <div className="space-y-6">
            <h3 className="font-display font-bold text-espresso-800 text-lg">Configuración de domicilios</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="text-xs font-semibold text-espresso-700 mb-1.5 block">Envío gratis desde ($)</label>
                <input type="number" value={config.envioGratisMinimo} onChange={(e) => update('envioGratisMinimo', Number(e.target.value))} className={inputClass} />
              </div>
              <div>
                <label className="text-xs font-semibold text-espresso-700 mb-1.5 block">Costo domicilio ($)</label>
                <input type="number" value={config.costoDomicilio} onChange={(e) => update('costoDomicilio', Number(e.target.value))} className={inputClass} />
              </div>
              <div>
                <label className="text-xs font-semibold text-espresso-700 mb-1.5 block">Radio de cobertura (km)</label>
                <input type="number" value={config.radioDomicilio} onChange={(e) => update('radioDomicilio', Number(e.target.value))} className={inputClass} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="text-xs font-semibold text-espresso-700 mb-1.5 block">Tiempo domicilio (min)</label>
                <input type="number" value={config.tiempoDomicilio} onChange={(e) => update('tiempoDomicilio', Number(e.target.value))} className={inputClass} />
              </div>
              <div>
                <label className="text-xs font-semibold text-espresso-700 mb-1.5 block">Tiempo recoger (min)</label>
                <input type="number" value={config.tiempoRecoger} onChange={(e) => update('tiempoRecoger', Number(e.target.value))} className={inputClass} />
              </div>
              <div>
                <label className="text-xs font-semibold text-espresso-700 mb-1.5 block">Tiempo mesa (min)</label>
                <input type="number" value={config.tiempoMesa} onChange={(e) => update('tiempoMesa', Number(e.target.value))} className={inputClass} />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-espresso-700 mb-1.5 block">Barrios de cobertura (separados por coma)</label>
              <input value={config.barrios.join(', ')} onChange={(e) => update('barrios', e.target.value.split(',').map(s => s.trim()).filter(Boolean))} className={inputClass} placeholder="Centro, San José, La Pradera..." />
            </div>
          </div>
        )}

        {/* RESERVAS */}
        {activeTab === 'reservas' && (
          <div className="space-y-6">
            <h3 className="font-display font-bold text-espresso-800 text-lg">Configuración de reservas</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="text-xs font-semibold text-espresso-700 mb-1.5 block">Máximo reservas por día</label>
                <input type="number" value={config.maxReservasPorDia} onChange={(e) => update('maxReservasPorDia', Number(e.target.value))} className={inputClass} />
              </div>
              <div>
                <label className="text-xs font-semibold text-espresso-700 mb-1.5 block">Tiempo mínimo anticipación (min)</label>
                <input type="number" value={config.tiempoMinimoReserva} onChange={(e) => update('tiempoMinimoReserva', Number(e.target.value))} className={inputClass} />
              </div>
              <div>
                <label className="text-xs font-semibold text-espresso-700 mb-1.5 block">Moneda</label>
                <select value={config.moneda} onChange={(e) => update('moneda', e.target.value)} className={inputClass}>
                  <option value="COP">COP - Peso colombiano</option>
                  <option value="USD">USD - Dólar</option>
                  <option value="EUR">EUR - Euro</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-espresso-700 mb-1.5 block">Política de reservas</label>
              <textarea value={config.politicaReserva} onChange={(e) => update('politicaReserva', e.target.value)} className={`${inputClass} resize-none`} rows={3} />
            </div>
          </div>
        )}

        {/* PAGOS */}
        {activeTab === 'pagos' && (
          <div className="space-y-6">
            <h3 className="font-display font-bold text-espresso-800 text-lg">Métodos de pago e impuestos</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="text-xs font-semibold text-espresso-700 mb-1.5 block">Impuesto (%)</label>
                <input type="number" value={config.impuesto} onChange={(e) => update('impuesto', Number(e.target.value))} className={inputClass} />
              </div>
              <div>
                <label className="text-xs font-semibold text-espresso-700 mb-1.5 block">Servicio de mesa ($)</label>
                <input type="number" value={config.servicioMesa} onChange={(e) => update('servicioMesa', Number(e.target.value))} className={inputClass} />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-espresso-700 mb-2 block">Métodos de pago aceptados</label>
              <div className="flex flex-wrap gap-2">
                {['Efectivo', 'Tarjeta débito', 'Tarjeta crédito', 'Nequi', 'Daviplata', 'PSE', 'Bancolombia'].map((m) => (
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

        {/* REDES */}
        {activeTab === 'redes' && (
          <div className="space-y-6">
            <h3 className="font-display font-bold text-espresso-800 text-lg">Redes sociales</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="text-xs font-semibold text-espresso-700 mb-1.5 block">Instagram URL</label>
                <input value={config.redes.instagram} onChange={(e) => update('redes', { ...config.redes, instagram: e.target.value })} className={inputClass} placeholder="https://instagram.com/..." />
              </div>
              <div>
                <label className="text-xs font-semibold text-espresso-700 mb-1.5 block">Facebook URL</label>
                <input value={config.redes.facebook} onChange={(e) => update('redes', { ...config.redes, facebook: e.target.value })} className={inputClass} placeholder="https://facebook.com/..." />
              </div>
              <div>
                <label className="text-xs font-semibold text-espresso-700 mb-1.5 block">TikTok URL</label>
                <input value={config.redes.tiktok} onChange={(e) => update('redes', { ...config.redes, tiktok: e.target.value })} className={inputClass} placeholder="https://tiktok.com/..." />
              </div>
              <div>
                <label className="text-xs font-semibold text-espresso-700 mb-1.5 block">Twitter/X URL</label>
                <input value={config.redes.twitter} onChange={(e) => update('redes', { ...config.redes, twitter: e.target.value })} className={inputClass} placeholder="https://twitter.com/..." />
              </div>
            </div>
          </div>
        )}

        {/* TEMA */}
        {activeTab === 'tema' && (
          <div className="space-y-6">
            <h3 className="font-display font-bold text-espresso-800 text-lg">Apariencia</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="text-xs font-semibold text-espresso-700 mb-1.5 block">Color primario</label>
                <div className="flex items-center gap-3">
                  <input type="color" value={config.colorPrimario} onChange={(e) => update('colorPrimario', e.target.value)} className="w-12 h-12 rounded-xl border border-cream-200 cursor-pointer" />
                  <input value={config.colorPrimario} onChange={(e) => update('colorPrimario', e.target.value)} className={inputClass} placeholder="#667A22" />
                </div>
              </div>
            </div>
            <div className="bg-cream-50 rounded-xl p-4 border border-cream-200">
              <p className="text-xs text-steel">Vista previa del color:</p>
              <div className="flex gap-2 mt-2">
                <div className="w-10 h-10 rounded-xl" style={{ backgroundColor: config.colorPrimario }} />
                <div className="px-4 py-2 rounded-xl text-white text-sm font-semibold" style={{ backgroundColor: config.colorPrimario }}>Botón de ejemplo</div>
              </div>
            </div>
          </div>
        )}

        {/* TEXTOS LEGALES */}
        {activeTab === 'textos-legales' && (
          <div className="space-y-6">
            <h3 className="font-display font-bold text-espresso-800 text-lg">Textos Legales</h3>
            <p className="text-sm text-steel">Edita los textos de las páginas legales. Se guardan en el navegador.</p>
            <div>
              <label className="text-xs font-semibold text-espresso-700 mb-1.5 block">Política de privacidad</label>
              <textarea
                value={politicaPrivacidad}
                onChange={(e) => setPoliticaPrivacidad(e.target.value)}
                className={`${inputClass} resize-none`}
                rows={10}
                placeholder="Escribe el contenido de la política de privacidad..."
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-espresso-700 mb-1.5 block">Términos y condiciones</label>
              <textarea
                value={terminosCondiciones}
                onChange={(e) => setTerminosCondiciones(e.target.value)}
                className={`${inputClass} resize-none`}
                rows={10}
                placeholder="Escribe el contenido de los términos y condiciones..."
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
