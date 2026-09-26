import { useState, useMemo, useEffect } from 'react'
import { toast } from 'sonner'
import { FaCashRegister, FaPlus, FaArrowUp, FaArrowDown, FaLock, FaUnlock } from 'react-icons/fa'
import { SEO } from '../../lib/seo'
import { storage } from '../../lib/storage'
import type { Order } from '../../features/orders/types'

interface Movimiento { id:string; tipo:'ingreso'|'egreso'; concepto:string; monto:number; metodo:string; fecha:string }

export default function AdminCaja() {
  const [tab, setTab] = useState<'caja'|'gastos'>('caja')
  const [movs, setMovs] = useState<Movimiento[]>(()=>{ try{ return JSON.parse(localStorage.getItem('caja_movs')||'[]')} catch{ return []}})
  const [gastos, setGastos] = useState<any[]>(()=>{ try{ return JSON.parse(localStorage.getItem('gastos')||'[]')} catch{ return []}})
  useEffect(()=>{ const id=setInterval(()=>{ try{ const g=JSON.parse(localStorage.getItem('gastos')||'[]'); setGastos(g)} catch{} }, 3000); return ()=> clearInterval(id)}, [])
  const [abierta, setAbierta] = useState(()=> localStorage.getItem('caja_abierta')==='true')
  const [apertura, setApertura] = useState(()=> Number(localStorage.getItem('caja_apertura')||0))
  const [montoApertura, setMontoApertura] = useState('50000')
  const [showMov, setShowMov] = useState(false)
  const [form, setForm] = useState<Omit<Movimiento,'id'>>({ tipo:'ingreso', concepto:'', monto:0, metodo:'Efectivo', fecha: new Date().toISOString().split('T')[0] })
  const ordenes = useMemo(()=> storage.getOrdenes<Order>(), [movs, abierta, gastos])
  const hoy = new Date().toISOString().split('T')[0]
  const ventasHoy = ordenes.filter(o=> o.createdAt?.startsWith(hoy)).reduce((s,o)=> s+(o.total||0),0)
  const ingresos = movs.filter(m=> m.tipo==='ingreso').reduce((s,m)=> s+m.monto,0) + ventasHoy
  const egresosMovs = movs.filter(m=> m.tipo==='egreso').reduce((s,m)=> s+m.monto,0)
  // Evitar doble conteo: gastos que ya tienen movimiento en caja no se cuentan de nuevo
  const egresosManuales = egresosMovs
  const gastosNoDuplicados = gastos.filter((g:any)=>{
    return !movs.some(m=> m.tipo==='egreso' && m.concepto===g.descripcion && m.monto===g.monto)
  }).reduce((s,g:any)=> s+(g.monto||0),0)
  const egresos = egresosManuales + gastosNoDuplicados
  const balance = apertura + ingresos - egresos
  const saveMovs = (d:Movimiento[])=>{ setMovs(d); localStorage.setItem('caja_movs', JSON.stringify(d))}
  const abrir = () => { const v=Number(montoApertura)||0; setAbierta(true); setApertura(v); localStorage.setItem('caja_abierta','true'); localStorage.setItem('caja_apertura', String(v)); toast.success(`Caja abierta con $${v.toLocaleString('es-CO')}`)}
  const cerrar = () => { setAbierta(false); localStorage.setItem('caja_abierta','false'); toast.success(`Caja cerrada — Balance $${balance.toLocaleString('es-CO')}`)}
  const agregar = () => {
    if(!form.concepto.trim()||!form.monto) { toast.error('Concepto y monto requeridos'); return }
    saveMovs([...movs, {id:'mov_'+Date.now(), ...form}])
    toast.success('Movimiento registrado'); setShowMov(false)
  }
  return (
    <div>
      <SEO title="Caja" />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div><h1 className="text-2xl font-display font-bold text-espresso-800">Caja</h1><p className="text-steel text-sm mt-1">Apertura / cierre · ingresos por pedidos + movimientos manuales</p></div>
        <div className="flex items-center gap-2">
          {!abierta ? (
            <div className="flex items-center gap-2">
              <input type="number" value={montoApertura} onChange={e=>setMontoApertura(e.target.value)} placeholder="Monto apertura" className="w-36 px-4 py-2.5 rounded-xl border border-cream-200 text-sm" />
              <button onClick={abrir} className="flex items-center gap-2 bg-olive-500 hover:bg-olive-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold"><FaUnlock size={12}/> Abrir caja</button>
            </div>
          ) : (
            <button onClick={cerrar} className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold"><FaLock size={12}/> Cerrar caja</button>
          )}
        </div>
      </div>
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border mb-6 ${abierta ? 'bg-sage-50 text-sage-700 border-sage-200' : 'bg-cream-100 text-steel border-cream-200'}`}>
        <span className={`w-2 h-2 rounded-full ${abierta ? 'bg-sage-500 animate-pulse' : 'bg-steel'}`} /> {abierta ? `Caja abierta — apertura $${apertura.toLocaleString('es-CO')}` : 'Caja cerrada'}
      </div>
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-cream-200 p-5"><p className="text-xs text-steel flex items-center gap-1"><FaArrowUp className="text-sage-500"/> Ingresos (hoy)</p><p className="text-2xl font-bold text-espresso-800 mt-1">${ingresos.toLocaleString('es-CO')}</p><p className="text-[11px] text-steel">Pedidos ${ventasHoy.toLocaleString('es-CO')} + manual ${(ingresos-ventasHoy).toLocaleString('es-CO')}</p></div>
        <div className="bg-white rounded-2xl border border-cream-200 p-5"><p className="text-xs text-steel flex items-center gap-1"><FaArrowDown className="text-red-500"/> Egresos</p><p className="text-2xl font-bold text-espresso-800 mt-1">${egresos.toLocaleString('es-CO')}</p></div>
        <div className={`rounded-2xl border p-5 ${balance>=0 ? 'bg-olive-50 border-olive-200' : 'bg-red-50 border-red-200'}`}><p className="text-xs text-steel flex items-center gap-1"><FaCashRegister/> Balance</p><p className="text-2xl font-bold text-espresso-800 mt-1">${balance.toLocaleString('es-CO')}</p></div>
      </div>
      <div className="flex gap-1.5 mb-4 border-b border-[#E5E7EB] pb-3">
        <button onClick={()=> setTab('caja')} className={`px-3 py-1.5 rounded-full text-xs font-medium border ${tab==='caja' ? 'bg-[#0F172A] text-white border-[#0F172A]' : 'bg-white text-[#475569] border-[#E5E7EB] hover:bg-[#F8FAFC]'}`}>Caja · Movimientos</button>
        <button onClick={()=> setTab('gastos')} className={`px-3 py-1.5 rounded-full text-xs font-medium border ${tab==='gastos' ? 'bg-[#0F172A] text-white border-[#0F172A]' : 'bg-white text-[#475569] border-[#E5E7EB] hover:bg-[#F8FAFC]'}`}>Gastos · {gastos.length}</button>
      </div>
      {tab==='caja' ? (
        <>
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-display font-bold text-espresso-800">Movimientos</h2>
            <button onClick={()=>setShowMov(true)} className="flex items-center gap-2 bg-white border border-cream-200 hover:bg-cream-50 px-4 py-2 rounded-xl text-sm font-medium"><FaPlus size={12}/> Movimiento</button>
          </div>
          <div className="bg-white rounded-2xl border border-cream-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="bg-cream-50 border-b border-cream-200"><th className="p-3 text-left text-xs font-semibold uppercase">Fecha</th><th className="p-3 text-left text-xs font-semibold uppercase">Concepto</th><th className="p-3 text-center text-xs font-semibold uppercase">Tipo</th><th className="p-3 text-right text-xs font-semibold uppercase">Monto</th><th className="p-3 text-left text-xs font-semibold uppercase">Método</th></tr></thead>
                <tbody>
                  {movs.length===0 && <tr><td colSpan={5} className="p-8 text-center text-sm text-steel">Sin movimientos manuales — las ventas se suman automáticamente</td></tr>}
                  {movs.map(m=> (
                    <tr key={m.id} className="border-t border-cream-100">
                      <td className="p-3 text-xs text-steel">{m.fecha}</td>
                      <td className="p-3 text-sm text-espresso-800">{m.concepto}</td>
                      <td className="p-3 text-center"><span className={`px-2 py-1 rounded-full text-[10px] font-semibold border ${m.tipo==='ingreso' ? 'bg-sage-50 text-sage-700 border-sage-200' : 'bg-red-50 text-red-700 border-red-200'}`}>{m.tipo}</span></td>
                      <td className={`p-3 text-right text-sm font-bold ${m.tipo==='ingreso' ? 'text-sage-600' : 'text-red-600'}`}>{m.tipo==='ingreso'?'+': '-'}${m.monto.toLocaleString('es-CO')}</td>
                      <td className="p-3 text-xs text-steel">{m.metodo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white rounded-2xl border border-cream-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="bg-cream-50 border-b border-cream-200"><th className="p-3 text-left text-xs font-semibold uppercase">Fecha</th><th className="p-3 text-left text-xs font-semibold uppercase">Categoría</th><th className="p-3 text-left text-xs font-semibold uppercase">Descripción</th><th className="p-3 text-right text-xs font-semibold uppercase">Monto</th></tr></thead>
              <tbody>
                {gastos.length===0 && <tr><td colSpan={4} className="p-8 text-center text-sm text-steel">Sin gastos — los egresos de caja aparecen aquí automáticamente</td></tr>}
                {gastos.slice(0,20).map((g:any)=> (
                  <tr key={g.id} className="border-t border-cream-100">
                    <td className="p-3 text-xs text-steel">{g.fecha}</td>
                    <td className="p-3 text-xs"><span className="px-2 py-1 rounded-full bg-[#F8FAFC] border border-[#E5E7EB] text-xs">{g.categoria}</span></td>
                    <td className="p-3 text-sm text-espresso-800">{g.descripcion}</td>
                    <td className="p-3 text-right text-sm font-bold text-[#DC2626]">${Number(g.monto).toLocaleString('es-CO')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-3 py-2 bg-[#FFFBEB] border-t border-[#FDE68A] text-xs text-[#92400E]">Gastos registrados como egresos de caja. Usa “Gastos” en el menú lateral para gestión completa (aún disponible).</div>
        </div>
      )}
      {showMov && (
        <div className="fixed inset-0 bg-espresso-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={()=>setShowMov(false)}>
          <div className="bg-white rounded-3xl w-full max-w-md shadow-xl" onClick={e=>e.stopPropagation()}>
            <div className="p-6 border-b border-cream-200 flex items-center justify-between"><h3 className="font-display font-bold text-espresso-800">Nuevo movimiento</h3><button onClick={()=>setShowMov(false)} className="p-2 hover:bg-cream-100 rounded-xl">✕</button></div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-semibold mb-1.5">Tipo</label><select value={form.tipo} onChange={e=>setForm({...form, tipo:e.target.value as any})} className="w-full px-4 py-2.5 rounded-xl border border-cream-200 text-sm"><option value="ingreso">Ingreso</option><option value="egreso">Egreso</option></select></div>
                <div><label className="block text-xs font-semibold mb-1.5">Método</label><select value={form.metodo} onChange={e=>setForm({...form, metodo:e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-cream-200 text-sm"><option>Efectivo</option><option>Nequi</option><option>Daviplata</option><option>Transferencia</option><option>Tarjeta</option></select></div>
              </div>
              <div><label className="block text-xs font-semibold mb-1.5">Concepto</label><input value={form.concepto} onChange={e=>setForm({...form, concepto:e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-cream-200 text-sm" /></div>
              <div><label className="block text-xs font-semibold mb-1.5">Monto</label><input type="number" value={form.monto} onChange={e=>setForm({...form, monto:Number(e.target.value)})} className="w-full px-4 py-2.5 rounded-xl border border-cream-200 text-sm" /></div>
              <div className="flex gap-3 pt-2"><button onClick={()=>setShowMov(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-cream-200 text-sm">Cancelar</button><button onClick={agregar} className="flex-1 px-4 py-2.5 rounded-xl bg-olive-500 hover:bg-olive-600 text-white text-sm font-semibold">Guardar</button></div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
