import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaSearch, FaBox, FaUsers, FaCalendarAlt, FaUtensils, FaFileInvoiceDollar, FaTruck } from 'react-icons/fa'
import { orderService } from '../../features/orders/order.service'
import { reservationService } from '../../features/reservations/reservation.service'
import { productService } from '../../features/products/product.service'
import { customerService } from '../../features/customers/customer.service'
import { purchaseService } from '../../features/inventory/purchase.service'

type Hit = { label: string; sublabel: string; icon: any; to: string; group: string }

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  useEffect(() => { if (open) setQ(''); const onEsc = (e: KeyboardEvent)=> { if(e.key==='Escape') onClose() }; window.addEventListener('keydown', onEsc); return ()=> window.removeEventListener('keydown', onEsc)}, [open, onClose])
  const hits: Hit[] = useMemo(() => {
    if (!q.trim()) return []
    const v = q.toLowerCase()
    const all: Hit[] = []
    const push = (arr: any[], group: string, icon:any, to: (x:any)=>string, getLabel:(x:any)=>string, getSub:(x:any)=>string) => {
      arr.forEach((x:any)=> { const label=getLabel(x); const sub=getSub(x); if(label.toLowerCase().includes(v) || sub.toLowerCase().includes(v)) all.push({label, sublabel:sub, icon, to: to(x), group})})
    }
    try {
      const prods = productService.getAll()
      push(prods.slice(0,50), 'Productos', FaUtensils, (_p:any)=> '/admin-productos', (p:any)=> p.nombre, (p:any)=> p.categoría||'')
      const ordenes = orderService.getAll(); push(ordenes.slice(0,50),'Pedidos',FaBox, (_o:any)=> '/admin-ordenes', (o:any)=> o.id||'', (o:any)=> o.fullName||o.phone||'')
      const reservas = reservationService.getAll(); push(reservas.slice(0,50),'Reservas',FaCalendarAlt,(_r:any)=> '/admin-reservas',(r:any)=> r.nombre, (r:any)=> `${r.fecha} ${r.hora}`)
      const clientes = customerService.getAll(); push(clientes.slice(0,50),'Clientes',FaUsers,(_c:any)=> '/admin-clientes',(c:any)=> c.nombre,(c:any)=> c.telefono||c.email||'')
      const provs = purchaseService.getSuppliers(); push(provs.slice(0,30),'Proveedores',FaTruck,(_p:any)=> '/admin-proveedores',(p:any)=> p.nombre,(p:any)=> p.categoria||'')
      const compras = purchaseService.getPurchases(); push(compras.slice(0,30),'Compras',FaFileInvoiceDollar,(_c:any)=> '/admin-compras',(c:any)=> c.proveedor,(c:any)=> c.productos||'')
    } catch {}
    return all.slice(0, 20)
  }, [q])
  const groups = useMemo(()=> {
    const m = new Map<string, Hit[]>()
    hits.forEach(h=> { if(!m.has(h.group)) m.set(h.group,[]); m.get(h.group)!.push(h) })
    return Array.from(m.entries())
  }, [hits])
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center pt-[18vh] p-4">
      <div className="absolute inset-0 bg-[#0F172A]/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-[640px] bg-white rounded-2xl border border-[#E5E7EB] shadow-2xl overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[#E5E7EB]">
          <FaSearch className="text-[#94A3B8]" size={14} />
          <input autoFocus value={q} onChange={e=>setQ(e.target.value)} placeholder="Buscar clientes, pedidos, productos, reservas..." className="flex-1 py-2 text-sm text-[#0F172A] placeholder:text-[#94A3B8] outline-none" />
          <span className="hidden sm:inline-flex text-[11px] font-medium px-1.5 py-1 rounded-md bg-[#F1F5F9] border border-[#E5E7EB] text-[#64748B]">ESC</span>
        </div>
        <div className="max-h-[50vh] overflow-y-auto p-2">
          {!q.trim() && <p className="text-sm text-[#94A3B8] p-4 text-center">Escribe para buscar · Atajo <span className="px-1.5 py-0.5 rounded bg-[#F1F5F9] border border-[#E5E7EB] text-xs">Ctrl+K</span></p>}
          {q.trim() && hits.length===0 && <p className="text-sm text-[#94A3B8] p-4 text-center">Sin resultados para “{q}”</p>}
          {groups.map(([group, items])=> (
            <div key={group} className="mb-3 last:mb-0">
              <p className="px-3 py-1.5 text-[11px] font-semibold tracking-widest uppercase text-[#94A3B8]">{group}</p>
              <div className="space-y-1">
                {items.map((h,i)=> (
                  <button key={group+i} onClick={()=>{ onClose(); navigate(h.to) }} className="w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#F8FAFC] border border-transparent hover:border-[#E5E7EB] transition-colors">
                    <span className="w-8 h-8 rounded-lg bg-[#F1F5F9] flex items-center justify-center text-[#64748B]"><h.icon size={13}/></span>
                    <span className="min-w-0 flex-1"><span className="block text-sm font-medium text-[#0F172A] truncate">{h.label}</span><span className="block text-xs text-[#64748B] truncate">{h.sublabel}</span></span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
