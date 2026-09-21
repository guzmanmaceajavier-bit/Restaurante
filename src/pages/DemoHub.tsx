import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { SEO } from '../lib/seo'
import { FaExternalLinkAlt, FaArrowRight, FaRocket, FaClipboardList, FaShoppingCart, FaCog, FaUtensils, FaUsers, FaUser, FaLock } from 'react-icons/fa'

const spring = { type: 'spring' as const, damping: 24, stiffness: 260, mass: 0.8 }

const interfaces = [
  {
    icon: '🌐', gradient: 'from-[#667A22] to-[#4A5A18]',
    title: 'Sitio web público', desc: 'Menú, carrito, checkout, reservas, contacto',
    path: '/', label: null, external: true,
  },
  {
    icon: '👤', gradient: 'from-[#1C2A0F] to-[#2A3D16]',
    title: 'Portal cliente', desc: 'Pedidos, reservas, favoritos, fidelidad, perfil',
    path: '/login', label: 'cliente@demo.com / Demo123', external: true,
    preIcon: FaUser, preLabel: 'Entrar como cliente demo',
  },
  {
    icon: '🔐', gradient: 'from-[#0F172A] to-[#1E293B]',
    title: 'Panel administrativo', desc: 'Dashboard, pedidos, cocina, mesas, inventario, caja',
    path: '/admin-login', label: 'admin / 12345', external: true,
    preIcon: FaLock, preLabel: 'Entrar como administrador demo',
  },
]

const steps = [
  { icon: FaUtensils, label: 'Explora el menú', desc: '25 platos colombianos con fotos y precios' },
  { icon: FaShoppingCart, label: 'Haz un pedido', desc: 'Agrega al carrito, elige domicilio o recoger' },
  { icon: FaCog, label: 'Entra al admin', desc: 'Gestiona pedidos, mesas, inventario y más' },
  { icon: FaClipboardList, label: 'Gestiona pedidos', desc: 'Cambia estados: recibido → preparando → listo' },
  { icon: FaUsers, label: 'Cocina y mesas', desc: 'Vista kanban de cocina y control de mesas' },
]

const techStack = [
  { name: 'React 18', color: 'bg-blue-500/20 text-blue-300' },
  { name: 'TypeScript', color: 'bg-blue-400/20 text-blue-200' },
  { name: 'Vite', color: 'bg-purple-500/20 text-purple-300' },
  { name: 'Tailwind', color: 'bg-cyan-500/20 text-cyan-300' },
  { name: 'Zustand', color: 'bg-amber-500/20 text-amber-300' },
  { name: 'Framer Motion', color: 'bg-pink-500/20 text-pink-300' },
]

export default function DemoHub() {
  const navigate = useNavigate()

  useEffect(() => {
    document.body.style.background = '#0a0f06'
    return () => { document.body.style.background = '' }
  }, [])

  return (
    <>
      <SEO title="Demo — Sabor y Origen" description="Explora la demo completa del sistema de gestión para restaurante" />
      <section className="min-h-screen relative overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-olive-500/[0.04] rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#667A22]/[0.03] rounded-full blur-[100px]" />
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-amber-500/[0.02] rounded-full blur-[80px]" />
        </div>

        <div className="relative z-10 flex flex-col items-center px-4 py-12 sm:py-20">
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.1 }}
            className="text-center mb-12 max-w-xl"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ ...spring, delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-olive-500/10 border border-olive-500/20 rounded-full px-5 py-2 mb-8"
            >
              <FaRocket className="text-olive-400" size={12} />
              <span className="text-olive-300 text-xs font-semibold tracking-widest uppercase">Demo interactiva</span>
            </motion.div>

            <h1 className="text-5xl sm:text-7xl font-display font-bold tracking-tight mb-4">
              <span className="bg-gradient-to-r from-white via-olive-100 to-olive-200 bg-clip-text text-transparent">Sabor y</span>{' '}
              <span className="bg-gradient-to-r from-olive-400 to-amber-400 bg-clip-text text-transparent">Origen</span>
            </h1>
            <p className="text-lg text-white/30 font-display mb-1">Sistema de gestión para restaurante</p>
            <p className="text-white/20 text-sm leading-relaxed max-w-md mx-auto">
              Explora las interfaces del sistema. Los datos de demostración se cargan automáticamente al entrar.
            </p>
          </motion.div>

          {/* Interface cards */}
          <motion.div
            className="grid gap-4 w-full max-w-lg mb-14"
            initial="hidden"
            animate="visible"
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.12 } } }}
          >
            {interfaces.map((item, i) => (
              <motion.div
                key={i}
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                transition={spring}
              >
                <motion.button
                  onClick={() => navigate(item.path)}
                  whileHover={{ y: -3, boxShadow: '0 12px 40px rgba(102,122,34,0.12)' }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full text-left bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.06] hover:border-olive-500/30 rounded-2xl p-5 transition-colors duration-200 group"
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-13 h-13 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center text-2xl flex-shrink-0 shadow-lg`}>
                      {item.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h2 className="text-white font-semibold text-base">{item.title}</h2>
                        <FaExternalLinkAlt className="text-olive-400/30 group-hover:text-olive-400 transition-colors" size={10} />
                      </div>
                      <p className="text-white/35 text-sm">{item.desc}</p>
                      {item.label && (
                        <p className="text-olive-300/40 text-xs mt-2 font-mono bg-white/[0.03] rounded-lg px-2.5 py-1 inline-block border border-white/[0.04]">
                          {item.label}
                        </p>
                      )}
                    </div>
                    <FaArrowRight className="text-white/15 group-hover:text-olive-400 group-hover:translate-x-1 transition-all mt-1 flex-shrink-0" size={14} />
                  </div>
                </motion.button>

                {/* Quick login button for client and admin */}
                {item.preIcon && (
                  <motion.button
                    onClick={() => navigate(item.path)}
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full mt-2 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      i === 1
                        ? 'bg-olive-600/20 hover:bg-olive-600/30 text-olive-300 border border-olive-500/20'
                        : 'bg-slate-600/20 hover:bg-slate-600/30 text-slate-300 border border-slate-500/20'
                    }`}
                  >
                    <item.preIcon size={13} />
                    {item.preLabel}
                  </motion.button>
                )}
              </motion.div>
            ))}
          </motion.div>

          {/* Recommended flow */}
          <motion.div
            className="w-full max-w-lg mb-14"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.6 }}
          >
            <h3 className="text-white/40 text-xs font-semibold tracking-[0.2em] uppercase mb-5 text-center">Flujo recomendado</h3>
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-[19px] top-4 bottom-4 w-px bg-gradient-to-b from-olive-500/20 via-olive-500/10 to-transparent" />

              <div className="space-y-1">
                {steps.map((s, i) => (
                  <motion.button
                    key={i}
                    onClick={() => navigate(i < 2 ? '/' : i < 4 ? '/admin-login' : '/admin-cocina')}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ ...spring, delay: 0.7 + i * 0.08 }}
                    whileHover={{ x: 4, backgroundColor: 'rgba(255,255,255,0.03)' }}
                    className="w-full flex items-center gap-3 rounded-xl px-3 py-3 text-left group"
                  >
                    <div className="relative z-10 w-10 h-10 rounded-xl bg-white/[0.04] group-hover:bg-olive-500/10 border border-white/[0.06] group-hover:border-olive-500/20 flex items-center justify-center flex-shrink-0 transition-colors">
                      <s.icon className="text-olive-400/50 group-hover:text-olive-400 transition-colors" size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white/60 group-hover:text-white text-sm font-medium transition-colors">{s.label}</p>
                      <p className="text-white/25 text-xs">{s.desc}</p>
                    </div>
                    <span className="text-olive-400/30 text-xs font-mono">{i + 1}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Stats bar */}
          <motion.div
            className="w-full max-w-lg mb-14"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
          >
            <div className="grid grid-cols-4 gap-3">
              {[
                { num: '20+', label: 'Módulos admin' },
                { num: '42', label: 'Rutas' },
                { num: '25', label: 'Platos' },
                { num: '0', label: 'Backends' },
              ].map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...spring, delay: 1.2 + i * 0.05 }}
                  className="text-center bg-white/[0.02] border border-white/[0.04] rounded-xl py-3"
                >
                  <p className="text-olive-400 text-lg font-bold font-mono">{s.num}</p>
                  <p className="text-white/25 text-[10px] uppercase tracking-wider mt-0.5">{s.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Tech stack */}
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4 }}
          >
            <p className="text-white/15 text-[10px] uppercase tracking-[0.2em] mb-3">Stack tecnológico</p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {techStack.map((t, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ ...spring, delay: 1.5 + i * 0.04 }}
                  className={`${t.color} text-[11px] font-medium px-3 py-1 rounded-full border border-white/[0.04]`}
                >
                  {t.name}
                </motion.span>
              ))}
            </div>
          </motion.div>

          {/* Footer note */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.7 }}
            className="text-white/10 text-xs"
          >
            Frontend SPA · Sin backend · Datos en localStorage
          </motion.p>
        </div>
      </section>
    </>
  )
}
