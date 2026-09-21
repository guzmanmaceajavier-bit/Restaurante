import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { DEMO_CONFIG } from '../demo/demoConfig'
import { SEO } from '../lib/seo'
import { FaExternalLinkAlt, FaArrowRight, FaGithub, FaRocket } from 'react-icons/fa'

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
        <div className="text-center mb-12 max-w-lg">
          <div className="inline-flex items-center gap-2 bg-olive-500/10 border border-olive-500/20 rounded-full px-4 py-1.5 mb-6">
            <FaRocket className="text-olive-400" size={12} />
            <span className="text-olive-300 text-xs font-medium tracking-wide uppercase">Demo interactiva</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-display font-bold text-white mb-4 tracking-tight">
            Sabor y Origen
          </h1>
          <p className="text-olive-200/60 text-lg leading-relaxed">
            {DEMO_CONFIG.tagline}
          </p>
        </div>

        <div className="grid gap-4 w-full max-w-md">
          {DEMO_CONFIG.versions.map((v) => (
            <Link
              key={v.id}
              to={v.path}
              className="group relative bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] hover:border-olive-500/30 rounded-2xl p-5 transition-all duration-300 hover:shadow-lg hover:shadow-olive-500/5"
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${v.color} flex items-center justify-center text-2xl flex-shrink-0 shadow-md`}>
                  {v.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-white font-semibold text-base">{v.label}</h2>
                    <FaExternalLinkAlt className="text-olive-400/40 group-hover:text-olive-400 transition-colors" size={10} />
                  </div>
                  <p className="text-white/40 text-sm leading-relaxed">{v.description}</p>
                  {v.credentials && (
                    <p className="text-olive-300/50 text-xs mt-2 font-mono bg-white/[0.03] rounded-lg px-2.5 py-1 inline-block">
                      {v.credentials}
                    </p>
                  )}
                </div>
                <FaArrowRight className="text-white/20 group-hover:text-olive-400 group-hover:translate-x-1 transition-all mt-1 flex-shrink-0" size={14} />
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-10 text-center">
          <p className="text-white/20 text-xs mb-3">Frontend SPA con datos simulados</p>
          <div className="flex items-center justify-center gap-4 text-xs">
            <span className="text-white/30">React</span>
            <span className="text-white/10">·</span>
            <span className="text-white/30">TypeScript</span>
            <span className="text-white/10">·</span>
            <span className="text-white/30">Tailwind</span>
            <span className="text-white/10">·</span>
            <span className="text-white/30">Zustand</span>
          </div>
        </div>

        <button
          onClick={() => navigate(-1)}
          className="mt-8 text-white/30 hover:text-white/60 text-sm transition-colors"
        >
          ← Volver
        </button>
      </section>
    </>
  )
}
