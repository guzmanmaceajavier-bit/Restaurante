import { useState } from 'react'
import { Link } from 'react-router-dom'
import { SEO } from '../lib/seo'
import { FaEnvelope, FaArrowLeft, FaCheckCircle, FaPaperPlane } from 'react-icons/fa'
import { toast } from 'sonner'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setSent(true)
    toast.success('Correo de recuperación enviado')
  }

  return (
    <>
      <SEO title="Recuperar contraseña" description="Recupera el acceso a tu cuenta de Sabor y Origen" />
      <section className="min-h-screen bg-cream-50 dark:bg-[#1a1f16] flex items-center justify-center py-12 px-6">
        <div className="w-full max-w-md">
          <Link to="/login" className="inline-flex items-center gap-2 text-steel hover:text-olive-600 text-sm mb-6 transition-colors">
            <FaArrowLeft size={12} /> Volver al login
          </Link>

          <div className="bg-white dark:bg-[#1e2518] rounded-3xl shadow-card border border-cream-200 dark:border-[#2d3523] p-8">
            {!sent ? (
              <>
                <div className="w-14 h-14 bg-olive-100 dark:bg-olive-900/30 rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <FaEnvelope size={22} className="text-olive-600" />
                </div>
                <h1 className="text-2xl font-display font-bold text-espresso-800 dark:text-cream-200 text-center mb-2">Recuperar contraseña</h1>
                <p className="text-sm text-steel dark:text-cream-400 text-center mb-8">Ingresa tu correo electrónico y te enviaremos las instrucciones para restablecer tu contraseña.</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-espresso-700 dark:text-cream-300 mb-1.5 block">Correo electrónico</label>
                    <div className="relative">
                      <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-steel/40" size={14} />
                      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                        placeholder="tu@email.com" className="input-base pl-11 text-sm" />
                    </div>
                  </div>
                  <button type="submit" className="btn-primary w-full text-sm flex items-center justify-center gap-2">
                    <FaPaperPlane size={14} /> Enviar instrucciones
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center py-4">
                <div className="w-14 h-14 bg-sage-100 dark:bg-sage-900/30 rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <FaCheckCircle size={22} className="text-sage-600" />
                </div>
                <h1 className="text-2xl font-display font-bold text-espresso-800 dark:text-cream-200 mb-2">Correo enviado</h1>
                <p className="text-sm text-steel dark:text-cream-400 mb-6">
                  Si existe una cuenta asociada a <strong>{email}</strong>, recibirás las instrucciones de recuperación en unos minutos.
                </p>
                <Link to="/login" className="btn-primary inline-flex items-center gap-2 text-sm">
                  Volver al login
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  )
}
