import { useEffect } from 'react'
import MainRoutes from './app/router'
import { AppProviders } from './app/providers/AppProviders'
import { initDataService } from './lib/seedDemo'

export default function App() {
  useEffect(() => { initDataService() }, [])

  return (
    <AppProviders>
      <MainRoutes />
    </AppProviders>
  )
}
