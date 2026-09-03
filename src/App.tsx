import { useEffect } from 'react'
import { BrowserRouter } from 'react-router-dom'
import MainRoutes from './routes'
import { Toaster } from 'sonner'
import ErrorBoundary from './lib/ErrorBoundary'
import { initDataService } from './lib/dataService'

export default function App() {
  useEffect(() => { initDataService() }, [])

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <MainRoutes />
        <Toaster
          toastOptions={{
            style: { padding: '15px' },
            className: 'my-toast',
          }}
          position="top-center"
          richColors
        />
      </BrowserRouter>
    </ErrorBoundary>
  )
}
