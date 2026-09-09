import { useEffect } from 'react'
import { FaTimes } from 'react-icons/fa'

export function DetailDrawer({ open, onClose, title, subtitle, children, actions }: {
  open: boolean; onClose: () => void; title: string; subtitle?: string; children: React.ReactNode; actions?: React.ReactNode
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [open, onClose])
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-[#0F172A]/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative w-full max-w-[440px] bg-white h-full shadow-xl flex flex-col animate-drawer-in border-l border-[#E5E7EB]">
        <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-[#0F172A] leading-5 truncate">{title}</h3>
            {subtitle && <p className="text-xs text-[#64748B] mt-1 truncate">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="shrink-0 w-7 h-7 rounded-md hover:bg-[#F1F5F9] flex items-center justify-center text-[#64748B] transition-colors">
            <FaTimes size={12} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {children}
        </div>
        {actions && <div className="px-5 py-3 border-t border-[#E5E7EB] bg-[#F8FAFC] flex gap-2 justify-end">{actions}</div>}
      </div>
    </div>
  )
}

export function DrawerSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] font-medium tracking-wide uppercase text-[#64748B] mb-2">{title}</p>
      <div className="space-y-2">{children}</div>
    </div>
  )
}
export function DrawerField({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-3 py-2 border-b border-[#F1F5F9] last:border-0">
      <span className="text-xs text-[#64748B] shrink-0">{label}</span>
      <span className="text-sm text-[#0F172A] text-right truncate">{value}</span>
    </div>
  )
}
