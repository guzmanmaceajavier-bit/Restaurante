import { Component, type ReactNode } from 'react'
import { Link } from 'react-router-dom'

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
        <section className="min-h-screen flex items-center justify-center bg-cream-50 px-6">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 bg-red-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">⚠️</span>
            </div>
            <h1 className="text-3xl font-display font-bold text-espresso-800 mb-2">Algo salió mal</h1>
            <p className="text-steel mb-8">Ocurrió un error inesperado. Por favor intenta de nuevo.</p>
            <Link to="/" className="btn-primary inline-block">
              Volver al inicio
            </Link>
          </div>
        </section>
      )
    }
    return this.props.children
  }
}
