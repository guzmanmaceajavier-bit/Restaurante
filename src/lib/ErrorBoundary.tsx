import { Component, type ReactNode } from 'react'
import { FaRedo } from 'react-icons/fa'

interface Props { children: ReactNode }
interface State { hasError: boolean }

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <section className="min-h-screen flex items-center justify-center bg-cream-50 dark:bg-[#1a1f16] px-6">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">⚠️</span>
            </div>
            <h1 className="text-3xl font-display font-bold text-espresso-800 dark:text-cream-200 mb-2">Algo salió mal</h1>
            <p className="text-steel dark:text-cream-400 mb-8">Ocurrió un error inesperado. Por favor intenta de nuevo.</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => this.setState({ hasError: false })} className="btn-primary inline-flex items-center gap-2">
                <FaRedo size={14} /> Reintentar
              </button>
              <a href="/" className="inline-flex items-center gap-2 px-6 py-3 border border-cream-200 dark:border-[#3d4a2e] rounded-xl text-espresso-600 dark:text-cream-400 hover:bg-cream-50 dark:hover:bg-[#252e1e] transition-colors font-medium">
                Volver al inicio
              </a>
            </div>
          </div>
        </section>
      )
    }
    return this.props.children
  }
}
