import { useState } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
import { toast } from 'sonner'
import { SEO } from '../lib/seo'
import { FaUser, FaEnvelope, FaPhone, FaLock, FaEye, FaEyeSlash, FaArrowRight, FaRocket } from 'react-icons/fa'

export default function ClientLogin() {
  const location = useLocation()
  const [isRegister, setIsRegister] = useState(location.pathname === '/registro')
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [telefono, setTelefono] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const { login, register } = useAuthStore()
  const navigate = useNavigate()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password.trim()) { toast.error('Completa todos los campos'); return }
    const result = login(email, password)
    if (result.ok) { toast.success('¡Bienvenido!'); navigate('/mi-cuenta') }
    else { toast.error(result.error) }
  }

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault()
    if (!nombre.trim() || !email.trim() || !telefono.trim() || !password.trim()) { toast.error('Completa todos los campos'); return }
    if (password.length < 6) { toast.error('La contraseña debe tener al menos 6 caracteres'); return }
    const result = register({ nombre, email, telefono, password })
    if (result.ok) { toast.success('¡Cuenta creada! Ya puedes hacer pedidos'); navigate('/mi-cuenta') }
    else { toast.error(result.error) }
  }

  const handleDemoLogin = () => {
    const result = login('cliente@demo.com', 'Demo123')
    if (result.ok) { toast.success('¡Bienvenido Laura! (Demo)'); navigate('/mi-cuenta') }
    else { toast.error('Error al entrar en modo demo') }
  }

  return (
    <section className="py-10 px-4 sm:px-6 min-h-screen bg-[#FFFBF5]">
      <SEO title={isRegister ? 'Crear cuenta' : 'Iniciar sesión'} />
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1C2A0F] to-[#667A22] flex items-center justify-center mx-auto mb-4 shadow-sm">
            <FaUser className="text-white" size={20} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-[#1C2A0F] tracking-tight mb-2">
            {isRegister ? 'Crear cuenta' : 'Bienvenido de vuelta'}
          </h1>
          <p className="text-sm text-[#64748B]">
            {isRegister ? 'Regístrate para acumular puntos y ver tus pedidos' : 'Accede a tu cuenta para ver tus pedidos y puntos'}
          </p>
        </div>

        <div className="bg-white rounded-[20px] border border-[#F1E9D8] shadow-sm p-6 sm:p-8">
          <form onSubmit={isRegister ? handleRegister : handleLogin} className="space-y-5">
            {isRegister && (
              <div>
                <label className="text-sm font-medium text-espresso-700 mb-1.5 block">Nombre completo</label>
                <div className="relative">
                  <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-steel/40" size={14} />
                  <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Tu nombre"
                    className="input-base pl-11" />
                </div>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-espresso-700 mb-1.5 block">Email</label>
              <div className="relative">
                <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-steel/40" size={14} />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@email.com"
                  className="input-base pl-11" />
              </div>
            </div>
            {isRegister && (
              <div>
                <label className="text-sm font-medium text-espresso-700 mb-1.5 block">Teléfono</label>
                <div className="relative">
                  <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-steel/40" size={14} />
                  <input type="tel" value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder="300 123 4567"
                    className="input-base pl-11" />
                </div>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-espresso-700 mb-1.5 block">Contraseña</label>
              <div className="relative">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-steel/40" size={14} />
                <input type={showPass ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••"
                  className="input-base pl-11 pr-11" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-steel/40 hover:text-olive-500 transition-colors">
                  {showPass ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                </button>
              </div>
              {!isRegister && (
                <Link to="/recuperar-contrasena" className="text-xs text-olive-500 hover:text-olive-600 mt-2 inline-block">¿Olvidaste tu contraseña?</Link>
              )}
            </div>
            <button type="submit" className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-full bg-[#1C2A0F] text-white text-sm font-medium hover:bg-[#2A3D16] transition-colors">
              {isRegister ? 'Crear cuenta' : 'Iniciar sesión'}
              <FaArrowRight size={12} />
            </button>
          </form>

          <div className="mt-6 text-center">
            <button onClick={() => setIsRegister(!isRegister)} className="text-[#667A22] hover:text-[#4A5A18] text-sm font-medium transition-colors">
              {isRegister ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
            </button>
          </div>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#F1E9D8]" /></div>
            <div className="relative flex justify-center text-xs"><span className="bg-white px-3 text-[#94A3B8]">o</span></div>
          </div>

          <button onClick={handleDemoLogin}
            className="w-full flex items-center justify-center gap-2 bg-[#667A22] hover:bg-[#4A5A18] text-white py-3 rounded-full font-medium text-sm transition-colors">
            <FaRocket size={14} />
            Entrar como cliente demo
          </button>
        </div>

        <Link to="/demo" className="mt-6 text-[#94A3B8] hover:text-[#64748B] text-xs transition-colors">
          ← Ver otras interfaces de demo
        </Link>
      </div>
    </section>
  )
}
