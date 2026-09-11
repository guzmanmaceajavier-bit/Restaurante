import { FaArrowUp, FaArrowDown, FaMinus } from 'react-icons/fa'

export function StatCard({ label, value, delta, deltaLabel, href }: {
  label: string; value: string | number; delta?: number; deltaLabel?: string; href?: string
}) {
  const trend = delta === undefined || delta === 0 ? 'flat' : delta > 0 ? 'up' : 'down'
  const Wrapper: any = href ? 'a' : 'div'
  const accent = label.toLowerCase().includes('ventas') || label.toLowerCase().includes('ingresos') ? 'border-l-[#667A22]' : label.toLowerCase().includes('pedidos') ? 'border-l-[#3B82F6]' : label.toLowerCase().includes('ticket') ? 'border-l-[#F59E0B]' : 'border-l-[#E5E7EB]'
  return (
    <Wrapper href={href} className={`bg-white border border-[#E5E7EB] border-l-2 ${accent} rounded-md px-4 py-3 flex flex-col gap-2 ${href ? 'hover:border-[#CBD5E1] hover:bg-[#F8FAFC] transition-colors' : ''}`}>
      <p className="text-[11px] font-medium tracking-wide uppercase text-[#64748B] leading-4">{label}</p>
      <div>
        <p className="text-[20px] font-bold tracking-tight text-[#0F172A] leading-6" data-numeric>{value}</p>
        {(delta !== undefined || deltaLabel) && (
          <p className="text-xs mt-1 flex items-center gap-1.5">
            {trend !== 'flat' && (
              <span className={`inline-flex items-center gap-1 text-[11px] font-medium ${trend==='up' ? 'text-[#065F46]' : 'text-[#991B1B]'}`}>
                {trend==='up' ? <FaArrowUp size={8}/> : <FaArrowDown size={8}/>}{Math.abs(delta || 0)}%
              </span>
            )}
            {trend==='flat' && <span className="inline-flex items-center gap-1 text-[#94A3B8]"><FaMinus size={8}/></span>}
            <span className="text-[#94A3B8] text-[11px]">{deltaLabel || 'vs. ayer'}</span>
          </p>
        )}
      </div>
    </Wrapper>
  )
}
