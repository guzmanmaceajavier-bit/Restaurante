import { useEffect, useState, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { storage } from '../lib/storage'
import { useClientStore } from '../store/useClientStore'
import { SEO } from '../lib/seo'
import { FaSearch, FaSignOutAlt } from 'react-icons/fa'
import clsx from 'clsx'

export default function AdminClientes() {
  const { clientes } = useClientStore()
  const [busqueda, setBusqueda] = useState('')
  const [filtroNivel, setFiltroNivel] = useState('')
  const [selected, setSelected] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (!storage.isAdmin()) { navigate('/admin-login'); return }
  }, [navigate])

  const clientesFiltrados = useMemo(() => {
    return clientes.filter((c) => {
      if (filtroNivel && c.nivel !== filtroNivel) return false
      if (busqueda.trim()) {
        const q = busqueda.toLowerCase()
        return c.nombre.toLowerCase().includes(q) || c.telefono.includes(q) || c.email?.toLowerCase().includes(q)
      }
      return true
    })
  }, [clientes, busqueda, filtroNivel])

  const clienteDetalle = clientes.find((c) => c.id === selected)

  return (
    <div className="min-h-screen bg-cream-50 p-6">
      <SEO title="Admin - Clientes" />
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-display font-bold text-espresso-800">Clientes</h1>
            <p className="text-steel text-sm mt-1">{clientes.length} clientes registrados</p>
          </div>
          <div className="flex gap-2">
            <Link to="/admin-dashboard" className="bg-white text-espresso-600 px-4 py-2 rounded-xl text-sm font-medium hover:bg-cream-100 transition-all border border-cream-200">Dashboard</Link>
            <button onClick={() => { storage.clearAdmin(); navigate('/admin-login') }} className="flex items-center gap-1.5 text-steel hover:text-red-500 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:bg-red-50">
              <FaSignOutAlt size={12} /> Salir
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-cream-200 p-4 mb-6 flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-steel/40" size={14} />
            <input type="text" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar por nombre, teléfono o email..." className="input-base pl-11 text-sm" />
          </div>
          <select value={filtroNivel} onChange={(e) => setFiltroNivel(e.target.value)} className="input-base text-sm w-auto">
            <option value="">Todos los niveles</option>
            <option value="bronce">Bronce</option>
            <option value="plata">Plata</option>
            <option value="oro">Oro</option>
          </select>
        </div>

        {clientesFiltrados.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-cream-200">
            <p className="text-3xl mb-3">👥</p>
            <p className="text-lg font-display font-bold text-espresso-800 mb-1">No hay clientes</p>
            <p className="text-sm text-steel">Los clientes aparecerán cuando realicen pedidos.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-cream-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-cream-50 text-left text-espresso-700 border-b border-cream-200">
                    <th className="p-3 font-semibold text-xs uppercase tracking-wider">Cliente</th>
                    <th className="p-3 font-semibold text-xs uppercase tracking-wider">Teléfono</th>
                    <th className="p-3 font-semibold text-xs uppercase tracking-wider">Nivel</th>
                    <th className="p-3 font-semibold text-xs uppercase tracking-wider">Puntos</th>
                    <th className="p-3 font-semibold text-xs uppercase tracking-wider">Pedidos</th>
                    <th className="p-3 font-semibold text-xs uppercase tracking-wider text-center">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {clientesFiltrados.map((c) => (
                    <tr key={c.id} className="border-t border-cream-100 hover:bg-cream-50/50 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-olive-400 to-olive-600 flex items-center justify-center text-white text-sm font-bold">
                            {c.nombre.charAt(0)}
                          </div>
                          <span className="font-medium text-espresso-800">{c.nombre}</span>
                        </div>
                      </td>
                      <td className="p-3 text-sm text-steel">{c.telefono}</td>
                      <td className="p-3">
                        <span className={clsx('px-3 py-1 rounded-full text-xs font-semibold capitalize border',
                          c.nivel === 'oro' ? 'bg-gold-50 border-gold-200 text-gold-700' :
                          c.nivel === 'plata' ? 'bg-cream-100 border-cream-200 text-steel' :
                          'bg-cream-100 border-cream-200 text-espresso-500'
                        )}>{c.nivel}</span>
                      </td>
                      <td className="p-3 text-sm font-bold text-olive-500">{c.puntos}</td>
                      <td className="p-3 text-sm text-espresso-700">{c.historialPedidos.length}</td>
                      <td className="p-3 text-center">
                        <button onClick={() => setSelected(c.id)} className="bg-espresso-800 hover:bg-espresso-900 text-white px-4 py-1.5 rounded-lg text-xs font-medium transition-all">Ver</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {clienteDetalle && (
          <div className="fixed inset-0 bg-espresso-900/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setSelected(null)}>
            <div className="bg-white p-8 rounded-3xl w-full max-w-lg shadow-xl mx-4" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-olive-400 to-olive-600 flex items-center justify-center text-white text-xl font-bold">
                  {clienteDetalle.nombre.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-display font-bold text-espresso-800">{clienteDetalle.nombre}</h3>
                  <p className="text-sm text-steel">{clienteDetalle.email || 'Sin email'}</p>
                </div>
              </div>
              <div className="bg-cream-50 rounded-2xl p-5 space-y-3 text-sm border border-cream-200">
                <div className="flex justify-between"><span className="text-steel">Teléfono</span><span className="font-semibold text-espresso-800">{clienteDetalle.telefono}</span></div>
                <div className="flex justify-between"><span className="text-steel">Nivel</span><span className={`font-bold capitalize ${clienteDetalle.nivel === 'oro' ? 'text-gold-500' : 'text-espresso-800'}`}>{clienteDetalle.nivel}</span></div>
                <div className="flex justify-between"><span className="text-steel">Puntos</span><span className="font-bold text-olive-500">{clienteDetalle.puntos}</span></div>
                <div className="flex justify-between"><span className="text-steel">Pedidos</span><span className="font-semibold text-espresso-800">{clienteDetalle.historialPedidos.length}</span></div>
                <div className="flex justify-between"><span className="text-steel">Registro</span><span className="font-semibold text-espresso-800">{new Date(clienteDetalle.createdAt).toLocaleDateString('es-CO')}</span></div>
              </div>
              <div className="flex justify-end mt-6">
                <button onClick={() => setSelected(null)} className="btn-secondary text-sm py-2.5">Cerrar</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
