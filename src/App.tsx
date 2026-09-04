import { useEffect } from 'react'
import { BrowserRouter } from 'react-router-dom'
import MainRoutes from './routes'
import { Toaster } from 'sonner'
import ErrorBoundary from './lib/ErrorBoundary'
import { initDataService } from './lib/dataService'
import ScrollToTop from './components/core/ScrollToTop'
import { ThemeProvider } from './hooks/useTheme'

export default function App() {
  useEffect(() => { initDataService() }, [])

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <ScrollToTop />
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
      </ThemeProvider>
    </ErrorBoundary>
  )
}
