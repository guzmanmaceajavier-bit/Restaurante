import { FaDownload } from 'react-icons/fa'

interface ExportButtonProps {
  data: any[]
  filename: string
  columns?: { key: string; label: string }[]
  className?: string
}

export function ExportButton({ data, filename, columns, className }: ExportButtonProps) {
  const exportCSV = () => {
    if (!data.length) return
    const cols = columns || Object.keys(data[0]).filter(k => typeof data[0][k] !== 'object').map(k => ({ key: k, label: k }))
    const header = cols.map(c => c.label).join(',')
    const rows = data.map(row => cols.map(c => {
      const val = row[c.key]
      return typeof val === 'string' && val.includes(',') ? `"${val}"` : val ?? ''
    }).join(','))
    const csv = [header, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = `${filename}.csv`
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url)
  }

  return (
    <button onClick={exportCSV} disabled={!data.length}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-white border border-cream-200 text-espresso-600 hover:bg-cream-50 transition-all disabled:opacity-40 disabled:cursor-not-allowed ${className || ''}`}>
      <FaDownload size={13} /> Descargar CSV
    </button>
  )
}
