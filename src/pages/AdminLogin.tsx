import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CONFIG } from '../lib/config'
import { storage } from '../lib/storage'
import { toast } from 'sonner'
import { SEO } from '../lib/seo'

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
      <section className="min-h-screen flex flex-col items-center justify-center bg-orange-50">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-sm border border-orange-200">
        <h1 className="text-3xl font-bold text-center text-orange-700 mb-6">
          Ingreso de Administrador
        </h1>

        <form onSubmit={handleLogin} className="grid gap-4">
          <input
            type="text"
            placeholder="Usuario"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            className="border rounded-xl p-3 w-full focus:ring-2 focus:ring-orange-400 outline-none"
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={clave}
            onChange={(e) => setClave(e.target.value)}
            className="border rounded-xl p-3 w-full focus:ring-2 focus:ring-orange-400 outline-none"
            required
          />

          <button
            type="submit"
            className="bg-orange-600 text-white py-3 rounded-xl hover:bg-orange-700 transition-all font-semibold"
          >
            Ingresar
          </button>
        </form>
      </div>
    </section>
    </>
  )
}
