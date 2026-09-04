import { ReactNode } from 'react'
import { FaInbox } from 'react-icons/fa'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: { label: string; onClick: () => void }
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-cream-100 dark:bg-[#252e1e] flex items-center justify-center mb-4">
        {icon || <FaInbox size={24} className="text-steel/50" />}
      </div>
      <h3 className="text-lg font-display font-bold text-espresso-800 dark:text-cream-200 mb-1">{title}</h3>
      {description && <p className="text-sm text-steel dark:text-cream-400 max-w-sm">{description}</p>}
      {action && (
        <button onClick={action.onClick}
          className="mt-4 px-5 py-2.5 bg-olive-600 hover:bg-olive-700 text-white text-sm font-semibold rounded-xl transition-colors">
          {action.label}
        </button>
      )}
    </div>
  )
}
