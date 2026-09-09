import { useState, useRef, useEffect } from 'react'
import { FaEllipsisH } from 'react-icons/fa'

export type ActionItem = { label: string; icon?: React.ElementType; onClick: () => void; danger?: boolean; disabled?: boolean }

export function ActionMenu({ items }: { items: ActionItem[] }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const onDoc = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', onDoc); return () => document.removeEventListener('mousedown', onDoc)
  }, [])
  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(v=>!v)} className="w-8 h-8 rounded-lg hover:bg-[#F1F5F9] flex items-center justify-center text-[#64748B] transition-colors">
        <FaEllipsisH size={12} />
      </button>
      {open && (
        <div className="absolute right-0 top-9 w-56 bg-white rounded-xl border border-[#E5E7EB] shadow-lift py-1 z-20 overflow-hidden">
          {items.map((it, i) => (
            <button key={i} onClick={() => { setOpen(false); it.onClick() }} disabled={it.disabled}
              className={`w-full text-left px-3 py-2.5 text-sm flex items-center gap-2.5 hover:bg-[#F8FAFC] transition-colors ${it.danger ? 'text-[#DC2626] hover:bg-[#FEF2F2]' : 'text-[#334155]'} ${it.disabled ? 'opacity-40 pointer-events-none' : ''}`}>
              {it.icon && <it.icon size={13} className={it.danger ? 'text-[#DC2626]' : 'text-[#64748B]'} />}{it.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
