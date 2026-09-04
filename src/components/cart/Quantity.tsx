import { FaMinus, FaPlus } from 'react-icons/fa6'

interface IProps {
  quantity: number
  increment: () => void
  decrement: () => void
}

export function Quantity({ quantity, increment, decrement }: IProps) {
  return (
    <div className='flex items-center gap-2'>
      <button
        type='button'
        onClick={decrement}
        className='w-8 h-8 flex items-center justify-center rounded-xl bg-cream-100 text-espresso-600 hover:bg-cream-200 transition-colors text-xs font-bold'
        aria-label='Disminuir cantidad'
      >
        <FaMinus size={10} />
      </button>
      <span className='w-8 text-center font-bold text-sm text-espresso-800'>{quantity}</span>
      <button
        type='button'
        onClick={increment}
        className='w-8 h-8 flex items-center justify-center rounded-xl bg-olive-500 text-white hover:bg-olive-600 transition-colors text-xs font-bold'
        aria-label='Aumentar cantidad'
      >
        <FaPlus size={10} />
      </button>
    </div>
  )
}
