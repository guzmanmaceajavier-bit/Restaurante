import { useState } from 'react'
import { FaUtensils, FaMotorcycle, FaShoppingBag, FaCheck, FaRegClock } from 'react-icons/fa'
import { CONFIG } from '../../lib/config'
import { toast } from 'sonner'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { validarCodigo } from '../../lib/promociones'
import type { Promocion } from '../../lib/config'
import clsx from 'clsx'

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
  appliedPromo?: Promocion | null
}

interface IProps {
  onSubmit: (data: OrderData) => void
}

const steps = ['Tipo', 'Datos', 'Pago', 'Confirmar']

const typeOptions = [
  { value: 'eatHere', label: 'Comer aquí', icon: FaUtensils, desc: `~${CONFIG.entrega.tiempoMesa} min`, time: CONFIG.entrega.tiempoMesa },
  { value: 'delivery', label: 'A domicilio', icon: FaMotorcycle, desc: `~${CONFIG.entrega.tiempoDomicilio} min`, time: CONFIG.entrega.tiempoDomicilio },
  { value: 'pickup', label: 'Recoger', icon: FaShoppingBag, desc: `~${CONFIG.entrega.tiempoRecoger} min`, time: CONFIG.entrega.tiempoRecoger },
]

const validationSchemas = [
  Yup.object({ typeOrder: Yup.string().required('Selecciona un tipo de pedido') }),
  Yup.object({
    fullName: Yup.string().min(3, 'Mínimo 3 caracteres').required('El nombre es obligatorio'),
    phone: Yup.string().matches(/^\d[\d\s]*$/, 'Teléfono inválido').min(10, 'Mínimo 10 dígitos').required('El teléfono es obligatorio'),
    address: Yup.string().when('typeOrder', { is: 'delivery', then: (s) => s.required('La dirección es obligatoria') }),
  }),
  Yup.object({ paymentMethod: Yup.string().required('Selecciona un método de pago') }),
  Yup.object({}),
]

export function CheckOutForm({ onSubmit }: IProps) {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<OrderData>({
    typeOrder: '', fullName: '', phone: '', tableNumber: '',
    address: '', neighborhood: '', paymentMethod: '',
    scheduled: false, scheduledTime: '', extras: [],
  })
  const [promoCode, setPromoCode] = useState('')
  const [appliedPromo, setAppliedPromo] = useState<Promocion | null>(null)
  const [promoError, setPromoError] = useState('')

  const update = (field: string, value: unknown) => setForm((prev) => ({ ...prev, [field]: value }))

  const handleValidarPromo = () => {
    const promo = validarCodigo(promoCode)
    if (promo) {
      setAppliedPromo(promo)
      setPromoError('')
      toast.success(`¡Código "${promo.codigo}" aplicado! ${promo.descuento}% de descuento`)
    } else {
      setAppliedPromo(null)
      setPromoError('Código no válido o vencido')
    }
  }

  const handleNext = (values: OrderData, setFieldTouched: (field: string, touched: boolean, shouldValidate?: boolean) => void) => {
    if (step === 1 && !values.typeOrder) { toast.error('Selecciona un tipo de pedido'); return }
    if (step === 2) {
      if (values.fullName.trim().length < 3) { toast.error('Completa tu nombre'); setFieldTouched('fullName', true); return }
      if (values.phone.replace(/\s/g, '').length < 7) { toast.error('Completa tu teléfono'); setFieldTouched('phone', true); return }
      if (values.typeOrder === 'delivery' && (!values.address || values.address.length < 5)) {
        toast.error('Ingresa tu dirección completa'); setFieldTouched('address', true); return
      }
    }
    if (step === 3 && !values.paymentMethod) { toast.error('Selecciona un método de pago'); return }
    setStep((s) => Math.min(s + 1, 4))
  }

  const handleConfirm = (values: OrderData) => {
    if (values.typeOrder === 'delivery' && !values.address) {
      toast.error('Completa la dirección de entrega')
      return
    }
    onSubmit({ ...values, appliedPromo })
  }

  const typeLabel = form.typeOrder === 'eatHere' ? 'Comer aquí'
    : form.typeOrder === 'delivery' ? 'A domicilio'
    : form.typeOrder === 'pickup' ? 'Recoger' : ''

  return (
    <Formik
      initialValues={form}
      enableReinitialize
      validationSchema={step <= 3 ? validationSchemas[step - 1] : validationSchemas[3]}
      onSubmit={() => {}}
    >
      {({ values, setFieldTouched }) => (
        <Form className="bg-white rounded-3xl shadow-card border border-cream-200 p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-display font-bold text-espresso-800">Nuevo pedido</h2>
            <span className="text-sm text-steel bg-cream-100 px-3 py-1 rounded-full">Paso {step} de 4</span>
          </div>

          <div className="flex gap-1.5 mb-10">
            {steps.map((label, i) => (
              <div key={label} className="flex-1">
                <div className={clsx(
                  'h-2 rounded-full transition-all duration-500',
                  i + 1 < step ? 'bg-sage-500' : i + 1 === step ? 'bg-olive-500' : 'bg-cream-200'
                )} />
                <span className={clsx(
                  'text-xs font-medium mt-2 block',
                  i + 1 <= step ? 'text-espresso-700' : 'text-steel/50'
                )}>{label}</span>
              </div>
            ))}
          </div>

          {step === 1 && (
            <div className="space-y-6">
              <p className="font-semibold text-espresso-800">¿Cómo quieres tu pedido?</p>
              <div className="grid sm:grid-cols-3 gap-4">
                {typeOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => { update('typeOrder', opt.value); setFieldTouched('typeOrder', true) }}
                    className={clsx(
                      'p-6 rounded-2xl border-2 text-center transition-all duration-300 hover:shadow-lift group',
                      values.typeOrder === opt.value
                        ? 'border-olive-500 bg-olive-50 shadow-lg shadow-olive-500/10'
                        : 'border-cream-200 hover:border-olive-300 bg-white'
                    )}
                  >
                    <div className={clsx(
                      'w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 transition-all',
                      values.typeOrder === opt.value
                        ? 'bg-olive-500 text-white'
                        : 'bg-cream-100 text-steel group-hover:bg-olive-100 group-hover:text-olive-500'
                    )}>
                      <opt.icon size={22} />
                    </div>
                    <p className={clsx('font-bold', values.typeOrder === opt.value ? 'text-olive-700' : 'text-espresso-800')}>{opt.label}</p>
                    <p className="text-xs text-steel mt-1">{opt.desc}</p>
                  </button>
                ))}
              </div>
              <ErrorMessage name="typeOrder" component="p" className="text-red-500 text-xs" />

              <div className="bg-cream-50 border border-cream-200 rounded-2xl p-4 flex items-center gap-3">
                <FaRegClock className="text-olive-500 shrink-0" size={18} />
                <div className="flex-1">
                  <label className="text-sm font-medium text-espresso-800">Programar pedido</label>
                  <p className="text-xs text-steel">¿Quieres pedir para después?</p>
                </div>
                <button
                  type="button"
                  onClick={() => update('scheduled', !values.scheduled)}
                  className={clsx(
                    'px-4 py-2 rounded-xl text-sm font-semibold transition-all',
                    values.scheduled ? 'bg-olive-500 text-white' : 'bg-cream-200 text-espresso-600'
                  )}
                >
                  {values.scheduled ? 'Sí' : 'No'}
                </button>
              </div>

              {values.scheduled && (
                <div>
                  <label className="text-sm font-medium text-espresso-800">¿Para qué hora?</label>
                  <Field as="select" name="scheduledTime" className="input-base mt-2">
                    <option value="">Selecciona una hora</option>
                    {Array.from({ length: 24 }, (_, i) => {
                      const h = i + 10
                      if (h > 21) return null
                      return (
                        <option key={h} value={`${h.toString().padStart(2, '0')}:00`}>{h.toString().padStart(2, '0')}:00</option>
                      )
                    })}
                  </Field>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <p className="font-semibold text-espresso-800 mb-4">Tus datos</p>
              <div>
                <label className="text-sm font-medium text-espresso-700">Nombre completo *</label>
                <Field name="fullName" placeholder="Ej: Juan Pérez" className="input-base mt-2" />
                <ErrorMessage name="fullName" component="p" className="text-red-500 text-xs mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium text-espresso-700">Celular *</label>
                <Field name="phone" placeholder="300 123 4567" className="input-base mt-2" />
                <ErrorMessage name="phone" component="p" className="text-red-500 text-xs mt-1" />
              </div>
              {values.typeOrder === 'eatHere' && (
                <div>
                  <label className="text-sm font-medium text-espresso-700">Mesa (opcional)</label>
                  <Field name="tableNumber" placeholder="Ej: Mesa 5" className="input-base mt-2" />
                </div>
              )}
              {values.typeOrder === 'delivery' && (
                <div>
                  <label className="text-sm font-medium text-espresso-700">Dirección completa *</label>
                  <Field name="address" placeholder="Cra 10 #20-30, Barrio, Ciudad" className="input-base mt-2" />
                  <ErrorMessage name="address" component="p" className="text-red-500 text-xs mt-1" />
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <p className="font-semibold text-espresso-800 mb-4">Método de pago</p>
              <div className="space-y-3">
                {CONFIG.metodosPago.map((mp) => (
                  <button
                    key={mp.id}
                    type="button"
                    onClick={() => { update('paymentMethod', mp.id); setFieldTouched('paymentMethod', true) }}
                    className={clsx(
                      'w-full p-4 rounded-2xl border-2 text-left transition-all duration-300 hover:shadow-lift',
                      values.paymentMethod === mp.id
                        ? 'border-olive-500 bg-olive-50'
                        : 'border-cream-200 hover:border-olive-300'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{mp.icono}</span>
                      <div className="flex-1">
                        <p className={clsx('font-bold', values.paymentMethod === mp.id ? 'text-olive-700' : 'text-espresso-800')}>{mp.nombre}</p>
                        <p className="text-sm text-steel">{mp.desc}</p>
                      </div>
                      {values.paymentMethod === mp.id && (
                        <div className="w-6 h-6 bg-olive-500 rounded-full flex items-center justify-center">
                          <FaCheck className="text-white" size={12} />
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
              <ErrorMessage name="paymentMethod" component="p" className="text-red-500 text-xs" />
              {values.paymentMethod && values.paymentMethod !== 'efectivo' && (
                <div className="bg-cream-50 border border-cream-200 rounded-2xl p-5">
                  <p className="font-semibold text-espresso-700 text-sm mb-1">Datos para transferencia:</p>
                  <p className="text-espresso-800 text-sm">
                    {CONFIG.metodosPago.find(m => m.id === values.paymentMethod)?.tipo}: {CONFIG.metodosPago.find(m => m.id === values.paymentMethod)?.numero}
                  </p>
                  <p className="text-xs text-steel mt-2">Envía el comprobante a nuestro WhatsApp</p>
                </div>
              )}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <div className="bg-sage-50 border border-sage-200 rounded-2xl p-6 text-center">
                <div className="w-14 h-14 bg-sage-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <FaCheck className="text-white" size={22} />
                </div>
                <p className="font-bold text-espresso-800 text-lg">¿Todo listo?</p>
                <p className="text-sm text-steel mt-1">Revisa tu pedido y confirma para enviarlo por WhatsApp</p>
              </div>

              <div className="bg-cream-50 rounded-2xl p-5 space-y-3 text-sm border border-cream-200">
                <div className="flex justify-between"><span className="text-steel">Tipo</span><span className="font-semibold text-espresso-800">{typeLabel}</span></div>
                <div className="flex justify-between"><span className="text-steel">Cliente</span><span className="font-semibold text-espresso-800">{values.fullName}</span></div>
                <div className="flex justify-between"><span className="text-steel">Teléfono</span><span className="font-semibold text-espresso-800">{values.phone}</span></div>
                {values.tableNumber && <div className="flex justify-between"><span className="text-steel">Mesa</span><span className="font-semibold text-espresso-800">{values.tableNumber}</span></div>}
                {values.address && <div className="flex justify-between"><span className="text-steel">Dirección</span><span className="font-semibold text-espresso-800">{values.address}</span></div>}
                <div className="flex justify-between"><span className="text-steel">Pago</span><span className="font-semibold text-espresso-800">{CONFIG.metodosPago.find(m => m.id === values.paymentMethod)?.nombre}</span></div>
                {values.scheduled && values.scheduledTime && (
                  <div className="flex justify-between"><span className="text-steel">Programado</span><span className="font-semibold text-espresso-800">{values.scheduledTime}</span></div>
                )}
              </div>

              <div className="bg-white border border-cream-200 rounded-2xl p-5">
                <p className="text-sm font-medium text-espresso-800 mb-3">¿Tienes un código de descuento?</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => { setPromoCode(e.target.value); if (!e.target.value) { setAppliedPromo(null); setPromoError('') } }}
                    placeholder="Ej: BIENVENIDO10"
                    className="input-base flex-1"
                  />
                  <button type="button" onClick={handleValidarPromo} className="bg-olive-500 hover:bg-olive-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all">
                    Aplicar
                  </button>
                </div>
                {appliedPromo && (
                  <p className="text-sage-600 text-sm mt-3 font-medium flex items-center gap-1">
                    <FaCheck size={12} /> Código "{appliedPromo.codigo}" — {appliedPromo.descuento}% de descuento
                  </p>
                )}
                {promoError && <p className="text-red-500 text-sm mt-2">{promoError}</p>}
              </div>
            </div>
          )}

          <div className="flex justify-between mt-8 pt-6 border-t border-cream-200">
            {step > 1 ? (
              <button type="button" onClick={() => setStep((s) => s - 1)} className="px-6 py-3 text-steel hover:text-espresso-800 font-medium transition-colors">
                Atrás
              </button>
            ) : <div />}
            {step < 4 ? (
              <button type="button" onClick={() => handleNext(values, setFieldTouched)} className="px-8 py-3.5 bg-olive-500 hover:bg-olive-600 text-white font-semibold rounded-xl transition-all shadow-lg shadow-olive-500/25">
                Siguiente
              </button>
            ) : (
              <button type="button" onClick={() => handleConfirm(values)} className="px-8 py-3.5 bg-olive-500 hover:bg-olive-600 text-white font-semibold rounded-xl transition-all shadow-lg shadow-olive-500/25 flex items-center gap-2">
                Confirmar pedido
              </button>
            )}
          </div>
        </Form>
      )}
    </Formik>
  )
}
