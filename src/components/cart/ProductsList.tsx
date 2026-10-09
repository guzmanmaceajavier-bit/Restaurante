import { FaMinus, FaPlus, FaTrash, FaUtensils, FaStickyNote } from 'react-icons/fa'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { IProductCart } from '../../features/products/types'
import { numberFormatter } from '../../utils/numberFormatter'
import { useCartStore } from '../../store/useCartStore'

interface IProps {
  cart: IProductCart[]
  onClose?: () => void
}

export function ProductsList({ cart, onClose }: IProps) {
  const decrementQuantity = useCartStore((s) => s.decrementQuantity)
  const removeItem = useCartStore((s) => s.removeItem)
  const addToCart = useCartStore((s) => s.addToCart)
  const navigate = useNavigate()
  const [editingNotes, setEditingNotes] = useState<string | null>(null)
  const [noteText, setNoteText] = useState('')

  if (cart.length === 0) {
    return (
      <div className='flex-1 flex items-center justify-center py-16 px-6 text-center'>
        <div>
          <p className='text-espresso-800 font-display font-bold text-lg mb-1'>Tu carrito está vacío</p>
          <p className="text-sm text-steel mb-5">Explora nuestro menú y encuentra tu plato favorito</p>
          <button
            onClick={() => { navigate('/menu'); onClose?.(); }}
            className="inline-flex items-center gap-2 btn-primary text-sm py-2.5 px-6"
          >
            <FaUtensils size={14} /> Ver menú
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className='flex-1 overflow-y-auto -mx-1 px-1 py-1 space-y-3'>
      {cart.map((item, i) => (
        <div
          key={item.nombre}
          className='bg-white rounded-3xl p-3.5 border border-cream-200/70 shadow-card fade-in-up'
          style={{ animationDelay: `${i * 50}ms` }}
        >
          <div className='flex items-center gap-3.5'>
            <div className='w-20 h-20 rounded-2xl overflow-hidden shrink-0 bg-cream-100'>
              <img src={item.imagen} alt={item.nombre} className='w-full h-full object-cover' loading='lazy' />
            </div>
            <div className='flex-1 min-w-0'>
              <h4 className='font-display font-bold text-espresso-800 text-[15px] leading-tight truncate'>{item.nombre}</h4>
              <p className='text-[11px] text-steel mt-0.5'>${numberFormatter(item.precio!)} c/u</p>
              <div className='flex items-center justify-between gap-2 mt-2.5'>
                <div className='inline-flex items-center gap-1 bg-cream-50 border border-cream-200 rounded-full p-1'>
                  <button
                    onClick={() => item.quantity <= 1 ? removeItem(item) : decrementQuantity(item)}
                    aria-label={item.quantity <= 1 ? 'Quitar del carrito' : 'Quitar uno'}
                    className='w-7 h-7 rounded-full bg-white border border-cream-200 hover:border-red-200 hover:text-red-500 flex items-center justify-center text-espresso-600 transition-all duration-200 active:scale-90 shadow-sm'
                  >
                    {item.quantity <= 1 ? <FaTrash size={10} /> : <FaMinus size={10} />}
                  </button>
                  <span className='text-sm font-bold text-espresso-800 w-6 text-center tabular-nums'>{item.quantity}</span>
                  <button
                    onClick={() => addToCart({ ...item, quantity: 1 })}
                    aria-label='Agregar uno'
                    className='w-7 h-7 rounded-full bg-olive-500 hover:bg-olive-600 flex items-center justify-center text-white transition-all duration-200 active:scale-90 shadow-sm'
                  >
                    <FaPlus size={10} />
                  </button>
                </div>
                <p className='text-[15px] font-display font-bold text-espresso-800'>${numberFormatter(item.precio! * item.quantity)}</p>
              </div>
            </div>
          </div>

          {/* Extras */}
          {item.adicionales && item.adicionales.length > 0 && (
            <div className='mt-2.5 ml-[92px] flex flex-wrap gap-1'>
              {item.adicionales.map((a) => (
                <span key={a.nombre} className='text-[10px] bg-olive-50 text-olive-700 px-2 py-0.5 rounded-full border border-olive-200'>
                  +{a.nombre} ${numberFormatter(a.precio)}
                </span>
              ))}
            </div>
          )}

          {/* Notes */}
          {editingNotes === item.nombre ? (
            <div className='mt-2.5 ml-[92px] flex items-center gap-2'>
              <input type="text" value={noteText} onChange={(e) => setNoteText(e.target.value)}
                placeholder=" Ej: Sin cebolla, poco picante..."
                className='flex-1 text-xs bg-cream-50 border border-olive-300 rounded-full px-3.5 py-2 focus:outline-none'
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const updated = cart.map(c => c.nombre === item.nombre ? { ...c, notas: noteText } : c)
                    useCartStore.setState({ cart: updated })
                    setEditingNotes(null)
                  }
                }}
                autoFocus />
              <button onClick={() => {
                const updated = cart.map(c => c.nombre === item.nombre ? { ...c, notas: noteText } : c)
                useCartStore.setState({ cart: updated })
                setEditingNotes(null)
              }} className='text-xs text-white font-semibold bg-olive-500 hover:bg-olive-600 rounded-full px-3.5 py-2 transition-colors'>OK</button>
            </div>
          ) : (
            <button onClick={() => { setEditingNotes(item.nombre); setNoteText(item.notas || '') }}
              className='mt-2.5 ml-[92px] flex items-center gap-1 text-[11px] text-steel hover:text-olive-600 transition-colors'>
              <FaStickyNote size={10} />
              {item.notas ? <span className='italic'>"{item.notas}"</span> : 'Agregar nota'}
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
