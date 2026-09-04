import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import { FaBox, FaSearch, FaExclamationTriangle, FaCheckCircle, FaTimesCircle, FaEdit } from 'react-icons/fa'
import EmptyState from '../components/core/EmptyState'
import { Pagination } from '../components/admin/Pagination'
import { ExportButton } from '../components/admin/ExportButton'
import { SEO } from '../lib/seo'
import { dataService } from '../lib/dataService'
import type { IProduct } from '../types/product'

const ITEMS_PER_PAGE = 10

type StockStatus = 'agotado' | 'bajo' | 'normal' | 'alto'

function getStockStatus(stock: number): StockStatus {
  if (stock <= 0) return 'agotado'
  if (stock <= 5) return 'bajo'
  if (stock <= 20) return 'normal'
  return 'alto'
}

const STATUS_CONFIG: Record<StockStatus, { label: string; color: string; icon: typeof FaTimesCircle }> = {
  agotado: { label: 'Agotado', color: 'bg-red-50 text-red-700 border-red-200', icon: FaTimesCircle },
  bajo: { label: 'Bajo', color: 'bg-gold-50 text-gold-700 border-gold-200', icon: FaExclamationTriangle },
  normal: { label: 'Normal', color: 'bg-sage-50 text-sage-700 border-sage-200', icon: FaCheckCircle },
  alto: { label: 'Alto', color: 'bg-blue-50 text-blue-700 border-blue-200', icon: FaCheckCircle },
}

export default function AdminInventario() {
  const [productos, setProductos] = useState<IProduct[]>(() => dataService.getProductos())
  const [busqueda, setBusqueda] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState('')
  const [page, setPage] = useState(1)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')

  const categorias = useMemo(() => {
    const cats = new Set(productos.map((p) => p.categoría).filter(Boolean))
    return Array.from(cats) as string[]
  }, [productos])

  const filtrados = useMemo(() => {
    return productos.filter((p) => {
      if (filtroCategoria && p.categoría !== filtroCategoria) return false
      if (busqueda) {
        const b = busqueda.toLowerCase()
        return p.nombre?.toLowerCase().includes(b)
      }
      return true
    })
  }, [productos, busqueda, filtroCategoria])

  const totalPages = Math.ceil(filtrados.length / ITEMS_PER_PAGE)
  const pagina = filtrados.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  const stats = useMemo(() => ({
    total: productos.length,
    agotados: productos.filter((p) => (p.stock || 0) <= 0).length,
    bajos: productos.filter((p) => (p.stock || 0) > 0 && (p.stock || 0) <= 5).length,
    normales: productos.filter((p) => (p.stock || 0) > 5 && (p.stock || 0) <= 20).length,
    altos: productos.filter((p) => (p.stock || 0) > 20).length,
  }), [productos])

  const saveStock = (productId: string, newStock: number) => {
    const updated = productos.map((p) =>
      p.id === productId ? { ...p, stock: Math.max(0, newStock) } : p
    ) as IProduct[]
    setProductos(updated)
    localStorage.setItem('productos', JSON.stringify(updated))
    toast.success('Stock actualizado')
  }

  const marcarTodosAgotados = () => {
    const updated = productos.map((p) => ({ ...p, stock: 0 })) as IProduct[]
    setProductos(updated)
    localStorage.setItem('productos', JSON.stringify(updated))
    toast.success('Todos los productos marcados como agotados')
  }

  const startEditing = (product: IProduct) => {
    setEditingId(product.id)
    setEditValue(String(product.stock || 0))
  }

  const finishEditing = (productId: string) => {
    const newStock = parseInt(editValue, 10)
    if (!isNaN(newStock) && newStock >= 0) {
      saveStock(productId, newStock)
    }
    setEditingId(null)
    setEditValue('')
  }

  const handleKeyDown = (e: React.KeyboardEvent, productId: string) => {
    if (e.key === 'Enter') {
      finishEditing(productId)
    } else if (e.key === 'Escape') {
      setEditingId(null)
      setEditValue('')
    }
  }

  return (
    <div className="min-h-screen bg-cream-50">
      <SEO title="Inventario" description="Gestión de inventario del restaurante" />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-espresso-800">Inventario</h1>
          <p className="text-steel text-sm mt-1">{filtrados.length} producto{filtrados.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={marcarTodosAgotados}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-white border border-cream-200 text-espresso-600 hover:bg-cream-50 transition-all"
          >
            <FaTimesCircle size={12} /> Marcar todos agotados
          </button>
          <ExportButton
            data={filtrados.map((p) => ({
              nombre: p.nombre,
              categoría: p.categoría,
              stock: p.stock || 0,
              estado: getStockStatus(p.stock || 0),
            }))}
            filename="inventario"
            columns={[
              { key: 'nombre', label: 'Producto' },
              { key: 'categoría', label: 'Categoría' },
              { key: 'stock', label: 'Stock' },
              { key: 'estado', label: 'Estado' },
            ]}
          />
          <div className="relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-steel/40" size={14} />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => { setBusqueda(e.target.value); setPage(1) }}
              placeholder="Buscar producto..."
              className="input-base pl-11 text-sm w-64"
            />
          </div>
          <select
            value={filtroCategoria}
            onChange={(e) => { setFiltroCategoria(e.target.value); setPage(1) }}
            className="input-base text-sm w-auto"
          >
            <option value="">Todas las categorías</option>
            {categorias.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total', value: stats.total, icon: FaBox, color: 'bg-olive-500' },
          { label: 'Agotados', value: stats.agotados, icon: FaTimesCircle, color: 'bg-red-500' },
          { label: 'Bajos', value: stats.bajos, icon: FaExclamationTriangle, color: 'bg-gold-500' },
          { label: 'Normales+', value: stats.normales + stats.altos, icon: FaCheckCircle, color: 'bg-sage-500' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-4 border border-cream-200 flex items-center gap-3">
            <div className={`w-10 h-10 ${s.color} rounded-xl flex items-center justify-center`}>
              <s.icon size={16} className="text-white" />
            </div>
            <div>
              <p className="text-xl font-display font-bold text-espresso-800">{s.value}</p>
              <p className="text-[10px] text-steel">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {pagina.length === 0 ? (
        <EmptyState
          icon={<FaBox size={24} />}
          title="No hay productos en inventario"
          description="Agrega productos desde la sección de Productos para gestionar su inventario"
        />
      ) : (
        <>
          <div className="bg-white rounded-2xl border border-cream-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-cream-50 border-b border-cream-200">
                    <th className="p-3 text-left text-xs font-semibold text-espresso-700 uppercase tracking-wider">Producto</th>
                    <th className="p-3 text-left text-xs font-semibold text-espresso-700 uppercase tracking-wider">Categoría</th>
                    <th className="p-3 text-center text-xs font-semibold text-espresso-700 uppercase tracking-wider">Stock</th>
                    <th className="p-3 text-center text-xs font-semibold text-espresso-700 uppercase tracking-wider">Estado</th>
                    <th className="p-3 text-center text-xs font-semibold text-espresso-700 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {pagina.map((p) => {
                    const stock = p.stock || 0
                    const status = getStockStatus(stock)
                    const config = STATUS_CONFIG[status]
                    const Icon = config.icon
                    const isEditing = editingId === p.id

                    return (
                      <tr key={p.id} className="border-t border-cream-100 hover:bg-cream-50/50 transition-colors">
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            {p.imagen ? (
                              <img src={p.imagen} alt={p.nombre} className="w-9 h-9 rounded-xl object-cover" />
                            ) : (
                              <div className="w-9 h-9 bg-cream-100 rounded-xl flex items-center justify-center">
                                <FaBox size={14} className="text-cream-400" />
                              </div>
                            )}
                            <p className="text-sm font-medium text-espresso-800 truncate max-w-[200px]">{p.nombre}</p>
                          </div>
                        </td>
                        <td className="p-3 text-xs text-steel">{p.categoría || '—'}</td>
                        <td className="p-3 text-center">
                          {isEditing ? (
                            <input
                              type="number"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onBlur={() => finishEditing(p.id)}
                              onKeyDown={(e) => handleKeyDown(e, p.id)}
                              className="w-20 text-center text-sm font-bold border border-olive-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-olive-500"
                              autoFocus
                              min={0}
                            />
                          ) : (
                            <button
                              onClick={() => startEditing(p)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold text-espresso-800 hover:bg-cream-100 transition-all cursor-pointer group"
                              title="Click para editar stock"
                            >
                              {stock}
                              <FaEdit size={11} className="text-steel/40 group-hover:text-olive-500 transition-colors" />
                            </button>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border ${config.color}`}>
                            <Icon size={10} /> {config.label}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => startEditing(p)}
                            className="p-1.5 rounded-lg hover:bg-cream-100 transition-all"
                            title="Actualizar stock"
                          >
                            <FaEdit size={13} className="text-steel" />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  )
}
