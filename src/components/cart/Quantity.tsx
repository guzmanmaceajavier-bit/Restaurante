import { FaMinus, FaPlus } from 'react-icons/fa6'

interface IProps {
  quantity: number
  increment: () => void
  decrement: () => void
}

export function Quantity({ quantity, increment, decrement }: IProps) {
  return (
    <div className='flex items-center gap-2 mt-1'>
      <button
        type='button'
        onClick={decrement}
        className='w-7 h-7 flex items-center justify-center rounded-full bg-warm text-brick-600 hover:bg-brick-100 transition-colors text-xs'
        aria-label='Disminuir cantidad'
      >
        <FaMinus size={10} />
      </button>
      <span className='w-8 text-center font-bold text-sm'>{quantity}</span>
      <button
        type='button'
        onClick={increment}
        className='w-7 h-7 flex items-center justify-center rounded-full bg-brick-500 text-white hover:bg-brick-600 transition-colors text-xs'
        aria-label='Aumentar cantidad'
      >
        <FaPlus size={10} />
      </button>
    </div>
  )
}
