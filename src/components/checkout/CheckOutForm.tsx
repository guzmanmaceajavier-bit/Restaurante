import { useState } from 'react'
import { FaUtensils, FaMotorcycle, FaShoppingBag, FaCheck, FaRegClock } from 'react-icons/fa'
import { CONFIG } from '../../lib/config'
import { toast } from 'sonner'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'

export interface OrderData {
  typeOrder: string
  fullName: string
  phone: string
  tableNumber?: string
  address?: string
  neighborhood?: string
  paymentMethod: string
  scheduled: boolean
  scheduledTime?: string
  extras?: string[]
}

interface IProps {
  onSubmit: (data: OrderData) => void
}

const steps = ['Tipo', 'Datos', 'Pago', 'Confirmar']

const typeOptions = [
  { value: 'eatHere', label: 'Comer en el restaurante', icon: FaUtensils, desc: `Te atendemos en tu mesa — ~${CONFIG.entrega.tiempoMesa} min`, color: 'from-brick-500 to-brick-600' },
  { value: 'delivery', label: 'A domicilio', icon: FaMotorcycle, desc: `Recibe en tu casa — ~${CONFIG.entrega.tiempoDomicilio} min`, color: 'from-brick-500 to-brick-600' },
  { value: 'pickup', label: 'Recoger en el local', icon: FaShoppingBag, desc: `Pasa y recoge — ~${CONFIG.entrega.tiempoRecoger} min`, color: 'from-brick-500 to-brick-600' },
]

const validationSchemas = [
  Yup.object({
    typeOrder: Yup.string().required('Selecciona un tipo de pedido'),
  }),
  Yup.object({
    fullName: Yup.string().min(3, 'Mínimo 3 caracteres').required('El nombre es obligatorio'),
    phone: Yup.string().matches(/^\d[\d\s]*$/, 'Teléfono inválido').min(10, 'Mínimo 10 dígitos').required('El teléfono es obligatorio'),
    neighborhood: Yup.string().when('typeOrder', { is: 'delivery', then: (s) => s.required('Selecciona tu barrio') }),
    address: Yup.string().when('typeOrder', { is: 'delivery', then: (s) => s.required('La dirección es obligatoria') }),
  }),
  Yup.object({
    paymentMethod: Yup.string().required('Selecciona un método de pago'),
  }),
  Yup.object({}),
]

export function CheckOutForm({ onSubmit }: IProps) {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<OrderData>({
    typeOrder: '', fullName: '', phone: '', tableNumber: '',
    address: '', neighborhood: '', paymentMethod: '',
    scheduled: false, scheduledTime: '', extras: [],
  })

  const update = (field: string, value: unknown) => setForm((prev) => ({ ...prev, [field]: value }))

  const handleNext = (values: OrderData, setFieldTouched: (field: string, touched: boolean, shouldValidate?: boolean) => void) => {
    if (step === 1 && !values.typeOrder) { toast.error('Selecciona un tipo de pedido'); return }
    if (step === 2) {
      if (values.fullName.trim().length < 3) { toast.error('Completa tu nombre'); setFieldTouched('fullName', true); return }
      if (values.phone.replace(/\s/g, '').length < 7) { toast.error('Completa tu teléfono'); setFieldTouched('phone', true); return }
      if (values.typeOrder === 'delivery') {
        if (!values.neighborhood) { toast.error('Selecciona tu barrio'); setFieldTouched('neighborhood', true); return }
        if (!values.address || values.address.length < 5) { toast.error('Ingresa tu dirección'); setFieldTouched('address', true); return }
      }
    }
    if (step === 3 && !values.paymentMethod) { toast.error('Selecciona un método de pago'); return }
    setStep((s) => Math.min(s + 1, 4))
  }

  const handleConfirm = (values: OrderData) => {
    if (values.typeOrder === 'delivery' && (!values.address || !values.neighborhood)) {
      toast.error('Completa la dirección de entrega')
      return
    }
    onSubmit(values)
  }

  const toggleExtra = (id: string) => {
    const current = form.extras || []
    update('extras', current.includes(id) ? current.filter((e) => e !== id) : [...current, id])
  }

  const typeLabel = form.typeOrder === 'eatHere' ? 'Comer en el restaurante'
    : form.typeOrder === 'delivery' ? 'A domicilio'
    : form.typeOrder === 'pickup' ? 'Recoger en el local' : ''

  return (
    <Formik
      initialValues={form}
      enableReinitialize
      validationSchema={step <= 3 ? validationSchemas[step - 1] : validationSchemas[3]}
      onSubmit={() => {}}
    >
      {({ values, setFieldTouched }) => (
        <Form className="bg-white rounded-2xl shadow-card border border-smoke p-6 md:p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-serif font-bold text-ink">Nuevo pedido</h2>
            <span className="text-sm text-steel">Paso {step} de 4</span>
          </div>

          <div className="flex gap-2 mb-8">
            {steps.map((label, i) => (
              <div key={label} className="flex-1 flex flex-col items-center gap-1">
                <div className={`w-full h-2 rounded-full transition-colors ${i + 1 <= step ? 'bg-brick-500' : 'bg-smoke'}`} />
                <span className={`text-xs font-medium ${i + 1 <= step ? 'text-brick-600' : 'text-steel'}`}>{label}</span>
              </div>
            ))}
          </div>

          {step === 1 && (
            <div className="space-y-6">
              <p className="font-semibold text-ink">¿Cómo quieres tu pedido?</p>
              <div className="grid sm:grid-cols-3 gap-4">
                {typeOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => { update('typeOrder', opt.value); setFieldTouched('typeOrder', true) }}
                    className={`p-5 rounded-xl border-2 text-center transition-all hover:shadow-lift ${
                      values.typeOrder === opt.value ? 'border-brick-500 bg-warm' : 'border-smoke hover:border-brick-400'
                    }`}
                  >
                    <opt.icon className={`mx-auto text-3xl mb-2 ${values.typeOrder === opt.value ? 'text-brick-600' : 'text-steel'}`} />
                    <p className={`font-bold ${values.typeOrder === opt.value ? 'text-brick-700' : 'text-ink'}`}>{opt.label}</p>
                    <p className="text-xs text-steel mt-1">{opt.desc}</p>
                  </button>
                ))}
              </div>
              <ErrorMessage name="typeOrder" component="p" className="text-red-500 text-xs" />

              <div className="bg-warm border border-smoke rounded-xl p-4 flex items-center gap-3">
                <FaRegClock className="text-brick-500 shrink-0" />
                <div className="flex-1">
                  <label className="text-sm font-medium text-ink">Programar pedido</label>
                  <p className="text-xs text-steel">Selecciona una hora si quieres pedir para después</p>
                </div>
                <button
                  type="button"
                  onClick={() => update('scheduled', !values.scheduled)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    values.scheduled ? 'bg-brick-600 text-white' : 'bg-smoke text-steel'
                  }`}
                >
                  {values.scheduled ? 'Sí' : 'No'}
                </button>
              </div>

              {values.scheduled && (
                <div>
                  <label className="text-sm font-medium text-ink">¿Para qué hora?</label>
                  <Field
                    type="time"
                    name="scheduledTime"
                    min={CONFIG.entrega.apertura}
                    max={CONFIG.entrega.cierre}
                    className="w-full border border-smoke rounded-xl p-3 mt-1 focus:ring-2 focus:ring-brick-500/30 focus:border-brick-500 outline-none bg-white"
                  />
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <p className="font-semibold text-ink mb-4">Tus datos</p>
              <div>
                <label className="text-sm font-medium text-ink">Nombre completo *</label>
                <Field name="fullName" placeholder="Ej: Juan Pérez" className="w-full border border-smoke rounded-xl p-3 mt-1 focus:ring-2 focus:ring-brick-500/30 focus:border-brick-500 outline-none bg-white" />
                <ErrorMessage name="fullName" component="p" className="text-red-500 text-xs mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium text-ink">Celular *</label>
                <Field name="phone" placeholder="300 123 4567" className="w-full border border-smoke rounded-xl p-3 mt-1 focus:ring-2 focus:ring-brick-500/30 focus:border-brick-500 outline-none bg-white" />
                <ErrorMessage name="phone" component="p" className="text-red-500 text-xs mt-1" />
              </div>
              {values.typeOrder === 'eatHere' && (
                <div>
                  <label className="text-sm font-medium text-ink">Mesa (opcional)</label>
                  <Field name="tableNumber" placeholder="Ej: Mesa 5" className="w-full border border-smoke rounded-xl p-3 mt-1 focus:ring-2 focus:ring-brick-500/30 focus:border-brick-500 outline-none bg-white" />
                </div>
              )}
              {values.typeOrder === 'delivery' && (
                <>
                  <div>
                    <label className="text-sm font-medium text-ink">Barrio *</label>
                    <Field as="select" name="neighborhood" className="w-full border border-smoke rounded-xl p-3 mt-1 focus:ring-2 focus:ring-brick-500/30 focus:border-brick-500 outline-none bg-white">
                      <option value="">Selecciona tu barrio</option>
                      {CONFIG.delivery.barrios.map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </Field>
                    <ErrorMessage name="neighborhood" component="p" className="text-red-500 text-xs mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-ink">Dirección *</label>
                    <Field name="address" placeholder="Cra 10 #20-30" className="w-full border border-smoke rounded-xl p-3 mt-1 focus:ring-2 focus:ring-brick-500/30 focus:border-brick-500 outline-none bg-white" />
                    <ErrorMessage name="address" component="p" className="text-red-500 text-xs mt-1" />
                  </div>
                </>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <p className="font-semibold text-ink mb-4">Método de pago</p>
              <div className="grid gap-3">
                {CONFIG.metodosPago.map((mp) => (
                  <button
                    key={mp.id}
                    type="button"
                    onClick={() => { update('paymentMethod', mp.id); setFieldTouched('paymentMethod', true) }}
                    className={`p-4 rounded-xl border-2 text-left transition-all hover:shadow-lift ${
                      values.paymentMethod === mp.id ? 'border-brick-500 bg-warm' : 'border-smoke hover:border-brick-400'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{mp.icono}</span>
                      <div className="flex-1">
                        <p className={`font-bold ${values.paymentMethod === mp.id ? 'text-brick-700' : 'text-ink'}`}>{mp.nombre}</p>
                        <p className="text-sm text-steel">{mp.desc}</p>
                      </div>
                      {values.paymentMethod === mp.id && <FaCheck className="text-brick-600" />}
                    </div>
                  </button>
                ))}
              </div>
              <ErrorMessage name="paymentMethod" component="p" className="text-red-500 text-xs" />
              {values.paymentMethod && values.paymentMethod !== 'efectivo' && (
                <div className="bg-warm border border-smoke rounded-xl p-4 mt-2">
                  <p className="font-semibold text-brick-700 text-sm mb-1">Datos para transferencia:</p>
                  <p className="text-ink text-sm">
                    {CONFIG.metodosPago.find(m => m.id === values.paymentMethod)?.tipo}: {CONFIG.metodosPago.find(m => m.id === values.paymentMethod)?.numero}
                  </p>
                  <p className="text-xs text-steel mt-1">Envía el comprobante a nuestro WhatsApp</p>
                </div>
              )}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-5">
              <div className="bg-warm border border-smoke rounded-xl p-5 text-center">
                <FaCheck className="text-brick-500 text-3xl mx-auto mb-2" />
                <p className="font-bold text-ink text-lg">¿Todo listo?</p>
                <p className="text-sm text-steel">Revisa tu pedido y confirma para enviarlo por WhatsApp</p>
              </div>

              <div className="bg-warm rounded-xl p-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-steel">Tipo</span><span className="font-medium">{typeLabel}</span></div>
                <div className="flex justify-between"><span className="text-steel">Cliente</span><span className="font-medium">{values.fullName}</span></div>
                <div className="flex justify-between"><span className="text-steel">Teléfono</span><span className="font-medium">{values.phone}</span></div>
                {values.tableNumber && <div className="flex justify-between"><span className="text-steel">Mesa</span><span className="font-medium">{values.tableNumber}</span></div>}
                {values.neighborhood && <div className="flex justify-between"><span className="text-steel">Barrio</span><span className="font-medium">{values.neighborhood}</span></div>}
                {values.address && <div className="flex justify-between"><span className="text-steel">Dirección</span><span className="font-medium">{values.address}</span></div>}
                <div className="flex justify-between"><span className="text-steel">Pago</span><span className="font-medium">{CONFIG.metodosPago.find(m => m.id === values.paymentMethod)?.nombre}</span></div>
                {values.scheduled && values.scheduledTime && (
                  <div className="flex justify-between"><span className="text-steel">Programado</span><span className="font-medium">{values.scheduledTime}</span></div>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-between mt-8">
            {step > 1 ? (
              <button type="button" onClick={() => setStep((s) => s - 1)} className="px-6 py-3 text-steel hover:text-ink font-medium transition-colors">
                Atrás
              </button>
            ) : <div />}
            {step < 4 ? (
              <button type="button" onClick={() => handleNext(values, setFieldTouched)} className="px-8 py-3 bg-brick-500 hover:bg-brick-600 text-white font-semibold rounded-xl transition-all shadow-lg shadow-brick-500/30">
                Siguiente
              </button>
            ) : (
              <button type="button" onClick={() => handleConfirm(values)} className="px-8 py-3 bg-brick-500 hover:bg-brick-600 text-white font-semibold rounded-xl transition-all shadow-lg shadow-brick-500/30 flex items-center gap-2">
                Confirmar pedido
              </button>
            )}
          </div>
        </Form>
      )}
    </Formik>
  )
}
