import { Component, type ReactNode, type ErrorInfo } from 'react'
import { Link } from 'react-router-dom'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <section className="min-h-screen flex items-center justify-center bg-orange-50 px-6">
          <div className="text-center max-w-lg">
            <div className="text-6xl mb-4">😅</div>
            <h1 className="text-3xl font-bold text-orange-700 mb-2">Algo salió mal</h1>
            <p className="text-gray-600 mb-2">Ocurrió un error inesperado. Ya lo estamos revisando.</p>
            <p className="text-sm text-gray-400 mb-8 font-mono">{this.state.error?.message}</p>
            <Link
              to="/"
              className="inline-block bg-orange-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-orange-700 transition-all"
              onClick={() => this.setState({ hasError: false, error: null })}
            >
              Volver al inicio
            </Link>
          </div>
        </section>
      )
    }
    return this.props.children
  }
}
