import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import { FaMoneyBillWave, FaPlus, FaSearch, FaTrash } from 'react-icons/fa'
import EmptyState from '../components/core/EmptyState'
import ConfirmModal from '../components/core/ConfirmModal'
import { SEO } from '../lib/seo'
import { Pagination } from '../components/admin/Pagination'
import { ExportButton } from '../components/admin/ExportButton'

interface Gasto { id:string; categoria:string; descripcion:string; monto:number; fecha:string; responsable:string }
const CATS = ['Servicios','Proveedores','Nómina','Transporte','Insumos','Mantenimiento','Marketing','Otros']
const ITEMS_PER_PAGE=10

export default function AdminGastos() {
  const [gastos, setGastos] = useState<Gasto[]>(()=>{ try{ return JSON.parse(localStorage.getItem('gastos')||'[]')} catch{ return []}})
  const [busqueda, setBusqueda] = useState('')
  const [filtroCat, setFiltroCat] = useState('')
  const [page, setPage]=useState(1)
  const [showForm, setShowForm]=useState(false)
  const [form, setForm]=useState<Omit<Gasto,'id'>>({ categoria:'Insumos', descripcion:'', monto:0, fecha: new Date().toISOString().split('T')[0], responsable:''})
  const [confirmDelete, setConfirmDelete]=useState<string|null>(null)
  const save=(d:Gasto[])=>{ setGastos(d); localStorage.setItem('gastos', JSON.stringify(d))}
  const filtrados=useMemo(()=> gastos.filter(g=> (!filtroCat||g.categoria===filtroCat) && (!busqueda|| g.descripcion.toLowerCase().includes(busqueda.toLowerCase()))), [gastos, filtroCat, busqueda])
  const totalPages=Math.ceil(filtrados.length/ITEMS_PER_PAGE)
  const pagina=filtrados.slice((page-1)*ITEMS_PER_PAGE, page*ITEMS_PER_PAGE)
  const total=filtrados.reduce((s,g)=> s+g.monto,0)
  const submit=()=>{
    if(!form.descripcion.trim()||!form.monto){ toast.error('Descripción y monto requeridos'); return }
    save([...gastos, {id:'gasto_'+Date.now(), ...form}]); toast.success('Gasto registrado'); setShowForm(false)
  }
  return (
    <div>
      <SEO title="Gastos" />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div><h1 className="text-2xl font-display font-bold text-espresso-800">Gastos</h1><p className="text-steel text-sm mt-1">Total filtrado: <span className="font-bold text-espresso-800">${total.toLocaleString('es-CO')}</span></p></div>
        <div className="flex items-center gap-2">
          <ExportButton data={filtrados} filename="gastos" columns={[{key:'categoria',label:'Categoría'},{key:'descripcion',label:'Descripción'},{key:'monto',label:'Monto'},{key:'fecha',label:'Fecha'}]} />
          <button onClick={()=>setShowForm(true)} className="flex items-center gap-2 bg-olive-500 hover:bg-olive-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm"><FaPlus size={12}/> Registrar gasto</button>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1"><FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-steel/40" size={14}/><input value={busqueda} onChange={e=>{setBusqueda(e.target.value); setPage(1)}} placeholder="Buscar gasto..." className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-cream-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-olive-500/20" /></div>
        <select value={filtroCat} onChange={e=>{setFiltroCat(e.target.value); setPage(1)}} className="px-4 py-2.5 rounded-xl border border-cream-200 bg-white text-sm"><option value="">Todas las categorías</option>{CATS.map(c=> <option key={c} value={c}>{c}</option>)}</select>
      </div>
      {pagina.length===0 ? <EmptyState icon={<FaMoneyBillWave size={24}/>} title="Sin gastos" description="Registra los gastos del restaurante" action={{label:'Registrar gasto', onClick:()=>setShowForm(true)}} /> : (
        <>
          <div className="bg-white rounded-2xl border border-cream-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="bg-cream-50 border-b border-cream-200"><th className="p-3 text-left text-xs font-semibold uppercase">Fecha</th><th className="p-3 text-left text-xs font-semibold uppercase">Categoría</th><th className="p-3 text-left text-xs font-semibold uppercase">Descripción</th><th className="p-3 text-right text-xs font-semibold uppercase">Monto</th><th className="p-3 text-left text-xs font-semibold uppercase hidden sm:table-cell">Responsable</th><th className="p-3 text-center text-xs font-semibold uppercase">—</th></tr></thead>
                <tbody>
                  {pagina.map(g=> (
                    <tr key={g.id} className="border-t border-cream-100 hover:bg-cream-50/50">
                      <td className="p-3 text-xs text-steel">{g.fecha}</td>
                      <td className="p-3"><span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-cream-100 border border-cream-200">{g.categoria}</span></td>
                      <td className="p-3 text-sm text-espresso-800 max-w-[220px] truncate">{g.descripcion}</td>
                      <td className="p-3 text-right text-sm font-bold text-red-600">${g.monto.toLocaleString('es-CO')}</td>
                      <td className="p-3 text-xs text-steel hidden sm:table-cell">{g.responsable||'—'}</td>
                      <td className="p-3 text-center"><button onClick={()=>setConfirmDelete(g.id)} className="p-1.5 rounded-lg hover:bg-red-50"><FaTrash size={12} className="text-red-400"/></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
      {showForm && (
        <div className="fixed inset-0 bg-espresso-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={()=>setShowForm(false)}>
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-xl" onClick={e=>e.stopPropagation()}>
            <div className="p-6 border-b border-cream-200 flex items-center justify-between"><h3 className="font-display font-bold text-espresso-800">Registrar gasto</h3><button onClick={()=>setShowForm(false)} className="p-2 hover:bg-cream-100 rounded-xl">✕</button></div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-semibold mb-1.5">Categoría</label><select value={form.categoria} onChange={e=>setForm({...form, categoria:e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-cream-200 text-sm">{CATS.map(c=> <option key={c} value={c}>{c}</option>)}</select></div>
                <div><label className="block text-xs font-semibold mb-1.5">Fecha</label><input type="date" value={form.fecha} onChange={e=>setForm({...form, fecha:e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-cream-200 text-sm" /></div>
              </div>
              <div><label className="block text-xs font-semibold mb-1.5">Descripción *</label><input value={form.descripcion} onChange={e=>setForm({...form, descripcion:e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-cream-200 text-sm" placeholder="Ej: Compra de insumos, pago servicios" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-semibold mb-1.5">Monto *</label><input type="number" min={0} value={form.monto} onChange={e=>setForm({...form, monto:Number(e.target.value)})} className="w-full px-4 py-2.5 rounded-xl border border-cream-200 text-sm" /></div>
                <div><label className="block text-xs font-semibold mb-1.5">Responsable</label><input value={form.responsable} onChange={e=>setForm({...form, responsable:e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-cream-200 text-sm" /></div>
              </div>
              <div className="flex gap-3 pt-2"><button onClick={()=>setShowForm(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-cream-200 text-sm">Cancelar</button><button onClick={submit} className="flex-1 px-4 py-2.5 rounded-xl bg-olive-500 hover:bg-olive-600 text-white text-sm font-semibold">Guardar</button></div>
            </div>
          </div>
        </div>
      )}
      <ConfirmModal open={!!confirmDelete} onClose={()=>setConfirmDelete(null)} onConfirm={()=>{ if(confirmDelete){ save(gastos.filter(g=>g.id!==confirmDelete)); setConfirmDelete(null); toast.success('Gasto eliminado')}}} title="Eliminar gasto" message="¿Eliminar este gasto?" confirmText="Eliminar" variant="danger" />
    </div>
  )
}
