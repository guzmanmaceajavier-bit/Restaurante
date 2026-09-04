import { useState, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { SEO } from '../lib/seo'
import ConfirmModal from '../components/core/ConfirmModal'
import { FaDownload, FaUpload, FaDatabase, FaFileArchive, FaHistory, FaTrash, FaBox, FaCalendarAlt, FaStar, FaUsers, FaTags, FaClipboardList } from 'react-icons/fa'

interface Backup {
  id: string
  createdAt: string
  data: Record<string, any>
  size: number
}

const DATA_KEYS = [
  { key: 'productos', label: 'Productos', icon: FaBox, color: 'bg-blue-100 text-blue-600' },
  { key: 'categorias', label: 'Categorías', icon: FaTags, color: 'bg-purple-100 text-purple-600' },
  { key: 'reservas', label: 'Reservas', icon: FaCalendarAlt, color: 'bg-green-100 text-green-600' },
  { key: 'ordenes', label: 'Órdenes', icon: FaClipboardList, color: 'bg-orange-100 text-orange-600' },
  { key: 'resenas', label: 'Reseñas', icon: FaStar, color: 'bg-yellow-100 text-yellow-600' },
  { key: 'clientes', label: 'Clientes', icon: FaUsers, color: 'bg-cyan-100 text-cyan-600' },
  { key: 'promociones_admin', label: 'Promociones', icon: FaTags, color: 'bg-pink-100 text-pink-600' },
  { key: 'activity_log', label: 'Log de actividad', icon: FaHistory, color: 'bg-gray-100 text-gray-600' },
  { key: 'mesas', label: 'Mesas', icon: FaDatabase, color: 'bg-olive-100 text-olive-600' },
]

function getKeyCount(key: string): number {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return 0
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.length : typeof parsed === 'object' ? Object.keys(parsed).length : 0
  } catch {
    return 0
  }
}

function getKeyData(key: string): any {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function getBackupHistory(): Backup[] {
  try {
    return JSON.parse(localStorage.getItem('backup_history') || '[]')
  } catch {
    return []
  }
}

function saveBackupHistory(backups: Backup[]) {
  localStorage.setItem('backup_history', JSON.stringify(backups))
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('es-CO', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit'
  })
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

export default function AdminBackup() {
  const [dataStats, setDataStats] = useState<Record<string, number>>({})
  const [history, setHistory] = useState<Backup[]>([])
  const [previewData, setPreviewData] = useState<Record<string, any> | null>(null)
  const [previewStats, setPreviewStats] = useState<Record<string, number>>({})
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadDataStats()
    setHistory(getBackupHistory())
  }, [])

  const loadDataStats = () => {
    const stats: Record<string, number> = {}
    DATA_KEYS.forEach(({ key }) => {
      stats[key] = getKeyCount(key)
    })
    setDataStats(stats)
  }

  const totalItems = Object.values(dataStats).reduce((sum, n) => sum + n, 0)
  const lastBackup = history.length > 0 ? history[0] : null

  const handleCreateBackup = () => {
    const data: Record<string, any> = {}
    DATA_KEYS.forEach(({ key }) => {
      const d = getKeyData(key)
      if (d !== null) data[key] = d
    })

    const jsonStr = JSON.stringify(data, null, 2)
    const sizeBytes = new Blob([jsonStr]).size
    const now = new Date()
    const id = `backup_${now.getTime()}`

    const backup: Backup = {
      id,
      createdAt: now.toISOString(),
      data,
      size: sizeBytes
    }

    const filename = `backup_restaurante_${now.toISOString().split('T')[0]}.json`
    const blob = new Blob([jsonStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    const newHistory = [backup, ...history].slice(0, 20)
    setHistory(newHistory)
    saveBackupHistory(newHistory)
    toast.success(`Backup creado: ${formatSize(sizeBytes)}`)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith('.json')) {
      toast.error('Solo se permiten archivos JSON')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string
        const parsed = JSON.parse(content)

        if (typeof parsed !== 'object' || parsed === null) {
          toast.error('Formato de archivo inválido')
          return
        }

        const stats: Record<string, number> = {}
        DATA_KEYS.forEach(({ key }) => {
          if (parsed[key] !== undefined) {
            const val = parsed[key]
            stats[key] = Array.isArray(val) ? val.length : typeof val === 'object' ? Object.keys(val).length : 0
          }
        })

        setPreviewData(parsed)
        setPreviewStats(stats)
      } catch {
        toast.error('Error al leer el archivo JSON')
      }
    }
    reader.readAsText(file)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleRestoreClick = () => {
    if (!previewData) return
    setShowRestoreConfirm(true)
  }

  const handleConfirmRestore = () => {
    if (!previewData) return

    DATA_KEYS.forEach(({ key }) => {
      if (previewData[key] !== undefined) {
        localStorage.setItem(key, JSON.stringify(previewData[key]))
      }
    })

    const jsonStr = JSON.stringify(previewData)
    const sizeBytes = new Blob([jsonStr]).size
    const now = new Date()
    const backup: Backup = {
      id: `restore_${now.getTime()}`,
      createdAt: now.toISOString(),
      data: previewData,
      size: sizeBytes
    }

    const newHistory = [backup, ...history].slice(0, 20)
    setHistory(newHistory)
    saveBackupHistory(newHistory)

    setPreviewData(null)
    setPreviewStats({})
    loadDataStats()
    toast.success('Datos restaurados correctamente')
  }

  const handleDownloadPrevious = (backup: Backup) => {
    const jsonStr = JSON.stringify(backup.data, null, 2)
    const blob = new Blob([jsonStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    const date = new Date(backup.createdAt).toISOString().split('T')[0]
    a.download = `backup_restaurante_${date}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Descargando backup...')
  }

  const handleDeleteHistory = (id: string) => {
    const newHistory = history.filter(b => b.id !== id)
    setHistory(newHistory)
    saveBackupHistory(newHistory)
    toast.success('Backup eliminado del historial')
  }

  const previewTotal = Object.values(previewStats).reduce((sum, n) => sum + n, 0)

  return (
    <div>
      <SEO title="Backup y Restauración" description="Crear y restaurar copias de seguridad" />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-espresso-800">Backup y Restauración</h1>
          <p className="text-steel text-sm mt-1">Crea copias de seguridad o restaura datos anteriores</p>
        </div>
        <button onClick={handleCreateBackup}
          className="flex items-center gap-2 bg-olive-500 hover:bg-olive-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm shadow-olive-500/20">
          <FaDownload size={14} /> Crear backup
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-2xl border border-cream-200 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-olive-100 flex items-center justify-center">
              <FaDatabase size={18} className="text-olive-600" />
            </div>
            <div>
              <p className="text-xs text-steel">Total de registros</p>
              <p className="text-xl font-bold text-espresso-800">{totalItems}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-cream-200 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <FaFileArchive size={18} className="text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-steel">Backups guardados</p>
              <p className="text-xl font-bold text-espresso-800">{history.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-cream-200 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
              <FaHistory size={18} className="text-green-600" />
            </div>
            <div>
              <p className="text-xs text-steel">Último backup</p>
              <p className="text-sm font-bold text-espresso-800">
                {lastBackup ? formatDate(lastBackup.createdAt) : 'Ninguno'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-2xl border border-cream-200 p-5">
          <h3 className="font-display font-bold text-espresso-800 text-lg mb-4">Datos actuales</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {DATA_KEYS.map(({ key, label, icon: Icon, color }) => (
              <div key={key} className="flex items-center gap-3 p-3 rounded-xl bg-cream-50 border border-cream-100">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
                  <Icon size={14} />
                </div>
                <div>
                  <p className="text-xs text-steel">{label}</p>
                  <p className="text-sm font-bold text-espresso-800">{dataStats[key] || 0}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-cream-200 p-5">
          <h3 className="font-display font-bold text-espresso-800 text-lg mb-4">Restaurar backup</h3>
          <div className="border-2 border-dashed border-cream-300 rounded-xl p-6 text-center mb-4">
            <FaUpload size={24} className="mx-auto text-steel/40 mb-2" />
            <p className="text-sm text-steel mb-3">Selecciona un archivo JSON para restaurar</p>
            <input ref={fileInputRef} type="file" accept=".json" onChange={handleFileUpload}
              className="hidden" id="restore-file" />
            <label htmlFor="restore-file"
              className="inline-flex items-center gap-2 bg-olive-500 hover:bg-olive-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer">
              <FaUpload size={14} /> Seleccionar archivo
            </label>
          </div>

          {previewData && (
            <div className="space-y-3">
              <div className="bg-cream-50 rounded-xl p-4 border border-cream-200">
                <p className="text-xs text-steel mb-2">Vista previa del backup ({previewTotal} registros)</p>
                <div className="grid grid-cols-2 gap-2">
                  {DATA_KEYS.filter(({ key }) => previewStats[key] !== undefined).map(({ key, label }) => (
                    <div key={key} className="flex justify-between text-sm">
                      <span className="text-steel">{label}</span>
                      <span className="font-semibold text-espresso-800">{previewStats[key]}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={handleRestoreClick}
                  className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all">
                  <FaDownload size={14} /> Restaurar datos
                </button>
                <button onClick={() => { setPreviewData(null); setPreviewStats({}) }}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium border border-cream-200 text-steel hover:bg-cream-50 transition-colors">
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-cream-200 p-5">
        <h3 className="font-display font-bold text-espresso-800 text-lg mb-4">Historial de backups</h3>
        {history.length === 0 ? (
          <div className="text-center py-8">
            <FaFileArchive size={32} className="mx-auto text-steel/30 mb-3" />
            <p className="text-steel text-sm">No hay backups guardados aún</p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((backup) => (
              <div key={backup.id}
                className="flex items-center justify-between p-4 rounded-xl bg-cream-50 border border-cream-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-olive-100 flex items-center justify-center">
                    <FaFileArchive size={16} className="text-olive-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-espresso-800">
                      {formatDate(backup.createdAt)}
                    </p>
                    <p className="text-xs text-steel">{formatSize(backup.size)} · {Object.keys(backup.data).length} claves</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleDownloadPrevious(backup)}
                    className="p-2 rounded-lg hover:bg-cream-200 text-steel hover:text-olive-600 transition-colors"
                    title="Descargar">
                    <FaDownload size={14} />
                  </button>
                  <button onClick={() => handleDeleteHistory(backup.id)}
                    className="p-2 rounded-lg hover:bg-red-100 text-steel hover:text-red-500 transition-colors"
                    title="Eliminar">
                    <FaTrash size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmModal
        open={showRestoreConfirm}
        onClose={() => setShowRestoreConfirm(false)}
        onConfirm={handleConfirmRestore}
        title="Restaurar backup"
        message="Se sobrescribirán todos los datos actuales con los datos del backup. Esta acción no se puede deshacer. ¿Deseas continuar?"
        confirmText="Restaurar"
        cancelText="Cancelar"
        variant="danger"
      />
    </div>
  )
}
