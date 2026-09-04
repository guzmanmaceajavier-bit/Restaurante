import { useTheme } from '../../hooks/useTheme'
import { FaSun, FaMoon } from 'react-icons/fa'

export default function DarkModeToggle({ className = '' }: { className?: string }) {
  const { theme, toggle } = useTheme()

  return (
    <button
      onClick={toggle}
      className={`p-2.5 rounded-xl transition-all duration-200 ${
        theme === 'dark'
          ? 'text-gold-400 hover:bg-yellow-900/30 hover:text-gold-300'
          : 'text-espresso-500 hover:text-olive-600 hover:bg-olive-50'
      } ${className}`}
      title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
    >
      {theme === 'dark' ? <FaSun size={16} /> : <FaMoon size={16} />}
    </button>
  )
}
