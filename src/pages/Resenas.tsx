import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { SEO } from '../lib/seo'
import { storage } from '../lib/storage'

interface Reseña {
  id: number
  nombre: string
  estrellas: number
  comentario: string
  fecha: string
}

const reseñasIniciales: Reseña[] = [
  { id: 1, nombre: 'Ana Gómez', estrellas: 5, comentario: 'Excelente comida y atención.', fecha: '2024-01-15' },
  { id: 2, nombre: 'Carlos Ruiz', estrellas: 4, comentario: 'Buen ambiente, volveré pronto.', fecha: '2024-02-20' },
]

export default function Reseñas() {
  const [reseñas, setReseñas] = useState<Reseña[]>(reseñasIniciales)
  const [nombre, setNombre] = useState('')
  const [estrellas, setEstrellas] = useState(5)
  const [comentario, setComentario] = useState('')
  const [estrellasHover, setEstrellasHover] = useState(0)

  useEffect(() => {
    const stored = storage.getResenas<Reseña>()
    if (stored.length) setReseñas(stored)
  }, [])

  useEffect(() => {
    storage.setResenas(reseñas)
  }, [reseñas])

  const promedio = reseñas.length ? (reseñas.reduce((acc, r) => acc + r.estrellas, 0) / reseñas.length).toFixed(1) : '0.0'

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!nombre.trim() || !comentario.trim()) {
      toast.error('Por favor completa todos los campos.')
      return
    }
    if (comentario.trim().length < 10) {
      toast.error('El comentario debe tener al menos 10 caracteres.')
      return
    }

    const nuevaReseña: Reseña = {
      id: Date.now(),
      nombre,
      estrellas,
      comentario,
      fecha: new Date().toISOString().split('T')[0],
    }

    setReseñas((prev) => [nuevaReseña, ...prev])
    setNombre('')
    setEstrellas(5)
    setComentario('')
    toast.success(`¡Gracias ${nombre}! Tu reseña fue enviada correctamente`)
  }

  return (
    <section className="pt-28 pb-20 px-6">
      <SEO title="Reseñas" description="Opiniones de nuestros clientes sobre Sabor y Origen" />
      <div className="max-w-content mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-serif font-bold text-ink mb-2">Reseñas de nuestros clientes</h1>
          <div className="flex items-center justify-center gap-3 mt-4">
            <span className="text-4xl font-bold text-brick-600">{promedio}</span>
            <div className="text-yellow-400 text-2xl">{'★'.repeat(Math.round(Number(promedio)))}{'☆'.repeat(5 - Math.round(Number(promedio)))}</div>
            <span className="text-steel text-sm">({reseñas.length} reseñas)</span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {reseñas.map((r) => (
            <div key={r.id} className="bg-white p-6 rounded-2xl shadow-card border border-smoke hover:shadow-lift transition-all duration-300 flex flex-col">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-brick-100 flex items-center justify-center text-brick-600 font-bold">{r.nombre.charAt(0)}</div>
                <div>
                  <p className="font-semibold text-ink">{r.nombre}</p>
                  <p className="text-xs text-steel">{r.fecha}</p>
                </div>
              </div>
              <div className="flex text-yellow-400 text-xl mb-2" aria-label={`${r.estrellas} de 5 estrellas`}>
                {'★'.repeat(r.estrellas)}{'☆'.repeat(5 - r.estrellas)}
              </div>
              <p className="text-steel italic leading-relaxed flex-grow">"{r.comentario}"</p>
            </div>
          ))}
        </div>

        <div className="max-w-2xl mx-auto bg-white border border-smoke p-8 rounded-3xl shadow-card">
          <h3 className="text-2xl font-serif font-bold text-center text-ink mb-6">¡Déjanos tu opinión!</h3>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex flex-col gap-2">
              <label htmlFor="nombre" className="font-medium text-ink">Tu nombre</label>
              <input id="nombre" type="text" placeholder="Ej. María López" value={nombre} onChange={(e) => setNombre(e.target.value)}
                className="border border-smoke rounded-xl p-3 focus:ring-2 focus:ring-brick-500/30 focus:border-brick-500 outline-none transition bg-white text-ink" />
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-medium text-ink">Calificación</label>
              <div className="flex gap-1 text-3xl cursor-pointer" role="radiogroup" aria-label="Calificación">
                {[1, 2, 3, 4, 5].map((estrella) => (
                  <button
                    key={estrella}
                    type="button"
                    onClick={() => setEstrellas(estrella)}
                    onMouseEnter={() => setEstrellasHover(estrella)}
                    onMouseLeave={() => setEstrellasHover(0)}
                    className={`transition-transform hover:scale-125 focus:outline-none focus:ring-2 focus:ring-brick-400 rounded ${estrella <= (estrellasHover || estrellas) ? 'text-yellow-400' : 'text-gray-300'}`}
                    aria-label={`${estrella} estrella${estrella > 1 ? 's' : ''}`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="comentario" className="font-medium text-ink">Tu comentario</label>
              <textarea id="comentario" placeholder="Cuéntanos tu experiencia..." value={comentario} onChange={(e) => setComentario(e.target.value)} rows={3}
                className="border border-smoke rounded-xl p-3 focus:ring-2 focus:ring-brick-500/30 focus:border-brick-500 outline-none resize-none transition bg-white text-ink" />
            </div>

            <button type="submit" className="w-full bg-brick-500 text-white font-semibold py-3 rounded-xl shadow-md hover:bg-brick-600 active:scale-95 transition-transform">
              Enviar reseña
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}
