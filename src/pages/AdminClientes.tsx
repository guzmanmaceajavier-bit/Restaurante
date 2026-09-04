import { useState, useEffect, useMemo } from 'react'
import { toast } from 'sonner'
import { FaPlus, FaEdit, FaTrash, FaSearch, FaUsers, FaEye, FaToggleOn, FaToggleOff } from 'react-icons/fa'
import EmptyState from '../components/core/EmptyState'
import ConfirmModal from '../components/core/ConfirmModal'
import { ExportButton } from '../components/admin/ExportButton'
import { Pagination } from '../components/admin/Pagination'
import { SEO } from '../lib/seo'
import { storage } from '../lib/storage'

const ITEMS_PER_PAGE = 10

interface ClientData {
  id: string
  nombre: string
  email: string
  telefono: string
  password?: string
  puntos: number
  nivel: 'bronce' | 'plata' | 'oro'
  activo: boolean
  historialPedidos: string[]
  historialReservas: string[]
  createdAt: string
  totalOrders?: number
  totalSpent?: number
  lastOrder?: string
}

export default function AdminClientes() {
  const [clientes, setClientes] = useState<ClientData[]>([])
  const [busqueda, setBusqueda] = useState('')
  const [page, setPage] = useState(1)
  const [filtroStatus, setFiltroStatus] = useState<'todos' | 'activos' | 'inactivos'>('todos')
  const [selected, setSelected] = useState<ClientData | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<ClientData | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<ClientData | null>(null)
  const [form, setForm] = useState({
    nombre: '',
    email: '',
    telefono: '',
    password: '',
    puntos: 0,
    nivel: 'bronce' as 'bronce' | 'plata' | 'oro',
    activo: true,
  })

  useEffect(() => {
    const stored: ClientData[] = JSON.parse(localStorage.getItem('clientes') || '[]')
    const ordenes: any[] = storage.getOrdenes<any>()
    const enriched = stored.map((c) => {
      const clientOrders = ordenes.filter(
        (o) => o.phone === c.telefono || o.email === c.email
      )
      return {
        ...c,
        totalOrders: clientOrders.length,
        totalSpent: clientOrders.reduce(
          (sum, o) => sum + (o.total || 0),
          0
        ),
        lastOrder:
          clientOrders.length > 0
            ? clientOrders.sort(
                (a, b) =>
                  new Date(b.createdAt || 0).getTime() -
                  new Date(a.createdAt || 0).getTime()
              )[0].createdAt
            : undefined,
        historialPedidos: clientOrders.map((o) => o.id || ''),
        historialReservas: [],
      }
    })
    setClientes(enriched)
  }, [])

  const filtrados = useMemo(() => {
    let result = clientes
    if (filtroStatus === 'activos') {
      result = result.filter((c) => c.activo)
    } else if (filtroStatus === 'inactivos') {
      result = result.filter((c) => !c.activo)
    }
    if (busqueda) {
      const b = busqueda.toLowerCase()
      result = result.filter(
        (c) =>
          c.nombre?.toLowerCase().includes(b) ||
          c.email?.toLowerCase().includes(b) ||
          c.telefono?.includes(b)
      )
    }
    return result
  }, [clientes, busqueda, filtroStatus])

  const totalPages = Math.ceil(filtrados.length / ITEMS_PER_PAGE)
  const pagina = filtrados.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  )

  const stats = useMemo(
    () => ({
      total: clientes.length,
      activos: clientes.filter((c) => c.activo).length,
      inactivos: clientes.filter((c) => !c.activo).length,
      bronce: clientes.filter((c) => c.nivel === 'bronce').length,
      plata: clientes.filter((c) => c.nivel === 'plata').length,
      oro: clientes.filter((c) => c.nivel === 'oro').length,
    }),
    [clientes]
  )

  const levelColors: Record<string, string> = {
    bronce: 'bg-orange-50 text-orange-700 border-orange-200',
    plata: 'bg-gray-50 text-gray-700 border-gray-200',
    oro: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  }

  const resetForm = () => {
    setForm({
      nombre: '',
      email: '',
      telefono: '',
      password: '',
      puntos: 0,
      nivel: 'bronce',
      activo: true,
    })
    setEditing(null)
    setShowForm(false)
  }

  const openNew = () => {
    resetForm()
    setShowForm(true)
  }

  const openEdit = (client: ClientData) => {
    setEditing(client)
    setForm({
      nombre: client.nombre,
      email: client.email,
      telefono: client.telefono,
      password: '',
      puntos: client.puntos,
      nivel: client.nivel,
      activo: client.activo,
    })
    setShowForm(true)
  }

  const validateForm = (): boolean => {
    if (!form.nombre.trim()) {
      toast.error('El nombre es requerido')
      return false
    }
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) {
      toast.error('Email inválido')
      return false
    }
    if (!form.telefono.trim()) {
      toast.error('El teléfono es requerido')
      return false
    }
    if (!editing && (!form.password || form.password.length < 6)) {
      toast.error('La contraseña debe tener al menos 6 caracteres')
      return false
    }
    if (editing && form.password && form.password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres')
      return false
    }
    return true
  }

  const save = () => {
    if (!validateForm()) return

    if (editing) {
      const updated = clientes.map((c) =>
        c.id === editing.id
          ? {
              ...c,
              nombre: form.nombre.trim(),
              email: form.email.trim(),
              telefono: form.telefono.trim(),
              ...(form.password ? { password: form.password } : {}),
              puntos: form.puntos,
              nivel: form.nivel,
              activo: form.activo,
            }
          : c
      )
      setClientes(updated)
      localStorage.setItem('clientes', JSON.stringify(updated))
      toast.success('Cliente actualizado')
    } else {
      const newClient: ClientData = {
        id: 'cli_' + Date.now(),
        nombre: form.nombre.trim(),
        email: form.email.trim(),
        telefono: form.telefono.trim(),
        password: form.password,
        puntos: form.puntos,
        nivel: form.nivel,
        activo: form.activo,
        historialPedidos: [],
        historialReservas: [],
        createdAt: new Date().toISOString(),
      }
      const updated = [...clientes, newClient]
      setClientes(updated)
      localStorage.setItem('clientes', JSON.stringify(updated))
      toast.success('Cliente creado')
    }
    resetForm()
  }

  const eliminar = (client: ClientData) => {
    const updated = clientes.filter((c) => c.id !== client.id)
    setClientes(updated)
    localStorage.setItem('clientes', JSON.stringify(updated))
    toast.success('Cliente eliminado')
    setConfirmDelete(null)
  }

  const toggleActivo = (client: ClientData) => {
    const updated = clientes.map((c) =>
      c.id === client.id ? { ...c, activo: !c.activo } : c
    )
    setClientes(updated)
    localStorage.setItem('clientes', JSON.stringify(updated))
    toast.success(`Cliente ${client.activo ? 'desactivado' : 'activado'}`)
  }

  const columns = [
    { key: 'nombre', label: 'Nombre' },
    { key: 'email', label: 'Email' },
    { key: 'telefono', label: 'Teléfono' },
    { key: 'totalOrders', label: 'Pedidos' },
    { key: 'totalSpent', label: 'Total gastado' },
    { key: 'nivel', label: 'Nivel' },
    { key: 'activo', label: 'Activo' },
    { key: 'createdAt', label: 'Registro' },
  ]

  return (
    <div className="min-h-screen bg-cream-50">
      <SEO title="Admin - Clientes" description="Gestión completa de clientes" />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-espresso-800">
            Clientes
          </h1>
          <p className="text-steel text-sm mt-1">
            {filtrados.length} cliente{filtrados.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <ExportButton
            data={filtrados}
            filename="clientes"
            columns={columns}
          />
          <div className="relative">
            <FaSearch
              className="absolute left-4 top-1/2 -translate-y-1/2 text-steel/40"
              size={14}
            />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => {
                setBusqueda(e.target.value)
                setPage(1)
              }}
              placeholder="Buscar..."
              className="input-base pl-11 text-sm w-64"
            />
          </div>
          <select
            value={filtroStatus}
            onChange={(e) => {
              setFiltroStatus(e.target.value as any)
              setPage(1)
            }}
            className="input-base text-sm"
          >
            <option value="todos">Todos</option>
            <option value="activos">Activos</option>
            <option value="inactivos">Inactivos</option>
          </select>
          <button
            onClick={openNew}
            className="flex items-center gap-2 bg-olive-500 hover:bg-olive-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm shadow-olive-500/20"
          >
            <FaPlus size={13} /> Nuevo cliente
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
        {[
          { label: 'Total', value: stats.total, color: 'bg-blue-500' },
          { label: 'Activos', value: stats.activos, color: 'bg-olive-500' },
          { label: 'Inactivos', value: stats.inactivos, color: 'bg-steel-400' },
          { label: 'Bronce', value: stats.bronce, color: 'bg-orange-500' },
          { label: 'Oro', value: stats.oro, color: 'bg-yellow-500' },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-2xl p-4 border border-cream-200 flex items-center gap-3"
          >
            <div
              className={`w-10 h-10 ${s.color} rounded-xl flex items-center justify-center`}
            >
              <FaUsers size={16} className="text-white" />
            </div>
            <div>
              <p className="text-xl font-display font-bold text-espresso-800">
                {s.value}
              </p>
              <p className="text-[10px] text-steel">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {pagina.length === 0 ? (
        <EmptyState
          icon={<FaUsers size={24} />}
          title="No hay clientes"
          description="Los clientes aparecerán cuando se registren"
          action={{ label: 'Nuevo cliente', onClick: openNew }}
        />
      ) : (
        <>
          <div className="bg-white rounded-2xl border border-cream-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-cream-50 border-b border-cream-200">
                    <th className="p-3 text-left text-xs font-semibold text-espresso-700 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="p-3 text-left text-xs font-semibold text-espresso-700 uppercase tracking-wider">
                      Contacto
                    </th>
                    <th className="p-3 text-center text-xs font-semibold text-espresso-700 uppercase tracking-wider">
                      Pedidos
                    </th>
                    <th className="p-3 text-right text-xs font-semibold text-espresso-700 uppercase tracking-wider">
                      Total gastado
                    </th>
                    <th className="p-3 text-center text-xs font-semibold text-espresso-700 uppercase tracking-wider">
                      Nivel
                    </th>
                    <th className="p-3 text-center text-xs font-semibold text-espresso-700 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="p-3 text-center text-xs font-semibold text-espresso-700 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pagina.map((c) => (
                    <tr
                      key={c.id}
                      className="border-t border-cream-100 hover:bg-cream-50/50 transition-colors"
                    >
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-olive-100 rounded-xl flex items-center justify-center text-sm font-bold text-olive-600">
                            {c.nombre?.charAt(0) || '?'}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-espresso-800">
                              {c.nombre}
                            </p>
                            <p className="text-[10px] text-steel">{c.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-xs text-steel">
                        {c.telefono || '—'}
                      </td>
                      <td className="p-3 text-center">
                        <span className="w-8 h-8 bg-cream-100 rounded-lg flex items-center justify-center text-xs font-bold text-espresso-700 mx-auto">
                          {c.totalOrders || 0}
                        </span>
                      </td>
                      <td className="p-3 text-right text-sm font-semibold text-espresso-800">
                        ${(c.totalSpent || 0).toLocaleString('es-CO')}
                      </td>
                      <td className="p-3 text-center">
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-semibold border ${levelColors[c.nivel]}`}
                        >
                          {c.nivel.charAt(0).toUpperCase() + c.nivel.slice(1)}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-semibold border ${
                            c.activo
                              ? 'bg-green-50 text-green-700 border-green-200'
                              : 'bg-red-50 text-red-700 border-red-200'
                          }`}
                        >
                          {c.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setSelected(c)}
                            className="p-1.5 rounded-lg hover:bg-cream-100 transition-all"
                            title="Ver detalle"
                          >
                            <FaEye size={13} className="text-steel" />
                          </button>
                          <button
                            onClick={() => openEdit(c)}
                            className="p-1.5 rounded-lg hover:bg-cream-100 transition-all"
                            title="Editar"
                          >
                            <FaEdit size={13} className="text-steel" />
                          </button>
                          <button
                            onClick={() => toggleActivo(c)}
                            className="p-1.5 rounded-lg hover:bg-cream-100 transition-all"
                            title={c.activo ? 'Desactivar' : 'Activar'}
                          >
                            {c.activo ? (
                              <FaToggleOn size={13} className="text-olive-500" />
                            ) : (
                              <FaToggleOff size={13} className="text-steel" />
                            )}
                          </button>
                          <button
                            onClick={() => setConfirmDelete(c)}
                            className="p-1.5 rounded-lg hover:bg-cream-100 transition-all"
                            title="Eliminar"
                          >
                            <FaTrash size={13} className="text-red-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </>
      )}

      {selected && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-md shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-cream-200 flex items-center justify-between">
              <h3 className="text-lg font-display font-bold text-espresso-800">
                Detalle del cliente
              </h3>
              <button
                onClick={() => setSelected(null)}
                className="p-2 hover:bg-cream-100 rounded-xl text-steel"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-olive-400 to-olive-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mx-auto mb-3">
                  {selected.nombre?.charAt(0)}
                </div>
                <h4 className="text-lg font-bold text-espresso-800">
                  {selected.nombre}
                </h4>
                <span
                  className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold border mt-2 ${levelColors[selected.nivel]}`}
                >
                  {selected.nivel.charAt(0).toUpperCase() + selected.nivel.slice(1)}
                </span>
                <span
                  className={`ml-2 inline-flex px-3 py-1 rounded-full text-xs font-semibold border ${
                    selected.activo
                      ? 'bg-green-50 text-green-700 border-green-200'
                      : 'bg-red-50 text-red-700 border-red-200'
                  }`}
                >
                  {selected.activo ? 'Activo' : 'Inactivo'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-cream-50 rounded-xl p-3">
                  <p className="text-[10px] text-steel">Email</p>
                  <p className="text-xs text-espresso-700 truncate">
                    {selected.email}
                  </p>
                </div>
                <div className="bg-cream-50 rounded-xl p-3">
                  <p className="text-[10px] text-steel">Teléfono</p>
                  <p className="text-xs text-espresso-700">
                    {selected.telefono || '—'}
                  </p>
                </div>
                <div className="bg-cream-50 rounded-xl p-3">
                  <p className="text-[10px] text-steel">Puntos</p>
                  <p className="text-lg font-bold text-espresso-800">
                    {selected.puntos}
                  </p>
                </div>
                <div className="bg-cream-50 rounded-xl p-3">
                  <p className="text-[10px] text-steel">Pedidos totales</p>
                  <p className="text-lg font-bold text-espresso-800">
                    {selected.totalOrders || 0}
                  </p>
                </div>
                <div className="bg-cream-50 rounded-xl p-3">
                  <p className="text-[10px] text-steel">Total gastado</p>
                  <p className="text-lg font-bold text-olive-600">
                    ${(selected.totalSpent || 0).toLocaleString('es-CO')}
                  </p>
                </div>
                <div className="bg-cream-50 rounded-xl p-3">
                  <p className="text-[10px] text-steel">Registro</p>
                  <p className="text-xs text-espresso-700">
                    {new Date(selected.createdAt).toLocaleDateString('es-CO')}
                  </p>
                </div>
              </div>
              {selected.lastOrder && (
                <p className="text-xs text-steel text-center">
                  Último pedido:{' '}
                  {new Date(selected.lastOrder).toLocaleDateString('es-CO')}
                </p>
              )}
              {selected.historialPedidos.length > 0 && (
                <div className="bg-cream-50 rounded-xl p-3">
                  <p className="text-[10px] text-steel mb-2">
                    Historial de pedidos
                  </p>
                  <div className="space-y-1">
                    {selected.historialPedidos.slice(0, 5).map((orderId, idx) => (
                      <p key={idx} className="text-xs text-espresso-700">
                        #{orderId}
                      </p>
                    ))}
                    {selected.historialPedidos.length > 5 && (
                      <p className="text-[10px] text-steel">
                        +{selected.historialPedidos.length - 5} más
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={resetForm}
        >
          <div
            className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-display font-bold text-espresso-800">
                {editing ? 'Editar cliente' : 'Nuevo cliente'}
              </h3>
              <button
                onClick={resetForm}
                className="p-2 hover:bg-cream-100 rounded-xl text-steel"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-espresso-700 mb-1.5">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={form.nombre}
                  onChange={(e) =>
                    setForm({ ...form, nombre: e.target.value })
                  }
                  placeholder="Nombre completo"
                  className="input-base text-sm"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-espresso-700 mb-1.5">
                  Email *
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm({ ...form, email: e.target.value })
                  }
                  placeholder="correo@ejemplo.com"
                  className="input-base text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-espresso-700 mb-1.5">
                  Teléfono *
                </label>
                <input
                  type="tel"
                  value={form.telefono}
                  onChange={(e) =>
                    setForm({ ...form, telefono: e.target.value })
                  }
                  placeholder="1234567890"
                  className="input-base text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-espresso-700 mb-1.5">
                  Contraseña{' '}
                  {editing ? '(dejar vacío para mantener)' : '*'}
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  placeholder="Mínimo 6 caracteres"
                  className="input-base text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-espresso-700 mb-1.5">
                    Puntos iniciales
                  </label>
                  <input
                    type="number"
                    value={form.puntos}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        puntos: parseInt(e.target.value) || 0,
                      })
                    }
                    min="0"
                    className="input-base text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-espresso-700 mb-1.5">
                    Nivel
                  </label>
                  <select
                    value={form.nivel}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        nivel: e.target.value as 'bronce' | 'plata' | 'oro',
                      })
                    }
                    className="input-base text-sm"
                  >
                    <option value="bronce">Bronce</option>
                    <option value="plata">Plata</option>
                    <option value="oro">Oro</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <label className="text-xs font-semibold text-espresso-700">
                  Activo
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setForm({ ...form, activo: !form.activo })
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    form.activo ? 'bg-olive-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      form.activo ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button
                  onClick={resetForm}
                  className="px-4 py-2.5 text-sm font-medium rounded-xl border border-cream-200 text-espresso-600 hover:bg-cream-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={save}
                  className="px-4 py-2.5 text-sm font-semibold rounded-xl bg-olive-500 hover:bg-olive-600 text-white transition-colors"
                >
                  {editing ? 'Guardar cambios' : 'Crear cliente'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => {
          if (confirmDelete) eliminar(confirmDelete)
        }}
        title="Eliminar cliente"
        message={`¿Estás seguro de que deseas eliminar a "${confirmDelete?.nombre}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        variant="danger"
      />
    </div>
  )
}