import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { storage } from '../lib/storage'
import { useProductStore } from '../store/useProductStore'
import { ProductForm } from '../components/admin/ProductForm'
import { toast } from 'sonner'
import { SEO } from '../lib/seo'
import type { IProduct } from '../types/product'

export default function AdminProductos() {
  const { productos, loadProductos, addProducto, updateProducto, deleteProducto, getCategorias } = useProductStore()
  const [editando, setEditando] = useState<IProduct | null>(null)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [busqueda, setBusqueda] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    if (!storage.isAdmin()) { navigate('/admin-login'); return }
    loadProductos()
  }, [navigate, loadProductos])

  const categorias = getCategorias()
  const productosFiltrados = productos.filter((p) => {
    if (filtroCategoria && p.categoría !== filtroCategoria) return false
    if (busqueda.trim()) { const q = busqueda.toLowerCase(); return p.nombre.toLowerCase().includes(q) || p.descripcion.toLowerCase().includes(q) }
    return true
  })

  const handleCrear = (data: Omit<IProduct, 'id'>) => { addProducto(data); setMostrarForm(false); toast.success('Producto creado') }
  const handleEditar = (data: Omit<IProduct, 'id'>) => { if (!editando) return; updateProducto(editando.id, data); setEditando(null); toast.success('Producto actualizado') }
  const handleEliminar = (id: string, nombre: string) => { if (!confirm(`¿Eliminar "${nombre}"?`)) return; deleteProducto(id); toast.success('Producto eliminado') }

  return (
    <div className="min-h-screen bg-cream-50 p-6">
      <SEO title="Admin - Productos" />
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-display font-bold text-espresso-800">Productos</h1>
            <p className="text-steel text-sm mt-1">{productos.length} productos registrados</p>
          </div>
          <div className="flex gap-3">
            <Link to="/admin-dashboard" className="btn-secondary">Dashboard</Link>
            <button onClick={() => { setMostrarForm(true); setEditando(null) }} className="btn-primary">+ Nuevo producto</button>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-cream-200 p-4 mb-6 flex flex-col sm:flex-row gap-3">
          <input type="text" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar por nombre o descripción..." className="flex-1 input-base" />
          <select value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)} className="input-base">
            <option value="">Todas las categorías</option>
            {categorias.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {productosFiltrados.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-cream-200">
            <p className="text-xl mb-2 text-espresso-800 font-display font-bold">No hay productos</p>
            <p className="text-sm text-steel">Crea el primer producto con el botón de arriba.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {productosFiltrados.map((p) => (
              <div key={p.id} className="bg-white rounded-2xl border border-cream-200 overflow-hidden hover:shadow-lift transition-all">
                <div className="h-40 bg-cream-100 flex items-center justify-center overflow-hidden">
                  {p.imagen ? <img src={p.imagen} alt={p.nombre} className="w-full h-full object-cover" /> : <span className="text-4xl">🍽️</span>}
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-espresso-800 truncate">{p.nombre}</h3>
                      <p className="text-xs text-steel">{p.categoría}</p>
                    </div>
                    <span className="text-lg font-bold text-olive-500">${p.precio.toLocaleString('es-CO')}</span>
                  </div>
                  <p className="text-xs text-steel line-clamp-2 mb-3">{p.descripcion}</p>
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <span className="text-xs bg-cream-100 rounded-full px-2 py-0.5 text-steel">Stock: {p.stock}</span>
                    {p.descuento ? <span className="text-xs bg-sage-100 text-sage-700 rounded-full px-2 py-0.5 font-medium">-{p.descuento}%</span> : null}
                    {p.destacado ? <span className="text-xs bg-olive-100 text-olive-600 rounded-full px-2 py-0.5">Destacado</span> : null}
                    {p.nuevo ? <span className="text-xs bg-blue-100 text-blue-700 rounded-full px-2 py-0.5">Nuevo</span> : null}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setEditando(p); setMostrarForm(false) }} className="flex-1 btn-primary py-2 text-sm">Editar</button>
                    <button onClick={() => handleEliminar(p.id, p.nombre)} className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-xl text-sm font-medium transition-all">Eliminar</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {mostrarForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto" onClick={() => setMostrarForm(false)}>
            <div className="bg-white p-6 rounded-2xl w-full max-w-2xl shadow-xl mx-4 my-8" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-xl font-display font-bold text-espresso-800 mb-4">Nuevo producto</h3>
              <ProductForm categorias={categorias} onSubmit={handleCrear} onCancel={() => setMostrarForm(false)} />
            </div>
          </div>
        )}

        {editando && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto" onClick={() => setEditando(null)}>
            <div className="bg-white p-6 rounded-2xl w-full max-w-2xl shadow-xl mx-4 my-8" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-xl font-display font-bold text-espresso-800 mb-4">Editar: {editando.nombre}</h3>
              <ProductForm initialData={editando} categorias={categorias} onSubmit={handleEditar} onCancel={() => setEditando(null)} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
