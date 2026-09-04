import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CONFIG } from '../lib/config'
import { storage } from '../lib/storage'
import { toast } from 'sonner'
import { SEO } from '../lib/seo'
import { FaLock, FaUser } from 'react-icons/fa'

export default function AdminLogin() {
  const [usuario, setUsuario] = useState('')
  const [clave, setClave] = useState('')
  const navigate = useNavigate()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (usuario === CONFIG.admin.usuario && clave === CONFIG.admin.clave) {
      storage.setAdmin(true, CONFIG.admin.nombre)
      toast.success(`¡Bienvenido Admin ${CONFIG.admin.nombre}!`)
      navigate('/admin-dashboard')
    } else {
      toast.error('Usuario o contraseña incorrectos')
    }
  }

  return (
    <>
      <SEO title="Admin Login" />
      <section className="min-h-screen flex flex-col items-center justify-center bg-espresso-900">
        <div className="bg-white p-10 rounded-3xl shadow-xl w-full max-w-sm border border-cream-200">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-espresso-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FaLock className="text-olive-400" size={20} />
            </div>
            <h1 className="text-2xl font-display font-bold text-espresso-800">Admin Panel</h1>
            <p className="text-steel text-sm mt-1">Sabor y Origen</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-espresso-700 mb-1.5 block">Usuario</label>
              <div className="relative">
                <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-steel/40" size={14} />
                <input type="text" value={usuario} onChange={(e) => setUsuario(e.target.value)}
                  className="input-base pl-11" placeholder="admin" required />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-espresso-700 mb-1.5 block">Contraseña</label>
              <div className="relative">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-steel/40" size={14} />
                <input type="password" value={clave} onChange={(e) => setClave(e.target.value)}
                  className="input-base pl-11" placeholder="••••••" required />
              </div>
            </div>
            <button type="submit" className="w-full bg-espresso-800 hover:bg-espresso-900 text-white py-3.5 rounded-xl font-semibold transition-all shadow-lg shadow-espresso-800/20">
              Ingresar
            </button>
          </form>
        </div>
      </section>
    </>
  )
}
