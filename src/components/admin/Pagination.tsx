import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'

interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null

  const pages: (number | '...')[] = []
  if (totalPages <= 5) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
  } else {
    pages.push(1)
    if (page > 3) pages.push('...')
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i)
    if (page < totalPages - 2) pages.push('...')
    pages.push(totalPages)
  }

  return (
    <div className="flex items-center justify-center gap-1.5 mt-6">
      <button onClick={() => onPageChange(page - 1)} disabled={page <= 1}
        className="w-9 h-9 rounded-xl flex items-center justify-center text-steel hover:bg-cream-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
        <FaChevronLeft size={12} />
      </button>
      {pages.map((p, i) => p === '...' ? (
        <span key={`dots-${i}`} className="w-9 h-9 flex items-center justify-center text-steel text-xs">...</span>
      ) : (
        <button key={p} onClick={() => onPageChange(p)}
          className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-medium transition-all ${
            page === p ? 'bg-olive-500 text-white shadow-sm shadow-olive-500/25' : 'text-espresso-600 hover:bg-cream-100'
          }`}>{p}</button>
      ))}
      <button onClick={() => onPageChange(page + 1)} disabled={page >= totalPages}
        className="w-9 h-9 rounded-xl flex items-center justify-center text-steel hover:bg-cream-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
        <FaChevronRight size={12} />
      </button>
    </div>
  )
}
