import { useMemo } from 'react'
import { FaFileInvoiceDollar, FaPrint } from 'react-icons/fa'
import { SEO } from '../lib/seo'
import { storage } from '../lib/storage'
import { imprimirPedido } from '../components/admin/PrintTicket'
import { ExportButton } from '../components/admin/ExportButton'
import type { Order } from '../types/order'

export default function AdminFacturacion() {
  const ordenes = useMemo(()=> storage.getOrdenes<Order>().filter(o=> o.estado!=='cancelado').sort((a,b)=> new Date(b.createdAt||0).getTime()-new Date(a.createdAt||0).getTime()), [])
  const total = ordenes.reduce((s,o)=> s+(o.total||0),0)
  return (
    <div>
      <SEO title="Facturación" />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div><h1 className="text-2xl font-display font-bold text-espresso-800">Facturación</h1><p className="text-steel text-sm mt-1">{ordenes.length} facturas · Total ${total.toLocaleString('es-CO')} · Una factura por pedido</p></div>
        <ExportButton data={ordenes} filename="facturas" columns={[{key:'id',label:'Factura'},{key:'fullName',label:'Cliente'},{key:'total',label:'Total'},{key:'createdAt',label:'Fecha'}]} />
      </div>
      <div className="bg-white rounded-2xl border border-cream-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="bg-cream-50 border-b border-cream-200"><th className="p-3 text-left text-xs font-semibold uppercase">Factura</th><th className="p-3 text-left text-xs font-semibold uppercase">Cliente</th><th className="p-3 text-left text-xs font-semibold uppercase hidden sm:table-cell">Fecha</th><th className="p-3 text-right text-xs font-semibold uppercase">Total</th><th className="p-3 text-center text-xs font-semibold uppercase">Estado</th><th className="p-3 text-center text-xs font-semibold uppercase">Acción</th></tr></thead>
            <tbody>
              {ordenes.length===0 && <tr><td colSpan={6} className="p-8 text-center text-sm text-steel">Sin facturas aún</td></tr>}
              {ordenes.map(o=> (
                <tr key={o.id} className="border-t border-cream-100 hover:bg-cream-50/50">
                  <td className="p-3 text-xs font-mono text-steel">FAC-{o.id?.slice(0,8).toUpperCase()}</td>
                  <td className="p-3 text-sm text-espresso-800">{(o as any).fullName || (o as any).clientName || 'Cliente'}</td>
                  <td className="p-3 text-xs text-steel hidden sm:table-cell">{o.createdAt ? new Date(o.createdAt).toLocaleString('es-CO') : '—'}</td>
                  <td className="p-3 text-right text-sm font-bold">${Number(o.total).toLocaleString('es-CO')}</td>
                  <td className="p-3 text-center"><span className="px-2 py-1 rounded-full text-[10px] font-semibold bg-sage-50 text-sage-700 border border-sage-200">Válida</span></td>
                  <td className="p-3 text-center"><button onClick={()=>imprimirPedido(o)} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-cream-200 hover:bg-cream-50 rounded-lg text-xs font-medium"><FaPrint size={11}/> Imprimir</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <p className="text-[11px] text-steel mt-3 flex items-center gap-1"><FaFileInvoiceDollar/> Numeración automática FAC- + ID pedido · PDF vía impresión del navegador</p>
    </div>
  )
}
