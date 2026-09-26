import { useEffect, useState, useMemo } from 'react'
import { customerService } from '../../features/customers/customer.service'
import type { ContactoWhatsApp as Customer } from '../../features/customers/customer.service'
import type { MensajeEnviado } from '../../services/storage/whatsappStorage'
import { CONFIG } from '../../lib/config'
import { FaWhatsapp, FaSearch, FaRegSquare, FaCheckSquare, FaExternalLinkAlt } from 'react-icons/fa'

const plantillas = [
  { id: 'bienvenida', titulo: 'Bienvenida', mensaje: `¡Hola {nombre}! 👋 Bienvenido a {restaurante}. Estamos felices de tenerte como cliente. Disfruta de nuestro menú y no dudes en escribirnos si necesitas algo.` },
  { id: 'promo', titulo: 'Promoción', mensaje: `¡Hola {nombre}! 🎉 Tienes una promoción exclusiva en {restaurante}. Visítanos pronto y aprovecha nuestros descuentos especiales. ¡Te esperamos!` },
  { id: 'recordatorio', titulo: 'Recordatorio', mensaje: `¡Hola {nombre}! 📋 Te recordamos tu reserva en {restaurante}. Si tienes alguna pregunta o necesitas cambiar la fecha, contáctanos.` },
  { id: 'cumpleanos', titulo: 'Cumpleaños', mensaje: `¡Feliz cumpleaños, {nombre}! 🎂 En {restaurante} queremos celebrar contigo. Visítanos y te obsequiamos algo especial.` },
  { id: 'seguimiento', titulo: 'Seguimiento', mensaje: `¡Hola {nombre}! 😊 Queríamos saber cómo fue tu experiencia en {restaurante}. Tu opinión nos ayuda a mejorar. ¡Gracias por preferirnos!` },
]

export default function AdminWhatsApp() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [message, setMessage] = useState('')
  const [search, setSearch] = useState('')
  const [sending, setSending] = useState(false)
  const [filtroSource, setFiltroSource] = useState<'todos' | 'pedido' | 'reserva'>('todos')
  const [plantillaActiva, setPlantillaActiva] = useState('')
  const [historial, setHistorial] = useState<MensajeEnviado[]>([])

  useEffect(() => {
    setCustomers(customerService.getContactosWhatsApp())
    setHistorial(customerService.getHistorialWhatsApp())
  }, [])

  const filtered = useMemo(() => customers.filter((c) => {
    if (filtroSource !== 'todos' && c.source !== filtroSource) return false
    if (search.trim()) { const q = search.toLowerCase(); return c.name.toLowerCase().includes(q) || c.phone.includes(q) }
    return true
  }), [customers, search, filtroSource])

  const toggleAll = () => { setSelected(selected.size === filtered.length && filtered.length > 0 ? new Set() : new Set(filtered.map((c) => c.phone))) }
  const toggle = (phone: string) => setSelected((prev) => { const next = new Set(prev); next.has(phone) ? next.delete(phone) : next.add(phone); return next })
  const aplicarPlantilla = (id: string) => { const p = plantillas.find((x) => x.id === id); if (p) { setMessage(p.mensaje); setPlantillaActiva(id) } }
  const reemplazarVariables = (msg: string, nombre: string) => msg.replace(/{nombre}/g, nombre).replace(/{restaurante}/g, CONFIG.restaurante.nombre)

  const handleSend = () => {
    const selectedCustomers = customers.filter((c) => selected.has(c.phone))
    if (!selectedCustomers.length || !message.trim()) return
    setSending(true)
    setHistorial(customerService.registrarEnvioWhatsApp(message, selectedCustomers.length))
    selectedCustomers.forEach((c, i) => { setTimeout(() => { window.open(`https://wa.me/${c.phone}?text=${encodeURIComponent(reemplazarVariables(message, c.name))}`, '_blank') }, i * 800) })
    setTimeout(() => { setSending(false); setMessage(''); setPlantillaActiva('') }, selectedCustomers.length * 800 + 500)
  }

  return (
    <div>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-display font-bold text-espresso-800">WhatsApp Masivo</h1>
            <p className="text-sm text-steel mt-1">{customers.length} clientes registrados</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl shadow-card border border-cream-200 p-4">
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-steel" size={14} />
                  <input type="text" placeholder="Buscar por nombre o teléfono..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 input-base" />
                </div>
                <select value={filtroSource} onChange={(e) => setFiltroSource(e.target.value as any)} className="input-base">
                  <option value="todos">Todos</option>
                  <option value="pedido">Solo pedidos</option>
                  <option value="reserva">Solo reservas</option>
                </select>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-card border border-cream-200">
              <div className="flex items-center justify-between px-4 py-3 border-b border-cream-200">
                <button onClick={toggleAll} className="flex items-center gap-2 text-sm font-medium text-steel hover:text-espresso-800 transition-colors">
                  {selected.size === filtered.length && filtered.length > 0 ? <><FaCheckSquare className="text-olive-500" size={16} />Deseleccionar todos</> : <><FaRegSquare size={16} />Seleccionar todos</>}
                </button>
                <span className="text-xs text-steel">{selected.size} seleccionados</span>
              </div>
              <div className="max-h-[600px] overflow-y-auto divide-y divide-cream-200">
                {filtered.length === 0 ? <div className="p-8 text-center text-steel text-sm">No se encontraron clientes</div> : filtered.map((c) => (
                  <label key={c.phone} className="flex items-center gap-3 px-4 py-3 hover:bg-cream-50 transition-colors cursor-pointer">
                    <input type="checkbox" checked={selected.has(c.phone)} onChange={() => toggle(c.phone)} className="w-4 h-4 rounded border-cream-300 text-olive-500 focus:ring-olive-500/30" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-espresso-800 truncate">{c.name || 'Sin nombre'}</p>
                      <p className="text-xs text-steel">{c.phone} · {c.source === 'pedido' ? 'Pedido' : 'Reserva'}</p>
                    </div>
                    <a href={`https://wa.me/${c.phone}`} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-sage-500 hover:text-sage-600 transition-colors p-1" title="Abrir chat">
                      <FaExternalLinkAlt size={12} />
                    </a>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-card border border-cream-200 p-5">
              <h2 className="text-sm font-semibold text-espresso-800 mb-3">Plantillas</h2>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {plantillas.map((p) => (
                  <button key={p.id} onClick={() => aplicarPlantilla(p.id)} className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${plantillaActiva === p.id ? 'bg-olive-500 text-white' : 'bg-cream-50 text-espresso-800 hover:bg-cream-100 border border-cream-200'}`}>
                    {p.titulo}
                  </button>
                ))}
              </div>
              <h2 className="text-sm font-semibold text-espresso-800 mb-3">Mensaje</h2>
              <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Escribe el mensaje que quieres enviar..." rows={8} className="w-full input-base resize-none" />
              <div className="mt-3 bg-cream-50 rounded-xl p-3 text-xs text-steel space-y-1 border border-cream-200">
                <p className="font-medium text-espresso-800">Variables:</p>
                <code>{'{nombre}'} — Nombre del cliente</code><br />
                <code>{'{restaurante}'} — {CONFIG.restaurante.nombre}</code>
              </div>
              <button onClick={handleSend} disabled={selected.size === 0 || !message.trim() || sending}
                className="w-full flex items-center justify-center gap-2 bg-sage-500 hover:bg-sage-600 disabled:bg-cream-200 disabled:text-steel text-white py-3 rounded-xl font-semibold transition-all mt-4">
                <FaWhatsapp size={18} />{sending ? 'Enviando...' : `Enviar a ${selected.size} cliente${selected.size !== 1 ? 's' : ''}`}
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-card border border-cream-200 p-5">
              <h2 className="text-sm font-semibold text-espresso-800 mb-2">Resumen</h2>
              <div className="text-xs text-steel space-y-1">
                <p>Total: <strong>{customers.length}</strong></p>
                <p>Seleccionados: <strong>{selected.size}</strong></p>
                <p>Pedidos: <strong>{customers.filter(c => c.source === 'pedido').length}</strong></p>
                <p>Reservas: <strong>{customers.filter(c => c.source === 'reserva').length}</strong></p>
              </div>
            </div>

            {historial.length > 0 && (
              <div className="bg-white rounded-2xl shadow-card border border-cream-200 p-5">
                <h2 className="text-sm font-semibold text-espresso-800 mb-3">Historial</h2>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {historial.slice(0, 10).map((h) => (
                    <div key={h.id} className="bg-cream-50 rounded-lg p-2 text-xs border border-cream-200">
                      <p className="text-steel">{new Date(h.fecha).toLocaleDateString('es-CO')} — {h.destinatarios} destinatarios</p>
                      <p className="text-espresso-800 truncate mt-1">{h.mensaje}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
