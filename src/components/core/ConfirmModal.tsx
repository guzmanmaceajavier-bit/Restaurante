import { FaExclamationTriangle, FaTimes } from 'react-icons/fa'

interface ConfirmModalProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'info'
}

export default function ConfirmModal({
  open, onClose, onConfirm, title, message,
  confirmText = 'Confirmar', cancelText = 'Cancelar', variant = 'danger'
}: ConfirmModalProps) {
  if (!open) return null

  const colors = {
    danger: { bg: 'bg-red-500', hover: 'hover:bg-red-600', icon: 'text-red-500' },
    warning: { bg: 'bg-gold-500', hover: 'hover:bg-gold-600', icon: 'text-gold-500' },
    info: { bg: 'bg-olive-600', hover: 'hover:bg-olive-700', icon: 'text-olive-600' },
  }
  const c = colors[variant]

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-espresso-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-[#1e2518] rounded-2xl shadow-2xl w-full max-w-md p-6 animate-scale-in">
        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-cream-100 dark:hover:bg-[#252e1e] transition-colors">
          <FaTimes size={14} className="text-steel" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${variant === 'danger' ? 'bg-red-50 dark:bg-red-900/30' : variant === 'warning' ? 'bg-gold-50 dark:bg-gold-900/30' : 'bg-olive-50 dark:bg-olive-900/30'}`}>
            <FaExclamationTriangle size={18} className={c.icon} />
          </div>
          <h3 className="text-lg font-display font-bold text-espresso-800 dark:text-cream-200">{title}</h3>
        </div>

        <p className="text-sm text-steel dark:text-cream-400 mb-6 leading-relaxed">{message}</p>

        <div className="flex gap-3 justify-end">
          <button onClick={onClose}
            className="px-4 py-2.5 text-sm font-medium rounded-xl border border-cream-200 dark:border-[#3d4a2e] text-espresso-600 dark:text-cream-400 hover:bg-cream-50 dark:hover:bg-[#252e1e] transition-colors">
            {cancelText}
          </button>
          <button onClick={() => { onConfirm(); onClose(); }}
            className={`px-4 py-2.5 text-sm font-semibold rounded-xl text-white transition-colors ${c.bg} ${c.hover}`}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
