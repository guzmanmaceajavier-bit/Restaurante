import { ReactNode } from 'react'

export function PageHeader({ title, description, actions, meta }: {
  title: string; description?: string; actions?: ReactNode; meta?: ReactNode
}) {
  return (
    <div className="flex flex-col gap-4 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-[22px] font-semibold tracking-tight text-[#0F172A] leading-7">{title}</h1>
          {description && <p className="text-sm text-[#64748B] mt-1.5 leading-5">{description}</p>}
          {meta && <div className="mt-3">{meta}</div>}
        </div>
        {actions && <div className="flex items-center gap-2 shrink-0 flex-wrap">{actions}</div>}
      </div>
    </div>
  )
}
