import { FaMinus, FaPlus, FaTrash, FaUtensils, FaStickyNote } from 'react-icons/fa'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { IProductCart } from '../../types/product'
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
          <div className="w-20 h-20 bg-cream-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">🛒</span>
          </div>
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
    <div className='flex-1 overflow-y-auto p-4 space-y-3'>
      {cart.map((item, i) => (
        <div
          key={item.nombre}
          className='bg-white rounded-2xl p-3 border border-cream-200 shadow-sm hover:shadow-md transition-all duration-300 fade-in-up'
          style={{ animationDelay: `${i * 50}ms` }}
        >
          <div className='flex items-center gap-3'>
            <div className='w-[72px] h-[72px] rounded-xl overflow-hidden shrink-0 bg-cream-100 border border-cream-200'>
              <img src={item.imagen} alt={item.nombre} className='w-full h-full object-cover' />
            </div>
            <div className='flex-1 min-w-0'>
              <h4 className='font-semibold text-espresso-800 text-sm truncate'>{item.nombre}</h4>
              <p className='text-olive-600 font-bold text-sm mt-0.5'>${numberFormatter(item.precio! * item.quantity)}</p>
              <div className='flex items-center gap-2 mt-2'>
                <button
                  onClick={() => item.quantity <= 1 ? removeItem(item) : decrementQuantity(item)}
                  className='w-7 h-7 rounded-lg bg-cream-100 hover:bg-cream-200 flex items-center justify-center text-espresso-600 transition-all duration-200 active:scale-90'
                >
                  {item.quantity <= 1 ? <FaTrash size={10} /> : <FaMinus size={10} />}
                </button>
                <span className='text-sm font-bold text-espresso-800 w-6 text-center tabular-nums'>{item.quantity}</span>
                <button
                  onClick={() => addToCart({ ...item, quantity: 1 })}
                  className='w-7 h-7 rounded-lg bg-olive-500 hover:bg-olive-600 flex items-center justify-center text-white transition-all duration-200 active:scale-90 shadow-sm'
                >
                  <FaPlus size={10} />
                </button>
              </div>
            </div>
            <div className='text-right shrink-0'>
              <p className='text-xs text-steel'>${numberFormatter(item.precio!)}</p>
              <p className='text-[10px] text-steel/60'>c/u</p>
            </div>
          </div>

          {/* Extras */}
          {item.adicionales && item.adicionales.length > 0 && (
            <div className='mt-2 ml-[84px] flex flex-wrap gap-1'>
              {item.adicionales.map((a) => (
                <span key={a.nombre} className='text-[10px] bg-olive-50 text-olive-700 px-2 py-0.5 rounded-full border border-olive-200'>
                  +{a.nombre} ${numberFormatter(a.precio)}
                </span>
              ))}
            </div>
          )}

          {/* Notes */}
          {editingNotes === item.nombre ? (
            <div className='mt-2 ml-[84px] flex items-center gap-2'>
              <input type="text" value={noteText} onChange={(e) => setNoteText(e.target.value)}
                placeholder=" Ej: Sin cebolla, poco picante..."
                className='flex-1 text-xs bg-cream-50 border border-cream-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-olive-400'
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
              }} className='text-xs text-olive-600 font-medium'>OK</button>
            </div>
          ) : (
            <button onClick={() => { setEditingNotes(item.nombre); setNoteText(item.notas || '') }}
              className='mt-2 ml-[84px] flex items-center gap-1 text-[11px] text-steel hover:text-olive-600 transition-colors'>
              <FaStickyNote size={10} />
              {item.notas ? <span className='italic'>"{item.notas}"</span> : 'Agregar nota'}
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
