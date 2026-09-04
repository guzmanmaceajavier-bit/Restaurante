import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { storage } from '../lib/storage'
import { toast } from 'sonner'
import { FaSearch, FaSignOutAlt, FaStar } from 'react-icons/fa'

interface IResena {
  id: number; nombre: string; estrellas: number; comentario: string; fecha: string; respuestaAdmin?: string; respondedAt?: string
}

export default function AdminResenas() {
  const [reseñas, setReseñas] = useState<IResena[]>([])
  const [busqueda, setBusqueda] = useState('')
  const [filtroEstrellas, setFiltroEstrellas] = useState(0)
  const [respondiendo, setRespondiendo] = useState<IResena | null>(null)
  const [respuesta, setRespuesta] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    setReseñas(storage.getResenas<IResena>())
  }, [])

  const filtradas = useMemo(() => {
    return reseñas.filter((r) => {
      if (filtroEstrellas && r.estrellas !== filtroEstrellas) return false
      if (busqueda.trim()) {
        const q = busqueda.toLowerCase()
        return r.nombre.toLowerCase().includes(q) || r.comentario.toLowerCase().includes(q)
      }
      return true
    })
  }, [reseñas, busqueda, filtroEstrellas])

  const eliminarResena = (id: number) => {
    if (!confirm('¿Eliminar esta reseña?')) return
    const updated = reseñas.filter((r) => r.id !== id)
    setReseñas(updated); storage.setResenas(updated); toast.success('Reseña eliminada')
  }

  const enviarRespuesta = () => {
    if (!respondiendo || !respuesta.trim()) return
    const updated = reseñas.map((r) => r.id === respondiendo.id ? { ...r, respuestaAdmin: respuesta.trim(), respondedAt: new Date().toISOString() } : r)
    setReseñas(updated); storage.setResenas(updated); setRespondiendo(null); setRespuesta(''); toast.success('Respuesta guardada')
  }

  const promedio = reseñas.length ? (reseñas.reduce((a, r) => a + r.estrellas, 0) / reseñas.length).toFixed(1) : '0.0'

  return (
    <div>
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-display font-bold text-espresso-800">Reseñas</h1>
            <p className="text-steel text-sm mt-1 flex items-center gap-2">{reseñas.length} reseñas — <span className="text-gold-500 font-semibold">{promedio}</span> <FaStar size={12} className="text-gold-400" /></p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => { storage.clearAdmin(); navigate('/admin-login') }} className="flex items-center gap-1.5 text-steel hover:text-red-500 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:bg-red-50">
              <FaSignOutAlt size={12} /> Salir
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-cream-200 p-4 mb-6 flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-steel/40" size={14} />
            <input type="text" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar por nombre o comentario..." className="input-base pl-11 text-sm" />
          </div>
          <select value={filtroEstrellas} onChange={(e) => setFiltroEstrellas(Number(e.target.value))} className="input-base text-sm w-auto">
            <option value={0}>Todas las estrellas</option>
            {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} estrella{n > 1 ? 's' : ''}</option>)}
          </select>
        </div>

        <div className="space-y-4">
          {filtradas.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-cream-200">
              <p className="text-3xl mb-3">⭐</p>
              <p className="text-lg font-display font-bold text-espresso-800 mb-1">No hay reseñas</p>
              <p className="text-sm text-steel">Las reseñas aparecerán aquí cuando los clientes las dejen.</p>
            </div>
          ) : filtradas.map((r) => (
            <div key={r.id} className="bg-white rounded-2xl border border-cream-200 p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-olive-400 to-olive-600 flex items-center justify-center text-white font-bold">
                    {r.nombre.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-espresso-800">{r.nombre}</p>
                    <p className="text-xs text-steel">{r.fecha}</p>
                  </div>
                </div>
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <FaStar key={i} size={14} className={i < r.estrellas ? 'text-gold-400' : 'text-cream-200'} />
                  ))}
                </div>
              </div>
              <p className="text-steel italic mb-3">"{r.comentario}"</p>
              {r.respuestaAdmin && (
                <div className="bg-cream-50 border border-cream-200 rounded-xl p-4 mb-3">
                  <p className="text-xs font-semibold text-espresso-700 mb-1">Respuesta del admin:</p>
                  <p className="text-sm text-espresso-800">{r.respuestaAdmin}</p>
                </div>
              )}
              <div className="flex gap-2">
                <button onClick={() => { setRespondiendo(r); setRespuesta(r.respuestaAdmin || '') }} className="bg-espresso-800 hover:bg-espresso-900 text-white px-4 py-1.5 rounded-lg text-xs font-medium transition-all">
                  {r.respuestaAdmin ? 'Editar respuesta' : 'Responder'}
                </button>
                <button onClick={() => eliminarResena(r.id)} className="bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded-lg text-xs font-medium transition-all">Eliminar</button>
              </div>
            </div>
          ))}
        </div>

        {respondiendo && (
          <div className="fixed inset-0 bg-espresso-900/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setRespondiendo(null)}>
            <div className="bg-white p-8 rounded-3xl w-full max-w-lg shadow-xl mx-4" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-xl font-display font-bold text-espresso-800 mb-5">Responder a {respondiendo.nombre}</h3>
              <textarea value={respuesta} onChange={(e) => setRespuesta(e.target.value)} rows={4} className="input-base resize-none" placeholder="Escribe tu respuesta..." />
              <div className="flex justify-end gap-3 mt-5">
                <button onClick={() => setRespondiendo(null)} className="btn-secondary text-sm py-2.5">Cancelar</button>
                <button onClick={enviarRespuesta} className="btn-primary text-sm py-2.5">Guardar</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
