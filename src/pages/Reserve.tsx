import { useState, useMemo } from 'react'
import { CONFIG } from '../lib/config'
import { storage } from '../lib/storage'
import { toast } from 'sonner'
import { SEO } from '../lib/seo'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { FaCalendarAlt, FaUser, FaArrowRight, FaArrowLeft, FaMinus, FaPlus, FaUsers, FaCheck, FaBan, FaWhatsapp, FaCalendarPlus } from 'react-icons/fa'
import clsx from 'clsx'

const HORAS = (() => { const h = []; for (let i = 11; i <= 21; i++) { h.push(`${i.toString().padStart(2, '0')}:00`); if (i < 21) h.push(`${i.toString().padStart(2, '0')}:30`) } return h })()
const OCASIONES = [...CONFIG.reservas.ocasiones, 'Otra']
const DAYS = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do']
const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

const fullSchema = Yup.object({
  nombre: Yup.string().min(2, 'Mínimo 2 caracteres').required('El nombre es obligatorio'),
  email: Yup.string().email('Email inválido').required('El email es obligatorio'),
  telefono: Yup.string().matches(/^\d[\d\s]*$/, 'Teléfono inválido').min(10, 'Mínimo 10 dígitos').required('El teléfono es obligatorio'),
  fecha: Yup.string().required('Selecciona una fecha'),
  hora: Yup.string().required('Selecciona una hora'),
  personas: Yup.number().min(1).max(CONFIG.reservas.maxPersonas).required(),
  ocasion: Yup.string(),
  ocasionOtra: Yup.string(),
  comentarios: Yup.string(),
})

function getCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay()
  const offset = firstDay === 0 ? 6 : firstDay - 1
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const days: (number | null)[] = []
  for (let i = 0; i < offset; i++) days.push(null)
  for (let d = 1; d <= daysInMonth; d++) days.push(d)
  return days
}

function getAvailability(fecha: string, hora: string): 'available' | 'limited' | 'full' {
  const reservas = storage.getReservas()
  const same = reservas.filter((r: any) => r.fecha === fecha && r.hora === hora && r.estado !== 'Cancelada')
  if (same.length >= 3) return 'full'
  if (same.length >= 1) return 'limited'
  return 'available'
}

export default function Reserve() {
  const today = new Date()
  const [step, setStep] = useState(1)
  const [calendarMonth, setCalendarMonth] = useState(today.getMonth())
  const [calendarYear, setCalendarYear] = useState(today.getFullYear())
  const [confirmed, setConfirmed] = useState<any>(null)
  const calendarDays = useMemo(() => getCalendarDays(calendarYear, calendarMonth), [calendarYear, calendarMonth])

  const handleNext = async (validateForm: any) => {
    const errors = await validateForm()
    const stepErrors: Record<number, string[]> = {
      1: ['personas'],
      2: ['fecha', 'hora'],
      3: ['nombre', 'email', 'telefono'],
    }
    const fields = stepErrors[step] || []
    const hasError = fields.some(f => errors[f])
    if (!hasError) setStep(s => Math.min(4, s + 1))
  }

  if (confirmed) {
    const fechaFormatted = new Date(confirmed.fecha + 'T12:00:00').toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    const whatsappMsg = `🍽️ *Reserva*%0A👤 ${confirmed.nombre}%0A📅 ${confirmed.fecha}%0A🕐 ${confirmed.hora}%0A👥 ${confirmed.personas} personas%0A🎉 ${confirmed.ocasion || 'Sin especificar'}`
    const calendarDate = confirmed.fecha.replace(/-/g, '') + 'T' + confirmed.hora.replace(':', '') + '00'
    const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=Reserva+Sabor+y+Origen&dates=${calendarDate}/${calendarDate}&details=Mesa+para+${confirmed.personas}+personas`

    return (
      <section className="py-10 px-6 min-h-screen">
        <SEO title="Reserva confirmada" />
        <div className="max-w-lg mx-auto">
          <div className="bg-white rounded-3xl shadow-card border border-cream-200 overflow-hidden text-center">
            <div className="bg-gradient-to-r from-olive-500 to-olive-600 text-white py-10 px-8">
              <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <FaCheck size={32} />
              </div>
              <h1 className="text-2xl font-display font-bold">Reserva recibida</h1>
              <p className="text-white/70 text-sm mt-1">Te contactaremos por WhatsApp</p>
            </div>
            <div className="p-8 space-y-5">
              <div className="bg-cream-50 rounded-2xl p-6 border border-cream-200 space-y-3">
                <div className="flex justify-between"><span className="text-steel text-sm">Fecha</span><span className="font-semibold text-espresso-800">{fechaFormatted}</span></div>
                <div className="flex justify-between"><span className="text-steel text-sm">Hora</span><span className="font-bold text-olive-600 text-lg">{confirmed.hora}</span></div>
                <div className="flex justify-between"><span className="text-steel text-sm">Personas</span><span className="font-semibold text-espresso-800">{confirmed.personas}</span></div>
                {confirmed.ocasion && <div className="flex justify-between"><span className="text-steel text-sm">Ocasión</span><span className="font-semibold text-espresso-800">{confirmed.ocasion}</span></div>}
              </div>
              <div className="flex gap-3">
                <a href={`https://wa.me/${CONFIG.contacto.whatsapp}?text=${whatsappMsg}`} target="_blank" rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3.5 rounded-xl transition-all shadow-md active:scale-95">
                  <FaWhatsapp size={18} /> Abrir WhatsApp
                </a>
                <a href={gcalUrl} target="_blank" rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 bg-olive-500 hover:bg-olive-600 text-white font-semibold py-3.5 rounded-xl transition-all shadow-md active:scale-95">
                  <FaCalendarPlus size={16} /> Agregar al calendario
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-10 px-6 min-h-screen">
      <SEO title="Reservas" description="Reserva tu mesa en Sabor y Origen" />
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-olive-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <FaCalendarAlt className="text-olive-500" size={20} />
          </div>
          <h1 className="text-3xl font-display font-bold text-espresso-800 mb-2">Reservar mesa</h1>
          <p className="text-steel text-sm">Completa los datos y te confirmamos por WhatsApp</p>
        </div>

        <div className="flex gap-1.5 mb-8">
          {['Personas', 'Fecha', 'Datos', 'Listo'].map((label, i) => (
            <div key={label} className="flex-1">
              <div className={clsx('h-2 rounded-full transition-all duration-500', i + 1 < step ? 'bg-olive-500' : i + 1 === step ? 'bg-olive-500 step-active' : 'bg-cream-200')} />
              <span className={clsx('text-xs font-medium mt-2 block', i + 1 <= step ? 'text-espresso-700' : 'text-steel/50')}>{label}</span>
            </div>
          ))}
        </div>

        <Formik
          initialValues={{ nombre: '', email: '', telefono: '', fecha: '', hora: '', personas: 2, ocasion: '', ocasionOtra: '', comentarios: '' }}
          validationSchema={fullSchema}
          validateOnMount={false}
          onSubmit={(values) => {
            const reservas = storage.getReservas()
            const id = `RES-${Date.now().toString(36).toUpperCase()}`
            const ocasionFinal = values.ocasion === 'Otra' ? values.ocasionOtra : values.ocasion
            reservas.push({ ...values, ocasion: ocasionFinal, id, estado: 'Pendiente', createdAt: new Date().toISOString() })
            storage.setReservas(reservas)
            setConfirmed({ ...values, ocasion: ocasionFinal, id })
            toast.success('¡Reserva enviada!')
          }}
        >
          {({ isSubmitting, values, setFieldValue, validateForm }) => (
            <Form className="bg-white rounded-3xl shadow-card border border-cream-200 p-8 overflow-hidden">

              {step === 1 && (
                <div className="space-y-6 fade-in-up">
                  <p className="font-semibold text-espresso-800 flex items-center gap-2"><FaUsers className="text-olive-500" size={16} /> ¿Cuántos serán?</p>
                  <div className="flex items-center justify-center gap-6 py-6">
                    <button type="button" onClick={() => setFieldValue('personas', Math.max(1, values.personas - 1))}
                      className="w-14 h-14 rounded-2xl bg-cream-100 border border-cream-300 flex items-center justify-center text-espresso-600 hover:bg-cream-200 transition-all active:scale-90">
                      <FaMinus size={18} />
                    </button>
                    <div className="text-center">
                      <span className="text-5xl font-bold text-olive-500 tabular-nums">{values.personas}</span>
                      <p className="text-sm text-steel mt-1">{values.personas === 1 ? 'persona' : 'personas'}</p>
                    </div>
                    <button type="button" onClick={() => setFieldValue('personas', Math.min(CONFIG.reservas.maxPersonas, values.personas + 1))}
                      className="w-14 h-14 rounded-2xl bg-olive-500 flex items-center justify-center text-white hover:bg-olive-600 transition-all active:scale-90 shadow-lg shadow-olive-500/20">
                      <FaPlus size={18} />
                    </button>
                  </div>
                  <div className="bg-olive-50 border border-olive-200 rounded-xl p-4 text-center">
                    <p className="text-sm font-semibold text-olive-700">🪑 Mesa para {values.personas} {values.personas === 1 ? 'persona' : 'personas'}</p>
                  </div>
                  <ErrorMessage name="personas" component="p" className="text-red-500 text-xs text-center" />
                  <button type="button" onClick={() => handleNext(validateForm)} className="w-full btn-primary py-3.5 flex items-center justify-center gap-2">
                    Siguiente <FaArrowRight size={14} />
                  </button>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-5 fade-in-up">
                  <p className="font-semibold text-espresso-800 flex items-center gap-2"><FaCalendarAlt className="text-olive-500" size={16} /> ¿Cuándo quieres venir?</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <button type="button" onClick={() => { if (calendarMonth === 0) { setCalendarMonth(11); setCalendarYear(y => y - 1) } else setCalendarMonth(m => m - 1) }}
                          className="text-olive-600 hover:bg-olive-50 w-8 h-8 rounded-lg flex items-center justify-center transition-colors text-sm font-bold">‹</button>
                        <span className="text-sm font-semibold text-espresso-800">{MONTHS[calendarMonth]} {calendarYear}</span>
                        <button type="button" onClick={() => { if (calendarMonth === 11) { setCalendarMonth(0); setCalendarYear(y => y + 1) } else setCalendarMonth(m => m + 1) }}
                          className="text-olive-600 hover:bg-olive-50 w-8 h-8 rounded-lg flex items-center justify-center transition-colors text-sm font-bold">›</button>
                      </div>
                      <div className="grid grid-cols-7 gap-1 mb-1">{DAYS.map(d => <div key={d} className="text-center text-[10px] font-semibold text-steel uppercase">{d}</div>)}</div>
                      <div className="grid grid-cols-7 gap-1">
                        {calendarDays.map((day, i) => {
                          if (day === null) return <div key={`e-${i}`} className="calendar-day calendar-empty" />
                          const dateStr = `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                          const dateObj = new Date(calendarYear, calendarMonth, day)
                          const isPast = dateObj < new Date(today.getFullYear(), today.getMonth(), today.getDate())
                          return (
                            <button key={i} type="button" disabled={isPast} onClick={() => setFieldValue('fecha', dateStr)}
                              className={clsx('calendar-day', { 'calendar-today': dateObj.getTime() === today.getTime(), 'calendar-selected': values.fecha === dateStr, 'calendar-disabled': isPast })}>
                              {day}
                            </button>
                          )
                        })}
                      </div>
                      <ErrorMessage name="fecha" component="p" className="text-red-500 text-xs mt-2" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-espresso-700 mb-2 block">Hora *</label>
                      <div className="grid grid-cols-3 gap-1.5 max-h-[280px] overflow-y-auto scrollbar-hide pr-1">
                        {HORAS.map(h => {
                          const avail = values.fecha ? getAvailability(values.fecha, h) : 'available' as const
                          const selected = values.hora === h
                          const isFull = avail === 'full'
                          return (
                            <button key={h} type="button" disabled={isFull} onClick={() => !isFull && setFieldValue('hora', h)}
                              className={clsx('hour-slot relative', { 'hour-selected': selected, 'hour-occupied': isFull, 'hour-available': !isFull && !selected, 'border-gold-400 bg-gold-50': avail === 'limited' && !selected })}>
                              {selected && <FaCheck size={10} className="inline mr-1" />}
                              {isFull && <FaBan size={10} className="inline mr-1 opacity-50" />}
                              {h}
                              {avail === 'limited' && !selected && <span className="absolute -top-1 -right-1 w-2 h-2 bg-gold-400 rounded-full" />}
                            </button>
                          )
                        })}
                      </div>
                      <div className="flex gap-3 mt-3 text-[10px]">
                        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-olive-500" /> Seleccionada</span>
                        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded border border-cream-200 bg-white" /> Disponible</span>
                        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-gold-400" /> Pocos lugares</span>
                        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-cream-200" /> Completo</span>
                      </div>
                      <ErrorMessage name="hora" component="p" className="text-red-500 text-xs mt-2" />
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setStep(1)} className="btn-secondary flex-1 py-3.5 flex items-center justify-center gap-2"><FaArrowLeft size={14} /> Atrás</button>
                    <button type="button" onClick={() => handleNext(validateForm)} className="btn-primary flex-1 py-3.5 flex items-center justify-center gap-2">Siguiente <FaArrowRight size={14} /></button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-5 fade-in-up">
                  <p className="font-semibold text-espresso-800 flex items-center gap-2"><FaUser className="text-olive-500" size={16} /> Tus datos</p>
                  <div>
                    <label className="text-sm font-medium text-espresso-700 mb-1.5 block">Nombre *</label>
                    <Field name="nombre" className="input-base" placeholder="Tu nombre completo" />
                    <ErrorMessage name="nombre" component="p" className="text-red-500 text-xs mt-1" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-sm font-medium text-espresso-700 mb-1.5 block">Email *</label><Field type="email" name="email" className="input-base" placeholder="tu@email.com" /><ErrorMessage name="email" component="p" className="text-red-500 text-xs mt-1" /></div>
                    <div><label className="text-sm font-medium text-espresso-700 mb-1.5 block">Teléfono *</label><Field name="telefono" className="input-base" placeholder="300 123 4567" /><ErrorMessage name="telefono" component="p" className="text-red-500 text-xs mt-1" /></div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-espresso-700 mb-1.5 block">Ocasión</label>
                    <Field as="select" name="ocasion" className="input-base"><option value="">Sin especificar</option>{OCASIONES.map(o => <option key={o} value={o}>{o}</option>)}</Field>
                  </div>
                  {values.ocasion === 'Otra' && <div className="fade-in-up"><label className="text-sm font-medium text-espresso-700 mb-1.5 block">¿Cuál?</label><Field name="ocasionOtra" className="input-base" placeholder="Escribe la ocasión..." /></div>}
                  <div><label className="text-sm font-medium text-espresso-700 mb-1.5 block">Comentarios</label><Field as="textarea" name="comentarios" rows={3} className="input-base resize-none" placeholder="Alguna solicitud especial..." /></div>
                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setStep(2)} className="btn-secondary flex-1 py-3.5 flex items-center justify-center gap-2"><FaArrowLeft size={14} /> Atrás</button>
                    <button type="button" onClick={() => handleNext(validateForm)} className="btn-primary flex-1 py-3.5 flex items-center justify-center gap-2">Siguiente <FaArrowRight size={14} /></button>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-5 fade-in-up">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-olive-100 rounded-2xl flex items-center justify-center mx-auto mb-3"><FaCheck size={24} className="text-olive-500" /></div>
                    <h3 className="text-xl font-display font-bold text-espresso-800">Mesa para {values.personas} {values.personas === 1 ? 'persona' : 'personas'}</h3>
                    <p className="text-sm text-steel mt-1">Revisa los datos antes de confirmar</p>
                  </div>
                  <div className="bg-cream-50 rounded-2xl p-5 space-y-3 text-sm border border-cream-200">
                    <div className="flex justify-between"><span className="text-steel">Fecha</span><span className="font-semibold text-espresso-800">{values.fecha}</span></div>
                    <div className="flex justify-between"><span className="text-steel">Hora</span><span className="font-semibold text-espresso-800">{values.hora}</span></div>
                    <div className="flex justify-between"><span className="text-steel">Nombre</span><span className="font-semibold text-espresso-800">{values.nombre}</span></div>
                    {values.ocasion && <div className="flex justify-between"><span className="text-steel">Ocasión</span><span className="font-semibold text-espresso-800">{values.ocasion === 'Otra' ? values.ocasionOtra : values.ocasion}</span></div>}
                  </div>
                  <div className="flex gap-3">
                    <button type="button" onClick={() => setStep(3)} className="btn-secondary flex-1 py-3.5 flex items-center justify-center gap-2"><FaArrowLeft size={14} /> Atrás</button>
                    <button type="submit" disabled={isSubmitting} className="btn-primary flex-1 py-3.5 flex items-center justify-center gap-2 disabled:opacity-50">{isSubmitting ? 'Enviando...' : 'Confirmar reserva'}</button>
                  </div>
                </div>
              )}
            </Form>
          )}
        </Formik>
      </div>
    </section>
  )
}
