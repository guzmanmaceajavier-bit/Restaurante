import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { SEO } from '../lib/seo'
import { FaExternalLinkAlt, FaArrowRight, FaRocket, FaClipboardList, FaShoppingCart, FaCog, FaUtensils, FaUsers } from 'react-icons/fa'

const steps = [
  { icon: FaUtensils, label: 'Explora el restaurante', desc: 'Navega el menú con 25 platos colombianos', path: '/' },
  { icon: FaShoppingCart, label: 'Haz un pedido', desc: 'Agrega al carrito, elige domicilio o recoger', path: '/menu' },
  { icon: FaCog, label: 'Entra al administrador', desc: 'Gestiona pedidos, mesas, inventario y más', path: '/admin-login' },
  { icon: FaClipboardList, label: 'Gestiona el pedido', desc: 'Cambia estados: recibido → preparando → listo', path: '/admin-ordenes' },
  { icon: FaUsers, label: 'Revisa cocina y mesas', desc: 'Vista kanban de cocina y control de mesas', path: '/admin-cocina' },
]

export default function DemoHub() {
  const navigate = useNavigate()

  useEffect(() => {
    document.body.style.background = '#0f1a0a'
    return () => { document.body.style.background = '' }
  }, [])

  return (
    <>
      <SEO title="Demo — Sabor y Origen" description="Explora la demo completa del sistema de gestión para restaurante Sabor y Origen" />
      <section className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
        <div className="text-center mb-10 max-w-lg">
          <div className="inline-flex items-center gap-2 bg-olive-500/10 border border-olive-500/20 rounded-full px-4 py-1.5 mb-6">
            <FaRocket className="text-olive-400" size={12} />
            <span className="text-olive-300 text-xs font-medium tracking-wide uppercase">Demo interactiva</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-display font-bold text-white mb-3 tracking-tight">
            Sabor y Origen
          </h1>
          <p className="text-xl text-olive-200/50 font-display mb-2">Sistema de gestión para restaurante</p>
          <p className="text-olive-200/40 text-sm leading-relaxed">
            Explora las diferentes interfaces del sistema. Los datos de demostración se cargan automáticamente.
          </p>
        </div>

        {/* Interfaces */}
        <div className="grid gap-3 w-full max-w-md mb-10">
          <Link to="/" className="group relative bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] hover:border-olive-500/30 rounded-2xl p-5 transition-all duration-300 hover:shadow-lg hover:shadow-olive-500/5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#667A22] to-[#4A5A18] flex items-center justify-center text-2xl flex-shrink-0 shadow-md">🌐</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-white font-semibold text-base">Sitio web público</h2>
                  <FaExternalLinkAlt className="text-olive-400/40 group-hover:text-olive-400 transition-colors" size={10} />
                </div>
                <p className="text-white/40 text-sm">Menú, carrito, checkout, reservas, contacto</p>
              </div>
              <FaArrowRight className="text-white/20 group-hover:text-olive-400 group-hover:translate-x-1 transition-all mt-1 flex-shrink-0" size={14} />
            </div>
          </Link>

          <Link to="/login" className="group relative bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] hover:border-olive-500/30 rounded-2xl p-5 transition-all duration-300 hover:shadow-lg hover:shadow-olive-500/5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1C2A0F] to-[#2A3D16] flex items-center justify-center text-2xl flex-shrink-0 shadow-md">👤</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-white font-semibold text-base">Portal cliente</h2>
                  <FaExternalLinkAlt className="text-olive-400/40 group-hover:text-olive-400 transition-colors" size={10} />
                </div>
                <p className="text-white/40 text-sm">Mis pedidos, mis reservas, favoritos, fidelidad, perfil</p>
                <p className="text-olive-300/50 text-xs mt-2 font-mono bg-white/[0.03] rounded-lg px-2.5 py-1 inline-block">cliente@demo.com / Demo123</p>
              </div>
              <FaArrowRight className="text-white/20 group-hover:text-olive-400 group-hover:translate-x-1 transition-all mt-1 flex-shrink-0" size={14} />
            </div>
          </Link>

          <Link to="/admin-login" className="group relative bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] hover:border-olive-500/30 rounded-2xl p-5 transition-all duration-300 hover:shadow-lg hover:shadow-olive-500/5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0F172A] to-[#1E293B] flex items-center justify-center text-2xl flex-shrink-0 shadow-md">🔐</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-white font-semibold text-base">Panel administrativo</h2>
                  <FaExternalLinkAlt className="text-olive-400/40 group-hover:text-olive-400 transition-colors" size={10} />
                </div>
                <p className="text-white/40 text-sm">Dashboard, pedidos, cocina, mesas, inventario, caja, clientes</p>
                <p className="text-olive-300/50 text-xs mt-2 font-mono bg-white/[0.03] rounded-lg px-2.5 py-1 inline-block">admin / 12345</p>
              </div>
              <FaArrowRight className="text-white/20 group-hover:text-olive-400 group-hover:translate-x-1 transition-all mt-1 flex-shrink-0" size={14} />
            </div>
          </Link>
        </div>

        {/* Flujo recomendado */}
        <div className="w-full max-w-md mb-10">
          <h3 className="text-white/60 text-xs font-semibold tracking-widest uppercase mb-4 text-center">Flujo recomendado</h3>
          <div className="space-y-2">
            {steps.map((s, i) => (
              <button key={i} onClick={() => navigate(s.path)}
                className="w-full flex items-center gap-3 bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.04] rounded-xl px-4 py-3 text-left transition-all group">
                <span className="text-olive-400/60 text-xs font-mono w-5">{i + 1}.</span>
                <div className="w-8 h-8 rounded-lg bg-white/[0.05] flex items-center justify-center flex-shrink-0">
                  <s.icon className="text-olive-400/60 group-hover:text-olive-400 transition-colors" size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white/70 group-hover:text-white text-sm font-medium transition-colors">{s.label}</p>
                  <p className="text-white/30 text-xs">{s.desc}</p>
                </div>
                <FaArrowRight className="text-white/10 group-hover:text-olive-400/60 group-hover:translate-x-1 transition-all flex-shrink-0" size={10} />
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-white/15 text-xs mb-3">Frontend SPA con datos simulados</p>
          <div className="flex items-center justify-center gap-3 text-xs">
            <span className="text-white/25">React</span>
            <span className="text-white/10">·</span>
            <span className="text-white/25">TypeScript</span>
            <span className="text-white/10">·</span>
            <span className="text-white/25">Tailwind</span>
            <span className="text-white/10">·</span>
            <span className="text-white/25">Zustand</span>
          </div>
        </div>

        <button onClick={() => navigate(-1)}
          className="mt-8 text-white/25 hover:text-white/50 text-sm transition-colors">
          ← Volver
        </button>
      </section>
    </>
  )
}
