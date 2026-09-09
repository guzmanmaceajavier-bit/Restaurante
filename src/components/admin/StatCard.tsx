import { FaArrowUp, FaArrowDown, FaMinus } from 'react-icons/fa'

export function StatCard({ label, value, delta, deltaLabel, icon, href }: {
  label: string; value: string | number; delta?: number; deltaLabel?: string; icon?: React.ElementType; href?: string
}) {
  const trend = delta === undefined || delta === 0 ? 'flat' : delta > 0 ? 'up' : 'down'
  const Wrapper: any = href ? 'a' : 'div'
  return (
    <Wrapper href={href} className={`bg-white rounded-xl border border-[#E5E7EB] p-4 flex flex-col gap-3 ${href ? 'hover:border-[#CBD5E1] hover:shadow-card-hover transition-all' : ''}`}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-semibold tracking-widest uppercase text-[#64748B] leading-4">{label}</p>
        {icon && <span className="w-8 h-8 rounded-lg bg-[#F8FAFC] border border-[#E5E7EB] flex items-center justify-center text-[#64748B] shrink-0"><icon size={13} /></span>}
      </div>
      <div>
        <p className="text-[22px] font-semibold tracking-tight text-[#0F172A] leading-7" data-numeric>{value}</p>
        {(delta !== undefined || deltaLabel) && (
          <p className="text-xs mt-1.5 flex items-center gap-1.5">
            {trend !== 'flat' && (
              <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[11px] font-semibold border ${trend==='up' ? 'bg-[#ECFDF5] text-[#065F46] border-[#A7F3D0]' : 'bg-[#FEF2F2] text-[#991B1B] border-[#FECACA]'}`}>
                {trend==='up' ? <FaArrowUp size={8}/> : <FaArrowDown size={8}/>}{Math.abs(delta || 0)}%
              </span>
            )}
            {trend==='flat' && <span className="inline-flex items-center gap-1 text-[#94A3B8]"><FaMinus size={8}/></span>}
            <span className="text-[#94A3B8]">{deltaLabel || 'vs. ayer'}</span>
          </p>
        )}
      </div>
    </Wrapper>
  )
}
