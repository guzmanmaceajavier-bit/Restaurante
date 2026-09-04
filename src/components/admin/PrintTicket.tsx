import { FaPrint } from 'react-icons/fa'
import { CONFIG } from '../../lib/config'
import type { Order } from '../../types/order'

interface PrintTicketProps {
  order: Order
  restaurantName?: string
  restaurantAddress?: string
  restaurantPhone?: string
}

const defaultStyles = `
  @media print {
    body * { display: none !important; }
    .print-ticket, .print-ticket * { display: block !important; }
    .print-ticket { position: fixed; top: 0; left: 0; width: 100%; }
  }
  .print-ticket {
    font-family: 'Courier New', Courier, monospace;
    font-size: 12px;
    max-width: 320px;
    margin: 0 auto;
    background: white;
    padding: 16px;
    color: #000;
  }
  .print-ticket .ticket-header { text-align: center; font-weight: bold; margin-bottom: 8px; font-size: 14px; }
  .print-ticket .ticket-subheader { text-align: center; font-size: 11px; color: #555; margin-bottom: 4px; }
  .print-ticket .ticket-divider { border-top: 1px dashed #000; margin: 8px 0; }
  .print-ticket .ticket-row { display: flex; justify-content: space-between; margin-bottom: 2px; font-size: 11px; }
  .print-ticket .ticket-item { margin-bottom: 4px; font-size: 11px; }
  .print-ticket .ticket-item-name { font-weight: bold; }
  .print-ticket .ticket-item-detail { padding-left: 8px; font-size: 10px; }
  .print-ticket .ticket-total { font-weight: bold; font-size: 13px; border-top: 1px dashed #000; padding-top: 4px; margin-top: 4px; }
  .print-ticket .ticket-footer { text-align: center; font-size: 10px; margin-top: 8px; color: #555; }
`

function buildTicketHTML(order: Order, name: string, address: string, phone: string): string {
  const typeLabels: Record<string, string> = {
    eatHere: 'Comer aquí',
    delivery: 'A domicilio',
    pickup: 'Recoger',
  }
  const items = order.items
    .map(
      (item) => `
    <div class="ticket-item">
      <div class="ticket-item-name">${item.nombre}</div>
      <div class="ticket-item-detail">
        ${item.quantity} x $${Number(item.precio).toLocaleString('es-CO')} = $${(item.quantity * Number(item.precio)).toLocaleString('es-CO')}
      </div>
    </div>`
    )
    .join('')

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<title>Pedido #${order.id}</title>
<style>${defaultStyles}</style>
</head>
<body>
<div class="print-ticket">
  <div class="ticket-header">${name}</div>
  <div class="ticket-subheader">${address}</div>
  <div class="ticket-subheader">Tel: ${phone}</div>
  <div class="ticket-divider"></div>
  <div class="ticket-row"><span>Pedido:</span><span>#${order.id}</span></div>
  <div class="ticket-row"><span>Fecha:</span><span>${new Date(order.createdAt).toLocaleString('es-CO')}</span></div>
  <div class="ticket-row"><span>Cliente:</span><span>${order.fullName}</span></div>
  <div class="ticket-row"><span>Tel:</span><span>${order.phone}</span></div>
  <div class="ticket-row"><span>Tipo:</span><span>${typeLabels[order.typeOrder] || order.typeOrder}</span></div>
  <div class="ticket-divider"></div>
  <div style="font-weight:bold; margin-bottom:4px;">Items:</div>
  ${items}
  <div class="ticket-divider"></div>
  <div class="ticket-row"><span>Subtotal:</span><span>$${Number(order.subtotal).toLocaleString('es-CO')}</span></div>
  <div class="ticket-row"><span>Domicilio:</span><span>$${Number(order.deliveryFee).toLocaleString('es-CO')}</span></div>
  <div class="ticket-row ticket-total"><span>TOTAL:</span><span>$${Number(order.total).toLocaleString('es-CO')}</span></div>
  <div class="ticket-row"><span>Pago:</span><span>${CONFIG.metodosPago.find((m) => m.id === order.paymentMethod)?.nombre || order.paymentMethod}</span></div>
  <div class="ticket-row"><span>Estado:</span><span>${order.estado}</span></div>
  <div class="ticket-divider"></div>
  <div class="ticket-footer">
    ¡Gracias por su preferencia!<br/>
    WhatsApp: ${CONFIG.contacto.whatsapp}
  </div>
</div>
</body>
</html>`
}

export function imprimirPedido(order: Order) {
  const name = CONFIG.restaurante.nombre
  const address = CONFIG.contacto.direccion
  const phone = CONFIG.contacto.telefono
  const html = buildTicketHTML(order, name, address, phone)
  const win = window.open('', '_blank', 'width=400,height=600')
  if (win) {
    win.document.write(html)
    win.document.close()
    win.focus()
    setTimeout(() => win.print(), 300)
  }
}

export default function PrintTicket({
  order,
  restaurantName = CONFIG.restaurante.nombre,
  restaurantAddress = CONFIG.contacto.direccion,
  restaurantPhone = CONFIG.contacto.telefono,
}: PrintTicketProps) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: defaultStyles }} />
      <button
        onClick={() => imprimirPedido(order)}
        className="bg-cream-100 hover:bg-cream-200 text-espresso-700 border border-cream-200 rounded-xl px-4 py-2 text-sm flex items-center gap-2 transition-colors"
      >
        <FaPrint size={14} />
        Imprimir ticket
      </button>
      <div className="print-ticket hidden">
        <div className="ticket-header">{restaurantName}</div>
        <div className="ticket-subheader">{restaurantAddress}</div>
        <div className="ticket-subheader">Tel: {restaurantPhone}</div>
        <div className="ticket-divider" />
        <div className="ticket-row"><span>Pedido:</span><span>#{order.id}</span></div>
        <div className="ticket-row"><span>Fecha:</span><span>{new Date(order.createdAt).toLocaleString('es-CO')}</span></div>
        <div className="ticket-row"><span>Cliente:</span><span>{order.fullName}</span></div>
        <div className="ticket-row"><span>Tel:</span><span>{order.phone}</span></div>
        <div className="ticket-row"><span>Tipo:</span><span>{order.typeOrder === 'eatHere' ? 'Comer aquí' : order.typeOrder === 'delivery' ? 'A domicilio' : 'Recoger'}</span></div>
        <div className="ticket-divider" />
        <div className="font-bold mb-1">Items:</div>
        {order.items.map((item, i) => (
          <div key={i} className="ticket-item">
            <div className="ticket-item-name">{item.nombre}</div>
            <div className="ticket-item-detail">
              {item.quantity} x ${Number(item.precio).toLocaleString('es-CO')} = ${(item.quantity * Number(item.precio)).toLocaleString('es-CO')}
            </div>
          </div>
        ))}
        <div className="ticket-divider" />
        <div className="ticket-row"><span>Subtotal:</span><span>${Number(order.subtotal).toLocaleString('es-CO')}</span></div>
        <div className="ticket-row"><span>Domicilio:</span><span>${Number(order.deliveryFee).toLocaleString('es-CO')}</span></div>
        <div className="ticket-row ticket-total"><span>TOTAL:</span><span>${Number(order.total).toLocaleString('es-CO')}</span></div>
        <div className="ticket-row"><span>Pago:</span><span>{CONFIG.metodosPago.find((m) => m.id === order.paymentMethod)?.nombre || order.paymentMethod}</span></div>
        <div className="ticket-row"><span>Estado:</span><span>{order.estado}</span></div>
        <div className="ticket-divider" />
        <div className="ticket-footer">
          ¡Gracias por su preferencia!<br />
          WhatsApp: {restaurantPhone}
        </div>
      </div>
    </>
  )
}
