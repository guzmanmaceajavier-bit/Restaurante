import { ReactNode } from 'react'

export function PageHeader({ title, kicker, description, actions, meta }: {
  title: string; kicker?: string; description?: string; actions?: ReactNode; meta?: ReactNode
}) {
  return (
    <div className="mb-5">
      {kicker && <p className="text-[11px] font-semibold tracking-widest uppercase text-[#94A3B8] mb-1">{kicker}</p>}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-[18px] font-semibold tracking-tight text-[#0F172A] leading-6">{title}</h1>
          {description && <p className="text-[13px] text-[#64748B] mt-1 leading-5 max-w-[60ch]">{description}</p>}
          {meta && <div className="mt-2">{meta}</div>}
        </div>
        {actions && <div className="flex items-center gap-2 shrink-0 flex-wrap">{actions}</div>}
      </div>
    </div>
  )
}
