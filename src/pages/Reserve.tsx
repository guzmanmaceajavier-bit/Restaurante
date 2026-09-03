import { CONFIG } from '../lib/config'
import { storage } from '../lib/storage'
import { toast } from 'sonner'
import { SEO } from '../lib/seo'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'

const horas = Array.from({ length: 12 }, (_, i) => `${(i + 10).toString().padStart(2, '0')}:00`)

const validationSchema = Yup.object({
  nombre: Yup.string().min(2, 'Mínimo 2 caracteres').required('El nombre es obligatorio'),
  email: Yup.string().email('Email inválido').required('El email es obligatorio'),
  telefono: Yup.string().matches(/^\d[\d\s]*$/, 'Teléfono inválido').min(10, 'Mínimo 10 dígitos').required('El teléfono es obligatorio'),
  fecha: Yup.string().required('La fecha es obligatoria'),
  hora: Yup.string().required('La hora es obligatoria'),
  personas: Yup.number().min(1, 'Mínimo 1 persona').max(CONFIG.reservas.maxPersonas, `Máximo ${CONFIG.reservas.maxPersonas} personas`).required(),
  zona: Yup.string(),
  ocasion: Yup.string(),
  comentarios: Yup.string(),
})

export default function Reserve() {
  const minDate = new Date().toISOString().split('T')[0]

  return (
    <section className="pt-28 pb-20 px-6">
      <SEO title="Reservas" description="Reserva tu mesa en Sabor y Origen" />
      <div className="max-w-content mx-auto">
        <div className="max-w-xl mx-auto">
          <h1 className="text-4xl font-serif font-bold text-ink mb-2">Reservar mesa</h1>
          <p className="text-steel mb-10">Completa el formulario y te confirmamos por WhatsApp</p>

          <Formik
            initialValues={{
              nombre: '', email: '', telefono: '', fecha: '', hora: '',
              personas: 2, zona: '', ocasion: '', comentarios: '',
            }}
            validationSchema={validationSchema}
            onSubmit={(values, { resetForm }) => {
              const reservas = storage.getReservas()
              const id = `RES-${Date.now().toString(36).toUpperCase()}`
              reservas.push({ ...values, id, estado: 'Pendiente', createdAt: new Date().toISOString() })
              storage.setReservas(reservas)
              const msg = `🍽️ *Nueva reserva* #${id}%0A👤 ${values.nombre}%0A📧 ${values.email}%0A📞 ${values.telefono}%0A📅 ${values.fecha} ${values.hora}%0A👥 ${values.personas} personas%0A🪑 Zona: ${values.zona || 'Sin especificar'}%0A🎉 Ocasión: ${values.ocasion || 'Sin ocasión'}%0A💬 ${values.comentarios || 'Sin comentarios'}`
              window.open(`https://wa.me/${CONFIG.contacto.whatsapp}?text=${msg}`, '_blank')
              toast.success('Reserva solicitada')
              resetForm()
            }}
          >
            {({ isSubmitting }) => (
              <Form className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-ink mb-1.5">Nombre *</label>
                  <Field name="nombre" className="w-full px-4 py-3 rounded-xl border border-smoke bg-white text-ink placeholder:text-steel/50 focus:outline-none focus:ring-2 focus:ring-brick-500/30 focus:border-brick-500 transition-all" placeholder="Tu nombre completo" />
                  <ErrorMessage name="nombre" component="p" className="text-red-500 text-xs mt-1" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink mb-1.5">Email *</label>
                  <Field type="email" name="email" className="w-full px-4 py-3 rounded-xl border border-smoke bg-white text-ink placeholder:text-steel/50 focus:outline-none focus:ring-2 focus:ring-brick-500/30 focus:border-brick-500 transition-all" placeholder="tu@email.com" />
                  <ErrorMessage name="email" component="p" className="text-red-500 text-xs mt-1" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink mb-1.5">Teléfono *</label>
                  <Field name="telefono" className="w-full px-4 py-3 rounded-xl border border-smoke bg-white text-ink placeholder:text-steel/50 focus:outline-none focus:ring-2 focus:ring-brick-500/30 focus:border-brick-500 transition-all" placeholder="300 123 4567" />
                  <ErrorMessage name="telefono" component="p" className="text-red-500 text-xs mt-1" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-ink mb-1.5">Fecha *</label>
                    <Field type="date" name="fecha" min={minDate} className="w-full px-4 py-3 rounded-xl border border-smoke bg-white text-ink focus:outline-none focus:ring-2 focus:ring-brick-500/30 focus:border-brick-500 transition-all" />
                    <ErrorMessage name="fecha" component="p" className="text-red-500 text-xs mt-1" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-ink mb-1.5">Hora *</label>
                    <Field as="select" name="hora" className="w-full px-4 py-3 rounded-xl border border-smoke bg-white text-ink focus:outline-none focus:ring-2 focus:ring-brick-500/30 focus:border-brick-500 transition-all">
                      <option value="">Seleccionar</option>
                      {horas.map(h => <option key={h} value={h}>{h}</option>)}
                    </Field>
                    <ErrorMessage name="hora" component="p" className="text-red-500 text-xs mt-1" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-ink mb-1.5">Personas</label>
                    <Field as="select" name="personas" className="w-full px-4 py-3 rounded-xl border border-smoke bg-white text-ink focus:outline-none focus:ring-2 focus:ring-brick-500/30 focus:border-brick-500 transition-all">
                      {Array.from({ length: CONFIG.reservas.maxPersonas }, (_, i) => i + 1).map(n => (
                        <option key={n} value={n}>{n} {n === 1 ? 'persona' : 'personas'}</option>
                      ))}
                    </Field>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-ink mb-1.5">Zona</label>
                    <Field as="select" name="zona" className="w-full px-4 py-3 rounded-xl border border-smoke bg-white text-ink focus:outline-none focus:ring-2 focus:ring-brick-500/30 focus:border-brick-500 transition-all">
                      <option value="">Sin preferencia</option>
                      {CONFIG.reservas.zonas.map(z => <option key={z} value={z}>{z}</option>)}
                    </Field>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink mb-1.5">Ocasión</label>
                  <Field as="select" name="ocasion" className="w-full px-4 py-3 rounded-xl border border-smoke bg-white text-ink focus:outline-none focus:ring-2 focus:ring-brick-500/30 focus:border-brick-500 transition-all">
                    <option value="">Sin ocasión especial</option>
                    {CONFIG.reservas.ocasiones.map(o => <option key={o} value={o}>{o}</option>)}
                  </Field>
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink mb-1.5">Comentarios</label>
                  <Field as="textarea" name="comentarios" rows={3} className="w-full px-4 py-3 rounded-xl border border-smoke bg-white text-ink placeholder:text-steel/50 focus:outline-none focus:ring-2 focus:ring-brick-500/30 focus:border-brick-500 transition-all resize-none" placeholder="Alguna solicitud especial..." />
                </div>
                <button type="submit" disabled={isSubmitting}
                  className="w-full bg-brick-500 hover:bg-brick-600 text-white py-3.5 rounded-xl font-semibold transition-all shadow-lg shadow-brick-500/30 disabled:opacity-50">
                  {isSubmitting ? 'Enviando...' : 'Solicitar reserva'}
                </button>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </section>
  )
}
