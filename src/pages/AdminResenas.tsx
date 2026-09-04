import { useEffect, useState, useMemo } from 'react'
import { storage } from '../lib/storage'
import { toast } from 'sonner'
import { FaSearch, FaStar, FaReply, FaTrash } from 'react-icons/fa'
import { Pagination } from '../components/admin/Pagination'
import { ExportButton } from '../components/admin/ExportButton'
import ConfirmModal from '../components/core/ConfirmModal'

const ITEMS_PER_PAGE = 8

interface Resena { id: number; nombre: string; estrellas: number; comentario: string; fecha: string; respuestaAdmin?: string; respondedAt?: string }

export default function AdminResenas() {
  const [resenas, setResenas] = useState<Resena[]>([])
  const [respondiendo, setRespondiendo] = useState<Resena | null>(null)
  const [respuesta, setRespuesta] = useState('')
  const [filtroEstrellas, setFiltroEstrellas] = useState(0)
  const [busqueda, setBusqueda] = useState('')
  const [page, setPage] = useState(1)
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null)

  useEffect(() => { setResenas(storage.getResenas()) }, [])

  const filtradas = useMemo(() => {
    return resenas.filter((r) => {
      if (filtroEstrellas > 0 && r.estrellas !== filtroEstrellas) return false
      if (busqueda) {
        const b = busqueda.toLowerCase()
        return r.nombre?.toLowerCase().includes(b) || r.comentario?.toLowerCase().includes(b)
      }
      return true
    }).sort((a, b) => new Date(b.fecha || 0).getTime() - new Date(a.fecha || 0).getTime())
  }, [resenas, filtroEstrellas, busqueda])

  const totalPages = Math.ceil(filtradas.length / ITEMS_PER_PAGE)
  const pagina = filtradas.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  const promedio = useMemo(() => {
    if (resenas.length === 0) return 0
    return (resenas.reduce((sum, r) => sum + r.estrellas, 0) / resenas.length).toFixed(1)
  }, [resenas])

  const distribution = useMemo(() => {
    const dist: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    resenas.forEach((r) => { if (dist[r.estrellas] !== undefined) dist[r.estrellas]++ })
    return dist
  }, [resenas])

  const responder = () => {
    if (!respondiendo || !respuesta.trim()) return
    const updated = resenas.map((r) => r.id === respondiendo.id ? { ...r, respuestaAdmin: respuesta.trim(), respondedAt: new Date().toISOString() } : r)
    setResenas(updated); storage.setResenas(updated); setRespondiendo(null); setRespuesta('')
    toast.success('Respuesta enviada')
  }

  const eliminar = (id: number) => {
    const updated = resenas.filter((r) => r.id !== id)
    setResenas(updated); storage.setResenas(updated); toast.success('Reseña eliminada')
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-espresso-800">Reseñas</h1>
          <p className="text-steel text-sm mt-1">{filtradas.length} reseña{filtradas.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-3">
          <ExportButton data={filtradas} filename="resenas" columns={[
            { key: 'nombre', label: 'Nombre' }, { key: 'estrellas', label: 'Estrellas' }, { key: 'comentario', label: 'Comentario' },
            { key: 'fecha', label: 'Fecha' }, { key: 'respuestaAdmin', label: 'Respuesta' }
          ]} />
          <div className="relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-steel/40" size={14} />
            <input type="text" value={busqueda} onChange={(e) => { setBusqueda(e.target.value); setPage(1) }} placeholder="Buscar..." className="input-base pl-11 text-sm w-64" />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white rounded-2xl border border-cream-200 p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="text-center">
            <p className="text-4xl font-display font-bold text-espresso-800">{promedio}</p>
            <div className="flex gap-0.5 justify-center my-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <FaStar key={i} size={14} className={i < Math.round(Number(promedio)) ? 'text-gold-400' : 'text-cream-300'} />
              ))}
            </div>
            <p className="text-xs text-steel">{resenas.length} reseñas</p>
          </div>
          <div className="flex-1 space-y-1.5 w-full">
            {[5, 4, 3, 2, 1].map((n) => (
              <button key={n} onClick={() => setFiltroEstrellas(filtroEstrellas === n ? 0 : n)}
                className={`flex items-center gap-2 w-full group ${filtroEstrellas === n ? 'opacity-100' : 'hover:opacity-80'}`}>
                <span className="text-xs text-steel w-3">{n}</span>
                <FaStar size={10} className="text-gold-400" />
                <div className="flex-1 bg-cream-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-gold-400 h-full rounded-full transition-all" style={{ width: `${resenas.length > 0 ? (distribution[n] / resenas.length) * 100 : 0}%` }} />
                </div>
                <span className="text-xs text-steel w-6 text-right">{distribution[n]}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {pagina.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 text-center border border-cream-200">
          <FaStar className="text-cream-300 mx-auto mb-3" size={40} />
          <p className="text-lg font-display font-bold text-espresso-800 mb-1">No hay reseñas</p>
          <p className="text-sm text-steel">Las reseñas aparecerán aquí cuando los clientes las dejen.</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {pagina.map((r) => (
              <div key={r.id} className="bg-white rounded-2xl border border-cream-200 p-5 hover:shadow-lift transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-olive-100 rounded-xl flex items-center justify-center text-sm font-bold text-olive-600">
                      {r.nombre?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-espresso-800">{r.nombre}</p>
                      <div className="flex items-center gap-2">
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <FaStar key={i} size={10} className={i < r.estrellas ? 'text-gold-400' : 'text-cream-300'} />
                          ))}
                        </div>
                        <span className="text-[10px] text-steel">{r.fecha}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {!r.respuestaAdmin && (
                      <button onClick={() => { setRespondiendo(r); setRespuesta('') }} className="p-1.5 rounded-lg hover:bg-cream-100 transition-all" title="Responder">
                        <FaReply size={12} className="text-olive-600" />
                      </button>
                    )}
                    <button onClick={() => setConfirmDelete(r.id)} className="p-1.5 rounded-lg hover:bg-red-50 transition-all" title="Eliminar">
                      <FaTrash size={12} className="text-red-400" />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-espresso-700 leading-relaxed">{r.comentario}</p>
                {r.respuestaAdmin && (
                  <div className="mt-3 bg-olive-50 border border-olive-200 rounded-xl p-3">
                    <p className="text-[10px] text-olive-600 font-semibold mb-1">Respuesta del admin</p>
                    <p className="text-xs text-olive-800">{r.respuestaAdmin}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}

      {respondiendo && (
        <div className="fixed inset-0 bg-espresso-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setRespondiendo(null)}>
          <div className="bg-white rounded-3xl w-full max-w-md shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-cream-200">
              <h3 className="text-lg font-display font-bold text-espresso-800">Responder a {respondiendo.nombre}</h3>
              <p className="text-xs text-steel mt-1">"{respondiendo.comentario.slice(0, 80)}..."</p>
            </div>
            <div className="p-6 space-y-4">
              <textarea value={respuesta} onChange={(e) => setRespuesta(e.target.value)} className="input-base resize-none" placeholder="Escribe tu respuesta..." rows={4} />
              <div className="flex justify-end gap-3">
                <button onClick={() => setRespondiendo(null)} className="btn-secondary text-sm py-2.5">Cancelar</button>
                <button onClick={responder} disabled={!respuesta.trim()} className="btn-primary text-sm py-2.5 disabled:opacity-50">Enviar respuesta</button>
              </div>
            </div>
          </div>
        </div>
      )}
      <ConfirmModal
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => { if (confirmDelete) eliminar(confirmDelete) }}
        title="Eliminar reseña"
        message="¿Estás seguro de que deseas eliminar esta reseña? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        variant="danger"
      />
    </div>
  )
}
